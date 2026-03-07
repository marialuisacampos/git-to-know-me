# Migrations Prisma

## Fluxo padrao

1. Editar `prisma/schema.prisma`.
2. `npx prisma migrate dev --name <nome-curto>` — cria SQL e aplica no banco de dev.
3. `npx prisma generate` — atualiza o Prisma Client.
4. Verificar:
   - `npx prisma validate` — schema sem erros.
   - `npx prisma migrate status` — historico alinhado.
5. Commitar: `schema.prisma` + pasta `prisma/migrations/<timestamp>_<nome>/`.

## Regras

- **Nunca** apagar ou renomear pastas em `prisma/migrations/` ja aplicadas.
- **Nunca** editar SQL de migration ja aplicada; criar nova migration.
- **Nunca** usar `prisma migrate reset` em banco remoto/compartilhado.
- **Evitar** `prisma db push` em banco compartilhado (gera drift de historico).
- Se usar SQL manual em emergencia, criar migration formal equivalente no repo.

## Ambientes

| Ambiente | Comando | Observacao |
|----------|---------|-----------|
| Desenvolvimento | `npx prisma migrate dev` | Usa shadow database |
| CI / Staging | `npx prisma migrate deploy` | So aplica, nao cria |
| Producao | `npx prisma migrate deploy` | So aplica, nao cria |

## Shadow database

`prisma migrate dev` cria um shadow database temporario para validar historico completo. Pode falhar se:

- Migrations locais nao existem mas constam na tabela `_prisma_migrations`.
- Shadow DB nao tem permissao de criacao (configurar `shadowDatabaseUrl` se necessario).

## Diagnostico de problemas

### Verificar estado

```bash
npx prisma migrate status
```

### Consultar historico no banco

```sql
SELECT migration_name, finished_at, checksum
FROM "_prisma_migrations"
ORDER BY finished_at;
```

### "Applied migrations missing from local directory"

1. Procurar arquivos no Git: `git log --all --name-only -- prisma/migrations`.
2. Se existir em commit antigo: `git checkout <commit> -- prisma/migrations/<nome>`.
3. Se nao existir, criar placeholder:

```
prisma/migrations/<nome-exato>/migration.sql
```

```sql
-- Placeholder para alinhar historico
SELECT 1;
```

4. Rodar `npx prisma migrate status` ate normalizar.

### Aplicar SQL manual em emergencia

```bash
npx prisma db execute --url "$DATABASE_URL" --stdin <<'SQL'
ALTER TABLE "Tabela" ADD COLUMN "campo" TEXT;
SQL
```

Depois: criar migration formal no repo para manter historico.

## Checklist pre-merge

- [ ] `prisma validate` sem erros.
- [ ] Pasta de migration commitada junto do schema.
- [ ] `prisma generate` rodado (client atualizado).
- [ ] Sem `db push` em banco compartilhado.
