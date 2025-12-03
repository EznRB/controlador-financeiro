const { createClient } = require('@supabase/supabase-js')
const { PrismaClient } = require('@prisma/client')

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!supabaseUrl || !supabaseKey) {
    console.error('SUPABASE env ausente')
    process.exit(1)
  }
  const supabase = createClient(supabaseUrl, supabaseKey)
  const prisma = new PrismaClient()
  try {
    const { data: recs, error: e1 } = await supabase.from('recurring_expenses').select('*')
    if (e1) throw new Error(e1.message)
    for (const r of recs || []) {
      const exists = await prisma.recurringExpense.findFirst({ where: { id: r.id } })
      if (!exists) {
        await prisma.recurringExpense.create({
          data: {
            id: r.id,
            userId: r.user_id,
            title: r.title,
            amount: r.amount,
            category: r.category,
            description: r.description || null,
            frequency: r.frequency,
            startDate: new Date(r.start_date),
            lastProcessed: r.last_processed ? new Date(r.last_processed) : null,
            isActive: r.is_active,
          }
        })
      }
    }
    const { data: txs, error: e2 } = await supabase.from('transactions').select('*').eq('type', 'expense').eq('source', 'recurring')
    if (e2) throw new Error(e2.message)
    for (const t of txs || []) {
      const exists = await prisma.transaction.findFirst({ where: { userId: t.user_id, category: t.category, transactionDate: new Date(t.transaction_date), source: 'recurring' } })
      if (!exists) {
        await prisma.transaction.create({
          data: {
            userId: t.user_id,
            amount: t.amount,
            type: 'expense',
            category: t.category,
            description: t.description || null,
            transactionDate: new Date(t.transaction_date),
            source: 'recurring'
          }
        })
      }
    }
    console.log('Migração concluída')
  } catch (e) {
    console.error('Erro', e.message)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

main()
