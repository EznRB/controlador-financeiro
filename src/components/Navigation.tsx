'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Home, DollarSign, PlusCircle, Target, Settings, LogOut, RefreshCw, Upload, Moon, Sun, Coins } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import Link from 'next/link';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Transações', href: '/transactions', icon: DollarSign },
  { name: 'Nova', href: '/transactions/new', icon: PlusCircle },
  { name: 'Metas', href: '/goals', icon: Target },
  { name: 'Investimentos', href: '/investments', icon: Coins },
];

export default function Navigation() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { theme } = useTheme();
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/auth/login';
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 px-4 py-2 shadow-md md:hidden">
      <div className="mx-auto max-w-xl md:max-w-2xl flex items-center justify-between relative">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          const isPrimary = item.name === 'Nova';

          return (
            <Link
              key={item.name}
              href={item.href}
              prefetch={false}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center ${isPrimary ? 'p-2 -mt-6' : 'p-3'} rounded-2xl min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 transition-all duration-300 ${
                isPrimary
                  ? 'hover:scale-105'
                  : 'transform hover:scale-110'
              } ${
                isActive
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className="relative">
                <Icon className={`${isPrimary ? 'h-7 w-7' : 'h-6 w-6'} ${isPrimary ? 'text-white' : ''}`} />
              </div>
              <span className={`text-[11px] mt-1 font-medium transition-all ${
                isActive ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'
              }`}>
                {item.name}
              </span>
              {isPrimary && (
                <span aria-hidden className="absolute inset-0 -z-10 flex items-center justify-center">
                  <span className="h-12 w-12 rounded-full bg-green-500 shadow-lg shadow-green-500/30" />
                </span>
              )}
            </Link>
          );
        })}
        <button
          type="button"
          aria-label="Mais opções"
          onClick={() => setMoreOpen((v) => !v)}
          className="flex flex-col items-center p-2 rounded-xl min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          <Settings className="h-5 w-5" />
          <span className="text-[10px] mt-1">Mais</span>
        </button>

        {moreOpen && (
          <div role="menu" className="absolute bottom-16 right-2 w-56 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg">
            <div className="p-2 grid grid-cols-1 gap-1">
              <Link href="/recurring" prefetch={false} className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                <RefreshCw className="h-4 w-4" />
                <span className="text-sm">Recorrentes</span>
              </Link>
              <Link href="/import-csv" prefetch={false} className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                <Upload className="h-4 w-4" />
                <span className="text-sm">Importar CSV</span>
              </Link>
              <Link href="/settings" prefetch={false} className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                <Settings className="h-4 w-4" />
                <span className="text-sm">Configurações</span>
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600">
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Sair</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
