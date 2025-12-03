export async function fetchJson<T = any>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init)
  let json: any = null
  try { json = await res.json() } catch {}
  if (!res.ok) {
    const msg = json?.error?.message || json?.error || 'Falha na requisição'
    throw new Error(msg)
  }
  return (json && 'data' in json) ? (json.data as T) : (json as T)
}
