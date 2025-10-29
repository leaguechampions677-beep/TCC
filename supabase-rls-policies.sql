-- Políticas RLS para Supabase

-- Habilitar RLS nas tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Políticas para users
-- Permitir leitura própria
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

-- Permitir atualização própria
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Permitir insert (para cadastro)
CREATE POLICY "Users can insert own data" ON users
    FOR INSERT WITH CHECK (true);

-- Políticas para barbers
-- Permitir leitura pública (para listagem)
CREATE POLICY "Barbers can be viewed by everyone" ON barbers
    FOR SELECT USING (true);

-- Permitir insert (para cadastro de barbeiros)
CREATE POLICY "Barbers can be inserted by anyone" ON barbers
    FOR INSERT WITH CHECK (true);

-- Políticas para appointments
-- Usuários podem ver seus próprios agendamentos
CREATE POLICY "Users can view own appointments" ON appointments
    FOR SELECT USING (auth.email() = usuario_email);

-- Usuários podem criar agendamentos
CREATE POLICY "Users can create appointments" ON appointments
    FOR INSERT WITH CHECK (auth.email() = usuario_email);

-- Barbeiros podem ver agendamentos deles
CREATE POLICY "Barbers can view their appointments" ON appointments
    FOR SELECT USING (auth.email() = barber_email);

-- Políticas para payments
-- Usuários podem ver seus próprios pagamentos
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (auth.email() = usuario_email);

-- Usuários podem criar pagamentos
CREATE POLICY "Users can create payments" ON payments
    FOR INSERT WITH CHECK (auth.email() = usuario_email);
