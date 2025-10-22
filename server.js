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

    db.run(`CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_email TEXT NOT NULL,
        servico TEXT NOT NULL,
        data TEXT NOT NULL,
        hora TEXT NOT NULL,
        FOREIGN KEY (usuario_email) REFERENCES users (email)
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
    const sql = 'SELECT * FROM appointments WHERE usuario_email = ? ORDER BY data DESC, hora DESC';
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

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
