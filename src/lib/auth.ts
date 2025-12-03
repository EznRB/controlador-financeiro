import { type NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
 

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: "Email",
      credentials: { email: { label: "Email", type: "email" } },
      async authorize(credentials) {
        const email = credentials?.email?.toString().trim()
        if (!email) return null
        let user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
          user = await prisma.user.create({ data: { email, name: "Usuário" } })
          await prisma.recurringExpense.createMany({
            data: [
              { userId: user.id, title: 'Cartão de Crédito', amount: 200.0, category: 'Cartão de Crédito', description: 'Fatura do cartão de crédito mensal', frequency: 'monthly', startDate: new Date(), isActive: true },
              { userId: user.id, title: 'Alimentação', amount: 100.0, category: 'Alimentação', description: 'Despesas semanais com alimentação', frequency: 'weekly', startDate: new Date(), isActive: true },
              { userId: user.id, title: 'Corte de Cabelo', amount: 70.0, category: 'Corte de Cabelo', description: 'Corte de cabelo mensal', frequency: 'monthly', startDate: new Date(), isActive: true },
            ]
          })
        }
        return { id: user.id, email: user.email, name: user.name || "" }
      },
    }),
  ],
  pages: { signIn: "/auth/login" },
}
