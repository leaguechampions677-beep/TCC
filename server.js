const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'templates')));
app.use('/static', express.static(path.join(__dirname, 'static')));

// Conectar ao banco de dados SQLite
const db = new sqlite3.Database('./barbearia.db', (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        createTables();
    }
});

// Criar tabelas
function createTables() {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS barbers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        especialidade TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_email TEXT NOT NULL,
        barber_email TEXT NOT NULL,
        servico TEXT NOT NULL,
        data TEXT NOT NULL,
        hora TEXT NOT NULL,
        status TEXT DEFAULT 'ativo',
        motivo_cancelamento TEXT,
        FOREIGN KEY (usuario_email) REFERENCES users (email),
        FOREIGN KEY (barber_email) REFERENCES barbers (email)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_email TEXT NOT NULL,
        appointment_id INTEGER NOT NULL,
        metodo TEXT NOT NULL,
        status TEXT DEFAULT 'pendente',
        FOREIGN KEY (usuario_email) REFERENCES users (email),
        FOREIGN KEY (appointment_id) REFERENCES appointments (id)
    )`);
}

// Endpoints

// Registrar usuário
app.post('/register', (req, res) => {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
    }
    const sql = 'INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)';
    db.run(sql, [nome, email, senha], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: 'E-mail já cadastrado.' });
            }
            return res.status(500).json({ error: 'Erro ao registrar usuário.' });
        }
        res.json({ message: 'Usuário registrado com sucesso.', id: this.lastID });
    });
});

// Login
app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }
    const sql = 'SELECT * FROM users WHERE email = ? AND senha = ?';
    db.get(sql, [email, senha], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao fazer login.' });
        }
        if (!row) {
            return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
        }
        res.json({ message: 'Login bem-sucedido.', user: { nome: row.nome, email: row.email } });
    });
});

// Agendar
app.post('/appointments', (req, res) => {
    const { usuario_email, servico, data, hora } = req.body;
    if (!usuario_email || !servico || !data || !hora) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }
    const sql = 'INSERT INTO appointments (usuario_email, servico, data, hora) VALUES (?, ?, ?, ?)';
    db.run(sql, [usuario_email, servico, data, hora], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Erro ao agendar.' });
        }
        res.json({ message: 'Agendamento realizado com sucesso.', id: this.lastID });
    });
});

// Obter agendamentos do usuário
app.get('/appointments/:email', (req, res) => {
    const email = req.params.email;
    const sql = 'SELECT a.*, b.nome as barbeiro_nome FROM appointments a JOIN barbers b ON a.barber_email = b.email WHERE a.usuario_email = ? ORDER BY a.data DESC, a.hora DESC';
    db.all(sql, [email], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao obter agendamentos.' });
        }
        res.json(rows);
    });
});

// Pagar
app.post('/payments', (req, res) => {
    const { usuario_email, appointment_id, metodo } = req.body;
    if (!usuario_email || !appointment_id || !metodo) {
        return res.status(400).json({ error: 'Dados de pagamento incompletos.' });
    }
    const sql = 'INSERT INTO payments (usuario_email, appointment_id, metodo, status) VALUES (?, ?, ?, ?)';
    db.run(sql, [usuario_email, appointment_id, metodo, 'confirmado'], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Erro ao processar pagamento.' });
        }
        res.json({ message: 'Pagamento processado com sucesso.', id: this.lastID });
    });
});

// Registrar barbeiro
app.post('/register-barber', (req, res) => {
    const { nome, email, senha, especialidade } = req.body;
    if (!nome || !email || !senha || !especialidade) {
        return res.status(400).json({ error: 'Nome, email, senha e especialidade são obrigatórios.' });
    }
    const sql = 'INSERT INTO barbers (nome, email, senha, especialidade) VALUES (?, ?, ?, ?)';
    db.run(sql, [nome, email, senha, especialidade], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: 'E-mail já cadastrado.' });
            }
            return res.status(500).json({ error: 'Erro ao registrar barbeiro.' });
        }
        res.json({ message: 'Barbeiro registrado com sucesso.', id: this.lastID });
    });
});

// Login barbeiro
app.post('/login-barber', (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }
    const sql = 'SELECT * FROM barbers WHERE email = ? AND senha = ?';
    db.get(sql, [email, senha], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao fazer login.' });
        }
        if (!row) {
            return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
        }
        res.json({ message: 'Login bem-sucedido.', barber: { nome: row.nome, email: row.email, especialidade: row.especialidade } });
    });
});

// Obter barbeiros
app.get('/barbeiros', (req, res) => {
    const sql = 'SELECT id, nome, especialidade, email FROM barbers';
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao obter barbeiros.' });
        }
        res.json(rows);
    });
});

// Obter agendamentos do barbeiro
app.get('/barber-appointments/:email', (req, res) => {
    const email = req.params.email;
    const sql = 'SELECT a.*, u.nome as usuario_nome FROM appointments a JOIN users u ON a.usuario_email = u.email WHERE a.barber_email = ? ORDER BY a.data DESC, a.hora DESC';
    db.all(sql, [email], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao obter agendamentos.' });
        }
        res.json(rows);
    });
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
    // Aqui você pode armazenar em uma tabela de preços ou atualizar globalmente
    // Por simplicidade, vamos simular uma atualização (em produção, use banco)
    res.json({ message: 'Preço atualizado com sucesso.' });
});

// Cancelar agendamento
app.post('/cancel-appointment', (req, res) => {
    const { id, motivo } = req.body;
    if (!id || !motivo) {
        return res.status(400).json({ error: 'ID do agendamento e motivo são obrigatórios.' });
    }
    const sql = 'UPDATE appointments SET status = ?, motivo_cancelamento = ? WHERE id = ?';
    db.run(sql, ['cancelado', motivo, id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Erro ao cancelar agendamento.' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Agendamento não encontrado.' });
        }
        res.json({ message: 'Agendamento cancelado com sucesso.' });
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
