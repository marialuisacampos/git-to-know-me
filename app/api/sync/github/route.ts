import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/auth";
import {
  listPublicRepos,
  getReadmeHtml,
  listBlogPostFiles,
  getBlogPostContent,
} from "@/lib/github";
import { setUserProjects } from "@/lib/db/projects";
import { setUserPosts } from "@/lib/db/posts";
import type { ProjectMeta, PostMeta } from "@/types/portfolio";

export async function POST() {
  try {
    const session = await getServerSession();

    if (!session?.user?.username) {
      return NextResponse.json(
        { error: "Unauthorized. Please login first." },
        { status: 401 }
      );
    }

    const username = session.user.username;

    const repos = await listPublicRepos(username);

    const projectsWithReadme = await Promise.allSettled(
      repos.map(async (repo) => {
        const [owner, repoName] = repo.fullName.split("/");
        const readmeHtml = await getReadmeHtml(owner, repoName);

        const summary = readmeHtml
          ? readmeHtml
              .replace(/<[^>]*>/g, "")
              .trim()
              .slice(0, 800)
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
      .filter((result) => result.status === "fulfilled")
      .map((result) => (result as PromiseFulfilledResult<ProjectMeta>).value);

    projects.sort((a, b) => (b.stars || 0) - (a.stars || 0));

    await setUserProjects(username, projects);

    const postFiles = await listBlogPostFiles(username);

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
      .filter((result) => result.status === "fulfilled")
      .map((result) => (result as PromiseFulfilledResult<PostMeta>).value);

    await setUserPosts(username, posts);

    revalidatePath(`/u/${username}`);
    revalidatePath(`/u/${username}/projects`);
    revalidatePath(`/u/${username}/blog`);

    return NextResponse.json(
      {
        ok: true,
        projects: projects.length,
        posts: posts.length,
        message: `Sincronizados ${projects.length} projetos e ${posts.length} posts`,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Sync failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
