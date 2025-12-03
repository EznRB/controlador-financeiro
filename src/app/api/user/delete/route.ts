import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

export async function DELETE() {
  const session: any = await getServerSession(authOptions as any)
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ error: 'Usuário inválido' }, { status: 400 })

  await prisma.transaction.deleteMany({ where: { userId: user.id } })
  await prisma.goal.deleteMany({ where: { userId: user.id } })
  await prisma.category.deleteMany({ where: { userId: user.id } })
  await prisma.recurringExpense.deleteMany({ where: { userId: user.id } })
  await prisma.user.delete({ where: { id: user.id } })

  return NextResponse.json({ success: true })
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
