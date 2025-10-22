/**
 * @jest-environment node
 */

import { POST } from "@/app/api/sync/github/route";
import { getServerSession } from "@/lib/auth";
import {
  listPublicRepos,
  getReadmeHtml,
  listBlogPostFiles,
  getBlogPostContent,
} from "@/lib/github";
import { setUserProjects } from "@/lib/db/projects";
import { setUserPosts } from "@/lib/db/posts";

jest.mock("@/lib/auth");
jest.mock("@/lib/db/projects");
jest.mock("@/lib/db/posts");
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@/lib/github", () => ({
  listPublicRepos: jest.fn(),
  getReadmeHtml: jest.fn(),
  listBlogPostFiles: jest.fn(),
  getBlogPostContent: jest.fn(),
}));

const mockGetServerSession = getServerSession as jest.MockedFunction<
  typeof getServerSession
>;
const mockListPublicRepos = listPublicRepos as jest.MockedFunction<
  typeof listPublicRepos
>;
const mockGetReadmeHtml = getReadmeHtml as jest.MockedFunction<
  typeof getReadmeHtml
>;
const mockListBlogPostFiles = listBlogPostFiles as jest.MockedFunction<
  typeof listBlogPostFiles
>;
const mockGetBlogPostContent = getBlogPostContent as jest.MockedFunction<
  typeof getBlogPostContent
>;
const mockSetUserProjects = setUserProjects as jest.MockedFunction<
  typeof setUserProjects
>;
const mockSetUserPosts = setUserPosts as jest.MockedFunction<
  typeof setUserPosts
>;

