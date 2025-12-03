import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

export async function PATCH(req: NextRequest) {
  const session: any = await getServerSession(authOptions as any)
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const currentUser = await prisma.user.findUnique({ where: { email } })
  if (!currentUser) return NextResponse.json({ error: 'Usuário inválido' }, { status: 400 })

  const body = await req.json().catch(() => ({}))
  const name: string | undefined = body?.name
  const newEmail: string | undefined = body?.email

  let emailChanged = false

  if (newEmail && newEmail !== currentUser.email) {
    const exists = await prisma.user.findUnique({ where: { email: newEmail } })
    if (exists) return NextResponse.json({ error: 'Email já em uso' }, { status: 409 })
    emailChanged = true
  }

  const updated = await prisma.user.update({
    where: { id: currentUser.id },
    data: {
      name: typeof name === 'string' ? name : currentUser.name,
      email: emailChanged ? (newEmail as string) : currentUser.email,
      updatedAt: new Date(),
    },
    select: { id: true, email: true, name: true },
  })

  return NextResponse.json({ user: updated, emailChanged })
}

export async function GET() {
  const session: any = await getServerSession(authOptions as any)
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true, name: true } })
  if (!user) return NextResponse.json({ error: 'Usuário inválido' }, { status: 400 })
  return NextResponse.json({ user })
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
