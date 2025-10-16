import { getUserConfig, setUserConfig } from "@/lib/db/config";
import type { UserConfig } from "@/types/portfolio";

jest.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    userConfig: {
      upsert: jest.fn(),
    },
  },
}));

const mockDb = require("@/lib/db").db;

describe("Config Database", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserConfig", () => {
    it("should return empty config when user not found", async () => {
      mockDb.user.findUnique.mockResolvedValue(null);

      const result = await getUserConfig("nonexistent");
      expect(result).toEqual({});
    });

    it("should return config for existing user", async () => {
      const mockUser = {
        bio: "Test bio",
        twitterUrl: "https://twitter.com/test",
        linkedinUrl: null,
        instagramUrl: null,
        config: {
          includeRepos: ["repo1", "repo2"],
          excludeRepos: null,
          customPreviewUrls: { repo1: "https://preview.com" },
        },
      };

      mockDb.user.findUnique.mockResolvedValue(mockUser);

      const result = await getUserConfig("testuser");
      expect(result.bio).toBe("Test bio");
      expect(result.twitterUrl).toBe("https://twitter.com/test");
      expect(result.includeRepos).toEqual(["repo1", "repo2"]);
    });

    it("should handle database errors gracefully", async () => {
      mockDb.user.findUnique.mockRejectedValue(new Error("DB Error"));

      const result = await getUserConfig("testuser");
      expect(result).toEqual({});
    });
  });

  describe("setUserConfig", () => {
    it("should throw when user not found", async () => {
      mockDb.user.findUnique.mockResolvedValue(null);

      const config: Partial<UserConfig> = { bio: "New bio" };

      await expect(setUserConfig("nonexistent", config)).rejects.toThrow(
        "User not found"
      );
    });

    it("should update user bio and social links", async () => {
      const mockUser = { id: "user-1" };
      mockDb.user.findUnique.mockResolvedValue(mockUser);
      mockDb.user.update.mockResolvedValue({});
      mockDb.userConfig.upsert.mockResolvedValue({});

      const config: Partial<UserConfig> = {
        bio: "Updated bio",
        twitterUrl: "https://twitter.com/new",
      };

      await expect(setUserConfig("testuser", config)).resolves.not.toThrow();
      expect(mockDb.user.update).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: expect.objectContaining({
          bio: "Updated bio",
          twitterUrl: "https://twitter.com/new",
        }),
      });
    });

    it("should update repository selection", async () => {
      const mockUser = { id: "user-1" };
      mockDb.user.findUnique.mockResolvedValue(mockUser);
      mockDb.userConfig.upsert.mockResolvedValue({});

      const config: Partial<UserConfig> = {
        includeRepos: ["repo1", "repo2"],
      };

      await expect(setUserConfig("testuser", config)).resolves.not.toThrow();
      expect(mockDb.userConfig.upsert).toHaveBeenCalled();
    });
  });
});
