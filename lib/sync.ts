import {
  listPublicRepos,
  getReadmeHtml,
  listBlogPostFiles,
  getBlogPostContent,
} from "@/lib/github";
import { setUserProjects } from "@/lib/db/projects";
import { setUserPosts } from "@/lib/db/posts";
import type { ProjectMeta, PostMeta } from "@/types/portfolio";

export interface SyncResult {
  projects: number;
  posts: number;
  warnings: string[];
}

export async function syncUserData(username: string): Promise<SyncResult> {
  const warnings: string[] = [];

  const projects = await syncProjects(username, warnings);
  const posts = await syncPosts(username, warnings);

  return { projects, posts, warnings };
}

async function syncProjects(
  username: string,
  warnings: string[]
): Promise<number> {
  let repos;
  try {
    repos = await listPublicRepos(username);
  } catch {
    warnings.push("Falha ao buscar repositórios. Projetos não foram atualizados.");
    return -1;
  }

  const projectsWithReadme = await Promise.allSettled(
    repos.map(async (repo) => {
      const [owner, repoName] = repo.fullName.split("/");
      const readmeHtml = await getReadmeHtml(owner, repoName);

      const summary = readmeHtml
        ? readmeHtml.replace(/<[^>]*>/g, "").trim().slice(0, 800)
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
        previewUrl: undefined,
        summary,
      };

      return project;
    })
  );

  const projects: ProjectMeta[] = projectsWithReadme
    .filter((r) => r.status === "fulfilled")
    .map((r) => (r as PromiseFulfilledResult<ProjectMeta>).value);

  projects.sort((a, b) => (b.stars || 0) - (a.stars || 0));

  await setUserProjects(username, projects);
  return projects.length;
}

async function syncPosts(
  username: string,
  warnings: string[]
): Promise<number> {
  let postFiles;
  try {
    postFiles = await listBlogPostFiles(username);
  } catch {
    warnings.push("Falha ao buscar posts do blog. Posts não foram atualizados.");
    return -1;
  }

  const postsWithContent = await Promise.allSettled(
    postFiles.map(async (filename) => {
      const postData = await getBlogPostContent(username, filename);

      if (!postData) {
        throw new Error(`Failed to get content for ${filename}`);
      }

      const post: PostMeta = {
        slug: postData.slug,
        title: postData.title,
        summary: postData.summary,
        contentMdx: postData.content,
        tags: postData.tags,
        publishedAt: postData.date,
      };

      return post;
    })
  );

  const posts: PostMeta[] = postsWithContent
    .filter((r) => r.status === "fulfilled")
    .map((r) => (r as PromiseFulfilledResult<PostMeta>).value);

  await setUserPosts(username, posts);
  return posts.length;
}
