const { PrismaClient } = require('@prisma/client')

async function main() {
  const p = new PrismaClient()
  try {
    const email = 'test+recurring@example.com'
    const user = await p.user.findUnique({ where: { email } })
    if (!user) { console.log('no user'); return }
    const exp = await p.recurringExpense.findFirst({ where: { userId: user.id } })
    if (!exp) { console.log('no expense'); return }
    const d = new Date(); d.setDate(d.getDate() - 7)
    await p.recurringExpense.update({ where: { id: exp.id }, data: { lastProcessed: d } })
    console.log('updated', exp.id)
  } catch (e) {
    console.error('Erro', e.message)
    process.exitCode = 1
  } finally {
    await p.$disconnect()
  }
}

main()
