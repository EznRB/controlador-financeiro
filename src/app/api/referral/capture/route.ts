import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const ref = url.searchParams.get('ref')
  if (!ref) return NextResponse.redirect(url.origin)
  const res = new NextResponse(null, { status: 302 })
  res.headers.set('Location', url.origin)
  res.cookies.set('ref', ref, { path: '/', maxAge: 60 * 60 * 24 * 30 })
  return res
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
