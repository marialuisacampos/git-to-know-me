import { ProjectMeta, PostMeta, UserConfig } from "@/types/portfolio";

describe("Type Guards and Validation", () => {
  describe("ProjectMeta", () => {
    it("should accept valid project data", () => {
      const project: ProjectMeta = {
        fullName: "user/repo",
        name: "repo",
        language: "TypeScript",
        topics: ["nextjs", "react"],
        stars: 100,
        pushedAt: "2024-01-01T00:00:00Z",
        homepageUrl: "https://example.com",
        previewUrl: null,
        summary: "Test summary",
      };

      expect(project.fullName).toBe("user/repo");
      expect(project.stars).toBeGreaterThanOrEqual(0);
    });

    it("should allow optional fields", () => {
      const project: ProjectMeta = {
        fullName: "user/repo",
        name: "repo",
        language: null,
        topics: [],
        stars: 0,
        pushedAt: null,
        homepageUrl: null,
        previewUrl: null,
      };

      expect(project.language).toBeNull();
      expect(project.topics).toEqual([]);
    });
  });

  describe("PostMeta", () => {
    it("should accept valid post data", () => {
      const post: PostMeta = {
        slug: "my-post",
        title: "My Post",
        summary: "A summary",
        contentMdx: "# Content",
        tags: ["tutorial"],
        publishedAt: "2024-01-01T00:00:00Z",
      };

      expect(post.slug).toBe("my-post");
      expect(post.tags).toContain("tutorial");
    });

    it("should allow optional fields", () => {
      const post: PostMeta = {
        slug: "my-post",
        title: "My Post",
        contentMdx: "# Content",
        publishedAt: "2024-01-01T00:00:00Z",
      };

      expect(post.summary).toBeUndefined();
      expect(post.tags).toBeUndefined();
    });
  });

  describe("UserConfig", () => {
    it("should allow all fields optional", () => {
      const config: UserConfig = {};
      expect(config).toEqual({});
    });

    it("should accept valid config", () => {
      const config: UserConfig = {
        bio: "Test bio",
        includeRepos: ["repo1", "repo2"],
        excludeRepos: [],
        customPreviewUrls: {
          "user/repo1": "https://preview.com",
        },
        twitterUrl: "https://twitter.com/test",
        linkedinUrl: "https://linkedin.com/in/test",
        instagramUrl: "https://instagram.com/test",
      };

      expect(config.bio).toBeDefined();
      expect(config.includeRepos).toHaveLength(2);
    });
  });
});
