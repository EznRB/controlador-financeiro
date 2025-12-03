import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

function toCSV(rows: Array<Record<string, any>>) {
  const header = ['date','type','category','amount','description','source']
  const lines = [header.join(',')]
  for (const r of rows) {
    const date = new Date(r.transactionDate).toISOString()
    const type = r.type
    const category = r.category
    const amount = r.amount?.toString?.() ?? String(r.amount)
    const description = (r.description ?? '').toString().replace(/\"/g, '"').replace(/\n/g, ' ')
    const source = r.source ?? ''
    const row = [date, type, category, amount, description, source].map((v) => {
      const s = String(v)
      return s.includes(',') || s.includes('\n') ? `"${s.replace(/"/g, '"')}"` : s
    }).join(',')
    lines.push(row)
  }
  return lines.join('\n')
}

export async function GET() {
  const session: any = await getServerSession(authOptions as any)
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ error: 'Usuário inválido' }, { status: 400 })

  const transactions = await prisma.transaction.findMany({ where: { userId: user.id }, orderBy: { transactionDate: 'asc' } })
  const csv = toCSV(transactions as any)
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="transacoes.csv"',
    }
  })
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
