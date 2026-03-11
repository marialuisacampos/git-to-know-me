# Fluxo de Dados

## Autenticacao

```
Usuario → GitHub OAuth → NextAuth → Session (cookie) → getServerSession()
```

- Rotas protegidas verificam session via `getServerSession(authOptions)`.
- Em dev, cookie `dev-session` permite bypass.

## Sync GitHub → Banco

```
POST /api/sync/github
  → getServerSession (auth obrigatoria)
  → listPublicRepos (Octokit)
  → listBlogPostFiles (Octokit)
  → setUserProjects (Prisma upsert)
  → setUserPosts (Prisma upsert)
  → revalidatePath
```

## Perfil publico (leitura)

```
GET /u/[username]
  → isUserRegistered (Prisma)
  → getGitHubUser (Octokit)
  → getUserConfig (Prisma)
  → Render Server Component
```

## Projetos

```
GET /u/[username]/projects
  → getUserProjects (Prisma)
  → getUserConfig (Prisma) → filtro includeRepos/excludeRepos
  → Render ProjectCard[]
```

## Blog

```
GET /u/[username]/blog
  → getUserPosts (Prisma) → PostCard[]

GET /u/[username]/blog/[slug]
  → getUserPost (Prisma) → MarkdownPreview + LikeButton
```

## Likes

```
GET  /api/posts/like?username=x&slug=y → likesCount + liked (fingerprint IP+UA)
POST /api/posts/like?username=x&slug=y → toggleLike (Prisma transaction)
```

- Fingerprint: hash de IP + User-Agent.
- Sem autenticacao necessaria.
- Deduplicacao server-side (unique constraint) + client-side (localStorage).

## Dashboard (escrita)

```
Dashboard (client) → useUserData (context)
  → fetch /api/user/config
  → fetch /api/user/projects
  → DashboardForm → updateConfigAction → setUserConfig (Prisma)
  → syncGitHubAction → POST /api/sync/github
```
