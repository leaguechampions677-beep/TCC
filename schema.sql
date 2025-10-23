-- Schema para Supabase PostgreSQL

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de barbeiros
CREATE TABLE IF NOT EXISTS barbers (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    especialidade TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de agendamentos
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    usuario_email TEXT NOT NULL,
    barber_email TEXT NOT NULL,
    servico TEXT NOT NULL,
    data DATE NOT NULL,
    hora TIME NOT NULL,
    status TEXT DEFAULT 'ativo',
    motivo_cancelamento TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (usuario_email) REFERENCES users(email) ON DELETE CASCADE,
    FOREIGN KEY (barber_email) REFERENCES barbers(email) ON DELETE CASCADE
);

-- Tabela de pagamentos
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    usuario_email TEXT NOT NULL,
    appointment_id INTEGER NOT NULL,
    metodo TEXT NOT NULL,
    status TEXT DEFAULT 'pendente',
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (usuario_email) REFERENCES users(email) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_appointments_usuario_email ON appointments(usuario_email);
CREATE INDEX IF NOT EXISTS idx_appointments_barber_email ON appointments(barber_email);
CREATE INDEX IF NOT EXISTS idx_appointments_data ON appointments(data);
CREATE INDEX IF NOT EXISTS idx_payments_usuario_email ON payments(usuario_email);
