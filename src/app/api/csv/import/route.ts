import { NextRequest, NextResponse } from 'next/server'
import { processCSVContent } from '@/lib/csv-import'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { getPricesFiat } from '@/lib/crypto-providers'

export async function POST(request: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any)
    const userEmail = session?.user?.email
    if (!userEmail) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const contentType = request.headers.get('content-type') || ''
    let csvContent: string | null = null

    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData()
      const file = form.get('file') as File | null
      if (file && typeof file.text === 'function') {
        csvContent = await file.text()
      }
    } else {
      try {
        const body = await request.json()
        if (body && typeof body.csvContent === 'string') {
          csvContent = body.csvContent
        }
      } catch {}
      if (!csvContent && contentType.includes('multipart/form-data')) {
        const form = await request.formData()
        const file = form.get('file') as File | null
        if (file && typeof file.text === 'function') {
          csvContent = await file.text()
        }
      }
    }

    if (!csvContent || typeof csvContent !== 'string') {
      return NextResponse.json({ error: 'Conteúdo CSV inválido' }, { status: 400 })
    }
    if (csvContent.length > 2_000_000) {
      return NextResponse.json({ error: 'Arquivo CSV muito grande' }, { status: 413 })
    }

    const result = processCSVContent(csvContent)

    const userRow = await prisma.user.findUnique({ where: { email: userEmail } })
    if (!userRow) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 400 })
    }

    const prefAliases = Array.isArray((userRow as any).preferences?.categoryAliases)
      ? ((userRow as any).preferences?.categoryAliases as Array<{ pattern: string; category: string }>)
      : []

    const transactionsToInsertRaw = result.transactions.map(tx => {
      const isNomad = /nomad/i.test(tx.description)
      const isBrla = /brla\s*digital/i.test(tx.description)
      const baseCategory = tx.category || 'Outros'
      const descLc = (tx.description || '').toLowerCase()
      let aliasCategory: string | null = null
      for (const a of prefAliases) {
        const pat = (a?.pattern || '').toLowerCase().trim()
        const cat = String(a?.category || '').trim()
        if (pat && cat && descLc.includes(pat)) {
          aliasCategory = cat
          break
        }
      }
      const category = (isNomad || isBrla) ? 'Investimentos' : (aliasCategory || baseCategory)
      const metadata = (isNomad || isBrla) ? { instrument: 'ETHU', provider: isNomad ? 'Nomad' : 'BRLA Digital' } : {}
      return {
        userId: userRow.id,
        amount: tx.type === 'income' ? tx.amount : -Math.abs(tx.amount),
        type: tx.type,
        category,
        description: tx.description,
        transactionDate: new Date(tx.date),
        source: 'csv',
        metadata,
      }
    })

    const seen = new Set<string>()
    const normalize = (s: string | null | undefined) => (s || '').toString().trim().toLowerCase()
    const startRange = new Date(Math.min(...transactionsToInsertRaw.map(t => t.transactionDate.getTime())))
    const endRange = new Date(Math.max(...transactionsToInsertRaw.map(t => t.transactionDate.getTime())))
    const existing = await prisma.transaction.findMany({
      where: { userId: userRow.id, transactionDate: { gte: startRange, lte: endRange } },
      select: { transactionDate: true, description: true, type: true, amount: true },
    })
    for (const e of existing) {
      const key = `${new Date(e.transactionDate).toISOString().split('T')[0]}|${normalize(e.description)}|${e.type}|${Number(e.amount)}`
      seen.add(key)
    }
    const transactionsToInsert = transactionsToInsertRaw.filter(t => {
      const key = `${t.transactionDate.toISOString().split('T')[0]}|${normalize(t.description)}|${t.type}|${t.amount}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    // Atualizar holdings/transactions de cripto para transferências Nomad/BRLA Digital
    const investLines = transactionsToInsertRaw.filter(t => (t.metadata as any)?.instrument === 'ETHU')
    if (investLines.length > 0) {
      try {
        const prices = await getPricesFiat(['ETH'], 'BRL')
        const priceEth = prices.find(p => p.symbol === 'ETH')?.price || 0
        if (priceEth > 0) {
          let holding = await prisma.cryptoHolding.findFirst({ where: { userId: userRow.id, symbol: 'ETH' } })
          let currentAmount = holding ? Number((holding as any).amount) : 0
          let currentAvg = holding ? Number((holding as any).avgPrice) : 0
          for (const line of investLines) {
            const brlValue = Math.abs(Number(line.amount))
            const qty = brlValue / priceEth
            const newAmount = currentAmount + qty
            const newAvg = newAmount > 0 ? ((currentAvg * currentAmount) + (priceEth * qty)) / newAmount : priceEth
            if (holding) {
              await prisma.cryptoHolding.update({ where: { id: holding.id }, data: { amount: newAmount, avgPrice: newAvg } })
            } else {
              const created = await prisma.cryptoHolding.create({ data: { userId: userRow.id, symbol: 'ETH', amount: qty, avgPrice: priceEth } })
              holding = created as any
              currentAmount = qty
              currentAvg = priceEth
            }
            await prisma.cryptoTransaction.create({ data: { userId: userRow.id, symbol: 'ETH', type: 'BUY', quantity: qty, price: priceEth, date: line.transactionDate } })
            currentAmount = newAmount
            currentAvg = newAvg
          }
        }
      } catch {}
    }

    let inserted = 0
    if (transactionsToInsert.length > 0) {
      try {
        const res = await prisma.transaction.createMany({ data: transactionsToInsert })
        inserted = res.count ?? transactionsToInsert.length
      } catch (e) {
        return NextResponse.json({ error: 'Erro ao salvar transações no banco' }, { status: 500 })
      }
    }

    if (inserted === 0) {
      return NextResponse.json({
        success: false,
        error: result.errors.join(', ') || 'Nenhuma transação válida encontrada',
        errors: result.errors,
        totalRows: result.totalRows,
        importedCount: 0,
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `${inserted} transações importadas com sucesso`,
      importedCount: inserted,
      totalRows: result.totalRows,
      errors: result.errors,
    })

  } catch (error) {
    console.error('Erro no servidor ao processar CSV:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor ao processar arquivo CSV' },
      { status: 500 }
    )
  }
}
