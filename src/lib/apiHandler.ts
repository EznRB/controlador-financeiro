import { NextRequest, NextResponse } from 'next/server'

type Handler<T = any> = (req: NextRequest) => Promise<T>

export function apiHandler<T>(fn: Handler<T>) {
  return async (req: NextRequest) => {
    try {
      const data = await fn(req)
      return NextResponse.json({ success: true, data })
    } catch (e: any) {
      const message = e?.message || 'Erro interno do servidor'
      const status = typeof e?.status === 'number' ? e.status : 500
      const code = e?.code || (status === 400 ? 'BAD_REQUEST' : status === 401 ? 'UNAUTHORIZED' : 'INTERNAL_ERROR')
      return NextResponse.json({ success: false, error: { code, message } }, { status })
    }
  }
}
