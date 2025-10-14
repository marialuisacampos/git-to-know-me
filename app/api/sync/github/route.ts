import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/auth";
import {
  listPublicRepos,
  getReadmeHtml,
  getReadmeMarkdown,
  discoverPreviewUrl,
  listBlogPostFiles,
  getBlogPostContent,
} from "@/lib/github";
import { setUserProjects, setUserPosts } from "@/lib/kv";
import { checkRateLimit } from "@/lib/rate-limit";
import { ProjectListSchema, PostListSchema } from "@/types/schemas";
import { capArrayByBytes, capStringByBytes, byteLength } from "@/lib/kv-guard";
import type { ProjectMeta, PostMeta } from "@/types/portfolio";

/**
 * POST /api/sync/github
 * Sincroniza projetos e posts do blog do usuário logado
 * Rate limit: 1 request a cada 60 segundos por usuário
 */
export async function POST() {
  try {
    // 1. Autenticar sessão
    const session = await getServerSession();

    if (!session?.user?.username) {
      return NextResponse.json(
        { error: "Unauthorized. Please login first." },
        { status: 401 }
      );
    }

    const username = session.user.username;

    // 2. Verificar rate limit (1 sync a cada 60s)
    const rateLimit = checkRateLimit(`sync:${username}`, {
      max: 1,
      windowSeconds: 60,
    });

    if (!rateLimit.allowed) {
      const waitSeconds = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `Aguarde ${waitSeconds}s antes de sincronizar novamente.`,
          resetAt: rateLimit.resetAt,
        },
        { status: 429 }
      );
    }

    // 3. Sincronizar repositórios públicos
    console.log(`[Sync] Iniciando sincronização para ${username}...`);

    const repos = await listPublicRepos(username);
    console.log(`[Sync] Encontrados ${repos.length} repositórios públicos`);

    // Limitar a 20 repos no MVP
    const reposToSync = repos.slice(0, 20);

    // 3. Enriquecer com README (paralelo com Promise.allSettled)
    console.log(`[Sync] Buscando READMEs de ${reposToSync.length} repos...`);

    const projectsWithReadme = await Promise.allSettled(
      reposToSync.map(async (repo) => {
        const [owner, repoName] = repo.fullName.split("/");

        // Buscar README em paralelo (HTML para descrição, Markdown para preview)
        const [readmeHtml, readmeMarkdown] = await Promise.all([
          getReadmeHtml(owner, repoName),
          getReadmeMarkdown(owner, repoName),
        ]);

        // Descobrir preview URL automaticamente
        const previewUrl = discoverPreviewUrl({
          owner,
          repo: repoName,
          homepage: repo.homepageUrl,
          readmeMarkdown,
        });

        // Criar summary curto do README (cap 800 bytes)
        const summary = readmeHtml
          ? capStringByBytes(
              readmeHtml.replace(/<[^>]*>/g, "").trim(), // Remove HTML tags
              800
            )
          : repo.description || undefined;

        const project: ProjectMeta = {
          fullName: repo.fullName,
          name: repo.name,
          descriptionHtml: readmeHtml || repo.description || undefined,
          language: repo.language || undefined,
          topics: repo.topics,
          stars: repo.stars,
          pushedAt: repo.pushedAt,
          homepageUrl: repo.homepageUrl || undefined,
          previewUrl,
          summary, // Resumo curto para listagem
        };

        return project;
      })
    );

    // Filtrar apenas os que deram certo
    let projects: ProjectMeta[] = projectsWithReadme
      .filter((result) => result.status === "fulfilled")
      .map((result) => (result as PromiseFulfilledResult<ProjectMeta>).value);

    console.log(`[Sync] ${projects.length} projetos processados com sucesso`);

    // Validar com Zod
    try {
      const validated = ProjectListSchema.parse({ projects });
      projects = validated.projects;
    } catch (error) {
      console.error("[Sync] Erro de validação em projetos:", error);
      return NextResponse.json(
        { error: "Validação falhou ao processar projetos" },
        { status: 500 }
      );
    }

    // Ordenar por stars (projetos mais relevantes primeiro)
    projects.sort((a, b) => (b.stars || 0) - (a.stars || 0));

    // Cap total: 32KB (garantir que cabe no KV)
    const PROJECTS_CAP = 32 * 1024;
    const cappedProjects = capArrayByBytes(
      projects,
      (p) => ({
        fullName: p.fullName,
        name: p.name,
        language: p.language,
        topics: p.topics,
        stars: p.stars,
        pushedAt: p.pushedAt,
        homepageUrl: p.homepageUrl,
        previewUrl: p.previewUrl,
        summary: p.summary,
      }),
      PROJECTS_CAP
    );

    console.log(
      `[Sync] Projetos capados: ${projects.length} → ${
        cappedProjects.length
      } (${byteLength(JSON.stringify(cappedProjects))} bytes)`
    );

    // 4. Salvar projetos no KV (com TTL de 12h)
    await setUserProjects(username, cappedProjects);
    console.log(`[Sync] Projetos salvos no KV`);

    // 5. Sincronizar posts do blog
    console.log(`[Sync] Buscando posts do blog...`);

    const postFiles = await listBlogPostFiles(username);
    console.log(`[Sync] Encontrados ${postFiles.length} posts`);

    // 6. Buscar conteúdo de cada post
    const postsWithContent = await Promise.allSettled(
      postFiles.map(async (filename) => {
        const postData = await getBlogPostContent(username, filename);

        if (!postData) {
          throw new Error(`Failed to get content for ${filename}`);
        }

        // Capar contentMdx (20KB max) e summary (800 bytes)
        const contentMdx = capStringByBytes(postData.content, 20_000);
        const summary = postData.summary
          ? capStringByBytes(postData.summary, 800)
          : undefined;

        // Montar PostMeta com o conteúdo MDX cru
        const post: PostMeta = {
          slug: postData.slug,
          title: postData.title,
          summary,
          contentMdx,
          tags: postData.tags,
          publishedAt: postData.date,
        };

        return post;
      })
    );

    // Filtrar posts que deram certo
    let posts: PostMeta[] = postsWithContent
      .filter((result) => result.status === "fulfilled")
      .map((result) => (result as PromiseFulfilledResult<PostMeta>).value);

    console.log(`[Sync] ${posts.length} posts processados com sucesso`);

    // Validar com Zod
    try {
      const validated = PostListSchema.parse({ posts });
      posts = validated.posts;
    } catch (error) {
      console.error("[Sync] Erro de validação em posts:", error);
      return NextResponse.json(
        { error: "Validação falhou ao processar posts" },
        { status: 500 }
      );
    }

    // Ordenar por data (mais recentes primeiro)
    posts.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    // Cap total: 64KB (garantir que cabe no KV)
    const POSTS_CAP = 64 * 1024;
    const cappedPosts = capArrayByBytes(
      posts,
      (p) => ({
        slug: p.slug,
        title: p.title,
        summary: p.summary,
        contentMdx: p.contentMdx,
        tags: p.tags,
        publishedAt: p.publishedAt,
      }),
      POSTS_CAP
    );

    console.log(
      `[Sync] Posts capados: ${posts.length} → ${
        cappedPosts.length
      } (${byteLength(JSON.stringify(cappedPosts))} bytes)`
    );

    // 7. Salvar posts no KV (com TTL de 24h)
    await setUserPosts(username, cappedPosts);
    console.log(`[Sync] Posts salvos no KV`);

    // 8. Revalidar páginas do portfolio
    revalidatePath(`/u/${username}`);
    revalidatePath(`/u/${username}/projects`);
    revalidatePath(`/u/${username}/blog`);
    console.log(`[Sync] Páginas revalidadas`);

    // 9. Retornar sucesso
    return NextResponse.json(
      {
        ok: true,
        projects: cappedProjects.length,
        posts: cappedPosts.length,
        message: `Sincronizados ${cappedProjects.length} projetos e ${cappedPosts.length} posts`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Sync] Erro durante sincronização:", error);

    return NextResponse.json(
      {
        error: "Sync failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
