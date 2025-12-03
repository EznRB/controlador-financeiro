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

  const { dryRun = false } = (await req.json().catch(() => ({ dryRun: false }))) as { dryRun?: boolean }

  const rows = await prisma.transaction.findMany({
    where: { userId: user.id, source: 'csv', type: 'expense' },
    orderBy: { createdAt: 'desc' },
    take: 2000,
  })

  let candidates = 0
  let fixed = 0
  const updates: { id: string; old: number; new: number }[] = []

  for (const t of rows) {
    const amt = Number(t.amount)
    const absAmt = Math.abs(amt)
    const shouldFix = absAmt >= 1000
    if (!shouldFix) continue
    candidates++
    const newAmt = amt < 0 ? -Math.abs(absAmt / 100) : Math.abs(absAmt / 100)
    updates.push({ id: t.id, old: amt, new: newAmt })
  }

  if (!dryRun) {
    for (const u of updates) {
      await prisma.transaction.update({ where: { id: u.id }, data: { amount: u.new } })
      fixed++
    }
  }

  return NextResponse.json({
    success: true,
    dryRun,
    candidates,
    fixed,
    sample: updates.slice(0, 10),
  })
}

