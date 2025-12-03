export function assertEnv() {
  const requiredServer = [
    'NEXTAUTH_SECRET',
    'DATABASE_URL',
  ]
  const missing = requiredServer.filter((k) => !process.env[k])
  if (missing.length) {
    // Lança erro apenas em produção para não bloquear desenvolvimento local
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Variáveis de ambiente ausentes: ${missing.join(', ')}`)
    }
  }
}
