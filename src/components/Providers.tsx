'use client';

import { SessionProvider } from 'next-auth/react';
import { useEffect } from 'react'
import { ThemeProvider } from '@/hooks/useTheme';
import { Toaster } from 'sonner'
import { useTheme } from '@/hooks/useTheme'

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister()))
    }
  }, [])
  return (
    <ThemeProvider>
      <SessionProvider refetchOnWindowFocus={false}>
        {children}
        <InnerToaster />
      </SessionProvider>
    </ThemeProvider>
  );
}

function InnerToaster() {
  const { theme } = useTheme()
  return <Toaster theme={theme === 'dark' ? 'dark' : 'light'} richColors position="top-center" />
}
