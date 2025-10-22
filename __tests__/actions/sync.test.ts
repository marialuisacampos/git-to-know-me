/**
 * @jest-environment node
 */

import { syncGitHubAction } from "@/app/actions/sync";
import { getServerSession } from "@/lib/auth";
import { getOctokitFor } from "@/lib/github";
import { setUserProjects } from "@/lib/db/projects";
import { setUserPosts } from "@/lib/db/posts";

jest.mock("@/lib/auth");
jest.mock("@/lib/db/projects");
jest.mock("@/lib/db/posts");
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@/lib/github", () => ({
  getOctokitFor: jest.fn(),
}));

const mockGetServerSession = getServerSession as jest.MockedFunction<
  typeof getServerSession
>;
const mockGetOctokitFor = getOctokitFor as jest.MockedFunction<
  typeof getOctokitFor
>;
const mockSetUserProjects = setUserProjects as jest.MockedFunction<
  typeof setUserProjects
>;
const mockSetUserPosts = setUserPosts as jest.MockedFunction<
  typeof setUserPosts
>;

describe("syncGitHubAction", () => {
  const mockOctokit = {
    repos: {
      listForUser: jest.fn(),
      getReadme: jest.fn(),
      getContent: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetOctokitFor.mockResolvedValue(mockOctokit as never);
  });

  it("should return error if user is not authenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const result = await syncGitHubAction();

    expect(result).toEqual({ error: "Não autenticado" });
    expect(mockGetOctokitFor).not.toHaveBeenCalled();
  });

  it("should sync projects without blog-posts repo", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { username: "testuser" },
      expires: "2025-12-31",
    });

    mockOctokit.repos.listForUser.mockResolvedValue({
      data: [
        {
          name: "project1",
          full_name: "testuser/project1",
          description: "Test project",
          language: "TypeScript",
          stargazers_count: 10,
          html_url: "https://github.com/testuser/project1",
          topics: ["react", "nextjs"],
          pushed_at: "2025-01-01T00:00:00Z",
          fork: false,
          private: false,
        },
        {
          name: "forked-repo",
          full_name: "testuser/forked-repo",
          fork: true,
          private: false,
        },
      ],
    } as any);

    mockOctokit.repos.getReadme.mockResolvedValue({
      data: {
        content: Buffer.from("# Project 1\n\nAwesome project").toString(
          "base64"
        ),
      },
    } as any);

    mockSetUserProjects.mockResolvedValue(undefined);
    mockSetUserPosts.mockResolvedValue(undefined);

    const result = await syncGitHubAction();

    expect(result).toMatchObject({
      success: "Sincronização concluída!",
      projects: 1,
      posts: 0,
    });

    expect(mockSetUserProjects).toHaveBeenCalledWith("testuser", [
      expect.objectContaining({
        name: "project1",
        fullName: "testuser/project1",
        description: "Test project",
        language: "TypeScript",
        stars: 10,
      }),
    ]);

    expect(mockSetUserPosts).toHaveBeenCalledWith("testuser", []);
  });

  it("should sync blog posts when blog-posts repo exists", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { username: "testuser" },
      expires: "2025-12-31",
    });

    mockOctokit.repos.listForUser.mockResolvedValue({
      data: [
        {
          name: "regular-project",
          full_name: "testuser/regular-project",
          description: "Regular repo",
          language: "TypeScript",
          stargazers_count: 5,
          html_url: "https://github.com/testuser/regular-project",
          topics: [],
          pushed_at: "2025-01-01T00:00:00Z",
          private: false,
          fork: false,
        },
        {
          name: "blog-posts",
          full_name: "testuser/blog-posts",
          private: false,
          fork: false,
        },
      ],
    } as any);

    mockOctokit.repos.getReadme.mockResolvedValue({
      data: {
        content: Buffer.from("# README").toString("base64"),
      },
    } as any);

    mockOctokit.repos.getContent
      .mockResolvedValueOnce({
        data: [
          {
            name: "first-post.md",
            type: "file",
          },
        ],
      } as any)
      .mockResolvedValueOnce({
        data: {
          content: Buffer.from(
            `---
title: My First Post
date: 2025-01-15
excerpt: This is my first blog post
tags: [tech, typescript]
---

# Hello World

This is the content.`
          ).toString("base64"),
        },
      } as any);

    mockSetUserProjects.mockResolvedValue(undefined);
    mockSetUserPosts.mockResolvedValue(undefined);

    const result = await syncGitHubAction();

    expect(result).toMatchObject({
      success: "Sincronização concluída!",
      projects: 1,
      posts: 1,
    });

    expect(mockSetUserPosts).toHaveBeenCalledWith("testuser", [
      {
        slug: "first-post",
        title: "My First Post",
        summary: "This is my first blog post",
        contentMdx: "# Hello World\n\nThis is the content.",
        publishedAt: "2025-01-15",
        tags: ["tech", "typescript"],
      },
    ]);
  });

  it("should handle projects without README", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { username: "testuser" },
      expires: "2025-12-31",
    });

    mockOctokit.repos.listForUser.mockResolvedValue({
      data: [
        {
          name: "no-readme-project",
          full_name: "testuser/no-readme-project",
          description: "Project without README",
          language: "JavaScript",
          stargazers_count: 5,
          html_url: "https://github.com/testuser/no-readme-project",
          topics: [],
          pushed_at: "2025-01-01T00:00:00Z",
          fork: false,
          private: false,
        },
      ],
    } as any);

    mockOctokit.repos.getReadme.mockRejectedValue(new Error("404 Not Found"));

    mockSetUserProjects.mockResolvedValue(undefined);
    mockSetUserPosts.mockResolvedValue(undefined);

    const result = await syncGitHubAction();

    expect(result).toMatchObject({
      success: "Sincronização concluída!",
      projects: 1,
      posts: 0,
    });

    expect(mockSetUserProjects).toHaveBeenCalledWith("testuser", [
      expect.objectContaining({
        name: "no-readme-project",
        descriptionHtml: "",
      }),
    ]);
  });

  it("should return error when GitHub API fails", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { username: "testuser" },
      expires: "2025-12-31",
    });

    mockOctokit.repos.listForUser.mockRejectedValue(
      new Error("API rate limit exceeded")
    );

    const result = await syncGitHubAction();

    expect(result).toEqual({ error: "Erro ao sincronizar com o GitHub" });
    expect(mockSetUserProjects).not.toHaveBeenCalled();
    expect(mockSetUserPosts).not.toHaveBeenCalled();
  });

  it("should handle blog posts without frontmatter", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { username: "testuser" },
      expires: "2025-12-31",
    });

    mockOctokit.repos.listForUser.mockResolvedValue({
      data: [
        {
          name: "regular-repo",
          full_name: "testuser/regular-repo",
          description: "Regular",
          language: "TypeScript",
          stargazers_count: 1,
          html_url: "https://github.com/testuser/regular-repo",
          topics: [],
          pushed_at: "2025-01-01T00:00:00Z",
          private: false,
          fork: false,
        },
        {
          name: "blog-posts",
          full_name: "testuser/blog-posts",
          private: false,
          fork: false,
        },
      ],
    } as any);

    mockOctokit.repos.getReadme.mockResolvedValue({
      data: {
        content: Buffer.from("# README").toString("base64"),
      },
    } as any);

    mockOctokit.repos.getContent
      .mockResolvedValueOnce({
        data: [
          {
            name: "invalid-post.md",
            type: "file",
          },
        ],
      } as any)
      .mockResolvedValueOnce({
        data: {
          content: Buffer.from("Just content without frontmatter").toString(
            "base64"
          ),
        },
      } as any);

    mockSetUserProjects.mockResolvedValue(undefined);
    mockSetUserPosts.mockResolvedValue(undefined);

    const result = await syncGitHubAction();

    expect(result).toMatchObject({
      success: "Sincronização concluída!",
      projects: 1,
      posts: 0,
    });

    expect(mockSetUserPosts).toHaveBeenCalledWith("testuser", []);
  });

  it("should filter out forked and private repositories", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { username: "testuser" },
      expires: "2025-12-31",
    });

    mockOctokit.repos.listForUser.mockResolvedValue({
      data: [
        {
          name: "public-repo",
          full_name: "testuser/public-repo",
          fork: false,
          private: false,
          stargazers_count: 1,
          html_url: "https://github.com/testuser/public-repo",
        },
        {
          name: "forked-repo",
          full_name: "testuser/forked-repo",
          fork: true,
          private: false,
        },
        {
          name: "private-repo",
          full_name: "testuser/private-repo",
          fork: false,
          private: true,
        },
      ],
    } as any);

    mockOctokit.repos.getReadme.mockRejectedValue(new Error("No README"));
    mockSetUserProjects.mockResolvedValue(undefined);
    mockSetUserPosts.mockResolvedValue(undefined);

    const result = await syncGitHubAction();

    expect(result).toMatchObject({
      success: "Sincronização concluída!",
      projects: 1,
    });

    expect(mockSetUserProjects).toHaveBeenCalledWith("testuser", [
      expect.objectContaining({
        name: "public-repo",
      }),
    ]);
  });
});
