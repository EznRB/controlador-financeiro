import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { format, startOfDay, addWeeks, addMonths } from 'date-fns'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const expectedSecret = process.env.CRON_SECRET_KEY
    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Importa dinamicamente para evitar erros durante o build
    const configs = await prisma.recurringExpense.findMany({ where: { isActive: true } })
    let processed = 0
    const errors: string[] = []
    for (const config of configs) {
      const todayStr = format(startOfDay(new Date()), 'yyyy-MM-dd')
      const base = config.lastProcessed ? format(new Date(config.lastProcessed), 'yyyy-MM-dd') : format(config.startDate, 'yyyy-MM-dd')
      const nextDate = config.frequency === 'weekly' ? format(addWeeks(new Date(base), 1), 'yyyy-MM-dd') : format(addMonths(new Date(base), 1), 'yyyy-MM-dd')
      if (todayStr !== nextDate) continue
      try {
        await prisma.transaction.create({
          data: {
            userId: config.userId,
            amount: config.amount,
            type: 'expense',
            category: config.category,
            description: config.description || config.title,
            transactionDate: new Date(todayStr),
            source: 'recurring',
          },
        })
        await prisma.recurringExpense.update({ where: { id: config.id }, data: { lastProcessed: new Date() } })
        processed++
      } catch (e: any) {
        errors.push(`Erro ao processar ${config.title}: ${e.message || 'erro'}`)
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      errors,
      message: `Processamento concluído: ${processed} despesas recorrentes processadas`
    })
  } catch (error) {
    console.error('Erro ao processar despesas recorrentes:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno ao processar despesas recorrentes',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

// Adiciona também um endpoint GET para verificar o status
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'API de despesas recorrentes está funcionando',
    timestamp: new Date().toISOString(),
    endpoints: {
      POST: '/api/recurring/process - Processa despesas recorrentes automaticamente'
    }
  })
}
