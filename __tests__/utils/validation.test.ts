import { z } from "zod";

const configSchema = z.object({
  bio: z.string().max(240).optional(),
  includeRepos: z.array(z.string()).optional(),
  excludeRepos: z.array(z.string()).optional(),
  customPreviewUrls: z.record(z.string(), z.string().url()).optional(),
  twitterUrl: z.string().url().optional().or(z.literal("")),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  instagramUrl: z.string().url().optional().or(z.literal("")),
});

describe("Config Validation", () => {
  describe("Bio field", () => {
    it("should accept bio under 240 characters", () => {
      const result = configSchema.safeParse({ bio: "Short bio" });
      expect(result.success).toBe(true);
    });

    it("should reject bio over 240 characters", () => {
      const result = configSchema.safeParse({ bio: "a".repeat(241) });
      expect(result.success).toBe(false);
    });

    it("should accept exactly 240 characters", () => {
      const result = configSchema.safeParse({ bio: "a".repeat(240) });
      expect(result.success).toBe(true);
    });

    it("should accept empty bio", () => {
      const result = configSchema.safeParse({ bio: "" });
      expect(result.success).toBe(true);
    });

    it("should accept undefined bio", () => {
      const result = configSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe("Social URLs", () => {
    it("should accept valid URLs", () => {
      const result = configSchema.safeParse({
        twitterUrl: "https://twitter.com/user",
        linkedinUrl: "https://linkedin.com/in/user",
        instagramUrl: "https://instagram.com/user",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid URLs", () => {
      const result = configSchema.safeParse({
        twitterUrl: "not-a-url",
      });
      expect(result.success).toBe(false);
    });

    it("should accept empty strings", () => {
      const result = configSchema.safeParse({
        twitterUrl: "",
        linkedinUrl: "",
        instagramUrl: "",
      });
      expect(result.success).toBe(true);
    });

    it("should reject URLs without protocol", () => {
      const result = configSchema.safeParse({
        twitterUrl: "twitter.com/user",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Repository arrays", () => {
    it("should accept array of strings", () => {
      const result = configSchema.safeParse({
        includeRepos: ["repo1", "repo2", "repo3"],
      });
      expect(result.success).toBe(true);
    });

    it("should accept empty arrays", () => {
      const result = configSchema.safeParse({
        includeRepos: [],
        excludeRepos: [],
      });
      expect(result.success).toBe(true);
    });

    it("should reject non-string arrays", () => {
      const result = configSchema.safeParse({
        includeRepos: [1, 2, 3],
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Custom preview URLs", () => {
    it("should accept valid URL record", () => {
      const result = configSchema.safeParse({
        customPreviewUrls: {
          "user/repo1": "https://preview1.com",
          "user/repo2": "https://preview2.com",
        },
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid URLs in record", () => {
      const result = configSchema.safeParse({
        customPreviewUrls: {
          "user/repo1": "not-a-url",
        },
      });
      expect(result.success).toBe(false);
    });

    it("should accept empty record", () => {
      const result = configSchema.safeParse({
        customPreviewUrls: {},
      });
      expect(result.success).toBe(true);
    });
  });
});
