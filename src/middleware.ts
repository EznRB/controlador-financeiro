// Middleware simplificado para modo demonstração
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

function isMutation(method: string) {
  return ['POST','PUT','PATCH','DELETE'].includes(method.toUpperCase())
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (process.env.NODE_ENV === 'production') {
    const proto = request.headers.get('x-forwarded-proto')
    if (proto && proto !== 'https') {
      const url = new URL(request.url)
      url.protocol = 'https:'
      return NextResponse.redirect(url)
    }
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  const isAuthRoute = pathname.startsWith('/auth')
  const isPublicRoute = pathname === '/' || pathname.startsWith('/pricing') || pathname === '/offline'

  if (pathname.startsWith('/api/')) {
    const isPublic = pathname.startsWith('/api/investments/price')
    const isAuthApi = pathname.startsWith('/api/auth')
    if (isPublic || isAuthApi) return NextResponse.next()
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    if (isMutation(request.method) && !isAuthApi) {
      const origin = request.headers.get('origin')
      const expectedOrigin = `${request.nextUrl.protocol}//${request.nextUrl.host}`
      if (!origin || origin !== expectedOrigin) {
        return NextResponse.json({ error: 'Origem inválida' }, { status: 403 })
      }
    }
    return NextResponse.next()
  }

  // Persistência de UTMs em cookie
  const url = request.nextUrl
  const reqHasUtm = ['utm_source','utm_medium','utm_campaign','utm_content'].some((k) => url.searchParams.has(k))
  let res = NextResponse.next()
  if (reqHasUtm) {
    for (const k of ['utm_source','utm_medium','utm_campaign','utm_content']) {
      const v = url.searchParams.get(k)
      if (v) res.cookies.set(k, v, { path: '/', maxAge: 60 * 60 * 24 * 30 })
    }
  }
  if (!token && !isAuthRoute && !isPublicRoute) {
    const redirectUrl = new URL('/auth/login', request.url)
    return NextResponse.redirect(redirectUrl)
  }
  return res
}

export const config = {
  matcher: ['/((?!api|_next|favicon.ico).*)'],
}
