import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const defaults = [
    { name: 'Limpeza Pós-Obra', icon: '🧹', color: '#10B981', isDefault: true, type: 'income' },
    { name: 'Serviço Extra', icon: '💪', color: '#10B981', isDefault: true, type: 'income' },
    { name: 'Cartão - Internet', icon: '💳', color: '#EF4444', isDefault: true, type: 'expense' },
    { name: 'Alimentação', icon: '🍽️', color: '#EF4444', isDefault: true, type: 'expense' },
    { name: 'Materiais de Limpeza', icon: '🧼', color: '#EF4444', isDefault: true, type: 'expense' },
    { name: 'Transporte', icon: '🚗', color: '#EF4444', isDefault: true, type: 'expense' },
    { name: 'Outros Gastos', icon: '📦', color: '#EF4444', isDefault: true, type: 'expense' },
    { name: 'Corte de Cabelo', icon: '✂️', color: '#EF4444', isDefault: true, type: 'expense' },
  ]
  for (const cat of defaults) {
    const exists = await prisma.category.findFirst({ where: { name: cat.name, userId: null } })
    if (!exists) {
      await prisma.category.create({ data: cat })
    }
  }
}

main().finally(async () => { await prisma.$disconnect() })
