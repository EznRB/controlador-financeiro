import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { apiHandler } from '@/lib/apiHandler'
import { TransactionSchema } from '@/lib/validation'
import { rateLimit } from '@/lib/ratelimit'

export const POST = apiHandler(async (req: NextRequest) => {
  const session: any = await getServerSession(authOptions as any)
  const email = session?.user?.email
  if (!email) {
    const err: any = new Error('Não autorizado')
    err.status = 401
    throw err
  }
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    const err: any = new Error('Usuário inválido')
    err.status = 400
    throw err
  }

  const body = await req.json()
  const parsed = TransactionSchema.safeParse(body)
  if (!parsed.success) {
    const err: any = new Error('Dados inválidos')
    err.status = 400
    throw err
  }
  const { amount, type, category, description, transaction_date, source } = parsed.data

  await prisma.transaction.create({
    data: {
      userId: user.id,
      amount: Number(type === 'income' ? amount : -Math.abs(amount)),
      type,
      category,
      description: description || null,
      transactionDate: new Date(transaction_date),
      source: source || 'manual',
    },
  })

  return { ok: true }
})
  const decision = await rateLimit(`transactions:new:${user.id}`, 100, 10 * 60_000)
  if (!decision.allowed) {
    const err: any = new Error('Muitas requisições')
    err.status = 429
    throw err
  }
