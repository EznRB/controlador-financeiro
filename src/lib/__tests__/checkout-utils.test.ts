import { describe, it, expect } from '@jest/globals'

function parseCookies(header: string) {
  const out: Record<string,string> = {}
  header.split(';').forEach((kv) => {
    const [k, v] = kv.split('=').map((s) => s.trim())
    if (k && v) out[k] = decodeURIComponent(v)
  })
  return out
}

describe('cookie utm parsing', () => {
  it('extracts utm cookies safely', () => {
    const h = 'utm_source=google; utm_medium=cpc; utm_campaign=brand; utm_content=ad1'
    const c = parseCookies(h)
    expect(c.utm_source).toBe('google')
    expect(c.utm_medium).toBe('cpc')
    expect(c.utm_campaign).toBe('brand')
    expect(c.utm_content).toBe('ad1')
  })
})
