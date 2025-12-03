-- Inserir usuário Enzo
INSERT INTO users (id, email, name, preferences) VALUES 
('c3f4a5b6-7d8e-9f0a-1b2c-3d4e5f6a7b8c', 'enzo@example.com', 'Enzo', '{"currency": "BRL", "language": "pt-BR"}');

-- Inserir transações de exemplo (renda diária)
INSERT INTO transactions (id, user_id, amount, type, category, description, transaction_date, source, created_at) VALUES
-- Renda de 10 dias (1-10 de novembro de 2025)
('t1', 'c3f4a5b6-7d8e-9f0a-1b2c-3d4e5f6a7b8c', 150.00, 'income', 'Limpeza Pós-Obra', 'Serviço de limpeza no condomínio', '2025-11-01', 'manual', NOW()),
('t2', 'c3f4a5b6-7d8e-9f0a-1b2c-3d4e5f6a7b8c', 150.00, 'income', 'Limpeza Pós-Obra', 'Serviço de limpeza no condomínio', '2025-11-02', 'manual', NOW()),
('t3', 'c3f4a5b6-7d8e-9f0a-1b2c-3d4e5f6a7b8c', 150.00, 'income', 'Limpeza Pós-Obra', 'Serviço de limpeza no condomínio', '2025-11-03', 'manual', NOW()),
('t4', 'c3f4a5b6-7d8e-9f0a-1b2c-3d4e5f6a7b8c', 150.00, 'income', 'Limpeza Pós-Obra', 'Serviço de limpeza no condomínio', '2025-11-04', 'manual', NOW()),
('t5', 'c3f4a5b6-7d8e-9f0a-1b2c-3d4e5f6a7b8c', 150.00, 'income', 'Limpeza Pós-Obra', 'Serviço de limpeza no condomínio', '2025-11-05', 'manual', NOW()),
('t6', 'c3f4a5b6-7d8e-9f0a-1b2c-3d4e5f6a7b8c', 150.00, 'income', 'Limpeza Pós-Obra', 'Serviço de limpeza no condomínio', '2025-11-06', 'manual', NOW()),
('t7', 'c3f4a5b6-7d8e-9f0a-1b2c-3d4e5f6a7b8c', 150.00, 'income', 'Limpeza Pós-Obra', 'Serviço de limpeza no condomínio', '2025-11-07', 'manual', NOW()),
('t8', 'c3f4a5b6-7d8e-9f0a-1b2c-3d4e5f6a7b8c', 150.00, 'income', 'Limpeza Pós-Obra', 'Serviço de limpeza no condomínio', '2025-11-08', 'manual', NOW()),
('t9', 'c3f4a5b6-7d8e-9f0a-1b2c-3d4e5f6a7b8c', 150.00, 'income', 'Limpeza Pós-Obra', 'Serviço de limpeza no condomínio', '2025-11-09', 'manual', NOW()),
('t10', 'c3f4a5b6-7d8e-9f0a-1b2c-3d4e5f6a7b8c', 150.00, 'income', 'Limpeza Pós-Obra', 'Serviço de limpeza no condomínio', '2025-11-10', 'manual', NOW());

-- Despesas recorrentes
-- Cartão mensal (R$200)
INSERT INTO transactions (id, user_id, amount, type, category, description, transaction_date, recurring, source, created_at) VALUES
('d1', 'c3f4a5b6-7d8e-9f0a-1b2c-3d4e5f6a7b8c', -200.00, 'expense', 'Cartão - Internet', 'Fatura do cartão de crédito', '2025-11-05', 'monthly', 'manual', NOW());

-- Alimentação semanal (R$100 por semana)
INSERT INTO transactions (id, user_id, amount, type, category, description, transaction_date, recurring, source, created_at) VALUES
('d2', 'c3f4a5b6-7d8e-9f0a-1b2c-3d4e5f6a7b8c', -100.00, 'expense', 'Alimentação', 'Compras da semana', '2025-11-03', 'weekly', 'manual', NOW()),
('d3', 'c3f4a5b6-7d8e-9f0a-1b2c-3d4e5f6a7b8c', -100.00, 'expense', 'Alimentação', 'Compras da semana', '2025-11-10', 'weekly', 'manual', NOW());

-- Corte de cabelo mensal (R$70)
INSERT INTO transactions (id, user_id, amount, type, category, description, transaction_date, recurring, source, created_at) VALUES
('d4', 'c3f4a5b6-7d8e-9f0a-1b2c-3d4e5f6a7b8c', -70.00, 'expense', 'Corte de Cabelo', 'Corte de cabelo mensal', '2025-11-07', 'monthly', 'manual', NOW());

-- Criar meta financeira
INSERT INTO goals (id, user_id, title, target_amount, current_amount, category, start_date, end_date, is_active, created_at) VALUES
('g1', 'c3f4a5b6-7d8e-9f0a-1b2c-3d4e5f6a7b8c', 'Economizar para festas de fim de ano', 2000.00, 850.00, 'Limpeza Pós-Obra', '2025-11-01', '2025-12-31', true, NOW());