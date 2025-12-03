import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'

export async function setupDefaultRecurringExpensesClient(userId: string): Promise<void> {
  const today = format(new Date(), 'yyyy-MM-dd')

  const configs = [
    {
      user_id: userId,
      title: 'Cartão de Crédito',
      amount: 200.0,
      category: 'Cartão de Crédito',
      frequency: 'monthly' as const,
      start_date: today,
      description: 'Fatura do cartão de crédito mensal',
      is_active: true,
    },
    {
      user_id: userId,
      title: 'Alimentação',
      amount: 100.0,
      category: 'Alimentação',
      frequency: 'weekly' as const,
      start_date: today,
      description: 'Despesas semanais com alimentação',
      is_active: true,
    },
    {
      user_id: userId,
      title: 'Corte de Cabelo',
      amount: 70.0,
      category: 'Corte de Cabelo',
      frequency: 'monthly' as const,
      start_date: today,
      description: 'Corte de cabelo mensal',
      is_active: true,
    },
  ]

  const { error } = await supabase.from('recurring_expenses').insert(configs)
  if (error) throw new Error(`Erro ao configurar despesas recorrentes: ${error.message}`)
}
