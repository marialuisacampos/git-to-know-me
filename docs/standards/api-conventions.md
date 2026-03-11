# API Conventions

## Estrutura de rotas

Rotas ficam em `app/api/`. Cada rota exporta funcoes nomeadas pelo metodo HTTP:

```typescript
// app/api/recurso/route.ts
export async function GET(request: NextRequest) { ... }
export async function POST(request: NextRequest) { ... }
```

## Padrao de resposta

### Sucesso

```typescript
return NextResponse.json({ dados }, { status: 200 });
return NextResponse.json({ dados }, { status: 201 }); // criacao
```

### Erro de validacao

```typescript
return NextResponse.json(
  { error: "Mensagem descritiva em PT-BR" },
  { status: 400 }
);
```

### Erro de autenticacao

```typescript
const session = await getServerSession(authOptions);
if (!session?.user?.username) {
  return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
}
```

### Erro interno

```typescript
catch (error) {
  console.error("Contexto:", error);
  return NextResponse.json(
    { error: "Erro ao processar requisicao" },
    { status: 500 }
  );
}
```

## Validacao de input

Toda API route que recebe dados do client deve validar com Zod:

```typescript
import { z } from "zod";

const bodySchema = z.object({
  campo: z.string().min(1).max(500),
});

const body = await request.json();
const result = bodySchema.safeParse(body);
if (!result.success) {
  return NextResponse.json({ error: "Dados invalidos" }, { status: 400 });
}
```

Para query params:

```typescript
const { searchParams } = new URL(request.url);
const username = searchParams.get("username");
if (!username) {
  return NextResponse.json({ error: "Username obrigatorio" }, { status: 400 });
}
```

## Separacao de responsabilidades

- **Route handler**: validacao, auth, orquestracao, resposta HTTP.
- **lib/db/**: acesso ao banco (Prisma queries).
- **lib/**: logica de negocio e integracao externa.

Nao colocar queries Prisma direto no route handler; sempre delegar para `lib/db/`.

## Rotas existentes

| Rota | Metodo | Auth | Descricao |
|------|--------|------|-----------|
| `/api/auth/[...nextauth]` | * | - | NextAuth handlers |
| `/api/config` | POST | Sim | Atualizar config do usuario |
| `/api/consent` | GET/POST | Sim | Gerenciar consentimentos |
| `/api/sync/github` | POST | Sim | Sincronizar repos e posts do GitHub |
| `/api/user/config` | GET | Nao | Buscar config por username |
| `/api/user/projects` | GET | Nao | Buscar projetos por username |
| `/api/posts/like` | GET/POST | Nao | Likes em posts (fingerprint) |
