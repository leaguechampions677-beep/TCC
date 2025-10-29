-- Políticas RLS para Supabase

-- Habilitar RLS nas tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Barbers can be viewed by everyone" ON barbers;
DROP POLICY IF EXISTS "Barbers can be inserted by anyone" ON barbers;
DROP POLICY IF EXISTS "Users can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can create appointments" ON appointments;
DROP POLICY IF EXISTS "Barbers can view their appointments" ON appointments;
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Users can create payments" ON payments;

-- Políticas para users
-- Permitir leitura (para login e listagem)
CREATE POLICY "Users can view data" ON users
    FOR SELECT USING (true);

-- Permitir atualização própria
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Permitir insert (para cadastro)
CREATE POLICY "Users can insert data" ON users
    FOR INSERT WITH CHECK (true);

-- Políticas para barbers
-- Permitir leitura pública (para listagem)
CREATE POLICY "Barbers can be viewed by everyone" ON barbers
    FOR SELECT USING (true);

-- Permitir insert (para cadastro de barbeiros)
CREATE POLICY "Barbers can be inserted by anyone" ON barbers
    FOR INSERT WITH CHECK (true);

-- Políticas para appointments
-- Permitir leitura (para listagem)
CREATE POLICY "Appointments can be viewed" ON appointments
    FOR SELECT USING (true);

-- Usuários podem criar agendamentos
CREATE POLICY "Users can create appointments" ON appointments
    FOR INSERT WITH CHECK (true);

-- Permitir atualização (para cancelamento)
CREATE POLICY "Appointments can be updated" ON appointments
    FOR UPDATE USING (true);

-- Políticas para payments
-- Usuários podem ver seus próprios pagamentos
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (auth.email() = usuario_email);

-- Usuários podem criar pagamentos
CREATE POLICY "Users can create payments" ON payments
    FOR INSERT WITH CHECK (auth.email() = usuario_email);
