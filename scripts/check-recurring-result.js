const { PrismaClient } = require('@prisma/client')

async function main() {
  const p = new PrismaClient()
  try {
    const email = 'test+recurring@example.com'
    const user = await p.user.findUnique({ where: { email } })
    if (!user) { console.log('Sem usuário de teste'); return }
    const txs = await p.transaction.findMany({ where: { userId: user.id, source: 'recurring' }, orderBy: { transactionDate: 'desc' } })
    console.log(JSON.stringify({ count: txs.length, last: txs[0] || null }))
  } catch (e) {
    console.error('Erro', e.message)
    process.exitCode = 1
  } finally {
    await p.$disconnect()
  }
}

main()
