'use client';

import { signIn, signOut, useSession } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();
  return {
    user: session?.user ? {
      id: (session.user as any).id || '',
      email: session.user.email || '',
      role: (session.user as any).role || 'user',
      plan: (session.user as any).plan || 'free',
      subscriptionStatus: (session.user as any).subscriptionStatus || 'free',
      trialEndAt: (session.user as any).trialEndAt || null,
    } : null,
    loading: status === 'loading',
    signIn: async (email: string) => {
      await signIn('credentials', { email, redirect: true, callbackUrl: '/dashboard' });
    },
    signOut: async () => {
      await signOut({ callbackUrl: '/auth/login' });
    },
  };
}
