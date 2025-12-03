# Deploy no Vercel com Conta Premium

## Objetivo
- Garantir que o projeto utilize os limites de uma conta/Team Premium no Vercel e evitar o erro `rate_limited (api-upload-free)`.

## Passos
- Verifique a identidade atual:
  - `npx vercel whoami`
- Selecione o Team Premium:
  - `npx vercel switch`
  - Escolha o Team/Org associado ao plano Premium
- Vincule o projeto ao Team Premium:
  - `npx vercel link --scope <seu-team>`
  - Confirme a criação de `.vercel/project.json` (arquivo local, ignorado no Git)
- Se o projeto existir em uma workspace Free:
  - Transfira em `Vercel Dashboard > Project > Settings > General > Transfer` para o Team Premium
- Configure variáveis de ambiente no Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_VISION_API_KEY`
- Realize o deploy sob o escopo Premium:
  - `npx vercel --scope <seu-team> --prod`

## Solução de Problemas
- Mensagem: `You may have reached the usage limit of the free account` / `rate_limited` / `api-upload-free`
  - Causa: Deploy executado sob escopo Free
  - Ação: refaça `switch` e `link`, confirme o Team Premium, e use `--scope <seu-team>` no comando de deploy
- Excesso de arquivos enviados:
  - Certifique-se que `vercel.json` usa `outputDirectory: ".next"`
  - Evite arquivos estáticos desnecessários em `public/`
  - Opcional: ajuste `next-pwa` para não pré-cachear além do necessário

## Comandos Rápidos
- `npx vercel whoami`
- `npx vercel switch`
- `npx vercel link --scope <seu-team>`
- `npx vercel --scope <seu-team> --prod`
