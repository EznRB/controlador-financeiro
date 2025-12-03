'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import ModernCard from '@/components/ModernCard'
import PageHeader from '@/components/PageHeader'
import GradientButton from '@/components/GradientButton'
import Motion from '@/components/Motion'
import { toast } from 'sonner'

interface RecurringExpense {
  id: string
  title: string
  amount: number
  category: string
  description: string
  frequency: 'weekly' | 'monthly'
  start_date: string
  is_active: boolean
  last_processed?: string
  created_at: string
}

export default function RecurringExpensesPage() {
  const [expenses, setExpenses] = useState<RecurringExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') fetchRecurringExpenses()
  }, [status])

  const fetchRecurringExpenses = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/recurring/list')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha ao carregar')
      setExpenses(json.expenses || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar despesas recorrentes')
      console.error('Erro ao buscar despesas recorrentes:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleExpenseStatus = async (expenseId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/recurring/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: expenseId, is_active: !currentStatus })
      })
      if (!res.ok) throw new Error('Falha ao atualizar')
      setExpenses(expenses.map(expense => expense.id === expenseId ? { ...expense, is_active: !currentStatus } : expense))
      toast.success(!currentStatus ? 'Despesa ativada' : 'Despesa pausada')
    } catch (err) {
      toast.error(`Erro ao atualizar status: ${err instanceof Error ? err.message : 'Erro desconhecido'}`)
    }
  }

  const deleteExpense = async (expenseId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta despesa recorrente?')) return
    try {
      const res = await fetch('/api/recurring/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: expenseId })
      })
      if (!res.ok) throw new Error('Falha ao excluir')
      setExpenses(expenses.filter(expense => expense.id !== expenseId))
      toast.success('Despesa excluída')
    } catch (err) {
      toast.error(`Erro ao excluir: ${err instanceof Error ? err.message : 'Erro desconhecido'}`)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getFrequencyLabel = (frequency: string) => {
    return frequency === 'weekly' ? 'Semanal' : 'Mensal'
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <PageHeader
          title="Despesas Recorrentes"
          subtitle="Automatize suas despesas semanais e mensais"
          actions={<GradientButton onClick={() => router.push('/recurring/new')}>Nova Despesa</GradientButton>}
        />

        {error && (
          <ModernCard className="p-4 border border-red-200 dark:border-red-800">
            <div className="text-red-700 dark:text-red-400">{error}</div>
          </ModernCard>
        )}

        {expenses.length === 0 ? (
          <Motion>
          <ModernCard className="p-8 text-center">
            <div className="text-gray-500 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Nenhuma despesa recorrente</h3>
            <p className="text-slate-500 mb-4">Configure despesas que se repetem regularmente</p>
            <GradientButton onClick={() => router.push('/recurring/new')}>Criar Primeira Despesa</GradientButton>
          </ModernCard>
          </Motion>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {expenses.map((expense) => (
              <Motion>
              <ModernCard key={expense.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                      {expense.title}
                    </h3>
                    <p className="text-sm text-slate-500 mb-2">
                      {expense.description}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    expense.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {expense.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Valor:</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(expense.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Frequência:</span>
                    <span className="font-medium">{getFrequencyLabel(expense.frequency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Categoria:</span>
                    <span className="font-medium">{expense.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Início:</span>
                    <span className="font-medium">{formatDate(expense.start_date)}</span>
                  </div>
                  {expense.last_processed && (
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Último processamento:</span>
                      <span className="font-medium text-xs">{formatDate(expense.last_processed)}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleExpenseStatus(expense.id, expense.is_active)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      expense.is_active
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {expense.is_active ? 'Pausar' : 'Ativar'}
                  </button>
                  <button
                    onClick={() => deleteExpense(expense.id)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                  >
                    Excluir
                  </button>
                </div>
              </ModernCard>
              </Motion>
            ))}
          </div>
        )}

        <ModernCard className="mt-8 p-6">
          <h3 className="text-lg font-medium text-blue-900 dark:text-blue-300 mb-2">Como funcionam as despesas recorrentes?</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
            <li>• Despesas semanais são processadas automaticamente toda semana</li>
            <li>• Despesas mensais são processadas no mesmo dia do mês</li>
            <li>• Você pode pausar ou ativar qualquer despesa a qualquer momento</li>
            <li>• As transações geradas aparecem automaticamente no seu extrato</li>
          </ul>
        </ModernCard>
      </div>
    </div>
  )
}
