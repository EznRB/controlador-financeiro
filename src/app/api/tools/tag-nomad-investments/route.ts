import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

export async function POST(req: NextRequest) {
  const session: any = await getServerSession(authOptions as any)
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ error: 'Usuário inválido' }, { status: 400 })

  const body = await req.json().catch(() => ({}))
  const startDate = body.startDate ? new Date(body.startDate) : undefined
  const endDate = body.endDate ? new Date(body.endDate) : undefined

  const where: any = { userId: user.id }
  if (startDate && endDate) {
    where.transactionDate = { gte: startDate, lte: endDate }
  }
  const rows = await prisma.transaction.findMany({
    where,
    select: { id: true, description: true, metadata: true, category: true }
  })

  let updated = 0
  for (const r of rows) {
    const desc = (r.description || '').toLowerCase()
    if (!desc.includes('nomad')) continue
    const metadata = { ...(r.metadata as any || {}), instrument: 'ETHU', provider: 'Nomad' }
    const category = 'Investimentos'
    await prisma.transaction.update({ where: { id: r.id }, data: { metadata, category } })
    updated += 1
  }

  return NextResponse.json({ success: true, updated })
}

