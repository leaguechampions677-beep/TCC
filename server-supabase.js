require('dotenv').config();

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://gruzcdrzryuiahiwwalc.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdydXpjZHJ6cnl1aWFoaXd3YWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjAzMTcsImV4cCI6MjA3Njc5NjMxN30.C_qa-brDL4HQE0bMmvnNBYsdnn1J8_eV_aneHNTSE0g';
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Servir arquivos estáticos
app.use(express.static(__dirname)); // Serve arquivos da raiz (app.js, pagamento.js, etc.)
app.use(express.static(path.join(__dirname, 'templates')));
app.use('/static', express.static(path.join(__dirname, 'static')));

// Rota para favicon (evita erro 404)
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Rota para servir index.html na raiz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

// Endpoints

// Registrar usuário
app.post('/register', async (req, res) => {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
    }
    try {
        // Create user with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password: senha,
            options: {
                data: { nome }
            }
        });
        if (authError) {
            if (authError.message.includes('already registered')) {
                return res.status(400).json({ error: 'E-mail já cadastrado.' });
            }
            return res.status(500).json({ error: 'Erro ao registrar usuário.' });
        }

        // Insert into users table
        const { data, error } = await supabase
            .from('users')
            .insert([{ nome, email, senha }]);
        if (error) {
            console.error('Erro ao inserir na tabela users:', error);
            return res.status(500).json({ error: 'Erro ao registrar usuário.' });
        }
        res.json({ message: 'Usuário registrado com sucesso.', id: data ? data[0].id : null });
    } catch (err) {
        console.error('Erro interno no register:', err);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// Login
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }
    try {
        // Get user data from users table directly
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .eq('senha', senha)
            .single();
        if (error || !data) {
            return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
        }
        res.json({ message: 'Login bem-sucedido.', user: { nome: data.nome, email: data.email } });
    } catch (err) {
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// Agendar
app.post('/appointments', async (req, res) => {
    console.log("📩 Requisição recebida:", req.body);
    const { usuario_email, barber_email, servico, data: dataAgendamento, hora } = req.body;
    if (!usuario_email || !barber_email || !servico || !dataAgendamento || !hora) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }
    try {
        // Verificar se o usuário existe
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('email')
            .eq('email', usuario_email)
            .single();
        if (userError || !userData) {
            return res.status(400).json({ error: 'Usuário não encontrado.' });
        }

        // Verificar se o barbeiro existe
        const { data: barberData, error: barberError } = await supabase
            .from('barbers')
            .select('email')
            .eq('email', barber_email)
            .single();
        if (barberError || !barberData) {
            return res.status(400).json({ error: 'Barbeiro não encontrado.' });
        }

        const { data, error } = await supabase
            .from('appointments')
            .insert([{ usuario_email, barber_email, servico, data: dataAgendamento, hora }]);
        if (error) {
            console.error('Erro ao agendar:', error);
            return res.status(500).json({ error: 'Erro ao agendar.' });
        }
        res.json({ message: 'Agendamento realizado com sucesso.', id: data ? data[0].id : null });
    } catch (err) {
        console.error('Erro interno:', err);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// Obter agendamentos do usuário
app.get('/appointments/:email', async (req, res) => {
    const email = req.params.email;
    try {
        const { data, error } = await supabase
            .from('appointments')
            .select('*, barbers!inner(nome)')
            .eq('usuario_email', email)
            .order('data', { ascending: false })
            .order('hora', { ascending: false });
        if (error) {
            return res.status(500).json({ error: 'Erro ao obter agendamentos.' });
        }
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// Pagar
app.post('/payments', async (req, res) => {
    const { usuario_email, appointment_id, metodo, valor } = req.body;
    if (!usuario_email || !appointment_id || !metodo) {
        return res.status(400).json({ error: 'Dados de pagamento incompletos.' });
    }
    try {
        const { data, error } = await supabase
            .from('payments')
            .insert([{ usuario_email, appointment_id, metodo, valor, status: 'confirmado' }]);
        if (error) {
            return res.status(500).json({ error: 'Erro ao processar pagamento.' });
        }
        res.json({ message: 'Pagamento processado com sucesso.', id: data ? data[0].id : null });
    } catch (err) {
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// Registrar barbeiro
app.post('/register-barber', async (req, res) => {
    const { nome, email, senha, especialidade } = req.body;
    if (!nome || !email || !senha || !especialidade) {
        return res.status(400).json({ error: 'Nome, email, senha e especialidade são obrigatórios.' });
    }
    try {
        const { data, error } = await supabase
            .from('barbers')
            .insert([{ nome, email, senha, especialidade }]);
        if (error) {
            if (error.code === '23505') {
                return res.status(400).json({ error: 'E-mail já cadastrado.' });
            }
            return res.status(500).json({ error: 'Erro ao registrar barbeiro.' });
        }
        res.json({ message: 'Barbeiro registrado com sucesso.', id: data ? data[0].id : null });
    } catch (err) {
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// Login barbeiro
app.post('/login-barber', async (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }
    try {
        const { data, error } = await supabase
            .from('barbers')
            .select('*')
            .eq('email', email)
            .eq('senha', senha)
            .single();
        if (error || !data) {
            return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
        }
        res.json({ message: 'Login bem-sucedido.', barber: { nome: data.nome, email: data.email, especialidade: data.especialidade } });
    } catch (err) {
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// Obter barbeiros
app.get('/barbeiros', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('barbers')
            .select('id, nome, especialidade, email');
        if (error) {
            return res.status(500).json({ error: 'Erro ao obter barbeiros.' });
        }
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// Obter agendamentos do barbeiro
app.get('/barber-appointments/:email', async (req, res) => {
    const email = req.params.email;
    try {
        const { data, error } = await supabase
            .from('appointments')
            .select('*, users!inner(nome)')
            .eq('barber_email', email)
            .order('data', { ascending: false })
            .order('hora', { ascending: false });
        if (error) {
            return res.status(500).json({ error: 'Erro ao obter agendamentos.' });
        }
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// Obter horários disponíveis
app.get('/horarios', (req, res) => {
    const horarios = [
        '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
    ];
    res.json(horarios);
});

// Atualizar preço do serviço
app.post('/update-price', (req, res) => {
    const { servico, preco } = req.body;
    if (!servico || preco === undefined) {
        return res.status(400).json({ error: 'Serviço e preço são obrigatórios.' });
    }
    // Simulação - em produção, armazenar no banco
    res.json({ message: 'Preço atualizado com sucesso.' });
});

// Cancelar agendamento
app.post('/cancel-appointment', async (req, res) => {
    const { id, motivo } = req.body;
    if (!id || !motivo) {
        return res.status(400).json({ error: 'ID do agendamento e motivo são obrigatórios.' });
    }
    try {
        const { data, error } = await supabase
            .from('appointments')
            .update({ status: 'cancelado', motivo_cancelamento: motivo })
            .eq('id', id);
        if (error) {
            return res.status(500).json({ error: 'Erro ao cancelar agendamento.' });
        }
        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Agendamento não encontrado.' });
        }
        res.json({ message: 'Agendamento cancelado com sucesso.' });
    } catch (err) {
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
