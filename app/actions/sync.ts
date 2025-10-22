"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/auth";
import { getOctokitFor } from "@/lib/github";
import { setUserProjects } from "@/lib/db/projects";
import { setUserPosts } from "@/lib/db/posts";
import type { PostMeta } from "@/types/portfolio";

export async function syncGitHubAction() {
  const session = await getServerSession();

  if (!session?.user?.username) {
    return { error: "Não autenticado" };
  }

  try {
    const octokit = await getOctokitFor();
    const username = session.user.username;

    const { data: repos } = await octokit.repos.listForUser({
      username,
      per_page: 100,
      sort: "updated",
    });

    const publicRepos = repos
      .filter(
        (repo) => !repo.fork && !repo.private && repo.name !== "blog-posts"
      )
      .slice(0, 20);

    const projectsPromises = publicRepos.map(async (repo) => {
      let descriptionHtml = "";

      try {
        const { data: readme } = await octokit.repos.getReadme({
          owner: username,
          repo: repo.name,
        });

        const content = Buffer.from(readme.content, "base64").toString("utf-8");
        descriptionHtml = content;
      } catch {
        descriptionHtml = "";
      }

      return {
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description || "",
        descriptionHtml,
        language: repo.language || "",
        stars: repo.stargazers_count || 0,
        url: repo.html_url,
        topics: repo.topics || [],
        pushedAt: repo.pushed_at,
        previewUrl: undefined,
      };
    });

    const projects = await Promise.all(projectsPromises);

    const blogRepo = repos.find(
      (repo) => repo.name === "blog-posts" && !repo.private
    );

    let posts: PostMeta[] = [];

    if (blogRepo) {
      try {
        const { data: contents } = await octokit.repos.getContent({
          owner: username,
          repo: "blog-posts",
          path: "",
        });

        const mdFiles = Array.isArray(contents)
          ? contents.filter(
              (file) => file.type === "file" && file.name.endsWith(".md")
            )
          : [];

        const postsPromises = mdFiles.map(async (file) => {
          try {
            const { data: fileData } = await octokit.repos.getContent({
              owner: username,
              repo: "blog-posts",
              path: file.name,
            });

            if ("content" in fileData) {
              const content = Buffer.from(fileData.content, "base64").toString(
                "utf-8"
              );

              const frontmatterMatch = content.match(
                /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
              );

              if (frontmatterMatch) {
                const frontmatter = frontmatterMatch[1];
                const body = frontmatterMatch[2];

                const titleMatch = frontmatter.match(/^title:\s*(.*)$/m);
                const dateMatch = frontmatter.match(/^date:\s*(.*)$/m);
                const excerptMatch = frontmatter.match(/^excerpt:\s*(.*)$/m);
                const tagsMatch = frontmatter.match(/^tags:\s*\[(.*)\]$/m);

                const title = titleMatch
                  ? titleMatch[1].trim().replace(/^["']|["']$/g, "")
                  : file.name.replace(".md", "");
                const date = dateMatch
                  ? dateMatch[1].trim()
                  : new Date().toISOString();
                const excerpt = excerptMatch
                  ? excerptMatch[1].trim().replace(/^["']|["']$/g, "")
                  : "";
                const tags = tagsMatch
                  ? tagsMatch[1]
                      .split(",")
                      .map((t) => t.trim().replace(/^["']|["']$/g, ""))
                  : [];

                const slug = file.name.replace(".md", "");

                return {
                  slug,
                  title,
                  summary: excerpt || undefined,
                  contentMdx: body.trim(),
                  publishedAt: date,
                  tags: tags.length > 0 ? tags : undefined,
                };
              }
            }
          } catch {
            return null;
          }

          return null;
        });

        const postsResults = await Promise.all(postsPromises);
        posts = postsResults.filter((post) => post !== null) as PostMeta[];
      } catch {
        posts = [];
      }
    }

    await setUserProjects(username, projects);
    await setUserPosts(username, posts);

    revalidatePath(`/u/${username}`);
    revalidatePath(`/u/${username}/projects`);
    revalidatePath(`/u/${username}/blog`);
    revalidatePath("/dashboard");

    return {
      success: "Sincronização concluída!",
      projects: projects.length,
      posts: posts.length,
    };
  } catch {
    return { error: "Erro ao sincronizar com o GitHub" };
  }
}
