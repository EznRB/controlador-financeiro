-- Criar tabela de despesas recorrentes
CREATE TABLE recurring_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    category VARCHAR(50) NOT NULL,
    description TEXT,
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('weekly', 'monthly')),
    start_date DATE NOT NULL,
    last_processed TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX idx_recurring_expenses_user_id ON recurring_expenses(user_id);
CREATE INDEX idx_recurring_expenses_active ON recurring_expenses(is_active);
CREATE INDEX idx_recurring_expenses_frequency ON recurring_expenses(frequency);

-- Adicionar coluna source na tabela transactions para rastrear origem
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'manual' 
CHECK (source IN ('manual', 'csv', 'ocr', 'recurring'));

-- Atualizar transactions existentes para ter source 'manual'
UPDATE transactions SET source = 'manual' WHERE source IS NULL;

-- Habilitar RLS para recurring_expenses
ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;

-- Criar policies RLS para recurring_expenses
CREATE POLICY "Users can manage own recurring expenses" ON recurring_expenses
    FOR ALL USING (auth.uid() = user_id);

-- Conceder permissões
GRANT ALL PRIVILEGES ON recurring_expenses TO authenticated;

-- Adicionar updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_recurring_expenses_updated_at 
    BEFORE UPDATE ON recurring_expenses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();