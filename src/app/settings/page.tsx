'use client'

import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { ThemeToggle } from '@/components/ThemeToggle'
import ModernCard from '@/components/ModernCard'
import PageHeader from '@/components/PageHeader'
import Motion from '@/components/Motion'
import { useEffect, useMemo, useState } from 'react'

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme, setPreference } = useTheme()

  const [name, setName] = useState('')
  const [email, setEmail] = useState(user?.email || '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMessage, setProfileMessage] = useState('')

  const [prefs, setPrefs] = useState({
    theme: theme as 'light' | 'dark' | 'system',
    transactionAlerts: false,
    weeklySummary: false,
    highContrast: false,
    reduceMotion: false,
    currency: 'BRL',
    locale: 'pt-BR',
    monthlyGoal: 2000,
    quickIncomeDefaultAmount: 150,
    quickIncomeDefaultProvider: 'Limpeza Pós-Obra',
    categoryAliases: [] as Array<{ pattern: string; category: string }>,
  })
  const [savingPrefs, setSavingPrefs] = useState(false)
  const [prefsMessage, setPrefsMessage] = useState('')

  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [mounted, setMounted] = useState(false)

  const canApplyTheme = useMemo(() => prefs.theme === 'light' || prefs.theme === 'dark', [prefs.theme])

  const applyThemeSelection = (next: 'light' | 'dark' | 'system') => {
    setPreference(next)
  }

  const handleLogout = async () => {
    await signOut()
    window.location.href = '/auth/login'
  }

  useEffect(() => {
    setMounted(true)
    const loadPreferences = async () => {
      try {
        const res = await fetch('/api/user/preferences', { method: 'GET' })
        if (res.ok) {
          const data = await res.json()
          setPrefs((prev) => ({ ...prev, ...data.preferences }))
        }
      } catch {}
    }
    loadPreferences()
  }, [])

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch('/api/user/profile', { method: 'GET' })
        if (res.ok) {
          const data = await res.json()
          setName(data.user?.name || '')
          setEmail(data.user?.email || '')
        }
      } catch {}
    }
    loadProfile()
  }, [])

  useEffect(() => {
    setEmail(user?.email || '')
  }, [user?.email])

  const saveProfile = async () => {
    setSavingProfile(true)
    setProfileMessage('')
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name || undefined, email: email || undefined }),
      })
      if (res.ok) {
        const data = await res.json()
        setProfileMessage('Perfil atualizado')
        if (data.emailChanged) {
          setProfileMessage('Email atualizado. Faça login novamente.')
          await handleLogout()
        }
      } else {
        const err = await res.json().catch(() => ({}))
        setProfileMessage(err.error || 'Erro ao atualizar perfil')
      }
    } catch {
      setProfileMessage('Erro de rede ao atualizar perfil')
    } finally {
      setSavingProfile(false)
    }
  }

  const savePreferences = async () => {
    setSavingPrefs(true)
    setPrefsMessage('')
    try {
      const res = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: prefs }),
      })
      if (res.ok) {
        setPrefsMessage('Preferências salvas')
        if (canApplyTheme) {
          const currentIsDark = theme === 'dark'
          const nextIsDark = prefs.theme === 'dark'
          if (currentIsDark !== nextIsDark) toggleTheme()
        }
      } else {
        const err = await res.json().catch(() => ({}))
        setPrefsMessage(err.error || 'Erro ao salvar preferências')
      }
    } catch {
      setPrefsMessage('Erro de rede ao salvar preferências')
    } finally {
      setSavingPrefs(false)
    }
  }

  const exportCSV = async () => {
    setExporting(true)
    try {
      const res = await fetch('/api/transactions/export')
      if (!res.ok) throw new Error('Falha ao exportar')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'transacoes.csv'
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {}
    finally { setExporting(false) }
  }

  const importCSV = async (file: File | null) => {
    if (!file) return
    setImporting(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/csv/import', { method: 'POST', body: form })
      if (!res.ok) throw new Error('Falha ao importar CSV')
    } catch {}
    finally { setImporting(false) }
  }

  const deleteAccount = async () => {
    const step1 = window.confirm('Tem certeza que deseja excluir a conta?')
    if (!step1) return
    const step2 = window.confirm('Esta ação é irreversível. Confirmar exclusão?')
    if (!step2) return
    try {
      const res = await fetch('/api/user/delete', { method: 'DELETE' })
      if (res.ok) {
        await handleLogout()
      }
    } catch {}
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4" />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <PageHeader title="Configurações" subtitle="Preferências da sua conta" actions={<ThemeToggle />} />

        <Motion>
        <ModernCard className="p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Conta</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{user?.email || 'Não autenticado'}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Nome</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700" placeholder="Usuário" />
              </div>
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700" type="email" />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button onClick={saveProfile} disabled={savingProfile} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">Salvar perfil</button>
              <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Sair da conta</button>
              <button onClick={deleteAccount} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600">Excluir conta</button>
            </div>
            {profileMessage && (<p className="text-sm mt-2 text-slate-600 dark:text-slate-400">{profileMessage}</p>)}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Preferências</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Tema atual: {theme}</p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Tema</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2"><input type="radio" name="theme" checked={prefs.theme==='light'} onChange={() => { setPrefs({ ...prefs, theme: 'light' }); applyThemeSelection('light') }} /> light</label>
                  <label className="flex items-center gap-2"><input type="radio" name="theme" checked={prefs.theme==='dark'} onChange={() => { setPrefs({ ...prefs, theme: 'dark' }); applyThemeSelection('dark') }} /> dark</label>
                  <label className="flex items-center gap-2 opacity-60"><input type="radio" name="theme" checked={prefs.theme==='system'} onChange={() => { setPrefs({ ...prefs, theme: 'system' }); applyThemeSelection('system') }} /> sistema</label>
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Moeda</label>
                <select value={prefs.currency} onChange={(e) => setPrefs({ ...prefs, currency: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <option value="BRL">BRL</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Localidade</label>
                <select value={prefs.locale} onChange={(e) => setPrefs({ ...prefs, locale: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <option value="pt-BR">pt-BR</option>
                  <option value="en-US">en-US</option>
                  <option value="es-ES">es-ES</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Meta do mês (R$)</label>
                <input value={String(prefs.monthlyGoal ?? 0)} onChange={(e) => setPrefs({ ...prefs, monthlyGoal: Number(e.target.value || 0) })} className="w-full px-3 py-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700" type="number" step="0.01" />
              </div>
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Renda rápida: valor padrão (R$)</label>
                <input value={String(prefs.quickIncomeDefaultAmount ?? 0)} onChange={(e) => setPrefs({ ...prefs, quickIncomeDefaultAmount: Number(e.target.value || 0) })} className="w-full px-3 py-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700" type="number" step="0.01" />
              </div>
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Renda rápida: provedor (trabalho)</label>
                <input value={String(prefs.quickIncomeDefaultProvider || '')} onChange={(e) => setPrefs({ ...prefs, quickIncomeDefaultProvider: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700" type="text" placeholder="Ex.: Limpeza Pós-Obra" />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <label className="flex items-center gap-2"><input type="checkbox" checked={prefs.transactionAlerts} onChange={(e) => setPrefs({ ...prefs, transactionAlerts: e.target.checked })} /> Alertas de transação</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={prefs.weeklySummary} onChange={(e) => setPrefs({ ...prefs, weeklySummary: e.target.checked })} /> Resumo semanal</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={prefs.highContrast} onChange={(e) => setPrefs({ ...prefs, highContrast: e.target.checked })} /> Alto contraste</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={prefs.reduceMotion} onChange={(e) => setPrefs({ ...prefs, reduceMotion: e.target.checked })} /> Reduzir animações</label>
              </div>
            </div>
          <div className="mt-4 flex gap-3">
            <button onClick={savePreferences} disabled={savingPrefs} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">Salvar preferências</button>
          </div>
          {prefsMessage && (<p className="text-sm mt-2 text-slate-600 dark:text-slate-400">{prefsMessage}</p>)}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Auto-categorização</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Defina palavras-chave que determinam a categoria automaticamente durante a importação do CSV.</p>
          <div className="space-y-3">
            {(prefs.categoryAliases || []).map((row, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                <input
                  value={row.pattern}
                  onChange={(e) => {
                    const next = [...(prefs.categoryAliases || [])]
                    next[idx] = { ...next[idx], pattern: e.target.value }
                    setPrefs({ ...prefs, categoryAliases: next })
                  }}
                  placeholder="palavra-chave (ex.: netflix)"
                  className="px-3 py-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700"
                />
                <input
                  value={row.category}
                  onChange={(e) => {
                    const next = [...(prefs.categoryAliases || [])]
                    next[idx] = { ...next[idx], category: e.target.value }
                    setPrefs({ ...prefs, categoryAliases: next })
                  }}
                  placeholder="categoria (ex.: Lazer)"
                  className="px-3 py-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700"
                />
                <button
                  onClick={() => {
                    const next = [...(prefs.categoryAliases || [])]
                    next.splice(idx, 1)
                    setPrefs({ ...prefs, categoryAliases: next })
                  }}
                  className="px-3 py-2 rounded-lg bg-red-600 text-white"
                >Remover</button>
              </div>
            ))}
            <button
              onClick={() => {
                const next = [...(prefs.categoryAliases || []), { pattern: '', category: '' }]
                setPrefs({ ...prefs, categoryAliases: next })
              }}
              className="px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white"
            >Adicionar regra</button>
          </div>
        </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Dados</h2>
            <div className="mt-2 flex gap-3">
              <button onClick={exportCSV} disabled={exporting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Exportar CSV</button>
              <label className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 cursor-pointer">
                Importar CSV
                <input type="file" accept=".csv" className="hidden" onChange={(e) => importCSV(e.target.files?.[0] || null)} />
              </label>
              {importing && <span className="text-sm text-slate-600 dark:text-slate-400">Importando...</span>}
              <button
                onClick={async () => {
                  const ok = window.confirm('Corrigir valores inflados de despesas importadas via CSV?')
                  if (!ok) return
                  try {
                    const res = await fetch('/api/tools/fix-csv-amounts', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ dryRun: false })
                    })
                    const data = await res.json().catch(() => ({}))
                    alert(res.ok ? `Correção concluída: ${data.fixed || 0} registros atualizados` : (data.error || 'Falha na correção'))
                  } catch {}
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Corrigir despesas CSV
              </button>
              <button
                onClick={async () => {
                  const ok = window.confirm('Excluir transações CSV deste ano com valores anômalos?')
                  if (!ok) return
                  try {
                    const res = await fetch('/api/tools/delete-csv-range', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ onlyAbnormal: true })
                    })
                    const data = await res.json().catch(() => ({}))
                    alert(res.ok ? `Exclusão concluída: ${data.deleted || 0} registros removidos` : (data.error || 'Falha na exclusão'))
                  } catch {}
                }}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900"
              >
                Excluir CSV anômalas (este ano)
              </button>
              <button
                onClick={async () => {
                  const ok = window.confirm('Marcar transferências Nomad como Investimentos (ETHU)?')
                  if (!ok) return
                  try {
                    const res = await fetch('/api/tools/tag-nomad-investments', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({})
                    })
                    const data = await res.json().catch(() => ({}))
                    alert(res.ok ? `Atualização concluída: ${data.updated || 0} registros marcados` : (data.error || 'Falha na atualização'))
                  } catch {}
                }}
                className="px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800"
              >
                Marcar Nomad como ETHU
              </button>
              <button
                onClick={async () => {
                  const ok = window.confirm('Excluir TODAS transações CSV deste ano? Esta ação não pode ser desfeita.')
                  if (!ok) return
                  try {
                    const res = await fetch('/api/tools/delete-csv-range', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ onlyAbnormal: false })
                    })
                    const data = await res.json().catch(() => ({}))
                    alert(res.ok ? `Exclusão concluída: ${data.deleted || 0} registros removidos` : (data.error || 'Falha na exclusão'))
                  } catch {}
                }}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900"
              >
                Excluir TODAS CSV (este ano)
              </button>
              <button
                onClick={async () => {
                  const ok = window.confirm('Aplicar regras de auto-categorização em transações antigas?')
                  if (!ok) return
                  try {
                    const res = await fetch('/api/tools/recategorize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
                    const data = await res.json().catch(() => ({}))
                    alert(res.ok ? `Recategorização concluída: ${data.updated || 0} registros atualizados` : (data.error || 'Falha na recategorização'))
                  } catch {}
                }}
                className="px-4 py-2 bg-indigo-700 text-white rounded-lg hover:bg-indigo-800"
              >
                Recategorizar antigas
              </button>
            </div>
          </div>
        </ModernCard>
        </Motion>
      </div>
    </div>
  )
}
