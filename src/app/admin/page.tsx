import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role || 'user'
  if (role !== 'admin') redirect('/dashboard')

  const [usersMonthly, usersLifetime, usersTrialing, usersCanceled, paymentEventsCount, utmTop] = await Promise.all([
    prisma.user.count({ where: { plan: 'monthly', subscriptionStatus: { in: ['active', 'trialing'] } } }),
    prisma.user.count({ where: { plan: 'lifetime' } }),
    prisma.user.count({ where: { plan: 'monthly', subscriptionStatus: 'trialing' } }),
    prisma.user.count({ where: { plan: 'canceled' } }),
    prisma.paymentEvent.count(),
    prisma.paymentEvent.groupBy({ by: ['utmSource'], _count: { _all: true } }).catch(() => []),
  ])
  const mrr = usersMonthly * 9.9

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Painel Admin</h1>
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <Card title="MRR Estimado" value={`R$ ${mrr.toFixed(2)}`} />
        <Card title="Trials ativos" value={String(usersTrialing)} />
        <Card title="Assinantes mensais" value={String(usersMonthly)} />
        <Card title="Vitalícios" value={String(usersLifetime)} />
        <Card title="Cancelados" value={String(usersCanceled)} />
        <Card title="Eventos de pagamento" value={String(paymentEventsCount)} />
      </div>
      <div className="mt-4">
        <a href="/api/admin/export/payments" className="underline">Exportar eventos (CSV)</a>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-semibold">Top UTM Sources</h2>
        <div className="mt-3 grid md:grid-cols-3 gap-3">
          {utmTop.slice(0,6).map((r: any, i: number) => (
            <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-800 p-3">
              <div className="text-sm text-slate-500 dark:text-slate-400">{r.utmSource || '—'}</div>
              <div className="text-lg font-semibold">{r._count._all}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
      <div className="text-sm text-slate-600 dark:text-slate-300">{title}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{value}</div>
    </div>
  )
}
