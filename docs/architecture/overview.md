# Visao Geral da Arquitetura

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 15 (App Router, Turbopack) |
| Runtime | React 19 |
| Linguagem | TypeScript 5 |
| Banco de dados | PostgreSQL (Neon) via Prisma 6 |
| Auth | NextAuth 4 (GitHub OAuth) |
| Estilizacao | Tailwind CSS 4, Radix UI, shadcn/ui |
| Validacao | Zod 4 |
| Markdown | @uiw/react-markdown-preview, rehype-sanitize |
| GitHub API | @octokit/rest |
| Hosting | Vercel |

## Estrutura de diretorios

```
app/                    # Rotas (App Router)
  api/                  # API Routes (server-side)
  dashboard/            # Area autenticada
  u/[username]/         # Perfil publico (blog, projetos)
  getting-started/      # Onboarding
components/             # Componentes React reutilizaveis
  base-ui/              # Primitivos (Button, Input, Switch)
contexts/               # React Context (UserDataContext)
lib/                    # Logica de negocio
  db/                   # Funcoes de acesso ao banco (Prisma)
  auth.ts               # Config NextAuth
  github.ts             # Integracao GitHub API
types/                  # Tipos TypeScript
prisma/                 # Schema e migrations
__tests__/              # Testes (Jest + Testing Library)
docs/                   # Documentacao do projeto
```

## Principios

1. **Server-first**: paginas publicas sao Server Components; client components so quando necessario (interatividade).
2. **Colocation**: logica de DB em `lib/db/`, tipos em `types/`, componentes junto das rotas quando exclusivos.
3. **Seguranca por padrao**: sanitizacao de markdown, validacao Zod em APIs, auth via session.
4. **Dados do GitHub como fonte**: projetos e posts vem do GitHub e sao sincronizados para o banco.
