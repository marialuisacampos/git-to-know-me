/**
 * @jest-environment node
 */

import { syncUserData } from "@/lib/sync";
import {
  listPublicRepos,
  getReadmeHtml,
  listBlogPostFiles,
  getBlogPostContent,
} from "@/lib/github";
import { setUserProjects } from "@/lib/db/projects";
import { setUserPosts } from "@/lib/db/posts";

jest.mock("@/lib/github", () => ({
  listPublicRepos: jest.fn(),
  getReadmeHtml: jest.fn(),
  listBlogPostFiles: jest.fn(),
  getBlogPostContent: jest.fn(),
}));
jest.mock("@/lib/db/projects", () => ({
  setUserProjects: jest.fn(),
}));
jest.mock("@/lib/db/posts", () => ({
  setUserPosts: jest.fn(),
}));

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

describe("syncUserData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSetUserProjects.mockResolvedValue(undefined);
    mockSetUserPosts.mockResolvedValue(undefined);
  });

  it("should sync projects and posts successfully", async () => {
    mockListPublicRepos.mockResolvedValue([
      {
        name: "project1",
        fullName: "user/project1",
        description: "A project",
        language: "TypeScript",
        topics: [],
        stars: 10,
        pushedAt: "2025-01-01T00:00:00Z",
        homepageUrl: null,
        isPrivate: false,
        isFork: false,
        isArchived: false,
      },
    ]);
    mockGetReadmeHtml.mockResolvedValue("# Project 1");
    mockListBlogPostFiles.mockResolvedValue(["post.md"]);
    mockGetBlogPostContent.mockResolvedValue({
      slug: "post",
      title: "My Post",
      date: "2025-01-15",
      content: "Hello world",
    });

    const result = await syncUserData("user");

    expect(result.projects).toBe(1);
    expect(result.posts).toBe(1);
    expect(result.warnings).toEqual([]);
    expect(mockSetUserProjects).toHaveBeenCalledTimes(1);
    expect(mockSetUserPosts).toHaveBeenCalledTimes(1);
  });

  it("should NOT update posts when blog fetch fails (transient error)", async () => {
    mockListPublicRepos.mockResolvedValue([]);
    mockListBlogPostFiles.mockRejectedValue(new Error("API rate limit"));

    const result = await syncUserData("user");

    expect(result.projects).toBe(0);
    expect(result.posts).toBe(-1);
    expect(result.warnings).toContain(
      "Falha ao buscar posts do blog. Posts não foram atualizados."
    );
    expect(mockSetUserProjects).toHaveBeenCalledTimes(1);
    expect(mockSetUserPosts).not.toHaveBeenCalled();
  });

  it("should NOT update projects when repo fetch fails (transient error)", async () => {
    mockListPublicRepos.mockRejectedValue(new Error("Network timeout"));
    mockListBlogPostFiles.mockResolvedValue([]);

    const result = await syncUserData("user");

    expect(result.projects).toBe(-1);
    expect(result.posts).toBe(0);
    expect(result.warnings).toContain(
      "Falha ao buscar repositórios. Projetos não foram atualizados."
    );
    expect(mockSetUserProjects).not.toHaveBeenCalled();
    expect(mockSetUserPosts).toHaveBeenCalledTimes(1);
  });

  it("should NOT update anything when both fetches fail", async () => {
    mockListPublicRepos.mockRejectedValue(new Error("Network timeout"));
    mockListBlogPostFiles.mockRejectedValue(new Error("API rate limit"));

    const result = await syncUserData("user");

    expect(result.projects).toBe(-1);
    expect(result.posts).toBe(-1);
    expect(result.warnings).toHaveLength(2);
    expect(mockSetUserProjects).not.toHaveBeenCalled();
    expect(mockSetUserPosts).not.toHaveBeenCalled();
  });

  it("should correctly delete posts when blog-posts repo returns 404 (legit empty)", async () => {
    mockListPublicRepos.mockResolvedValue([]);
    mockListBlogPostFiles.mockResolvedValue([]);

    const result = await syncUserData("user");

    expect(result.posts).toBe(0);
    expect(result.warnings).toEqual([]);
    expect(mockSetUserPosts).toHaveBeenCalledWith("user", []);
  });

  it("should handle individual post content failures gracefully", async () => {
    mockListPublicRepos.mockResolvedValue([]);
    mockListBlogPostFiles.mockResolvedValue(["good.md", "bad.md"]);
    mockGetBlogPostContent
      .mockResolvedValueOnce({
        slug: "good",
        title: "Good Post",
        date: "2025-01-15",
        content: "content",
      })
      .mockResolvedValueOnce(null);

    const result = await syncUserData("user");

    expect(result.posts).toBe(1);
    expect(mockSetUserPosts).toHaveBeenCalledWith("user", [
      expect.objectContaining({ slug: "good", title: "Good Post" }),
    ]);
  });
});