describe("Sync GitHub API Route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/sync/github", () => {
    it("should return 401 if not authenticated", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const response = await POST();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: "Unauthorized. Please login first." });
    });

    it("should sync projects and posts successfully", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { username: "testuser" },
        expires: "2025-12-31",
      });

      const mockRepos = [
        {
          fullName: "testuser/project1",
          name: "project1",
          description: "Test project",
          language: "TypeScript",
          topics: ["react"],
          stars: 15,
          pushedAt: "2025-01-01T00:00:00Z",
          homepageUrl: null,
        },
        {
          fullName: "testuser/project2",
          name: "project2",
          description: "Another project",
          language: "JavaScript",
          topics: [],
          stars: 5,
          pushedAt: "2025-01-02T00:00:00Z",
          homepageUrl: "https://example.com",
        },
      ];

      mockListPublicRepos.mockResolvedValue(mockRepos);
      mockGetReadmeHtml.mockResolvedValue("# Project README");
      mockListBlogPostFiles.mockResolvedValue(["post1.md"]);
      mockGetBlogPostContent.mockResolvedValue({
        slug: "post1",
        title: "First Post",
        summary: "Summary",
        content: "Content here",
        tags: ["tech"],
        date: "2025-01-15",
      });

      mockSetUserProjects.mockResolvedValue(undefined);
      mockSetUserPosts.mockResolvedValue(undefined);

      const response = await POST();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toMatchObject({
        ok: true,
        projects: 2,
        posts: 1,
      });

      expect(mockSetUserProjects).toHaveBeenCalledWith(
        "testuser",
        expect.arrayContaining([
          expect.objectContaining({
            name: "project1",
            stars: 15,
          }),
          expect.objectContaining({
            name: "project2",
            stars: 5,
          }),
        ])
      );

      expect(mockSetUserPosts).toHaveBeenCalledWith("testuser", [
        {
          slug: "post1",
          title: "First Post",
          summary: "Summary",
          contentMdx: "Content here",
          tags: ["tech"],
          publishedAt: "2025-01-15",
        },
      ]);
    });

    it("should handle sync with no blog posts", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { username: "testuser" },
        expires: "2025-12-31",
      });

      mockListPublicRepos.mockResolvedValue([
        {
          fullName: "testuser/repo1",
          name: "repo1",
          description: "Test",
          language: "Python",
          topics: [],
          stars: 0,
          pushedAt: "2025-01-01T00:00:00Z",
          homepageUrl: null,
        },
      ]);

      mockGetReadmeHtml.mockResolvedValue("");
      mockListBlogPostFiles.mockResolvedValue([]);

      mockSetUserProjects.mockResolvedValue(undefined);
      mockSetUserPosts.mockResolvedValue(undefined);

      const response = await POST();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toMatchObject({
        ok: true,
        projects: 1,
        posts: 0,
      });

      expect(mockSetUserPosts).toHaveBeenCalledWith("testuser", []);
    });

    it("should sync all public repositories without limit", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { username: "testuser" },
        expires: "2025-12-31",
      });

      const manyRepos = Array.from({ length: 50 }, (_, i) => ({
        fullName: `testuser/repo${i}`,
        name: `repo${i}`,
        description: `Repo ${i}`,
        language: "TypeScript",
        topics: [],
        stars: i,
        pushedAt: "2025-01-01T00:00:00Z",
        homepageUrl: null,
      }));

      mockListPublicRepos.mockResolvedValue(manyRepos);
      mockGetReadmeHtml.mockResolvedValue("");
      mockListBlogPostFiles.mockResolvedValue([]);

      mockSetUserProjects.mockResolvedValue(undefined);
      mockSetUserPosts.mockResolvedValue(undefined);

      const response = await POST();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.projects).toBe(50);
      expect(mockSetUserProjects).toHaveBeenCalledWith(
        "testuser",
        expect.arrayContaining([expect.objectContaining({ name: "repo0" })])
      );
    });

    it("should sort projects by stars descending", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { username: "testuser" },
        expires: "2025-12-31",
      });

      mockListPublicRepos.mockResolvedValue([
        {
          fullName: "testuser/low-stars",
          name: "low-stars",
          description: "",
          language: "",
          topics: [],
          stars: 2,
          pushedAt: "2025-01-01T00:00:00Z",
          homepageUrl: null,
        },
        {
          fullName: "testuser/high-stars",
          name: "high-stars",
          description: "",
          language: "",
          topics: [],
          stars: 100,
          pushedAt: "2025-01-01T00:00:00Z",
          homepageUrl: null,
        },
      ]);

      mockGetReadmeHtml.mockResolvedValue("");
      mockListBlogPostFiles.mockResolvedValue([]);
      mockSetUserProjects.mockResolvedValue(undefined);
      mockSetUserPosts.mockResolvedValue(undefined);

      await POST();

      const callArgs = mockSetUserProjects.mock.calls[0][1];
      expect(callArgs[0].name).toBe("high-stars");
      expect(callArgs[1].name).toBe("low-stars");
    });

    it("should return 500 on GitHub API error", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { username: "testuser" },
        expires: "2025-12-31",
      });

      mockListPublicRepos.mockRejectedValue(
        new Error("GitHub API rate limit exceeded")
      );

      const response = await POST();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toMatchObject({
        error: "Sync failed",
      });
    });

    it("should handle partial failures in README fetching", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { username: "testuser" },
        expires: "2025-12-31",
      });

      mockListPublicRepos.mockResolvedValue([
        {
          fullName: "testuser/repo1",
          name: "repo1",
          description: "Has README",
          language: "TypeScript",
          topics: [],
          stars: 0,
          pushedAt: "2025-01-01T00:00:00Z",
          homepageUrl: null,
        },
        {
          fullName: "testuser/repo2",
          name: "repo2",
          description: "No README",
          language: "JavaScript",
          topics: [],
          stars: 0,
          pushedAt: "2025-01-01T00:00:00Z",
          homepageUrl: null,
        },
      ]);

      mockGetReadmeHtml
        .mockResolvedValueOnce("# README for repo1")
        .mockResolvedValueOnce("");

      mockListBlogPostFiles.mockResolvedValue([]);
      mockSetUserProjects.mockResolvedValue(undefined);
      mockSetUserPosts.mockResolvedValue(undefined);

      const response = await POST();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.projects).toBe(2);

      const projects = mockSetUserProjects.mock.calls[0][1];
      expect(projects[0]).toMatchObject({
        name: "repo1",
        descriptionHtml: "# README for repo1",
      });
      expect(projects[1]).toMatchObject({
        name: "repo2",
        descriptionHtml: "No README",
      });
    });
  });
});
