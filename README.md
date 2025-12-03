This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Configuração de Ambiente

Crie um arquivo `.env.local` baseado em `.env.local.example`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
CRON_SECRET_KEY=...
GOOGLE_VISION_API_KEY=...
```

Nunca exponha chaves sensíveis no frontend. A chave de serviço do Supabase deve ser usada apenas em rotas de servidor.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Deploy com Conta Premium (Vercel)

- Garanta que o projeto esteja vinculado ao Team/Org Premium no Vercel.
- Passos recomendados via CLI:
  - `npx vercel whoami`
  - `npx vercel switch` e selecione seu Team Premium
  - `npx vercel link --scope <seu-team>` (gera `.vercel/project.json` local)
- Se o projeto foi criado em workspace Free, transfira em `Vercel > Project > Settings > General > Transfer` para o Team Premium.
- Para publicar: `npx vercel --scope <seu-team> --prod`
- Caso apareça erro `rate_limited` com `api-upload-free`, isso indica escopo Free. Repita os passos acima e use o `--scope` do Team Premium.

Mais detalhes em `docs/deploy-vercel.md`.
### Ambiente Neon + Prisma + Auth.js

Crie `.env.local` com:

```
DATABASE_URL=postgres://<user>:<pass>@<host>/<db>?sslmode=require
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<string-secreta>
# SMTP para login por email (link mágico)
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM="Financeiro <no-reply@financeiro.local>"

# Upstash Redis (opcional)
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

Opcional (Email provider):
```
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...
```

Comandos úteis:
```
npm install
npx prisma generate
npx prisma migrate dev
node prisma/seed.ts
npm run dev
```

### Testes de Segurança
- Login por email: acessar `/auth/login`, inserir email e confirmar via SMTP.
- Proteção de APIs: tentar `/api/transactions/new` sem sessão deve retornar `401`.
- Verificação de origem: alterar `Origin` em requisições mutáveis deve retornar `403`.
- Rate limit: chamar `/api/investments/price` repetidamente (≥30/min) deve retornar `429`.
- CSV: upload >2MB em `/api/csv/import` deve retornar `413`.
- Cabeçalhos: `curl -I http://localhost:3000` deve mostrar CSP, HSTS, XFO, nosniff, Referrer-Policy, Permissions-Policy.
