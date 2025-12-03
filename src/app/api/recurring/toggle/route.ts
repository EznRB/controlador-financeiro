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
  const { id, is_active } = body
  if (!id || typeof is_active !== 'boolean') return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  await prisma.recurringExpense.update({ where: { id }, data: { isActive: is_active } })
  return NextResponse.json({ success: true })
}
