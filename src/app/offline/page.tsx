'use client'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Você está offline</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-4">Sem conexão com a internet. Tente novamente mais tarde.</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">Algumas telas podem mostrar dados em cache quando disponíveis.</p>
      </div>
    </div>
  )
}
