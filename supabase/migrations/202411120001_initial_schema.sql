-- Criar tabela de usuários
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para email
CREATE INDEX idx_users_email ON users(email);

-- Criar tabela de transações
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount != 0),
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    category VARCHAR(50) NOT NULL,
    description TEXT,
    transaction_date DATE NOT NULL,
    recurring VARCHAR(20), -- 'weekly', 'monthly', 'yearly'
    source VARCHAR(50), -- 'manual', 'csv', 'ocr'
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_category ON transactions(category);

-- Criar tabela de metas
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    target_amount DECIMAL(10,2) NOT NULL CHECK (target_amount > 0),
    current_amount DECIMAL(10,2) DEFAULT 0 CHECK (current_amount >= 0),
    category VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_active ON goals(is_active);
CREATE INDEX idx_goals_dates ON goals(start_date, end_date);

-- Criar tabela de categorias
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    icon VARCHAR(10) DEFAULT '📊',
    color VARCHAR(7) DEFAULT '#3B82F6',
    is_default BOOLEAN DEFAULT false,
    type VARCHAR(10) CHECK (type IN ('income', 'expense', 'both')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice
CREATE INDEX idx_categories_user_id ON categories(user_id);

-- Inserir categorias padrão para o contexto deles
INSERT INTO categories (name, icon, color, is_default, type) VALUES
    ('Limpeza Pós-Obra', '🧹', '#10B981', true, 'income'),
    ('Serviço Extra', '💪', '#10B981', true, 'income'),
    ('Cartão - Internet', '💳', '#EF4444', true, 'expense'),
    ('Alimentação', '🍽️', '#EF4444', true, 'expense'),
    ('Materiais de Limpeza', '🧼', '#EF4444', true, 'expense'),
    ('Transporte', '🚗', '#EF4444', true, 'expense'),
    ('Outros Gastos', '📦', '#EF4444', true, 'expense'),
    ('Corte de Cabelo', '✂️', '#EF4444', true, 'expense');

-- Habilitar RLS (Row Level Security)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Criar policies RLS
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own goals" ON goals
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view categories" ON categories
    FOR SELECT USING (is_default = true OR user_id = auth.uid());

CREATE POLICY "Users can manage own categories" ON categories
    FOR ALL USING (user_id = auth.uid());

-- Conceder permissões
GRANT SELECT ON categories TO anon;
GRANT ALL PRIVILEGES ON transactions TO authenticated;
GRANT ALL PRIVILEGES ON goals TO authenticated;
GRANT ALL PRIVILEGES ON categories TO authenticated;