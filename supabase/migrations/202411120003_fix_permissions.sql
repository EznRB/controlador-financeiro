-- Verificar e garantir permissões corretas para todas as tabelas

-- Conceder permissões para transactions
GRANT SELECT ON transactions TO anon;
GRANT ALL PRIVILEGES ON transactions TO authenticated;

-- Conceder permissões para goals  
GRANT SELECT ON goals TO anon;
GRANT ALL PRIVILEGES ON goals TO authenticated;

-- Conceder permissões para categories
GRANT SELECT ON categories TO anon;
GRANT ALL PRIVILEGES ON categories TO authenticated;

-- Conceder permissões para recurring_expenses
GRANT SELECT ON recurring_expenses TO anon;
GRANT ALL PRIVILEGES ON recurring_expenses TO authenticated;

-- Conceder permissões para users
GRANT SELECT ON users TO anon;
GRANT ALL PRIVILEGES ON users TO authenticated;

-- Garantir que RLS está habilitado corretamente
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;