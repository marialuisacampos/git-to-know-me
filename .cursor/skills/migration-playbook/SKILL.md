---
name: migration-playbook
description: Padroniza o fluxo de migrations Prisma com seguranca e previsibilidade. Use quando o usuario mencionar migration, prisma migrate, schema.prisma, drift, shadow database, historico divergente, reset de banco, ou erro em _prisma_migrations.
---

# Migration Playbook (Prisma)

## Objetivo

Executar e manter migrations Prisma sem quebrar historico entre ambiente local, CI e banco remoto.

## Fluxo padrao (sempre)

1. Alterar `prisma/schema.prisma`.
2. Rodar `npx prisma migrate dev --name <nome-curto>`.
3. Rodar `npx prisma generate`.
4. Validar com:
   - `npx prisma validate`
   - `npx prisma migrate status`
5. Versionar no commit:
   - `prisma/schema.prisma`
   - `prisma/migrations/<timestamp>_<nome>/migration.sql`

## Regras que evitam erro

- Nao apagar nem renomear pastas em `prisma/migrations` ja aplicadas.
- Nao editar migration antiga ja aplicada; criar nova migration.
- Em ambiente compartilhado/producao, usar `npx prisma migrate deploy`.
- Evitar `prisma db push` em banco compartilhado (gera drift de historico).
- Se usar SQL manual em emergencia, criar migration formal equivalente no repo depois.

## Diagnostico rapido

Quando houver erro de migration:

1. Checar estado:
   - `npx prisma migrate status`
2. Checar historico do banco:
   - `SELECT migration_name, finished_at FROM "_prisma_migrations" ORDER BY finished_at;`
3. Comparar com diretorios locais em `prisma/migrations`.

## Recovery sem reset (historico divergente)

Use quando aparecer "applied migrations missing from local directory".

1. Recuperar arquivos faltantes via Git/historico.
2. Se nao existir mais no Git, criar pasta com o mesmo nome da migration faltante e `migration.sql` placeholder:

```sql
-- Placeholder para alinhar historico local com migration ja aplicada no banco
SELECT 1;
```

3. Rodar `npx prisma migrate status` ate nao haver erro de "missing from local".
4. Seguir com migrations novas normalmente.

## Shadow database e ambiente

- `prisma migrate dev` usa shadow database e pode falhar com historico incompleto.
- Se necessario, definir `shadowDatabaseUrl` para evitar conflito de permissao.
- Nao usar `prisma migrate reset` em banco remoto compartilhado.

## Comandos de referencia

```bash
# desenvolvimento
npx prisma migrate dev --name add-feature-x

# verificar estado e schema
npx prisma migrate status
npx prisma validate

# producao/CI
npx prisma migrate deploy
```

## Quando pedir confirmacao ao usuario

- Antes de qualquer comando destrutivo (`migrate reset`, drop schema, truncates).
- Antes de aplicar SQL manual em banco remoto.
- Quando houver risco de perda de dados.
