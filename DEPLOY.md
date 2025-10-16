# 🚀 Guia de Deploy no Vercel

## 📋 Pré-requisitos

- Conta no [Vercel](https://vercel.com)
- Banco PostgreSQL (Neon, Supabase, Railway, etc.)
- GitHub Personal Access Token

---

## 🗄️ 1. Configurar Banco de Dados

### Opção A: Neon (Recomendado - Free Tier Generoso)

1. Acesse [Neon](https://neon.tech) e crie uma conta
2. Crie um novo projeto PostgreSQL
3. Copie a **Connection String** (pooled connection)
4. Salve em um lugar seguro - você vai precisar dela

### Opção B: Supabase

1. Acesse [Supabase](https://supabase.com)
2. Crie um novo projeto
3. Vá em **Settings → Database**
4. Copie a **Connection String** (modo Session)

---

## 🔧 2. Preparar Variáveis de Ambiente

Crie um arquivo `.env.production` local (apenas para referência, NÃO commitar):

```env
# Database
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# NextAuth
NEXTAUTH_URL="https://seu-dominio.vercel.app"
NEXTAUTH_SECRET="gere-um-secret-aleatorio-aqui"

# GitHub OAuth
GITHUB_ID="seu_github_client_id"
GITHUB_SECRET="seu_github_client_secret"
GITHUB_PAT="ghp_seu_personal_access_token"
```

### Como gerar o NEXTAUTH_SECRET:

```bash
openssl rand -base64 32
```

---

## 📦 3. Deploy no Vercel

### 3.1. Importar Projeto

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Clique em **Add New → Project**
3. Selecione seu repositório do GitHub
4. Configure o projeto:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (padrão)
   - **Output Directory**: `.next` (padrão)

### 3.2. Configurar Variáveis de Ambiente

Na seção **Environment Variables**, adicione TODAS as variáveis:

```
DATABASE_URL = postgresql://...
NEXTAUTH_URL = https://seu-projeto.vercel.app
NEXTAUTH_SECRET = (seu secret gerado)
GITHUB_ID = (do GitHub OAuth App)
GITHUB_SECRET = (do GitHub OAuth App)
GITHUB_PAT = ghp_...
```

⚠️ **IMPORTANTE**: Adicione para **Production, Preview e Development**

### 3.3. Deploy Inicial

Clique em **Deploy** - O primeiro deploy vai **FALHAR** porque o banco está vazio. Isso é esperado! 🎯

---

## 🔄 4. Rodar as Migrations no Vercel

### Opção A: Via Terminal (Recomendado)

1. Instale o Vercel CLI:

```bash
npm i -g vercel
```

2. Faça login:

```bash
vercel login
```

3. Vincule o projeto:

```bash
vercel link
```

4. Baixe as variáveis de ambiente de produção:

```bash
vercel env pull .env.production.local
```

5. Rode a migration:

```bash
npx dotenv -e .env.production.local -- npx prisma migrate deploy
```

6. Verifique se deu certo:

```bash
npx dotenv -e .env.production.local -- npx prisma migrate status
```

### Opção B: Via Vercel Dashboard (Mais Simples)

1. No Vercel Dashboard, vá em **Settings → General**
2. Role até **Build & Development Settings**
3. Em **Install Command**, troque para:

```bash
npm install && npx prisma generate && npx prisma migrate deploy
```

4. Clique em **Save**
5. Vá em **Deployments** e clique em **Redeploy**

---

## 🎯 5. Configurar GitHub OAuth Callback

Após o primeiro deploy bem-sucedido:

1. Acesse seu [GitHub OAuth App](https://github.com/settings/developers)
2. Atualize a **Homepage URL**:

```
https://seu-projeto.vercel.app
```

3. Atualize a **Authorization callback URL**:

```
https://seu-projeto.vercel.app/api/auth/callback/github
```

---

## ✅ 6. Verificação Final

1. Acesse `https://seu-projeto.vercel.app`
2. Clique em **Sign in with GitHub**
3. Autorize o app
4. Você deve ser redirecionado para o dashboard
5. Clique em **Sincronizar** para importar seus projetos

---

## 🔄 7. Deploys Futuros

Para deploys futuros (após fazer push no GitHub):

1. O Vercel vai automaticamente fazer o build
2. As migrations vão rodar automaticamente (se configurou a Opção B)
3. O site será atualizado

Se precisar rodar migrations manualmente:

```bash
vercel env pull .env.production.local
npx dotenv -e .env.production.local -- npx prisma migrate deploy
```

---

## 🐛 Troubleshooting

### Erro: "PrismaClientInitializationError"

- Verifique se a `DATABASE_URL` está correta
- Confirme que as migrations rodaram: `npx prisma migrate status`

### Erro: "NEXTAUTH_URL environment variable is not set"

- Adicione `NEXTAUTH_URL` nas variáveis de ambiente do Vercel
- Valor deve ser `https://seu-dominio.vercel.app`

### Erro: "GitHub OAuth callback mismatch"

- Verifique se a callback URL no GitHub OAuth App está correta
- Deve ser exatamente: `https://seu-dominio.vercel.app/api/auth/callback/github`

### Tabelas não aparecem no banco

- Rode: `npx prisma migrate deploy` manualmente
- Verifique os logs do Vercel em **Deployments → [seu deploy] → Logs**

---

## 📊 Monitoramento

### Vercel Analytics (Opcional)

1. Vá em **Analytics** no dashboard do Vercel
2. Ative o **Web Analytics**
3. É gratuito e dá insights de performance

### Logs de Erro

- Acesse **Deployments → [deploy] → Functions**
- Clique em qualquer função para ver os logs em tempo real

---

## 🎉 Pronto!

Seu site está no ar! Agora você pode:

- ✅ Compartilhar seu portfólio: `https://seu-projeto.vercel.app/u/seu-username`
- ✅ Adicionar custom domain (Settings → Domains)
- ✅ Monitorar performance no dashboard
- ✅ Fazer deploys automáticos a cada push

---

**Dica**: Adicione um custom domain para ficar ainda mais profissional:
`https://seudominio.com` ao invés de `.vercel.app`
