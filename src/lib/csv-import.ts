export interface CSVTransaction {
  date: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category?: string
  source: 'csv'
}

export interface CSVImportResult {
  success: boolean
  transactions: CSVTransaction[]
  errors: string[]
  totalRows: number
  importedRows: number
}

export function parseBrazilianCurrency(value: string): number {
  let v = (value || '').toString().trim()
  let negative = false
  if (v.startsWith('(') && v.endsWith(')')) negative = true
  v = v.replace(/[()]/g, '')
  v = v.replace(/R\$\s*/gi, '')
  v = v.replace(/\s+/g, '')
  if (/^[-+]/.test(v)) {
    negative = v[0] === '-'
    v = v.slice(1)
  }
  const hasComma = v.includes(',')
  const hasDot = v.includes('.')
  if (hasComma && hasDot) {
    v = v.replace(/\./g, '')
    v = v.replace(/,/g, '.')
  } else if (hasComma) {
    v = v.replace(/,/g, '.')
  } else if (hasDot) {
    const decimalDot = /\.\d{2}$/.test(v)
    if (!decimalDot) {
      v = v.replace(/\./g, '')
    }
  }
  const n = parseFloat(v)
  if (isNaN(n)) return 0
  return negative ? -Math.abs(n) : n
}

export function parseBrazilianDate(dateStr: string): string {
  const clean = (dateStr || '').toString().trim().split(' ')[0]
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean
  const parts = clean.split(/[\/\-]/)
  if (parts.length === 3) {
    const d = parseInt(parts[0])
    const m = parseInt(parts[1])
    const y = parts[2]
    if (!isNaN(d) && !isNaN(m) && /^\d{4}$/.test(y)) {
      const day = String(d).padStart(2, '0')
      const month = String(m).padStart(2, '0')
      return `${y}-${month}-${day}`
    }
  }
  throw new Error('Data inválida')
}

export function categorizeTransaction(description: string): string {
  const desc = description.toLowerCase()

  const is = (patterns: string[]) => patterns.some((p) => desc.includes(p))

  if (is(['nomad', 'brla digital', 'investimento', 'corretora'])) {
    return 'Investimentos'
  }

  if (is(['salário', 'pagamento', 'renda'])) {
    return 'Serviço Extra'
  }

  if (
    is([
      'mercado',
      'supermercado',
      'alimentação',
      'ifood',
      'padaria',
      'restaurante',
      'pizza',
      'burger',
      'lanches',
    ])
  ) {
    return 'Comida'
  }

  if (is(['gasolina', 'combustível', 'posto', 'uber', '99', 'estacionamento'])) {
    return 'Transporte'
  }

  if (is(['cinema', 'netflix', 'spotify', 'disney', 'prime video', 'hbo', 'lazer', 'games'])) {
    return 'Lazer'
  }

  if (is(['farmácia', 'consulta', 'exame', 'médico', 'saúde'])) {
    return 'Saúde'
  }

  if (is(['cartão', 'fatura'])) {
    return 'Cartão - Internet'
  }

  if (is(['barbeiro', 'corte', 'cabelo'])) {
    return 'Corte de Cabelo'
  }

  if (is(['material', 'limpeza', 'produto'])) {
    return 'Materiais de Limpeza'
  }

  if (is(['manutenção', 'conserto', 'ferramenta'])) {
    return 'Manutenção Equipamentos'
  }

  return 'Outros Gastos'
}

export function processCSVContent(content: string): CSVImportResult {
  const lines = content.trim().split('\n')
  const errors: string[] = []
  const transactions: CSVTransaction[] = []
  
  if (lines.length < 2) {
    return {
      success: false,
      transactions: [],
      errors: ['Arquivo CSV deve ter pelo menos 2 linhas (cabeçalho + dados)'],
      totalRows: 0,
      importedRows: 0
    }
  }
  const header = lines[0]
    .split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/)
    .map(c => c.trim().replace(/^"|"$/g, '').toLowerCase())
  const idx = { date: 0, desc: 1, value: 2, credit: -1, debit: -1 }
  const normalize = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '')
  for (let i = 0; i < header.length; i++) {
    const h = normalize(header[i])
    if (h.includes('data')) idx.date = i
    else if (h.includes('descricao') || h.includes('histor') || h.includes('evento')) idx.desc = i
    else if (h.includes('valor') || h.includes('amount')) idx.value = i
    else if (h.includes('credito') || h.includes('entrada')) idx.credit = i
    else if (h.includes('debito') || h.includes('saida')) idx.debit = i
  }
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i]
      .split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/)
      .map(cell => cell.trim().replace(/^"|"$/g, ''))
    if (row.every(cell => !cell)) continue
    try {
      const date = parseBrazilianDate(row[idx.date] || '')
      const description = (row[idx.desc] || '').trim()
      let value = 0
      if (idx.credit >= 0 || idx.debit >= 0) {
        const cr = idx.credit >= 0 ? parseBrazilianCurrency(row[idx.credit] || '0') : 0
        const db = idx.debit >= 0 ? parseBrazilianCurrency(row[idx.debit] || '0') : 0
        value = cr - db
      } else {
        value = parseBrazilianCurrency(row[idx.value] || '')
      }
      if (value === 0 || !description) {
        throw new Error('Linha sem valor ou descrição')
      }
      transactions.push({
        date,
        description,
        amount: Math.abs(value),
        type: value > 0 ? 'income' : 'expense',
        category: categorizeTransaction(description),
        source: 'csv'
      })
    } catch (error) {
      errors.push(`Linha ${i + 1}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }
  
  return {
    success: transactions.length > 0,
    transactions,
    errors,
    totalRows: lines.length - 1,
    importedRows: transactions.length
  }
}
