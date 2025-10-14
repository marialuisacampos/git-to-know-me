import { Octokit } from "@octokit/rest";
import type { Session } from "next-auth";
import matter from "gray-matter";
import { remark } from "remark";
import remarkHtml from "remark-html";
import { sanitizeHtml } from "./sanitize";

/**
 * Cria uma instância do Octokit autenticada
 * Usa o token da sessão ou um PAT de fallback
 */
export function getOctokitFor(session: Session | null): Octokit {
  // Tentar usar o token da sessão primeiro
  let token: string | undefined;

  if (session?.user) {
    // NextAuth armazena o access_token no account
    // Como não temos acesso direto ao account aqui, podemos usar um PAT opcional
    token = process.env.GITHUB_PAT;
  }

  // Fallback para PAT ou modo público
  if (!token) {
    token = process.env.GITHUB_PAT;
  }

  return new Octokit({
    auth: token,
    userAgent: "git-to-know-me/1.0",
  });
}

/**
 * Lista repositórios públicos de um usuário
 * Filtra forks e repositórios arquivados
 * Paginado automaticamente
 */
export async function listPublicRepos(username: string) {
  const octokit = getOctokitFor(null);

  try {
    const repos: Array<{
      name: string;
      fullName: string;
      description: string | null;
      language: string | null;
      topics: string[];
      stars: number;
      pushedAt: string;
      homepageUrl: string | null;
      isPrivate: boolean;
      isFork: boolean;
      isArchived: boolean;
    }> = [];

    // Paginar através de todos os repositórios
    for await (const response of octokit.paginate.iterator(
      octokit.rest.repos.listForUser,
      {
        username,
        type: "owner",
        sort: "pushed",
        per_page: 100,
      }
    )) {
      for (const repo of response.data) {
        // Filtrar forks e arquivados
        if (repo.fork || repo.archived) {
          continue;
        }

        repos.push({
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description,
          language: repo.language ?? null,
          topics: repo.topics || [],
          stars: repo.stargazers_count ?? 0,
          pushedAt:
            repo.pushed_at || repo.created_at || new Date().toISOString(),
          homepageUrl: repo.homepage ?? null,
          isPrivate: repo.private ?? false,
          isFork: repo.fork ?? false,
          isArchived: repo.archived ?? false,
        });
      }
    }

    return repos;
  } catch (error) {
    if ((error as { status?: number }).status === 404) {
      console.warn(`Usuário ${username} não encontrado`);
      return [];
    }
    console.error("Erro ao listar repositórios:", error);
    throw error;
  }
}

/**
 * Obtém o README de um repositório em formato markdown cru
 */
export async function getReadmeMarkdown(
  owner: string,
  repo: string
): Promise<string | null> {
  const octokit = getOctokitFor(null);

  try {
    // Buscar o README em formato raw
    const { data } = await octokit.rest.repos.getReadme({
      owner,
      repo,
      mediaType: { format: "raw" },
    });

    return typeof data === "string" ? data : null;
  } catch (error) {
    if ((error as { status?: number }).status === 404) {
      console.warn(`README não encontrado para ${owner}/${repo}`);
      return null;
    }
    console.error(`Erro ao buscar README de ${owner}/${repo}:`, error);
    return null;
  }
}

/**
 * Obtém o README de um repositório e converte para HTML sanitizado
 */
export async function getReadmeHtml(
  owner: string,
  repo: string
): Promise<string | null> {
  const octokit = getOctokitFor(null);

  try {
    // Buscar o README
    const { data } = await octokit.rest.repos.getReadme({
      owner,
      repo,
    });

    // Decodificar de base64
    const content = Buffer.from(data.content, "base64").toString("utf-8");

    // Converter Markdown para HTML usando remark
    const processed = await remark().use(remarkHtml).process(content);
    const html = processed.toString();

    // Sanitizar HTML
    return sanitizeHtml(html);
  } catch (error) {
    if ((error as { status?: number }).status === 404) {
      console.warn(`README não encontrado para ${owner}/${repo}`);
      return null;
    }
    console.error(`Erro ao buscar README de ${owner}/${repo}:`, error);
    return null;
  }
}

/**
 * Lista arquivos de posts do blog no repositório posts-for-portfolio
 * Retorna apenas arquivos .md e .mdx da pasta posts/
 */
