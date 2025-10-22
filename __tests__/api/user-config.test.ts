/**
 * @jest-environment node
 */

import { GET } from "@/app/api/user/config/route";
import { getUserConfig } from "@/lib/db/config";

jest.mock("@/lib/db/config");

const mockGetUserConfig = getUserConfig as jest.MockedFunction<
  typeof getUserConfig
>;

describe("User Config API Route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/user/config", () => {
    it("should return 400 if username is missing", async () => {
      const req = new Request("http://localhost/api/user/config");

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "Username é obrigatório" });
    });

    it("should return user config for valid username", async () => {
      const mockConfig = {
        bio: "Test bio",
        includeRepos: ["repo1", "repo2"],
        twitterUrl: "https://twitter.com/test",
      };

      mockGetUserConfig.mockResolvedValue(mockConfig);

      const req = new Request(
        "http://localhost/api/user/config?username=testuser"
      );

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockConfig);
      expect(mockGetUserConfig).toHaveBeenCalledWith("testuser");
    });

    it("should return empty config if user not found", async () => {
      mockGetUserConfig.mockResolvedValue({});

      const req = new Request(
        "http://localhost/api/user/config?username=nonexistent"
      );

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({});
    });

    it("should return 500 on database error", async () => {
      mockGetUserConfig.mockRejectedValue(new Error("Database error"));

      const req = new Request(
        "http://localhost/api/user/config?username=testuser"
      );

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: "Erro ao buscar configuração" });
    });
  });
});
