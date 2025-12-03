type PriceInfo = { symbol: string; price: number; change24h: number; marketCap?: number }

const SYMBOL_TO_ID: Record<string, string> = {
  BTC: 'bitcoin', ETH: 'ethereum', SOL: 'solana', ADA: 'cardano', AVAX: 'avalanche-2', BNB: 'binancecoin', XRP: 'ripple', DOGE: 'dogecoin',
  LTC: 'litecoin', DOT: 'polkadot', MATIC: 'matic-network', LINK: 'chainlink', TRX: 'tron', ATOM: 'cosmos', NEAR: 'near', UNI: 'uniswap', TON: 'toncoin', SHIB: 'shiba-inu'
}

async function getUsdBrl(): Promise<number> {
  try {
    const res = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=BRL', { next: { revalidate: 600 } })
    if (!res.ok) return 5
    const j = await res.json()
    return Number(j?.rates?.BRL || 5)
  } catch { return 5 }
}

export async function getPricesFiat(symbols: string[], fiat: 'BRL' | 'USD' = 'BRL'): Promise<PriceInfo[]> {
  const syms = symbols.map(s=>s.toUpperCase())
  const cmcKey = process.env.CMC_API_KEY
  if (cmcKey) {
    try {
      const url = `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol=${syms.join(',')}&convert=${fiat}`
      const res = await fetch(url, { headers: { 'X-CMC_PRO_API_KEY': cmcKey }, next: { revalidate: 60 } })
      if (res.ok) {
        const data = await res.json()
        const out: PriceInfo[] = []
        for (const sym of syms) {
          const d = data?.data?.[sym]?.[0]
          const q = d?.quote?.[fiat]
          if (q) out.push({ symbol: sym, price: Number(q.price || 0), change24h: Number(q.percent_change_24h || 0), marketCap: Number(q.market_cap || 0) })
        }
        if (out.length) return out
      }
    } catch {}
  }
  try {
    const ids = syms.map(s => SYMBOL_TO_ID[s]).filter(Boolean).join(',')
    if (ids) {
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${fiat.toLowerCase()}&include_24hr_change=true&include_market_cap=true`
      const res = await fetch(url, { next: { revalidate: 60 } })
      if (res.ok) {
        const data = await res.json()
        const out: PriceInfo[] = []
        for (const [sym, id] of Object.entries(SYMBOL_TO_ID)) {
          if (syms.includes(sym) && data[id]) out.push({ symbol: sym, price: Number(data[id]?.[fiat.toLowerCase()] || 0), change24h: Number(data[id]?.[`${fiat.toLowerCase()}_24h_change`] || 0), marketCap: Number(data[id]?.[`${fiat.toLowerCase()}_market_cap`] || 0) })
        }
        if (out.length) return out
      }
    }
  } catch {}
  const out: PriceInfo[] = []
  for (const sym of syms) {
    try {
      if (fiat === 'BRL') {
        const usdToBrl = await getUsdBrl()
        const pairBRL = `${sym}BRL`
        let res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${pairBRL}`, { next: { revalidate: 60 } })
        if (!res.ok) {
          const pairUSDT = `${sym}USDT`
          res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${pairUSDT}`, { next: { revalidate: 60 } })
          if (!res.ok) continue
          const j = await res.json()
          const priceBRL = Number(j?.lastPrice || 0) * usdToBrl
          const changePct = Number(j?.priceChangePercent || 0)
          out.push({ symbol: sym, price: priceBRL, change24h: changePct })
        } else {
          const j = await res.json()
          out.push({ symbol: sym, price: Number(j?.lastPrice || 0), change24h: Number(j?.priceChangePercent || 0) })
        }
      } else {
        const pairUSDT = `${sym}USDT`
        const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${pairUSDT}`, { next: { revalidate: 60 } })
        if (!res.ok) continue
        const j = await res.json()
        out.push({ symbol: sym, price: Number(j?.lastPrice || 0), change24h: Number(j?.priceChangePercent || 0) })
      }
    } catch {}
  }
  return out
}

export { SYMBOL_TO_ID }
