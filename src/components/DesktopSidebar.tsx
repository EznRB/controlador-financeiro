'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, DollarSign, PlusCircle, Target, Settings, LogOut, RefreshCw, Upload, Coins } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const items = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Transações', href: '/transactions', icon: DollarSign },
  { name: 'Nova', href: '/transactions/new', icon: PlusCircle },
  { name: 'Metas', href: '/goals', icon: Target },
  { name: 'Recorrentes', href: '/recurring', icon: RefreshCw },
  { name: 'Investimentos', href: '/investments', icon: Coins },
  { name: 'Importar CSV', href: '/import-csv', icon: Upload },
  { name: 'Configurações', href: '/settings', icon: Settings },
]

export default function DesktopSidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
    window.location.href = '/auth/login'
  }

  return (
    <aside className="hidden md:flex md:flex-col md:w-60 md:shrink-0 border-r border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
      <div className="p-4">
        <nav className="flex flex-col gap-1">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                prefetch={false}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 transition-colors ${
                  isActive
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-medium">Sair</span>
        </button>
      </div>
    </aside>
  )
}

