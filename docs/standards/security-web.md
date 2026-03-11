# Seguranca Web

## Variaveis de ambiente

### Regras

- Nunca commitar `.env*` (ja no `.gitignore`).
- Variaveis sensiveis: `DATABASE_URL`, `GITHUB_SECRET`, `NEXTAUTH_SECRET`, `GITHUB_PAT`.
- No client-side, so variaveis com prefixo `NEXT_PUBLIC_` sao acessiveis; nunca prefixar segredos com isso.
- Em Vercel, configurar via painel (Settings > Environment Variables) com escopo por ambiente.

### Variaveis esperadas

| Variavel | Escopo | Descricao |
|----------|--------|-----------|
| `DATABASE_URL` | Server | Conexao PostgreSQL (Neon) |
| `GITHUB_ID` | Server | OAuth App ID |
| `GITHUB_SECRET` | Server | OAuth App Secret |
| `GITHUB_PAT` | Server | Personal Access Token para API publica |
| `NEXTAUTH_SECRET` | Server | Secret para JWT/session |
| `NEXTAUTH_URL` | Server | URL base da aplicacao |

## Autenticacao

- NextAuth com GitHub OAuth provider.
- Rotas protegidas verificam `getServerSession(authOptions)`.
- Session inclui `user.username` (type augmentation em `types/next-auth.d.ts`).
- Em dev: cookie `dev-session` permite bypass (remover em producao se aplicavel).

## Validacao de input

- Usar **Zod** para validar todo input externo em API routes.
- Exemplo existente: `/api/config/route.ts` valida bio, URLs, arrays.
- Regra: nunca confiar em dados do client; validar no server antes de persistir.

```typescript
// Padrao
const schema = z.object({
  bio: z.string().max(500).optional(),
  twitterUrl: z.string().url().optional(),
});
const result = schema.safeParse(body);
if (!result.success) {
  return NextResponse.json({ error: result.error }, { status: 400 });
}
```

## XSS / Sanitizacao

- Markdown renderizado com `rehype-sanitize` (whitelist de tags HTML).
- Nunca usar `dangerouslySetInnerHTML` sem sanitizacao.
- `descriptionHtml` de projetos vem do GitHub e ja passa por sanitizacao.

## SQL Injection

- Prisma Client previne SQL injection por padrao (queries parametrizadas).
- Nunca usar `$queryRawUnsafe` com input do usuario.
- Se precisar de raw query, usar `$queryRaw` com template literals tagged.

## Respostas de erro

- Nunca expor stack traces, mensagens internas do Prisma ou detalhes de infraestrutura.
- Padrao: mensagem generica ao usuario + log detalhado no server.

```typescript
// Correto
catch (error) {
  console.error("Erro interno:", error);
  return NextResponse.json({ error: "Erro ao processar" }, { status: 500 });
}

// Incorreto
catch (error) {
  return NextResponse.json({ error: error.message }, { status: 500 });
}
```

## Headers e CORS

- Next.js gerencia headers por padrao; API routes no mesmo dominio nao precisam de CORS manual.
- Para APIs publicas futuras, configurar CORS explicitamente em `next.config.ts`.

## Checklist de seguranca

- [ ] Nenhum segredo exposto no client (`NEXT_PUBLIC_` so para dados publicos).
- [ ] Input externo validado com Zod antes de persistir.
- [ ] Markdown sanitizado com rehype-sanitize.
- [ ] Erros nao vazam detalhes internos.
- [ ] Rotas de escrita protegidas com `getServerSession`.
