import { getOctokitFor } from "@/lib/github";

jest.mock("@octokit/rest", () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    rest: {
      repos: {
        listForUser: jest.fn(),
        getReadme: jest.fn(),
        getContent: jest.fn(),
      },
      users: {
        getByUsername: jest.fn(),
      },
    },
  })),
}));

describe("GitHub API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getOctokitFor", () => {
    it("should create Octokit instance with GITHUB_PAT", () => {
      const originalEnv = process.env.GITHUB_PAT;
      process.env.GITHUB_PAT = "test-token";

      const octokit = getOctokitFor();
      expect(octokit).toBeDefined();

      process.env.GITHUB_PAT = originalEnv;
    });

    it("should work without GITHUB_PAT", () => {
      const originalEnv = process.env.GITHUB_PAT;
      delete process.env.GITHUB_PAT;

      const octokit = getOctokitFor();
      expect(octokit).toBeDefined();

      process.env.GITHUB_PAT = originalEnv;
    });
  });
});
