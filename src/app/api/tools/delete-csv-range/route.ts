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

  const body = await req.json().catch(() => ({} as any))
  const now = new Date()
  const startDefault = new Date(now.getFullYear(), 0, 1)
  const startDate = body.startDate ? new Date(body.startDate) : startDefault
  const endDate = body.endDate ? new Date(body.endDate) : now
  const onlyAbnormal = body.onlyAbnormal !== undefined ? !!body.onlyAbnormal : true

  const where: any = {
    userId: user.id,
    source: 'csv',
    transactionDate: { gte: startDate, lte: endDate },
  }
  if (onlyAbnormal) {
    where.amount = { lte: -1000, gte: 1000 }
  }

  const toDelete = await prisma.transaction.findMany({ where, select: { id: true } })
  const ids = toDelete.map(r => r.id)
  let deleted = 0
  if (ids.length > 0) {
    const res = await prisma.transaction.deleteMany({ where: { id: { in: ids } } })
    deleted = res.count || 0
  }

  return NextResponse.json({ success: true, deleted, range: { startDate, endDate }, onlyAbnormal })
}

