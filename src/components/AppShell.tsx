'use client'

import { usePathname } from 'next/navigation'
import Navigation from '@/components/Navigation'
import DesktopSidebar from '@/components/DesktopSidebar'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideNav = pathname.startsWith('/auth')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user } = useAuth()
  return (
    <>
      <div className="relative pb-16 md:pb-0 flex">
        {!hideNav && (
          <button
            type="button"
            aria-label={sidebarOpen ? 'Fechar sidebar' : 'Abrir sidebar'}
            onClick={() => setSidebarOpen((v) => !v)}
            className={`hidden md:flex absolute top-1/2 -translate-y-1/2 z-30 justify-center items-center w-8 h-8 text-slate-600 dark:text-slate-300 bg-transparent transition-transform duration-300 ease-out hover:scale-110 ${sidebarOpen ? 'left-60 -translate-x-full' : 'left-0 translate-x-2'}`}
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
        )}
        {!hideNav && sidebarOpen && <DesktopSidebar />}
        <div className="flex-1">
          {!hideNav && user && (
            <div className="mx-4 mt-2 text-xs md:text-sm text-slate-500 dark:text-slate-400">
              {user.plan === 'monthly' && (
                <span>
                  Assinatura ativa • Status: {user.subscriptionStatus}
                  {' '}
                  <a href="/api/stripe/portal" className="ml-2 underline">Gerenciar assinatura</a>
                </span>
              )}
              {user.plan === 'lifetime' && (
                <span>Acesso vitalício ativo</span>
              )}
              {user.plan === 'free' && (
                <span>Plano gratuito • Experimente o plano completo por 30 dias em <a className="underline hover:text-slate-600 dark:hover:text-slate-300" href="/pricing">Pricing</a></span>
              )}
              {user.plan === 'monthly' && user.subscriptionStatus === 'trialing' && user.trialEndAt && (
                <span className="ml-2">Em teste até {new Date(user.trialEndAt).toLocaleDateString()}</span>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
      {!hideNav && <Navigation />}
    </>
  )
}
