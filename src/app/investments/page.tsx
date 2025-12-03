'use client';

import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import ModernCard from '@/components/ModernCard'
import PageHeader from '@/components/PageHeader'
import { Coins, Plus, Trash2, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import dynamic from 'next/dynamic'
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false })
const PieChart = dynamic(() => import('recharts').then(m => m.PieChart), { ssr: false })
const Pie = dynamic(() => import('recharts').then(m => m.Pie), { ssr: false })
const Cell = dynamic(() => import('recharts').then(m => m.Cell), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false })
const LineChart = dynamic(() => import('recharts').then(m => m.LineChart), { ssr: false })
const Line = dynamic(() => import('recharts').then(m => m.Line), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false })
import { cryptoSymbols } from '@/lib/crypto-symbols'

type Holding = {
  id: string
  symbol: string
  amount: number
  avgPrice: number
  targetValue?: number | null
}

type PriceInfo = {
  symbol: string
  price: number
  change24h: number
  marketCap?: number
}

export default function InvestmentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [holdings, setHoldings] = useState<Holding[]>([])
  const [prices, setPrices] = useState<Record<string, PriceInfo>>({})
  const [loading, setLoading] = useState(true)
  const [symbolInput, setSymbolInput] = useState('')
  const [amountInput, setAmountInput] = useState('')
  const [avgPriceInput, setAvgPriceInput] = useState('')
  const [targetInput, setTargetInput] = useState('')
  const [watchInput, setWatchInput] = useState('')
  const [txSymbol, setTxSymbol] = useState('')
  const [txType, setTxType] = useState<'BUY'|'SELL'>('BUY')
  const [txQty, setTxQty] = useState('')
  const [txPrice, setTxPrice] = useState('')
  const [txFee, setTxFee] = useState('')
  const [transactions, setTransactions] = useState<any[]>([])
  const [spark, setSpark] = useState<{ t: number; value: number }[]>([])
  const [fiat, setFiat] = useState<'BRL'|'USD'>('BRL')

  useEffect(() => {
    if (status === 'authenticated') {
      loadData()
    }
  }, [status, fiat])

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/user/preferences').then(r=>r.json()).then(j => {
        const pref = (j?.preferences || {}) as any
        const pv = String(pref.cryptoFiat || '').toUpperCase()
        if (pv === 'USD' || pv === 'BRL') setFiat(pv as any)
      }).catch(()=>{})
    }
  }, [status])

  const loadData = async () => {
    try {
      setLoading(true)
      const resHoldings = await fetch('/api/investments/holdings')
      const jsonHoldings = await resHoldings.json()
      const list: Holding[] = jsonHoldings.holdings || []
      setHoldings(list)

      const symbols = list.length ? list.map(h => h.symbol) : ['BTC','ETH','SOL']
      const resPrices = await fetch('/api/investments/price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols, fiat })
      })
      const jsonPrices = await resPrices.json()
      const bySymbol: Record<string, PriceInfo> = {}
      for (const p of jsonPrices.prices || []) {
        bySymbol[p.symbol] = p
      }
      setPrices(bySymbol)

      const resTx = await fetch('/api/investments/transactions')
      const jsonTx = await resTx.json()
      setTransactions(jsonTx.transactions || [])

      const resSpark = await fetch(`/api/investments/portfolio/sparkline?fiat=${fiat}`)
      const jsonSpark = await resSpark.json()
      setSpark(jsonSpark.points || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const portfolio = useMemo(() => {
    let total = 0
    const items = holdings.map(h => {
      const price = prices[h.symbol]?.price || 0
      const value = h.amount * price
      total += value
      const pnl = price - h.avgPrice
      const pnlPct = h.avgPrice ? (pnl / h.avgPrice) * 100 : 0
      return { ...h, price, value, pnl, pnlPct }
    })
    return { total, items }
  }, [holdings, prices])

  const kpis = useMemo(() => {
    let avgChange = 0
    if (portfolio.items.length > 0) {
      let weighted = 0
      let weightSum = 0
      portfolio.items.forEach(i => {
        const ch = prices[i.symbol]?.change24h || 0
        weighted += ch * i.value
        weightSum += i.value
      })
      avgChange = weightSum > 0 ? weighted / weightSum : 0
    } else {
      const syms = Object.keys(prices)
      syms.forEach(s => {
        avgChange += prices[s]?.change24h || 0
      })
      avgChange = syms.length ? avgChange / syms.length : 0
    }
    return { avgChange }
  }, [portfolio, prices])

  const watchlist = useMemo(() => {
    const wl = holdings.filter(h => h.amount === 0).map(h => h.symbol)
    return wl.length ? wl : ['BTC','ETH','SOL']
  }, [holdings])

  const addHolding = async () => {
    const symbol = symbolInput.trim().toUpperCase()
    const amount = parseFloat(amountInput)
    const avgPrice = parseFloat(avgPriceInput)
    if (!symbol || isNaN(amount) || isNaN(avgPrice)) return
    const res = await fetch('/api/investments/holdings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol, amount, avgPrice, targetValue: targetInput ? parseFloat(targetInput) : undefined })
    })
    if (res.ok) {
      setSymbolInput('')
      setAmountInput('')
      setAvgPriceInput('')
      setTargetInput('')
      await loadData()
    }
  }

  const addTransaction = async () => {
    const symbol = txSymbol.trim().toUpperCase()
    const quantity = parseFloat(txQty)
    const price = parseFloat(txPrice)
    const fee = txFee ? parseFloat(txFee) : undefined
    if (!symbol || isNaN(quantity) || isNaN(price) || quantity <= 0 || price <= 0) return
    const res = await fetch('/api/investments/transactions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol, type: txType, quantity, price, fee })
    })
    if (res.ok) {
      setTxSymbol(''); setTxQty(''); setTxPrice(''); setTxFee('')
      await loadData()
    }
  }

  const removeHolding = async (id: string) => {
    if (!confirm('Remover este ativo?')) return
    const res = await fetch(`/api/investments/holdings/${id}`, { method: 'DELETE' })
    if (res.ok) await loadData()
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="max-w-6xl mx-auto">
          <ModernCard className="p-6">
            <div className="animate-pulse">
              <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl w-1/3 mb-8"></div>
              <div className="space-y-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
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
          title="Investimentos"
          subtitle="Acompanhe seu portfólio cripto"
          actions={(
            <div className="flex items-center gap-2">
              <select value={fiat} onChange={e=>setFiat(e.target.value as any)} className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-sm">
                <option value="BRL">BRL</option>
                <option value="USD">USD</option>
              </select>
              <button onClick={async()=>{
                await fetch('/api/user/preferences', { method: 'PATCH', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ preferences: { cryptoFiat: fiat } }) })
              }} className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white text-sm">Salvar</button>
            </div>
          )}
        />

        <ModernCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Coins className="h-6 w-6 text-slate-600 dark:text-slate-300" />
            <h2 className="text-xl font-semibold">Resumo do Portfólio</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-white/40 dark:border-slate-600/40 shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Valor Total</p>
                  <p className="text-2xl font-bold">{fiat === 'BRL' ? 'R$ ' : '$ '}{portfolio.total.toLocaleString(fiat === 'BRL' ? 'pt-BR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <DollarSign className="h-6 w-6 text-slate-500 dark:text-slate-300" />
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-white/40 dark:border-slate-600/40 shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Ativos</p>
                  <p className="text-2xl font-bold">{holdings.length}</p>
                </div>
                <TrendingUp className="h-6 w-6 text-slate-500 dark:text-slate-300" />
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-white/40 dark:border-slate-600/40 shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Média 24h</p>
                  <p className={`text-2xl font-bold ${kpis.avgChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>{kpis.avgChange >= 0 ? '+' : ''}{kpis.avgChange.toFixed(2)}%</p>
                </div>
                {kpis.avgChange >= 0 ? <TrendingUp className="h-6 w-6 text-green-600" /> : <TrendingDown className="h-6 w-6 text-red-600" />}
              </div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-700/40">
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">Alocação por Ativo</p>
              <div className="h-64">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={portfolio.items.map(i=>({ name: i.symbol, value: i.value }))} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90}>
                      {portfolio.items.map((entry, index) => (
                        <Cell key={`cell-${entry.id}`} fill={["#10B981","#6366F1","#F59E0B","#EF4444","#3B82F6","#8B5CF6"][index % 6]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          {spark.length > 0 && (
            <div className="mt-6 p-4 rounded-2xl bg-slate-100 dark:bg-slate-700/40">
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">Evolução 24h do Portfólio</p>
              <div className="h-64">
                <ResponsiveContainer>
                  <LineChart data={spark.map(p=>({ t: new Date(p.t).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}), value: p.value }))}>
                    <XAxis dataKey="t" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(v)=>`${fiat === 'BRL' ? 'R$' : '$'} ${Number(v).toLocaleString(fiat === 'BRL' ? 'pt-BR' : 'en-US')}`} width={80} />
                    <Tooltip formatter={(v)=>[`${fiat === 'BRL' ? 'R$' : '$'} ${Number(v).toLocaleString(fiat === 'BRL' ? 'pt-BR' : 'en-US',{minimumFractionDigits:2})}`,'Valor']} />
                    <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </ModernCard>

        <ModernCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Posições</h2>
            <div className="flex gap-2">
              <input list="cryptoSymbols" value={symbolInput} onChange={e=>setSymbolInput(e.target.value)} placeholder="Símbolo (BTC)" className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-sm" />
              <input value={amountInput} onChange={e=>setAmountInput(e.target.value)} placeholder="Quantidade" className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-sm" />
              <input value={avgPriceInput} onChange={e=>setAvgPriceInput(e.target.value)} placeholder="Preço médio" className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-sm" />
              <input value={targetInput} onChange={e=>setTargetInput(e.target.value)} placeholder="Meta (R$)" className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-sm" />
              <button onClick={addHolding} className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl">
                <Plus className="h-4 w-4" />
                Adicionar
              </button>
            </div>
          </div>

          {portfolio.items.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-slate-600 dark:text-slate-400">Nenhuma posição. Adicione um ativo acima.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {portfolio.items.map(item => (
                <div key={item.id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-emerald-900/20 dark:to-green-900/20">
                        <Coins className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{item.symbol}</h3>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-slate-600 dark:text-slate-400">Qtd: {item.amount}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${prices[item.symbol]?.change24h >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{prices[item.symbol]?.change24h >= 0 ? '+' : ''}{(prices[item.symbol]?.change24h || 0).toFixed(2)}%</span>
                        </div>
                        {typeof item.targetValue === 'number' && item.targetValue > 0 && (
                          <div className="mt-2">
                            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded">
                              <div className="h-2 bg-green-500 rounded" style={{ width: `${Math.min(100, (item.value / item.targetValue) * 100)}%` }}></div>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Meta: {fiat === 'BRL' ? 'R$ ' : '$ '}{item.targetValue.toLocaleString(fiat === 'BRL' ? 'pt-BR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-semibold">{fiat === 'BRL' ? 'R$ ' : '$ '}{item.value.toLocaleString(fiat === 'BRL' ? 'pt-BR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Preço: {fiat === 'BRL' ? 'R$ ' : '$ '}{item.price.toLocaleString(fiat === 'BRL' ? 'pt-BR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </div>
                      <div className="text-right">
                        <p className={item.pnl >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                          {item.pnl >= 0 ? '+' : ''}{item.pnl.toFixed(2)} ({item.pnlPct.toFixed(2)}%)
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">PM: {fiat === 'BRL' ? 'R$ ' : '$ '}{item.avgPrice.toFixed(2)}</p>
                      </div>
                      <button onClick={()=>removeHolding(item.id)} className="text-red-600 hover:text-red-800 p-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <div className="flex items-center gap-2">
                        <input placeholder={fiat === 'BRL' ? 'Meta (R$)' : 'Target ($)'} className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-sm" onBlur={async(e)=>{
                          const v = e.target.value.trim()
                          if (!v) return
                          const res = await fetch(`/api/investments/holdings/${item.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetValue: parseFloat(v) }) })
                          if (res.ok) await loadData()
                        }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ModernCard>

        <ModernCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Transações</h2>
            <div className="flex gap-2">
              <input list="cryptoSymbols" value={txSymbol} onChange={e=>setTxSymbol(e.target.value)} placeholder="Símbolo (BTC)" className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-sm" />
              <select value={txType} onChange={e=>setTxType(e.target.value as any)} className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-sm">
                <option value="BUY">Compra</option>
                <option value="SELL">Venda</option>
              </select>
              <input value={txQty} onChange={e=>setTxQty(e.target.value)} placeholder="Quantidade" className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-sm" />
              <input value={txPrice} onChange={e=>setTxPrice(e.target.value)} placeholder="Preço" className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-sm" />
              <input value={txFee} onChange={e=>setTxFee(e.target.value)} placeholder="Taxa (opcional)" className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-sm" />
              <button onClick={addTransaction} className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl">
                <Plus className="h-4 w-4" />
                Registrar
              </button>
            </div>
          </div>
          {transactions.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-slate-600 dark:text-slate-400">Nenhuma transação registrada.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {transactions.map(t => (
                <div key={t.id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700">
                        <Coins className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{t.symbol} • {t.type}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Qtd: {t.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{fiat === 'BRL' ? 'R$ ' : '$ '}{(t.quantity * t.price).toLocaleString(fiat === 'BRL' ? 'pt-BR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Preço: {fiat === 'BRL' ? 'R$ ' : '$ '}{t.price.toLocaleString(fiat === 'BRL' ? 'pt-BR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{t.fee ? ` • ${fiat === 'BRL' ? 'Taxa: R$ ' : 'Fee: $ '}${t.fee.toLocaleString(fiat === 'BRL' ? 'pt-BR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ''}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ModernCard>

        <ModernCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-semibold">Watchlist</h2>
            <div className="ml-auto flex gap-2">
              <input list="cryptoSymbols" value={watchInput} onChange={e=>setWatchInput(e.target.value)} placeholder="Símbolo (BTC)" className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-sm" />
              <button onClick={async()=>{
                const s = watchInput.trim().toUpperCase()
                if (!s) return
                const res = await fetch('/api/investments/holdings', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ symbol: s, amount: 0, avgPrice: 0 }) })
                if (res.ok) { setWatchInput(''); await loadData() }
              }} className="inline-flex items-center gap-2 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white px-4 py-2 rounded-xl">
                Adicionar
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {watchlist.map(sym => {
              const info = prices[sym]
              return (
                <div key={sym} className="p-4 rounded-xl bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-white/40 dark:border-slate-600/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{sym}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-mono">{fiat === 'BRL' ? 'R$ ' : '$ '}{info?.price?.toLocaleString(fiat === 'BRL' ? 'pt-BR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '—'}</p>
                    </div>
                    <div className={info && info.change24h >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {info ? `${info.change24h.toFixed(2)}%` : '—'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ModernCard>
        <datalist id="cryptoSymbols">
          {cryptoSymbols.map(s => (
            <option key={s.symbol} value={s.symbol}>{s.name}</option>
          ))}
        </datalist>
      </div>
    </div>
  )
}
