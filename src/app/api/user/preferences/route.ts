import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

async function getCurrentUser() {
  const session: any = await getServerSession(authOptions as any)
  const email = session?.user?.email
  if (!email) return null
  const user = await prisma.user.findUnique({ where: { email } })
  return user
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const preferences = (user.preferences as any) || {}
  return NextResponse.json({ preferences })
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const incoming = (body?.preferences as Record<string, any>) || {}
  const current = (user.preferences as Record<string, any>) || {}
  const merged = { ...current, ...incoming }
  await prisma.user.update({ where: { id: user.id }, data: { preferences: merged, updatedAt: new Date() } })
  return NextResponse.json({ success: true })
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
