# Git to know me 🚀

Projeto Next.js com TypeScript, Tailwind CSS e shadcn/ui, configurado com dark mode por padrão.

## 🎯 Características

- ⚡ **Next.js 15** com App Router
- 🎨 **Tailwind CSS v4** com dark mode ativado por classe
- 🧩 **shadcn/ui** com componentes Button, Textarea, Input e Switch
- 🔐 **NextAuth.js** com autenticação GitHub OAuth
- 🌙 **Dark-first** - tema escuro configurado por padrão
- 📦 **TypeScript** para type safety
- 🎭 **Fontes Geist** (Sans e Mono) otimizadas

## 🚀 Como usar

### Configuração inicial

1. **Instale as dependências:**

```bash
npm install
```

2. **Configure as variáveis de ambiente:**

Copie o arquivo `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

3. **Configure o GitHub OAuth:**

   - Acesse [GitHub Settings > Developer Settings > OAuth Apps](https://github.com/settings/developers)
   - Clique em "New OAuth App"
   - Preencha:
     - **Application name**: Git to know me
     - **Homepage URL**: `http://localhost:3000`
     - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
   - Copie o `Client ID` e `Client Secret` para o `.env.local`

4. **Gere o NEXTAUTH_SECRET:**

```bash
openssl rand -base64 32
```

Copie o resultado para `NEXTAUTH_SECRET` no `.env.local`

### Desenvolvimento

```bash
npm run dev
```

Abre o servidor em [http://localhost:3000](http://localhost:3000)

### Build para produção

```bash
npm run build
```

### Iniciar servidor de produção

```bash
npm start
```

### Linter

```bash
npm run lint
```

## 📁 Estrutura

```
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts     # Rota de autenticação NextAuth
│   ├── layout.tsx               # Layout global com dark mode
│   ├── page.tsx                 # Página inicial
│   └── globals.css              # Estilos globais e tema Tailwind
├── components/
│   ├── AuthButton.tsx           # Botão de login/logout
│   ├── SessionProvider.tsx      # Provider de sessão
│   └── ui/                      # Componentes shadcn/ui
│       ├── button.tsx
│       ├── input.tsx
│       ├── switch.tsx
│       └── textarea.tsx
├── lib/
│   ├── auth.ts                  # Configuração NextAuth
│   └── utils.ts                 # Utilitários (cn helper)
├── types/
│   ├── global.d.ts              # Tipos globais e MDX
│   └── next-auth.d.ts           # Extensão de tipos NextAuth
├── tailwind.config.ts           # Configuração do Tailwind
├── postcss.config.js            # Configuração do PostCSS
├── .env.example                 # Exemplo de variáveis de ambiente
└── components.json              # Configuração do shadcn/ui
```

## 🎨 Tema

O projeto está configurado com:

- Fundo: `bg-slate-950` (azul escuro quase preto)
- Texto: `text-slate-100` (branco acinzentado)
- Dark mode sempre ativado via classe `dark` no elemento `<html>`

## 📦 Tecnologias

- **Next.js** 15.5.4
- **React** 19.1.0
- **TypeScript** 5.x
- **Tailwind CSS** 4.x
- **shadcn/ui** (Radix UI primitives)
- **NextAuth.js** 4.24.11 - Autenticação
- **Octokit** 22.0.0 - Cliente API GitHub
- **Zod** 4.1.12 - Validação de schemas
- **MDX** 3.1.1 - Suporte a conteúdo MDX
- **ioredis** 5.8.1 - Cliente Redis

## 🔧 Adicionando mais componentes

Para adicionar mais componentes do shadcn/ui:

```bash
npx shadcn@latest add [component-name]
```

Exemplo:

```bash
npx shadcn@latest add card
npx shadcn@latest add dialog
```

---

Feito com ❤️ usando Next.js
