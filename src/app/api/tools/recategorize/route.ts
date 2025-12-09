import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

export async function POST(req: NextRequest) {
  const session: any = await getServerSession(authOptions as any)
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ error: 'Usuário inválido' }, { status: 400 })

  const body = await req.json().catch(() => ({}))
  const startStr = String(body?.start || '')
  const endStr = String(body?.end || '')
  const start = startStr ? new Date(startStr) : new Date(new Date().getFullYear(), 0, 1)
  const end = endStr ? new Date(endStr) : new Date()

  const aliases: Array<{ pattern: string; category: string }> = Array.isArray((user as any).preferences?.categoryAliases)
    ? ((user as any).preferences?.categoryAliases as Array<{ pattern: string; category: string }>)
    : []

  if (aliases.length === 0) {
    return NextResponse.json({ updated: 0, message: 'Nenhuma regra definida' })
  }

  const rows = await prisma.transaction.findMany({
    where: { userId: user.id, transactionDate: { gte: start, lte: end } },
    select: { id: true, description: true, category: true },
  })

  let updated = 0
  for (const r of rows) {
    const descLc = (r.description || '').toLowerCase()
    let newCat: string | null = null
    for (const a of aliases) {
      const pat = (a?.pattern || '').toLowerCase().trim()
      const cat = String(a?.category || '').trim()
      if (pat && cat && descLc.includes(pat)) {
        newCat = cat
        break
      }
    }
    if (newCat && newCat !== (r.category || '')) {
      await prisma.transaction.update({ where: { id: r.id }, data: { category: newCat } })
      updated++
    }
  }

  return NextResponse.json({ updated })
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
