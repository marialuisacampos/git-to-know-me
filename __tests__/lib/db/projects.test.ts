import { getUserProjects, setUserProjects } from "@/lib/db/projects";
import type { ProjectMeta } from "@/types/portfolio";

jest.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: jest.fn(),
    },
    project: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
      upsert: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

const mockDb = require("@/lib/db").db;

describe("Projects Database", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserProjects", () => {
    it("should return empty array when user not found", async () => {
      mockDb.user.findUnique.mockResolvedValue(null);

      const result = await getUserProjects("nonexistent");
      expect(result).toEqual([]);
    });

    it("should call database when user exists", async () => {
      const mockUser = {
        projects: [],
      };

      mockDb.user.findUnique.mockResolvedValue(mockUser);

      const result = await getUserProjects("testuser");

      expect(mockDb.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { username: "testuser" },
        })
      );
      expect(result).toEqual([]);
    });

    it("should handle database errors gracefully", async () => {
      mockDb.user.findUnique.mockRejectedValue(new Error("DB Error"));

      const result = await getUserProjects("testuser");
      expect(result).toEqual([]);
    });
  });

  describe("setUserProjects", () => {
    it("should throw when user not found", async () => {
      mockDb.user.findUnique.mockResolvedValue(null);

      const projects: ProjectMeta[] = [];

      await expect(setUserProjects("nonexistent", projects)).rejects.toThrow(
        "User not found"
      );
    });

    it("should save projects successfully", async () => {
      const mockUser = { id: "user-1" };
      mockDb.user.findUnique.mockResolvedValue(mockUser);
      mockDb.project.findMany.mockResolvedValue([]);
      mockDb.$transaction.mockResolvedValue([]);

      const projects: ProjectMeta[] = [
        {
          fullName: "user/repo1",
          name: "repo1",
          language: "TypeScript",
          topics: ["test"],
          stars: 5,
          pushedAt: "2024-01-01T00:00:00Z",
          homepageUrl: null,
          previewUrl: null,
        },
      ];

      await expect(
        setUserProjects("testuser", projects)
      ).resolves.not.toThrow();
    });
  });
});
