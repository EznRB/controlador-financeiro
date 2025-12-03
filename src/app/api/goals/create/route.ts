import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { GoalSchema } from '@/lib/validation'

export async function POST(req: NextRequest) {
  const session: any = await getServerSession(authOptions as any)
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ error: 'Usuário inválido' }, { status: 400 })

  const body = await req.json()
  const parsed = GoalSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  const { title, target_amount, category, start_date, end_date } = parsed.data
  const start = new Date(start_date)
  const end = new Date(end_date)
  if (end < start) return NextResponse.json({ error: 'Data de fim deve ser após o início' }, { status: 400 })

  const goal = await prisma.goal.create({
    data: {
      userId: user.id,
      title,
      targetAmount: Number(target_amount),
      currentAmount: 0,
      category: category || 'Geral',
      startDate: start,
      endDate: end,
      isActive: true,
    },
  })

  return NextResponse.json({ goal })
}
