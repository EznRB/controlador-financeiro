'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Plus, DollarSign, TrendingUp, TrendingDown, Calendar, Wallet, PiggyBank, CreditCard } from 'lucide-react';
import Motion from '@/components/Motion'
import CountUp from '@/components/CountUp'
import SetupProgress from '@/components/SetupProgress'
import { toast } from 'sonner'
import { fetchJson } from '@/lib/fetchJson'
import { format } from 'date-fns';
import { safeFormat } from '@/lib/date';
import { ptBR } from 'date-fns/locale';

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  transaction_date: string;
}

interface DashboardStats {
  current_balance: number;
  total_income: number;
  total_expense: number;
  last_transactions: Transaction[];
}

// Componente de Card moderno
function ModernCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
}

// Componente de estatística
function StatCard({ title, value, icon: Icon, trend, color, trendText }: {
  title: string;
  value: number;
  icon: any;
  trend?: 'up' | 'down';
  color: 'green' | 'red' | 'blue';
  trendText?: string;
}) {
  const colors = {
    green: { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400', icon: 'text-green-500' },
    red: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', icon: 'text-red-500' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', icon: 'text-blue-500' },
  };

  return (
    <Motion>
    <ModernCard className="p-6 hover:scale-[1.02]">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
          <p className={`text-2xl font-bold ${colors[color].text}`}>R$ <CountUp value={value} duration={800} format={(v) => Number(v).toFixed(2)} /></p>
          {trend && (
            <div className={`flex items-center gap-1 text-xs ${colors[trend === 'up' ? 'green' : 'red'].text}`}>
              {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{trendText || ''}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colors[color].bg}`}>
          <Icon className={`h-6 w-6 ${colors[color].icon}`} />
        </div>
      </div>
    </ModernCard>
    </Motion>
  );
}

// Botão de ação rápida
function QuickActionButton({ onClick, icon: Icon, title, subtitle, color }: {
  onClick: () => void;
  icon: any;
  title: string;
  subtitle: string;
  color: 'green' | 'blue' | 'purple';
}) {
  const colors = {
    green: { from: 'from-green-500', to: 'to-emerald-600', hover: 'hover:from-green-600 hover:to-emerald-700' },
    blue: { from: 'from-blue-500', to: 'to-cyan-600', hover: 'hover:from-blue-600 hover:to-cyan-700' },
    purple: { from: 'from-purple-500', to: 'to-violet-600', hover: 'hover:from-purple-600 hover:to-violet-700' },
  };

  return (
    <button
      onClick={onClick}
      className={`w-full bg-gradient-to-r ${colors[color].from} ${colors[color].to} ${colors[color].hover} text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-4 group`}
    >
      <div className={`p-2 rounded-lg bg-white/20 group-hover:bg-white/30 transition-colors`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="text-left flex-1">
        <div className="text-lg font-bold">{title}</div>
        <div className="text-sm opacity-90">{subtitle}</div>
      </div>
      <div className="opacity-70 group-hover:opacity-100 transition-opacity">
        <Plus className="h-5 w-5" />
      </div>
    </button>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [period, setPeriod] = useState<'day'|'week'|'month'|'year'|'last7'|'last30'|'custom'>('month')
  const [customStart, setCustomStart] = useState<string>('')
  const [customEnd, setCustomEnd] = useState<string>('')
  const [monthlyGoal, setMonthlyGoal] = useState<number>(2000)
  const [quickIncomeAmount, setQuickIncomeAmount] = useState<number>(150)
  const [quickIncomeProvider, setQuickIncomeProvider] = useState<string>('Limpeza Pós-Obra')
  const [trendIncome, setTrendIncome] = useState<{ pct: number; dir: 'up'|'down' } | null>(null)
  const [trendExpense, setTrendExpense] = useState<{ pct: number; dir: 'up'|'down' } | null>(null)
  const [trendBalance, setTrendBalance] = useState<{ pct: number; dir: 'up'|'down' } | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [categoryTotals, setCategoryTotals] = useState<Array<{ category: string; total_expense: number }>>([])

  useEffect(() => {
    if (status === 'authenticated') {
      // inicializa categorias a partir da querystring
      const catParam = searchParams?.get('categories') || ''
      const cats = catParam
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c.length > 0)
      if (cats.length > 0 && selectedCategories.length === 0) {
        setSelectedCategories(cats)
      }
      fetchDashboardData(period, customStart, customEnd, cats.length > 0 ? cats : selectedCategories)
    }
  }, [status, period, customStart, customEnd, searchParams]);

  useEffect(() => {
    const loadPreferences = async () => {
      if (status !== 'authenticated') return
      try {
        const res = await fetch('/api/user/preferences', { method: 'GET' })
        if (res.ok) {
          const data = await res.json()
          const val = Number(data?.preferences?.monthlyGoal ?? 2000)
          setMonthlyGoal(isNaN(val) ? 2000 : val)
          const qAmt = Number(data?.preferences?.quickIncomeDefaultAmount ?? 150)
          setQuickIncomeAmount(isNaN(qAmt) ? 150 : qAmt)
          const qProv = String(data?.preferences?.quickIncomeDefaultProvider ?? 'Limpeza Pós-Obra')
          setQuickIncomeProvider(qProv)
        }
      } catch {}
    }
    loadPreferences()
  }, [status])

  const fetchDashboardData = async (p?: string, start?: string, end?: string, cats?: string[]) => {
    try {
      setLoading(true);
      const params = new URLSearchParams()
      params.set('period', p || period)
      params.set('limit', '5')
      params.set('type', 'expense')
      const effCats = cats && cats.length > 0 ? cats : selectedCategories
      if (effCats.length > 0) params.set('category', effCats.join(','))
      const effStart = start || customStart
      const effEnd = end || customEnd
      if ((p || period) === 'custom' && effStart && effEnd) {
        params.set('start', effStart)
        params.set('end', effEnd)
      }
      const res = await fetch(`/api/transactions/list?${params.toString()}`)
      const json = await res.json()
      const transactions: Transaction[] = json.transactions || []
      const totals = json.totals || { total_income: 0, total_expense: 0, current_balance: 0 }
      const totalsByCategory: Array<{ category: string; total_expense: number }> = json.totalsByCategory || []

      let prevStart = ''
      let prevEnd = ''
      const now = new Date()
      const pad = (d: Date) => new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString().split('T')[0]
      if ((p || period) === 'day') {
        const s = new Date(now)
        const e = new Date(now)
        s.setDate(s.getDate() - 1)
        e.setDate(e.getDate() - 1)
        prevStart = pad(s)
        prevEnd = pad(e)
      } else if ((p || period) === 'week') {
        const d = new Date(now)
        const dow = (d.getDay() + 6) % 7
        const curStart = new Date(d)
        curStart.setDate(curStart.getDate() - dow)
        const prevS = new Date(curStart)
        prevS.setDate(prevS.getDate() - 7)
        const prevE = new Date(prevS)
        prevE.setDate(prevE.getDate() + 6)
        prevStart = pad(prevS)
        prevEnd = pad(prevE)
      } else if ((p || period) === 'month') {
        const d = new Date(now)
        const prevS = new Date(d.getFullYear(), d.getMonth() - 1, 1)
        const prevE = new Date(d.getFullYear(), d.getMonth(), 0)
        prevStart = pad(prevS)
        prevEnd = pad(prevE)
      } else if ((p || period) === 'year') {
        const d = new Date(now)
        const prevS = new Date(d.getFullYear() - 1, 0, 1)
        const prevE = new Date(d.getFullYear() - 1, 11, 31)
        prevStart = pad(prevS)
        prevEnd = pad(prevE)
      } else if ((p || period) === 'last7') {
        const prevE = new Date(now)
        prevE.setDate(prevE.getDate() - 7)
        const prevS = new Date(prevE)
        prevS.setDate(prevS.getDate() - 6)
        prevStart = pad(prevS)
        prevEnd = pad(prevE)
      } else if ((p || period) === 'last30') {
        const prevE = new Date(now)
        prevE.setDate(prevE.getDate() - 30)
        const prevS = new Date(prevE)
        prevS.setDate(prevS.getDate() - 29)
        prevStart = pad(prevS)
        prevEnd = pad(prevE)
      } else if ((p || period) === 'custom') {
        const effStart = start || customStart
        const effEnd = end || customEnd
        if (effStart && effEnd) {
          const s = new Date(effStart)
          const e = new Date(effEnd)
          const days = Math.max(1, Math.round((e.getTime() - s.getTime()) / 86400000) + 1)
          const prevE = new Date(s)
          prevE.setDate(prevE.getDate() - 1)
          const prevS = new Date(prevE)
          prevS.setDate(prevS.getDate() - (days - 1))
          prevStart = pad(prevS)
          prevEnd = pad(prevE)
        }
      }

      let prevTotals = { total_income: 0, total_expense: 0, current_balance: 0 }
      if (prevStart && prevEnd) {
        const prevParams = new URLSearchParams()
        prevParams.set('period', 'custom')
        prevParams.set('start', prevStart)
        prevParams.set('end', prevEnd)
        prevParams.set('limit', '1')
        const prevRes = await fetch(`/api/transactions/list?${prevParams.toString()}`)
        const prevJson = await prevRes.json().catch(() => ({}))
        prevTotals = prevJson.totals || prevTotals
      }

      const fmtPct = (n: number) => `${Math.abs(n).toFixed(1).replace('.', ',')}%`
      const calc = (curr: number, prev: number) => {
        if (!prev || prev === 0) return { pct: 0, dir: curr >= 0 ? 'up' : 'down' as 'up'|'down' }
        const raw = ((curr - prev) / Math.abs(prev)) * 100
        const dir: 'up'|'down' = raw >= 0 ? 'up' : 'down'
        return { pct: raw, dir }
      }

      const tIncome = calc(Number(totals.total_income || 0), Number(prevTotals.total_income || 0))
      const tExpenseRaw = calc(Number(totals.total_expense || 0), Number(prevTotals.total_expense || 0))
      const tExpense: { pct: number; dir: 'up'|'down' } = {
        pct: tExpenseRaw.pct,
        dir: Number(totals.total_expense || 0) <= Number(prevTotals.total_expense || 0) ? 'up' : 'down'
      }
      const tBalance = calc(Number(totals.current_balance || 0), Number(prevTotals.current_balance || 0))

      setStats({
        current_balance: Number(totals.current_balance || 0),
        total_income: Number(totals.total_income || 0),
        total_expense: Number(totals.total_expense || 0),
        last_transactions: transactions || []
      });
      setCategoryTotals(totalsByCategory)
      setTrendIncome(tIncome)
      setTrendExpense(tExpense)
      setTrendBalance(tBalance)
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickAddIncome = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await fetchJson('/api/transactions/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: quickIncomeAmount,
          type: 'income',
          category: quickIncomeProvider,
          description: `Renda do dia - ${quickIncomeProvider}`,
          transaction_date: today,
          source: 'manual',
        }),
      })
      
      // Recarregar dados
      fetchDashboardData();
      
      toast.success('Renda registrada com sucesso!')
    } catch (error) {
      console.error('Erro ao registrar renda:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao registrar renda')
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
              <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
              <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
            </div>
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (status !== 'authenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4" />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-2">
              Dashboard Financeiro
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              {format(new Date(), 'EEEE, d \'de\' MMMM \'de\' yyyy', { locale: ptBR })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <PiggyBank className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Meta do mês</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">R$ {monthlyGoal.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtro de Período */}
        <ModernCard className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setPeriod('day')} className={`px-3 py-2 rounded-lg text-sm ${period==='day'?'bg-slate-900 text-white dark:bg-white dark:text-slate-900':'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'}`}>Hoje</button>
            <button onClick={() => setPeriod('last7')} className={`px-3 py-2 rounded-lg text-sm ${period==='last7'?'bg-slate-900 text-white dark:bg-white dark:text-slate-900':'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'}`}>Últimos 7 dias</button>
            <button onClick={() => setPeriod('last30')} className={`px-3 py-2 rounded-lg text-sm ${period==='last30'?'bg-slate-900 text-white dark:bg-white dark:text-slate-900':'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'}`}>Últimos 30 dias</button>
            <button onClick={() => setPeriod('week')} className={`px-3 py-2 rounded-lg text-sm ${period==='week'?'bg-slate-900 text-white dark:bg-white dark:text-slate-900':'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'}`}>Esta semana</button>
            <button onClick={() => setPeriod('month')} className={`px-3 py-2 rounded-lg text-sm ${period==='month'?'bg-slate-900 text-white dark:bg-white dark:text-slate-900':'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'}`}>Este mês</button>
            <button onClick={() => setPeriod('year')} className={`px-3 py-2 rounded-lg text-sm ${period==='year'?'bg-slate-900 text-white dark:bg-white dark:text-slate-900':'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'}`}>Este ano</button>
            <button onClick={() => setPeriod('custom')} className={`px-3 py-2 rounded-lg text-sm ${period==='custom'?'bg-slate-900 text-white dark:bg-white dark:text-slate-900':'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'}`}>Personalizado</button>
            {period==='custom' && (
              <div className="flex items-center gap-2">
                <input type="date" value={customStart} onChange={(e)=>setCustomStart(e.target.value)} className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200" />
                <span className="text-slate-600 dark:text-slate-300">até</span>
                <input type="date" value={customEnd} onChange={(e)=>setCustomEnd(e.target.value)} className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200" />
                <button disabled={!customStart || !customEnd} onClick={()=>fetchDashboardData('custom', customStart, customEnd)} className="px-3 py-2 rounded-lg text-sm bg-blue-600 text-white disabled:bg-blue-300">Aplicar</button>
              </div>
            )}
          </div>
        </ModernCard>

        {/* Filtro de Categoria */}
        <ModernCard className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            {['Comida', 'Investimentos', 'Lazer', 'Transporte', 'Saúde'].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  const exists = selectedCategories.includes(cat)
                  const next = exists
                    ? selectedCategories.filter((c) => c !== cat)
                    : [...selectedCategories, cat]
                  setSelectedCategories(next)
                  fetchDashboardData(undefined, undefined, undefined, next)
                }}
                className={`px-3 py-2 rounded-lg text-sm ${selectedCategories.includes(cat)
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'}`}
              >{cat}</button>
            ))}
            <button
              onClick={() => {
                setSelectedCategories([])
                fetchDashboardData(undefined, undefined, undefined, [])
              }}
              className={`px-3 py-2 rounded-lg text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200`}
            >Limpar</button>
          </div>
        </ModernCard>

        {/* Totais por Categoria */}
        {selectedCategories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {selectedCategories.map((cat) => {
              const entry = categoryTotals.find((e) => (e.category || 'Outros') === cat) || { category: cat, total_expense: 0 }
              return (
                <StatCard
                  key={cat}
                  title={`Gasto em ${cat}`}
                  value={entry.total_expense}
                  icon={TrendingDown}
                  color="red"
                />
              )
            })}
          </div>
        )}

        {/* Distribuição por Categoria */}
        {categoryTotals.length > 0 && (
          <ModernCard className="p-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Distribuição de Despesas por Categoria</h2>
            {(() => {
              const total = categoryTotals.reduce((acc, c) => acc + (c.total_expense || 0), 0)
              return (
                <div className="space-y-3">
                  {categoryTotals.map((c) => {
                    const pct = total > 0 ? ((c.total_expense || 0) / total) * 100 : 0
                    return (
                      <div key={c.category} className="space-y-1">
                        <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                          <span>{c.category || 'Outros'}</span>
                          <span>{pct.toFixed(1).replace('.', ',')}%</span>
                        </div>
                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-2 bg-red-500/70" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </ModernCard>
        )}

        {/* Ações Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Motion>
          <QuickActionButton
            onClick={quickAddIncome}
            icon={DollarSign}
            title="Registrar Renda do Dia"
            subtitle={`R$ ${quickIncomeAmount.toFixed(2)} - ${quickIncomeProvider}`}
            color="green"
          />
          </Motion>
          <Motion>
          <QuickActionButton
            onClick={() => window.location.href = '/transactions/new'}
            icon={CreditCard}
            title="Nova Transação"
            subtitle="Adicionar despesa ou renda"
            color="blue"
          />
          </Motion>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Saldo Atual"
            value={stats?.current_balance ?? 0}
            icon={Wallet}
            trend={trendBalance?.dir}
            color={(stats?.current_balance ?? 0) >= 0 ? 'green' : 'red'}
            trendText={trendBalance ? `${(Math.abs(trendBalance.pct)).toFixed(1).replace('.', ',')}%` : ''}
          />
          <StatCard
            title="Ganhos do Período"
            value={stats?.total_income ?? 0}
            icon={TrendingUp}
            trend={trendIncome?.dir}
            color="green"
            trendText={trendIncome ? `${(Math.abs(trendIncome.pct)).toFixed(1).replace('.', ',')}%` : ''}
          />
          <StatCard
            title="Despesas do Período"
            value={stats?.total_expense ?? 0}
            icon={TrendingDown}
            trend={trendExpense?.dir}
            color="red"
            trendText={trendExpense ? `${(Math.abs(trendExpense.pct)).toFixed(1).replace('.', ',')}%` : ''}
          />
        </div>

        {/* Progresso de Configuração */}
        <Motion>
          <SetupProgress />
        </Motion>

        {/* Últimas Transações */}
        <ModernCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Últimas Transações</h2>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Calendar className="h-5 w-5" />
              <span className="text-sm">{period==='day'?'Hoje':period==='week'?'Esta semana':period==='month'?'Este mês':period==='year'?'Este ano':period==='last7'?'Últimos 7 dias':period==='last30'?'Últimos 30 dias':(customStart&&customEnd?`${safeFormat(customStart,'dd/MM/yyyy')} - ${safeFormat(customEnd,'dd/MM/yyyy')}`:'Personalizado')}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {stats?.last_transactions.map((transaction) => (
              <Motion key={transaction.id}>
              <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-700/30 rounded-xl border border-slate-200/50 dark:border-slate-600/30 hover:bg-slate-100/50 dark:hover:bg-slate-600/40 transition-all duration-200">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${
                    transaction.type === 'income' ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}>
                    <DollarSign className={`h-5 w-5 ${
                      transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                    }`} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-base">{transaction.description}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{transaction.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${
                    transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}R$ <CountUp value={Math.abs(transaction.amount)} duration={700} format={(v) => Number(v).toFixed(2)} />
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {safeFormat(transaction.transaction_date, 'dd MMM', { locale: ptBR })}
                  </p>
                </div>
              </div>
              </Motion>
            ))}
            
            {stats?.last_transactions.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-lg mb-2">Nenhuma transação ainda</p>
                <p className="text-slate-500 dark:text-slate-500 text-sm">
                  Comece registrando sua primeira renda ou despesa
                </p>
              </div>
            )}
          </div>
        </ModernCard>
      </div>
    </div>
  );
}
