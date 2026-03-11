# Deploy na Vercel

## Pipeline

1. Push para branch → Vercel Preview Deployment (automatico).
2. Merge para `main` → Vercel Production Deployment.
3. Build: `next build --turbopack`.

## Variaveis de ambiente

Configurar no painel Vercel (Settings > Environment Variables):

| Variavel | Ambientes | Descricao |
|----------|-----------|-----------|
| `DATABASE_URL` | Preview, Production | URL do PostgreSQL (Neon) |
| `GITHUB_ID` | Preview, Production | OAuth App ID |
| `GITHUB_SECRET` | Preview, Production | OAuth App Secret |
| `GITHUB_PAT` | Preview, Production | Personal Access Token |
| `NEXTAUTH_SECRET` | Preview, Production | Secret para sessions |
| `NEXTAUTH_URL` | Production | URL base (ex: https://www.gittoknowme.com) |

- Nunca colocar segredos no codigo.
- Preview e Production podem ter valores diferentes (ex: bancos separados).

## Banco de dados (Neon)

- PostgreSQL serverless.
- Connection pooling via URL `*-pooler.*`.
- Para migrations em deploy, adicionar ao build command ou usar script separado:

```bash
npx prisma migrate deploy && next build --turbopack
```

Ou configurar como pre-build no `package.json`:

```json
{
  "scripts": {
    "vercel-build": "npx prisma migrate deploy && npx prisma generate && next build --turbopack"
  }
}
```

## Imagens externas

Configurado em `next.config.ts`:

```typescript
images: {
  remotePatterns: [{ hostname: "avatars.githubusercontent.com" }]
}
```

Adicionar novos dominios aqui antes de usar `<Image>` com URLs externas.

## Checklist pre-deploy

- [ ] `npm run check` (TypeScript + ESLint) sem erros.
- [ ] `npm test` sem falhas.
- [ ] Migrations commitadas e alinhadas com o banco.
- [ ] Variaveis de ambiente configuradas na Vercel.
- [ ] Testar em Preview antes de mergear para `main`.
