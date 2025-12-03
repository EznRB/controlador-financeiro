import nodemailer from 'nodemailer'

export async function sendEmail(to: string, subject: string, html: string) {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!host || !user || !pass) return
  const transporter = nodemailer.createTransport({ host, port, auth: { user, pass } })
  await transporter.sendMail({ from: user, to, subject, html })
}

export const templates = {
  onboarding: (name: string) => `<h1>Bem-vindo</h1><p>Oi ${name}, vamos organizar suas finanças hoje.</p>`,
  trialReminder: (days: number) => `<p>Seu teste termina em ${days} dias. Continue por R$ 9,90/mês.</p>`,
  paymentSuccess: () => `<p>Pagamento confirmado. Obrigado por apoiar o produto!</p>`,
  paymentFailed: () => `<p>Falha no pagamento. Atualize seu método no portal.</p>`,
}
