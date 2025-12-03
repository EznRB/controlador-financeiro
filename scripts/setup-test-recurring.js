const { PrismaClient } = require('@prisma/client')

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

async function main() {
  const p = new PrismaClient()
  try {
    const email = 'test+recurring@example.com'
    let user = await p.user.findUnique({ where: { email } })
    if (!user) user = await p.user.create({ data: { email, name: 'Test Recurring' } })
    const start = daysAgo(7)
    await p.recurringExpense.create({
      data: {
        userId: user.id,
        title: 'Despesa Semanal Teste',
        amount: 50.0,
        category: 'Teste',
        description: 'Processamento automático semanal',
        frequency: 'weekly',
        startDate: start,
        isActive: true,
      }
    })
    console.log('Setup concluído para usuário', user.id)
  } catch (e) {
    console.error('Erro', e.message)
    process.exitCode = 1
  } finally {
    await p.$disconnect()
  }
}

main()
