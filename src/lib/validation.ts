import { z } from 'zod'

export const LoginSchema = z.object({
  email: z.string().email('Email inválido')
})

export const TransactionSchema = z.object({
  amount: z.number().positive('Valor deve ser maior que 0'),
  type: z.enum(['income','expense']),
  category: z.string().min(1, 'Categoria obrigatória'),
  description: z.string().optional(),
  transaction_date: z.string().min(1, 'Data obrigatória'),
  source: z.string().optional()
})

export const GoalSchema = z.object({
  title: z.string().min(1, 'Título obrigatório'),
  target_amount: z.number().positive('Valor da meta deve ser > 0'),
  category: z.string().optional(),
  start_date: z.string().min(1, 'Data início obrigatória'),
  end_date: z.string().min(1, 'Data fim obrigatória'),
})

export type GoalInput = z.infer<typeof GoalSchema>

export type LoginInput = z.infer<typeof LoginSchema>
export type TransactionInput = z.infer<typeof TransactionSchema>
