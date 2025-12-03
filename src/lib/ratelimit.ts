type Decision = { allowed: boolean; remaining: number; reset: number }

const memoryBucket = new Map<string, { count: number; resetAt: number }>()

function memoryLimit(key: string, limit = 60, windowMs = 60_000): Decision {
  const now = Date.now()
  const entry = memoryBucket.get(key)
  if (!entry || now > entry.resetAt) {
    memoryBucket.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, reset: windowMs }
  }
  if (entry.count >= limit) return { allowed: false, remaining: 0, reset: entry.resetAt - now }
  entry.count += 1
  memoryBucket.set(key, entry)
  return { allowed: true, remaining: Math.max(0, limit - entry.count), reset: entry.resetAt - now }
}

export async function rateLimit(key: string, limit = 60, windowMs = 60_000): Promise<Decision> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return memoryLimit(key, limit, windowMs)
  try {
    const endpoint = `${url}/pipeline`
    const w = Math.ceil(windowMs / 1000)
    const body = JSON.stringify([
      ["INCR", key],
      ["EXPIRE", key, w],
      ["TTL", key],
    ])
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body,
    })
    if (!res.ok) return memoryLimit(key, limit, windowMs)
    const data = await res.json()
    const count = Number(data?.[0]?.result || 0)
    const ttl = Number(data?.[2]?.result || w)
    const allowed = count <= limit
    return { allowed, remaining: Math.max(0, limit - count), reset: ttl * 1000 }
  } catch {
    return memoryLimit(key, limit, windowMs)
  }
}
