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

  const body = await req.json()
  const { id, add_amount } = body || {}
  if (!id) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  const add = Number(add_amount)
  if (!add || isNaN(add) || add <= 0) return NextResponse.json({ error: 'Valor de incremento inválido' }, { status: 400 })

  const goal = await prisma.goal.findUnique({ where: { id } })
  if (!goal || goal.userId !== user.id) return NextResponse.json({ error: 'Meta não encontrada' }, { status: 404 })

  const nextAmount = Math.min(Number(goal.currentAmount) + add, Number(goal.targetAmount))

  const updated = await prisma.goal.update({
    where: { id },
    data: { currentAmount: nextAmount },
  })

  return NextResponse.json({ goal: updated })
}
