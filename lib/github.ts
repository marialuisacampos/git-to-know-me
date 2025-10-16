import { Octokit } from "@octokit/rest";
import matter from "gray-matter";

export function getOctokitFor(): Octokit {
  const token = process.env.GITHUB_PAT;

  return new Octokit({
    auth: token,
    userAgent: "git-to-know-me/1.0",
  });
}

export async function listPublicRepos(username: string) {
  const octokit = getOctokitFor();

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
        if (repo.fork || repo.archived || repo.name === "blog-posts") {
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
      return [];
    }
    throw error;
  }
}

export async function getReadmeMarkdown(
  owner: string,
  repo: string
): Promise<string | null> {
  const octokit = getOctokitFor();

  try {
    const { data } = await octokit.rest.repos.getReadme({
      owner,
      repo,
      mediaType: { format: "raw" },
    });

    return typeof data === "string" ? data : null;
  } catch (error) {
    if ((error as { status?: number }).status === 404) {
      return null;
    }
    return null;
  }
}

export async function getReadmeHtml(
  owner: string,
  repo: string
): Promise<string | null> {
  const octokit = getOctokitFor();

  try {
    const { data } = await octokit.rest.repos.getReadme({
      owner,
      repo,
    });

    const content = Buffer.from(data.content, "base64").toString("utf-8");
    return content;
  } catch (error) {
    if ((error as { status?: number }).status === 404) {
      return null;
    }
    return null;
  }
}

export async function listBlogPostFiles(username: string): Promise<string[]> {
  const octokit = getOctokitFor();

  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: username,
      repo: "blog-posts",
      path: "",
    });

    if (!Array.isArray(data)) {
      return [];
    }

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
      return [];
    }
    return [];
  }
}

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
  const octokit = getOctokitFor();

  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: username,
      repo: "blog-posts",
      path: `${filename}`,
    });

    if (Array.isArray(data) || data.type !== "file") {
      return null;
    }

    const content = Buffer.from(data.content, "base64").toString("utf-8");

    const { data: frontmatter, content: markdownContent } = matter(content);

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
      return null;
    }
    return null;
  }
}

export async function getGitHubUser(username: string) {
  const octokit = getOctokitFor();

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
      return null;
    }
    return null;
  }
}
