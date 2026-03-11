# Testing Minimum

## Setup

- **Runner**: Jest 30 + ts-jest.
- **Ambiente**: jsdom (`jest-environment-jsdom`).
- **UI**: @testing-library/react + @testing-library/user-event.
- **Config**: `jest.config.js`, `jest.setup.js`.
- **Cobertura**: `lib/`, `app/`, `components/`, `contexts/`.

## Regra: quando testar

| Tipo de mudanca | Teste obrigatorio? | Tipo de teste |
|----------------|-------------------|---------------|
| Nova API route | Sim | Unit: status codes, validacao, erros |
| Logica de negocio em `lib/` | Sim | Unit |
| Bugfix | Sim | Regressao (reproduz o bug antes de corrigir) |
| Componente interativo novo | Recomendado | Comportamento (Testing Library) |
| Componente visual simples | Nao | - |
| Mudanca em schema Prisma | Nao (migration cobre) | - |
| Refactoring sem mudanca de API | Recomendado | Garantir que testes existentes passam |

## Padrao de teste (API routes)

```typescript
// Exemplo: __tests__/api/user-config.test.ts
jest.mock("@/lib/db/config");
jest.mock("@/lib/auth");

describe("GET /api/user/config", () => {
  it("retorna 400 sem username", async () => { ... });
  it("retorna 200 com config valida", async () => { ... });
  it("retorna 500 em erro interno", async () => { ... });
});
```

## Padrao de teste (actions/logica)

```typescript
// Exemplo: __tests__/actions/config.test.ts
jest.mock("@/lib/db/config");
jest.mock("@/lib/auth");

describe("updateConfigAction", () => {
  it("rejeita usuario nao autenticado", async () => { ... });
  it("valida input com Zod", async () => { ... });
  it("salva config valida", async () => { ... });
});
```

## Mocks padrao

Mocks comuns usados nos testes existentes:

- `@/lib/auth` → session mockada
- `@/lib/db` → PrismaClient mockado
- `@/lib/db/*` → funcoes individuais
- `@/lib/github` → respostas de API mockadas
- `next/cache` → revalidatePath mockado

## Comandos

```bash
npm test              # Roda todos
npm run test:watch    # Watch mode
npm run test:coverage # Com cobertura
```

## Checklist pre-merge

- [ ] `npm test` passa sem falhas.
- [ ] Mudanca em API route tem teste correspondente.
- [ ] Bugfix tem teste de regressao.
- [ ] Nenhum `.only` ou `.skip` esquecido.
