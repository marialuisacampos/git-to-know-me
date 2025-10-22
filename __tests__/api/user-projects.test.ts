/**
 * @jest-environment node
 */

import { GET } from "@/app/api/user/projects/route";
import { getUserProjects } from "@/lib/db/projects";

jest.mock("@/lib/db/projects");

const mockGetUserProjects = getUserProjects as jest.MockedFunction<
  typeof getUserProjects
>;

describe("User Projects API Route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/user/projects", () => {
    it("should return 400 if username is missing", async () => {
      const req = new Request("http://localhost/api/user/projects");

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "Username é obrigatório" });
    });

    it("should return user projects for valid username", async () => {
      const mockProjects = [
        {
          name: "repo1",
          fullName: "testuser/repo1",
          description: "Test repo",
          descriptionHtml: "# README",
          language: "TypeScript",
          stars: 10,
          url: "https://github.com/testuser/repo1",
          topics: ["react"],
          pushedAt: "2025-01-01T00:00:00Z",
          previewUrl: undefined,
        },
      ];

      mockGetUserProjects.mockResolvedValue(mockProjects);

      const req = new Request(
        "http://localhost/api/user/projects?username=testuser"
      );

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockProjects);
      expect(mockGetUserProjects).toHaveBeenCalledWith("testuser");
    });

    it("should return empty array if user has no projects", async () => {
      mockGetUserProjects.mockResolvedValue([]);

      const req = new Request(
        "http://localhost/api/user/projects?username=testuser"
      );

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it("should return 500 on database error", async () => {
      mockGetUserProjects.mockRejectedValue(new Error("Database error"));

      const req = new Request(
        "http://localhost/api/user/projects?username=testuser"
      );

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: "Erro ao buscar projetos" });
    });
  });
});
