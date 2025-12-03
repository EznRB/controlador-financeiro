'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ModernCard from '@/components/ModernCard'
import PageHeader from '@/components/PageHeader'
import GradientButton from '@/components/GradientButton'

const CATEGORIES = [
  'Cartão de Crédito',
  'Alimentação',
  'Corte de Cabelo',
  'Transporte',
  'Materiais de Limpeza',
  'Manutenção Equipamentos',
  'Outros Gastos',
  'Outros'
]

export default function NewRecurringExpensePage() {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [frequency, setFrequency] = useState<'weekly' | 'monthly'>('monthly')
  const [startDate, setStartDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title || !amount || !category || !startDate) {
      setError('Por favor, preencha todos os campos obrigatórios')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const res = await fetch('/api/recurring/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          amount: parseFloat(amount),
          category,
          description,
          frequency,
          start_date: startDate,
        })
      })
      if (!res.ok) throw new Error('Falha ao criar despesa')

      router.push('/recurring')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar despesa recorrente')
      console.error('Erro ao criar despesa recorrente:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: string) => {
    const number = parseFloat(value)
    if (isNaN(number)) return ''
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(number)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <PageHeader
          title="Nova Despesa Recorrente"
          subtitle="Configure uma despesa automática"
          actions={<GradientButton onClick={() => router.push('/recurring')} className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800">Voltar</GradientButton>}
        />
        {error && (
          <ModernCard className="p-4 border border-red-200 dark:border-red-800">
            <div className="text-red-700 dark:text-red-400">{error}</div>
          </ModernCard>
        )}

        <ModernCard className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: Aluguel, Mensalidade Academia"
                required
              />
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Valor *
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0.00"
                step="0.01"
                min="0.01"
                required
              />
              {amount && (
                <p className="text-sm text-gray-500 mt-1">
                  Valor formatado: {formatCurrency(amount)}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Selecione uma categoria</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Descrição (opcional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Descreva esta despesa recorrente..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequência *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="frequency"
                    value="weekly"
                    checked={frequency === 'weekly'}
                    onChange={(e) => setFrequency(e.target.value as 'weekly' | 'monthly')}
                    className="mr-2"
                  />
                  Semanal
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="frequency"
                    value="monthly"
                    checked={frequency === 'monthly'}
                    onChange={(e) => setFrequency(e.target.value as 'weekly' | 'monthly')}
                    className="mr-2"
                  />
                  Mensal
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Data de Início *
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.push('/recurring')}
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-2xl hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <GradientButton type="submit" disabled={loading} className="flex-1 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Criando...' : 'Criar Despesa'}
              </GradientButton>
            </div>
          </form>
        </ModernCard>

        <ModernCard className="mt-6 p-4">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">Exemplos de despesas recorrentes:</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
            <li>• <strong>Mensal:</strong> Aluguel, fatura do cartão, mensalidade de academia</li>
            <li>• <strong>Semanal:</strong> Feira, gasolina estimada, lanche da semana</li>
          </ul>
        </ModernCard>
      </div>
    </div>
  )
}
