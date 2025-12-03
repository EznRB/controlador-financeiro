import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

function toNumber(v: any) {
  return typeof v === 'object' && v !== null && 'toString' in v ? Number(v.toString()) : Number(v)
}

const bucket = new Map<string, { count: number; last: number }>()
function rateLimit(key: string, limit = 10, windowMs = 15_000) {
  const now = Date.now()
  const entry = bucket.get(key)
  if (!entry || now - entry.last > windowMs) {
    bucket.set(key, { count: 1, last: now })
    return true
  }
  if (entry.count >= limit) return false
  entry.count += 1
  entry.last = now
  bucket.set(key, entry)
  return true
}

export async function GET() {
  const session: any = await getServerSession(authOptions as any)
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ error: 'Usuário inválido' }, { status: 400 })

  const holdings = await prisma.cryptoHolding.findMany({ where: { userId: user.id }, orderBy: { symbol: 'asc' } })
  const safe = holdings.map(h => ({
    id: h.id,
    symbol: h.symbol,
    amount: toNumber(h.amount),
    avgPrice: toNumber(h.avgPrice),
    targetValue: h.targetValue ? toNumber(h.targetValue) : null,
  }))
  return NextResponse.json({ holdings: safe })
}

export async function POST(req: NextRequest) {
  const session: any = await getServerSession(authOptions as any)
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ error: 'Usuário inválido' }, { status: 400 })

  if (!rateLimit(`holdings:${user.id}`)) {
    return NextResponse.json({ error: 'Muitas requisições' }, { status: 429 })
  }

  const body = await req.json().catch(() => ({}))
  const symbol = String(body.symbol || '').toUpperCase().trim()
  const amount = Number(body.amount)
  const avgPrice = Number(body.avgPrice)
  const targetValue = body.targetValue !== undefined ? Number(body.targetValue) : undefined
  if (!symbol || !isFinite(amount) || !isFinite(avgPrice) || amount < 0 || avgPrice < 0) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  const created = await prisma.cryptoHolding.create({
    data: { userId: user.id, symbol, amount, avgPrice, targetValue }
  })
  return NextResponse.json({ id: created.id })
}
