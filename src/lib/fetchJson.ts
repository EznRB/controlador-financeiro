export async function fetchJson<T = any>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers as any)
  if (!headers.has('accept')) headers.set('accept', 'application/json')
  const res = await fetch(input, { ...(init || {}), headers })
  let json: any = null
  try { json = await res.json() } catch {}
  if (!res.ok) {
    const msg = json?.error?.message || json?.error || 'Falha na requisição'
    throw new Error(msg)
  }
  return (json && 'data' in json) ? (json.data as T) : (json as T)
}
