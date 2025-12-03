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

  const txs = await prisma.cryptoTransaction.findMany({ where: { userId: user.id }, orderBy: { date: 'desc' }, take: 200 })
  const safe = txs.map(t => ({
    id: t.id,
    symbol: t.symbol,
    type: t.type,
    quantity: toNumber(t.quantity),
    price: toNumber(t.price),
    fee: t.fee ? toNumber(t.fee) : 0,
    date: t.date,
  }))
  return NextResponse.json({ transactions: safe })
}

export async function POST(req: NextRequest) {
  const session: any = await getServerSession(authOptions as any)
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ error: 'Usuário inválido' }, { status: 400 })
  if (!rateLimit(`transactions:${user.id}`)) {
    return NextResponse.json({ error: 'Muitas requisições' }, { status: 429 })
  }

  const body = await req.json().catch(() => ({}))
  const symbol = String(body.symbol || '').toUpperCase().trim()
  const type = String(body.type || '').toUpperCase() as 'BUY' | 'SELL'
  const quantity = Number(body.quantity)
  const price = Number(body.price)
  const fee = body.fee !== undefined ? Number(body.fee) : null
  const date = body.date ? new Date(body.date) : new Date()
  if (!symbol || (type !== 'BUY' && type !== 'SELL') || !isFinite(quantity) || !isFinite(price) || quantity <= 0 || price <= 0) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  await prisma.cryptoTransaction.create({
    data: { userId: user.id, symbol, type, quantity, price, fee, date }
  })
  return NextResponse.json({ success: true })
}
