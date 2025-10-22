/**
 * @jest-environment node
 */

import { updateConfigAction } from "@/app/actions/config";
import { syncGitHubAction } from "@/app/actions/sync";
import { getServerSession } from "@/lib/auth";
import { getOctokitFor } from "@/lib/github";
import { getUserConfig, setUserConfig } from "@/lib/db/config";
import { getUserProjects, setUserProjects } from "@/lib/db/projects";
import { getUserPosts, setUserPosts } from "@/lib/db/posts";

jest.mock("@/lib/auth");
jest.mock("@/lib/db/config");
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
const mockSetUserConfig = setUserConfig as jest.MockedFunction<
  typeof setUserConfig
>;
const mockSetUserProjects = setUserProjects as jest.MockedFunction<
  typeof setUserProjects
>;
const mockSetUserPosts = setUserPosts as jest.MockedFunction<
  typeof setUserPosts
>;

describe("User Flow Integration Tests", () => {
  const mockOctokit = {
    repos: {
      listForUser: jest.fn(),
      getReadme: jest.fn(),
      getContent: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetOctokitFor.mockResolvedValue(mockOctokit as any);
    mockGetServerSession.mockResolvedValue({
      user: { username: "testuser" },
      expires: "2025-12-31",
    });
  });

  describe("Complete User Onboarding Flow", () => {
    it("should handle first login sync → config update → profile view", async () => {
      mockOctokit.repos.listForUser.mockResolvedValue({
        data: [
          {
            name: "awesome-project",
            full_name: "testuser/awesome-project",
            description: "My awesome project",
            language: "TypeScript",
            stargazers_count: 50,
            html_url: "https://github.com/testuser/awesome-project",
            topics: ["react", "nextjs"],
            pushed_at: "2025-01-15T00:00:00Z",
            fork: false,
            private: false,
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
          content: Buffer.from("# Awesome Project").toString("base64"),
        },
      } as any);

      mockOctokit.repos.getContent
        .mockResolvedValueOnce({
          data: [
            {
              name: "my-first-post.md",
              type: "file",
            },
          ],
        } as any)
        .mockResolvedValueOnce({
          data: {
            content: Buffer.from(
              `---
title: My Journey into Tech
date: 2025-01-20
excerpt: How I started my career
tags: [career, beginners]
---

This is my story...`
            ).toString("base64"),
          },
        } as any);

      mockSetUserProjects.mockResolvedValue(undefined);
      mockSetUserPosts.mockResolvedValue(undefined);

      const syncResult = await syncGitHubAction();

      expect(syncResult).toMatchObject({
        success: "Sincronização concluída!",
        projects: 1,
        posts: 1,
      });

      expect(mockSetUserProjects).toHaveBeenCalledWith("testuser", [
        expect.objectContaining({
          name: "awesome-project",
          stars: 50,
        }),
      ]);

      expect(mockSetUserPosts).toHaveBeenCalledWith("testuser", [
        expect.objectContaining({
          slug: "my-first-post",
          title: "My Journey into Tech",
        }),
      ]);

      mockSetUserConfig.mockResolvedValue(undefined);

      const formData = new FormData();
      formData.append(
        "bio",
        "Full-stack developer passionate about open source"
      );
      formData.append("twitterUrl", "https://twitter.com/testuser");
      formData.append("includeRepos", "awesome-project");
      formData.append(
        "customPreviewUrls",
        JSON.stringify({ "awesome-project": "https://demo.vercel.app" })
      );

      const configResult = await updateConfigAction(null, formData);

      expect(configResult).toEqual({
        success: "Configurações salvas com sucesso!",
      });

      expect(mockSetUserConfig).toHaveBeenCalledWith("testuser", {
        bio: "Full-stack developer passionate about open source",
        twitterUrl: "https://twitter.com/testuser",
        linkedinUrl: "",
        instagramUrl: "",
        includeRepos: ["awesome-project"],
        customPreviewUrls: {
          "awesome-project": "https://demo.vercel.app",
        },
      });
    });

    it("should handle user with many repos selecting only specific ones", async () => {
      mockOctokit.repos.listForUser.mockResolvedValue({
        data: Array.from({ length: 30 }, (_, i) => ({
          name: `repo-${i}`,
          full_name: `testuser/repo-${i}`,
          description: `Repository ${i}`,
          language: "TypeScript",
          stargazers_count: i,
          html_url: `https://github.com/testuser/repo-${i}`,
          topics: [],
          pushed_at: "2025-01-01T00:00:00Z",
          fork: false,
          private: false,
        })),
      } as any);

      mockOctokit.repos.getReadme.mockResolvedValue({
        data: { content: Buffer.from("# README").toString("base64") },
      } as any);

      mockSetUserProjects.mockResolvedValue(undefined);
      mockSetUserPosts.mockResolvedValue(undefined);

      const syncResult = await syncGitHubAction();

      expect(syncResult).toMatchObject({
        success: "Sincronização concluída!",
        projects: 30,
        posts: 0,
      });

      mockSetUserConfig.mockResolvedValue(undefined);

      const formData = new FormData();
      formData.append("bio", "Developer");
      formData.append("includeRepos", "repo-0");
      formData.append("includeRepos", "repo-1");
      formData.append("includeRepos", "repo-2");

      const configResult = await updateConfigAction(null, formData);

      expect(configResult.success).toBeTruthy();
      expect(mockSetUserConfig).toHaveBeenCalledWith("testuser", {
        bio: "Developer",
        twitterUrl: "",
        linkedinUrl: "",
        instagramUrl: "",
        includeRepos: ["repo-0", "repo-1", "repo-2"],
        customPreviewUrls: undefined,
      });
    });

    it("should handle sync → config → re-sync workflow", async () => {
      mockOctokit.repos.listForUser.mockResolvedValue({
        data: [
          {
            name: "project1",
            full_name: "testuser/project1",
            description: "First project",
            language: "TypeScript",
            stargazers_count: 10,
            html_url: "https://github.com/testuser/project1",
            topics: [],
            pushed_at: "2025-01-01T00:00:00Z",
            fork: false,
            private: false,
          },
        ],
      } as any);

      mockOctokit.repos.getReadme.mockResolvedValue({
        data: { content: Buffer.from("# Project 1").toString("base64") },
      } as any);

      mockSetUserProjects.mockResolvedValue(undefined);
      mockSetUserPosts.mockResolvedValue(undefined);

      const firstSync = await syncGitHubAction();
      expect(firstSync.projects).toBe(1);

      mockSetUserConfig.mockResolvedValue(undefined);

      const formData = new FormData();
      formData.append("bio", "Updated bio");
      formData.append("includeRepos", "project1");

      const configUpdate = await updateConfigAction(null, formData);
      expect(configUpdate.success).toBeTruthy();

      mockOctokit.repos.listForUser.mockResolvedValue({
        data: [
          {
            name: "project1",
            full_name: "testuser/project1",
            description: "First project",
            language: "TypeScript",
            stargazers_count: 10,
            html_url: "https://github.com/testuser/project1",
            topics: [],
            pushed_at: "2025-01-01T00:00:00Z",
            fork: false,
            private: false,
          },
          {
            name: "project2",
            full_name: "testuser/project2",
            description: "New project",
            language: "Python",
            stargazers_count: 5,
            html_url: "https://github.com/testuser/project2",
            topics: ["python"],
            pushed_at: "2025-01-20T00:00:00Z",
            fork: false,
            private: false,
          },
        ],
      } as any);

      const secondSync = await syncGitHubAction();
      expect(secondSync.projects).toBe(2);

      expect(mockSetUserProjects).toHaveBeenCalledTimes(2);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle config update with no selected repos", async () => {
      mockSetUserConfig.mockResolvedValue(undefined);

      const formData = new FormData();
      formData.append("bio", "Just a bio");

      const result = await updateConfigAction(null, formData);

      expect(result.success).toBeTruthy();
      expect(mockSetUserConfig).toHaveBeenCalledWith("testuser", {
        bio: "Just a bio",
        twitterUrl: "",
        linkedinUrl: "",
        instagramUrl: "",
        includeRepos: undefined,
        customPreviewUrls: undefined,
      });
    });

    it("should handle sync with all invalid blog posts", async () => {
      mockOctokit.repos.listForUser.mockResolvedValue({
        data: [
          {
            name: "blog-posts",
            full_name: "testuser/blog-posts",
            private: false,
            fork: false,
          },
        ],
      } as any);

      mockOctokit.repos.getReadme.mockRejectedValue(new Error("No README"));

      mockOctokit.repos.getContent
        .mockResolvedValueOnce({
          data: [
            { name: "invalid1.md", type: "file" },
            { name: "invalid2.md", type: "file" },
          ],
        } as any)
        .mockResolvedValueOnce({
          data: {
            content: Buffer.from("No frontmatter here").toString("base64"),
          },
        } as any)
        .mockResolvedValueOnce({
          data: {
            content: Buffer.from("Also invalid").toString("base64"),
          },
        } as any);

      mockSetUserProjects.mockResolvedValue(undefined);
      mockSetUserPosts.mockResolvedValue(undefined);

      const result = await syncGitHubAction();

      expect(result).toMatchObject({
        success: "Sincronização concluída!",
        projects: 0,
        posts: 0,
      });

      expect(mockSetUserPosts).toHaveBeenCalledWith("testuser", []);
    });
  });
});
