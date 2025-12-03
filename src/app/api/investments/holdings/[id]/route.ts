import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { z } from 'zod'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session: any = await getServerSession(authOptions as any)
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ error: 'Usuário inválido' }, { status: 400 })

  await prisma.cryptoHolding.deleteMany({ where: { id, userId: user.id } })
  return NextResponse.json({ success: true })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session: any = await getServerSession(authOptions as any)
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ error: 'Usuário inválido' }, { status: 400 })

  const schema = z.object({
    symbol: z.string().optional(),
    amount: z.number().optional(),
    avgPrice: z.number().optional(),
    targetValue: z.number().optional(),
  })
  const parsed = schema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  const body = parsed.data
  const data: any = {}
  if (typeof body.symbol === 'string') data.symbol = body.symbol.toUpperCase().trim()
  if (body.amount !== undefined) data.amount = Number(body.amount)
  if (body.avgPrice !== undefined) data.avgPrice = Number(body.avgPrice)
  if (body.targetValue !== undefined) data.targetValue = Number(body.targetValue)

  await prisma.cryptoHolding.updateMany({ where: { id, userId: user.id }, data })
  return NextResponse.json({ success: true })
}
