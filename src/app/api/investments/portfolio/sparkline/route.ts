import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { SYMBOL_TO_ID } from '@/lib/crypto-providers'

export async function GET(req: Request) {
  const session: any = await getServerSession(authOptions as any)
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ error: 'Usuário inválido' }, { status: 400 })
  const urlReq = new URL(req.url)
  const fiatParam = urlReq.searchParams.get('fiat')
  const fiat = fiatParam && ['brl','usd'].includes(fiatParam.toLowerCase()) ? fiatParam.toLowerCase() : 'brl'

  const holdings = await prisma.cryptoHolding.findMany({ where: { userId: user.id } })
  const withAmount = holdings.filter(h => Number(h.amount) > 0).slice(0, 6)
  if (withAmount.length === 0) return NextResponse.json({ points: [] })

  const series: Array<{ t: number; value: number }>[] = []
  for (const h of withAmount) {
    const id = SYMBOL_TO_ID[h.symbol.toUpperCase()]
    if (!id) continue
    const url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=${fiat}&days=1&interval=hourly`
    const res = await fetch(url)
    if (!res.ok) continue
    const data = await res.json()
    const prices: Array<[number, number]> = data?.prices || []
    const qty = Number(h.amount)
    series.push(prices.map(([t, p]) => ({ t, value: p * qty })))
  }

  const byTime = new Map<number, number>()
  for (const s of series) {
    for (const point of s) {
      byTime.set(point.t, (byTime.get(point.t) || 0) + point.value)
    }
  }
  const points = Array.from(byTime.entries()).sort((a, b) => a[0] - b[0]).map(([t, value]) => ({ t, value }))
  return NextResponse.json({ points }, { headers: { 'Cache-Control': 's-maxage=120' } })
}
