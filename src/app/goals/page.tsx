'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Target, Plus, Calendar, DollarSign, CheckCircle2, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import ModernCard from '@/components/ModernCard'
import PageHeader from '@/components/PageHeader'
import GradientButton from '@/components/GradientButton'
import Motion from '@/components/Motion'
import { toast } from 'sonner'
import CountUp from '@/components/CountUp'

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'active' | 'all'>('active')
  const { data: session, status } = useSession()
  const router = useRouter()
  const [progressGoalId, setProgressGoalId] = useState<string | null>(null)
  const [progressInput, setProgressInput] = useState('')

  useEffect(() => {
    if (status === 'authenticated') fetchGoals()
  }, [statusFilter, status])

  const fetchGoals = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/goals/list?status=${statusFilter}&limit=200`)
      const json = await res.json()
      const list: any[] = json.goals || []
      const unique = Array.from(new Map(list.map(g => [g.id || `${g.title}-${g.endDate}`, g])).values())
      setGoals(unique)
    } catch (error) {
      console.error('Erro ao buscar metas:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProgress = (id: string) => {
    setProgressGoalId(id)
    setProgressInput('')
  }

  const confirmUpdateProgress = async () => {
    if (!progressGoalId) return
    const add_amount = Number(progressInput.replace(/\./g, '').replace(',', '.'))
    if (!add_amount || isNaN(add_amount) || add_amount <= 0) {
      toast.error('Valor inválido')
      return
    }
    try {
      const res = await fetch('/api/goals/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: progressGoalId, add_amount }),
      })
      if (!res.ok) throw new Error('Falha ao atualizar progresso')
      await fetchGoals()
      toast.success('Progresso atualizado!')
      setProgressGoalId(null)
      setProgressInput('')
    } catch (e) {
      console.error(e)
      toast.error('Erro ao atualizar progresso')
    }
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch('/api/goals/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !isActive }),
      })
      if (!res.ok) throw new Error('Falha ao atualizar status')
      await fetchGoals()
      toast.success('Status atualizado!')
    } catch (e) {
      console.error(e)
      toast.error('Erro ao atualizar status')
    }
  }

  const deleteGoal = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta meta?')) return
    try {
      const res = await fetch('/api/goals/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error('Falha ao excluir')
      await fetchGoals()
      toast.success('Meta excluída com sucesso!')
    } catch (e) {
      console.error(e)
      toast.error('Erro ao excluir meta')
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="max-w-6xl mx-auto">
          <ModernCard className="p-6">
            <div className="animate-pulse">
              <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl w-1/3 mb-8"></div>
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
                ))}
              </div>
            </div>
          </ModernCard>
        </div>
      </div>
    )
  }

  if (status !== 'authenticated') {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <PageHeader
          title="Metas Financeiras"
          subtitle="Crie e acompanhe suas metas de forma simples"
          actions={(
            <GradientButton onClick={() => router.push('/goals/new')}>
              Criar Nova Meta
            </GradientButton>
          )}
        />

        <ModernCard className="p-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                statusFilter === 'active'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-lg'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              Ativas
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-lg'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              Todas
            </button>
          </div>
        </ModernCard>

        {goals.length === 0 ? (
          <Motion>
          <ModernCard className="p-8 text-center">
            <div className="text-slate-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Nenhuma meta encontrada</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Comece criando sua primeira meta financeira.
            </p>
            <GradientButton onClick={() => router.push('/goals/new')}>Criar Nova Meta</GradientButton>
          </ModernCard>
          </Motion>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((goal, i) => {
              const current = Number(goal.currentAmount || 0)
              const target = Number(goal.targetAmount || 0)
              const percent = Math.min(100, Math.floor((current / Math.max(target, 1)) * 100))
              const end = new Date(goal.endDate)
              const isCompleted = percent >= 100
              const isLate = !isCompleted && end.getTime() < new Date().getTime()
              return (
                <Motion key={goal.id ?? `${goal.title}-${i}`}>
                <ModernCard className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-green-100">
                        <Target className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">{goal.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{goal.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-medium bg-green-100 text-green-700">
                          <CheckCircle2 className="h-4 w-4" /> Concluída
                        </span>
                      ) : isLate ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-medium bg-yellow-100 text-yellow-700">
                          <AlertTriangle className="h-4 w-4" /> Atrasada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-medium bg-blue-100 text-blue-700">
                          Em andamento
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <DollarSign className="h-4 w-4" />
                        <span>Atual: R$ <CountUp value={current} duration={800} format={(v) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} /></span>
                      </div>
                      <div className="text-slate-600 dark:text-slate-400">
                        Alvo: R$ <CountUp value={target} duration={800} format={(v) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} />
                      </div>
                    </div>
                    <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-xl overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="mt-2 text-right text-xs text-slate-500"><CountUp value={percent} duration={600} format={(v) => `${Math.round(v)}%`} /></div>
                  </div>

                  {progressGoalId === goal.id && (
                    <div className="mb-4 flex items-center gap-2">
                      <input
                        value={progressInput}
                        onChange={(e) => setProgressInput(e.target.value)}
                        placeholder="Valor a adicionar (R$)"
                        className="px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 w-48"
                      />
                      <button onClick={confirmUpdateProgress} className="px-3 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white">Confirmar</button>
                      <button onClick={() => { setProgressGoalId(null); setProgressInput('') }} className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white">Cancelar</button>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(goal.startDate).toLocaleDateString('pt-BR')} — {new Date(goal.endDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <span className={goal.isActive ? 'text-green-600' : 'text-slate-500'}>{goal.isActive ? 'Ativa' : 'Inativa'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateProgress(goal.id)}
                      className="px-4 py-2 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-semibold transition-all"
                    >
                      Atualizar Progresso
                    </button>
                    <button
                      onClick={() => toggleActive(goal.id, goal.isActive)}
                      className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold transition-all"
                    >
                      {goal.isActive ? 'Desativar' : 'Ativar'}
                    </button>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="px-4 py-2 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-all"
                    >
                      Excluir
                    </button>
                  </div>
                </ModernCard>
                </Motion>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
