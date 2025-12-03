import { NextResponse } from 'next/server'
import { getPricesFiat } from '@/lib/crypto-providers'
import { rateLimit } from '@/lib/ratelimit'

export async function POST(req: Request) {
  try {
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0] || 'unknown'
    const decision = await rateLimit(`price:${ip}`, 30, 60_000)
    if (!decision.allowed) return NextResponse.json({ error: 'Muitas requisições' }, { status: 429 })
    const body = await req.json().catch(() => ({}))
    const symbols: string[] = Array.isArray(body.symbols) ? body.symbols : ['BTC','ETH','SOL']
    const fiat = typeof body.fiat === 'string' && ['BRL','USD'].includes(body.fiat.toUpperCase()) ? body.fiat.toUpperCase() as 'BRL'|'USD' : 'BRL'
    if (!Array.isArray(symbols) || symbols.length === 0) {
      return NextResponse.json({ error: 'Símbolos inválidos' }, { status: 400 })
    }
    const prices = await getPricesFiat(symbols, fiat)
    return NextResponse.json({ prices }, { headers: { 'Cache-Control': 's-maxage=60' } })
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao obter preços' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0] || 'unknown'
  const decision = await rateLimit(`price:${ip}`, 30, 60_000)
  if (!decision.allowed) return NextResponse.json({ error: 'Muitas requisições' }, { status: 429 })
  const url = new URL(req.url)
  const fiatParam = url.searchParams.get('fiat')
  const fiat = fiatParam && ['BRL','USD'].includes(fiatParam.toUpperCase()) ? fiatParam.toUpperCase() as 'BRL'|'USD' : 'BRL'
  const prices = await getPricesFiat(['BTC','ETH','SOL'], fiat)
  return NextResponse.json({ prices }, { headers: { 'Cache-Control': 's-maxage=60' } })
}
