import { categorizeTransaction } from '@/lib/csv-import'

describe('categorizeTransaction', () => {
  it('classifica comida/alimentação', () => {
    expect(categorizeTransaction('Compra supermercado')).toBe('Comida')
    expect(categorizeTransaction('Pedido iFood')).toBe('Comida')
    expect(categorizeTransaction('Alimentação padaria')).toBe('Comida')
  })

  it('classifica investimentos (Nomad/BRLA)', () => {
    expect(categorizeTransaction('Transferência Nomad')).toBe('Investimentos')
    expect(categorizeTransaction('BRLA Digital aporte')).toBe('Investimentos')
  })

  it('classifica lazer (streaming/games/cinema)', () => {
    expect(categorizeTransaction('Netflix mensalidade')).toBe('Lazer')
    expect(categorizeTransaction('Cinema ingresso')).toBe('Lazer')
    expect(categorizeTransaction('Compra de games')).toBe('Lazer')
  })

  it('classifica transporte', () => {
    expect(categorizeTransaction('Gasolina')).toBe('Transporte')
    expect(categorizeTransaction('Uber corrida')).toBe('Transporte')
  })

  it('fallback para Outros Gastos', () => {
    expect(categorizeTransaction('Item desconhecido')).toBe('Outros Gastos')
  })
})
