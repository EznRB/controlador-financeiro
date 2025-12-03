'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ModernCard from '@/components/ModernCard'
import PageHeader from '@/components/PageHeader'
import GradientButton from '@/components/GradientButton'
import { Target, Calendar, DollarSign } from 'lucide-react'

export default function NewGoalPage() {
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Geral')
  const [target, setTarget] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const target_amount = Number(target.replace(/\./g, '').replace(',', '.'))
    if (!title || !target_amount || isNaN(target_amount) || target_amount <= 0 || !startDate || !endDate) {
      alert('Preencha os campos corretamente')
      return
    }
    try {
      setLoading(true)
      const res = await fetch('/api/goals/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          target_amount,
          category,
          start_date: startDate,
          end_date: endDate,
        }),
      })
      if (!res.ok) throw new Error('Falha ao criar meta')
      router.push('/goals')
    } catch (error) {
      console.error(error)
      alert('Erro ao criar meta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <PageHeader
          title="Nova Meta"
          subtitle="Defina o objetivo e o período"
          actions={(
            <GradientButton onClick={() => router.push('/goals')} className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800">
              Voltar para Metas
            </GradientButton>
          )}
        />

        <ModernCard className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Título</label>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3">
                  <Target className="h-5 w-5 text-slate-500" />
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex.: Reserva de emergência"
                    className="w-full bg-transparent outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3"
                >
                  <option>Geral</option>
                  <option>Casa</option>
                  <option>Carro</option>
                  <option>Educação</option>
                  <option>Viagem</option>
                  <option>Investimentos</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Valor da Meta (R$)</label>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3">
                  <DollarSign className="h-5 w-5 text-slate-500" />
                  <input
                    type="text"
                    inputMode="decimal"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="Ex.: 10000,00"
                    className="w-full bg-transparent outline-none"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Início</label>
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3">
                    <Calendar className="h-5 w-5 text-slate-500" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-transparent outline-none"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Fim</label>
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3">
                    <Calendar className="h-5 w-5 text-slate-500" />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-transparent outline-none"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-slate-600 dark:text-slate-400">Você poderá atualizar o progresso pela lista de metas.</p>
              <GradientButton type="submit" disabled={loading}>
                {loading ? 'Criando...' : 'Criar Meta'}
              </GradientButton>
            </div>
          </form>
        </ModernCard>
      </div>
    </div>
  )
}
