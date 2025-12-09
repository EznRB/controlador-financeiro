import { GET } from './route'

jest.mock('next-auth', () => ({
  getServerSession: jest.fn().mockResolvedValue({ user: { email: 'test@example.com' } }),
}))
jest.mock('@/lib/auth', () => ({ authOptions: {} }))
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: jest.fn().mockResolvedValue({ id: 'user-1' }) },
    transaction: {
      findMany: jest.fn().mockResolvedValue([]),
      aggregate: jest.fn().mockResolvedValue({ _sum: { amount: 0 } }),
      groupBy: jest.fn().mockResolvedValue([]),
    },
  },
}))

describe('GET /api/transactions/list', () => {
  it('aplica filtro de categoria quando informado', async () => {
    const url = new URL('http://localhost/api/transactions/list?period=month&type=expense&category=Comida,Lazer')
    const req: any = { nextUrl: { searchParams: url.searchParams } }
    await GET(req)
    const { prisma } = require('@/lib/prisma')
    expect(prisma.transaction.findMany).toHaveBeenCalled()
    const args = prisma.transaction.findMany.mock.calls[0][0]
    expect(args.where.category.in).toEqual(['Comida', 'Lazer'])
    expect(args.where.type).toBe('expense')
    expect(prisma.transaction.groupBy).toHaveBeenCalled()
  })
})
