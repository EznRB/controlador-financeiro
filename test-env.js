// Testar variáveis de ambiente
console.log('=== Verificando Variáveis de Ambiente ===')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY existe:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
console.log('SUPABASE_SERVICE_ROLE_KEY existe:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)

// Verificar se é válido
const isValid = !!process.env.NEXT_PUBLIC_SUPABASE_URL && 
               !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
               process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('https://') && 
               process.env.NEXT_PUBLIC_SUPABASE_URL.includes('.supabase.co')

console.log('Configuração válida:', isValid)

if (!isValid) {
  console.log('❌ Configuração inválida - usando stub')
} else {
  console.log('✅ Configuração válida - usando Supabase real')
}