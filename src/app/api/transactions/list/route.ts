import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { startOfMonth, endOfMonth, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfYear, endOfYear, subDays, parseISO, isValid } from 'date-fns'

export async function GET(req: NextRequest) {
  const session: any = await getServerSession(authOptions as any)
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ error: 'Usuário inválido' }, { status: 400 })

  const searchParams = req.nextUrl.searchParams
  const type = searchParams.get('type') as 'income' | 'expense' | 'all' | null
  const limit = Number(searchParams.get('limit') || 50)
  const period = searchParams.get('period') || 'month'
  const categoryParam = searchParams.get('category') || ''
  const categories = categoryParam
    .split(',')
    .map((c) => c.trim())
    .filter((c) => c.length > 0)

  const where: any = { userId: user.id }
  if (type && type !== 'all') where.type = type
  if (categories.length > 0) where.category = { in: categories }
  const now = new Date()
  if (period === 'day') {
    const start = startOfDay(now)
    const end = endOfDay(now)
    where.transactionDate = { gte: start, lte: end }
  } else if (period === 'week') {
    const start = startOfWeek(now, { weekStartsOn: 1 })
    const end = endOfWeek(now, { weekStartsOn: 1 })
    where.transactionDate = { gte: start, lte: end }
  } else if (period === 'month') {
    const start = startOfMonth(now)
    const end = endOfMonth(now)
    where.transactionDate = { gte: start, lte: end }
  } else if (period === 'year') {
    const start = startOfYear(now)
    const end = endOfYear(now)
    where.transactionDate = { gte: start, lte: end }
  } else if (period === 'last7') {
    const start = startOfDay(subDays(now, 6))
    const end = endOfDay(now)
    where.transactionDate = { gte: start, lte: end }
  } else if (period === 'last30') {
    const start = startOfDay(subDays(now, 29))
    const end = endOfDay(now)
    where.transactionDate = { gte: start, lte: end }
  } else if (period === 'custom') {
    const startStr = searchParams.get('start')
    const endStr = searchParams.get('end')
    const start = startStr ? parseISO(startStr) : null
    const end = endStr ? parseISO(endStr) : null
    if (start && end && isValid(start) && isValid(end)) {
      where.transactionDate = { gte: start, lte: end }
    }
  }

  const rows = await prisma.transaction.findMany({
    where,
    orderBy: { transactionDate: 'desc' },
    take: limit,
  })

  const transactions = rows.map((t: any) => ({
    id: t.id,
    amount: Number(t.amount || 0),
    type: t.type,
    category: t.category || 'Outros',
    description: t.description || '',
    transaction_date: t.transactionDate instanceof Date ? t.transactionDate.toISOString() : String(t.transactionDate || ''),
    created_at: t.createdAt instanceof Date ? t.createdAt.toISOString() : String(t.createdAt || t.transactionDate || ''),
  }))

  const totalIncome = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: { userId: user.id, type: 'income', ...(where.transactionDate ? { transactionDate: where.transactionDate } : {}) },
  })
  const totalExpenseAgg = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: { userId: user.id, type: 'expense', ...(where.transactionDate ? { transactionDate: where.transactionDate } : {}) },
  })
  const totalExpense = Number(totalExpenseAgg._sum.amount || 0)
  const totalIncomeVal = Number(totalIncome._sum.amount || 0)

  let totalsByCategory: Array<{ category: string; total_expense: number }> = []
  try {
    const group = await prisma.transaction.groupBy({
      by: ['category'],
      _sum: { amount: true },
      where: {
        userId: user.id,
        type: 'expense',
        ...(where.transactionDate ? { transactionDate: where.transactionDate } : {}),
        ...(categories.length > 0 ? { category: { in: categories } } : {}),
      },
    })
    totalsByCategory = group.map((g: any) => ({
      category: g.category || 'Outros',
      total_expense: Math.abs(Number(g._sum.amount || 0)),
    }))
  } catch (e) {
    totalsByCategory = []
  }

  return NextResponse.json({
    transactions,
    totals: { total_income: totalIncomeVal, total_expense: Math.abs(totalExpense), current_balance: totalIncomeVal - Math.abs(totalExpense) },
    totalsByCategory,
  })
}