export async function listBlogPostFiles(username: string): Promise<string[]> {
  const octokit = getOctokitFor(null);

  try {
    // Tentar buscar o conteúdo da pasta posts/
    const { data } = await octokit.rest.repos.getContent({
      owner: username,
      repo: "posts-for-portfolio",
      path: "posts",
    });

    // Verificar se é um array (pasta)
    if (!Array.isArray(data)) {
      return [];
    }

    // Filtrar apenas arquivos .md e .mdx
    const postFiles = data
      .filter((file) => {
        return (
          file.type === "file" &&
          (file.name.endsWith(".md") || file.name.endsWith(".mdx"))
        );
      })
      .map((file) => file.name);

    return postFiles;
  } catch (error) {
    if ((error as { status?: number }).status === 404) {
      console.warn(
        `Repositório posts-for-portfolio ou pasta posts/ não encontrada para ${username}`
      );
      return [];
    }
    console.error("Erro ao listar posts:", error);
    return [];
  }
}

/**
 * Baixa e parseia o conteúdo de um post do blog
 * Retorna os metadados do frontmatter e o conteúdo
 */
export async function getBlogPostContent(
  username: string,
  filename: string
): Promise<{
  slug: string;
  title: string;
  summary?: string;
  tags?: string[];
  date: string;
  content: string;
} | null> {
  const octokit = getOctokitFor(null);

  try {
    // Baixar o arquivo
    const { data } = await octokit.rest.repos.getContent({
      owner: username,
      repo: "posts-for-portfolio",
      path: `posts/${filename}`,
    });

    // Verificar se é um arquivo (não pasta)
    if (Array.isArray(data) || data.type !== "file") {
      return null;
    }

    // Decodificar de base64
    const content = Buffer.from(data.content, "base64").toString("utf-8");

    // Parsear frontmatter
    const { data: frontmatter, content: markdownContent } = matter(content);

    // Gerar slug do nome do arquivo (remover extensão)
    const slug = filename.replace(/\.(md|mdx)$/, "");

    return {
      slug,
      title: frontmatter.title || slug,
      summary: frontmatter.summary || frontmatter.description,
      tags: frontmatter.tags || [],
      date:
        frontmatter.date || frontmatter.publishedAt || new Date().toISOString(),
      content: markdownContent,
    };
  } catch (error) {
    if ((error as { status?: number }).status === 404) {
      console.warn(`Post ${filename} não encontrado para ${username}`);
      return null;
    }
    console.error(`Erro ao buscar post ${filename}:`, error);
    return null;
  }
}

/**
 * Descobre automaticamente a URL de preview de um projeto
 * Usa heurísticas: homepage, links no README, GitHub Pages
 */
export function discoverPreviewUrl(params: {
  owner: string;
  repo: string;
  homepage?: string | null;
  readmeMarkdown?: string | null;
}): string | null {
  // 1) Se houver homepage válida, priorizar
  if (params.homepage && /^https?:\/\//i.test(params.homepage)) {
    return params.homepage.trim();
  }

  // 2) Tentar encontrar link "demo" / "preview" / "live" / "site" no README
  const md = params.readmeMarkdown ?? "";

  // Regex para encontrar links de demo/preview/live/site
  const demoRegex =
    /\[?(demo|preview|live|site)\]?\s*[:\-–]\s*(https?:\/\/[^\s)]+)/gi;
  const match = demoRegex.exec(md);
  const urlFromDemo = match?.[2] ?? null;

  if (urlFromDemo) {
    // Limpar URL (remover trailing parênteses, aspas, etc)
    return urlFromDemo.replace(/[)\]"'>]+$/, "").trim();
  }

  // 3) GitHub Pages heuristic: https://<owner>.github.io/<repo>
  // Apenas se o repo não for o repo de usuário (owner.github.io)
  if (params.repo.toLowerCase() !== `${params.owner.toLowerCase()}.github.io`) {
    return `https://${params.owner}.github.io/${params.repo}`;
  }

  // Se for o repo de usuário, a URL é https://<owner>.github.io
  return `https://${params.owner}.github.io`;
}

/**
 * Busca informações do usuário do GitHub
 */
export async function getGitHubUser(username: string) {
  const octokit = getOctokitFor(null);

  try {
    const { data } = await octokit.rest.users.getByUsername({
      username,
    });

    return {
      login: data.login,
      name: data.name,
      bio: data.bio,
      avatarUrl: data.avatar_url,
      location: data.location,
      company: data.company,
      blog: data.blog,
      twitterUsername: data.twitter_username,
      publicRepos: data.public_repos,
      followers: data.followers,
      following: data.following,
    };
  } catch (error) {
    if ((error as { status?: number }).status === 404) {
      console.warn(`Usuário ${username} não encontrado`);
      return null;
    }
    console.error(`Erro ao buscar usuário ${username}:`, error);
    return null;
  }
}
