/**
 * @jest-environment node
 */

import { POST } from "@/app/api/sync/github/route";
import { getServerSession } from "@/lib/auth";
import { syncUserData } from "@/lib/sync";

jest.mock("@/lib/auth");
jest.mock("@/lib/sync", () => ({
  syncUserData: jest.fn(),
}));
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

const mockGetServerSession = getServerSession as jest.MockedFunction<
  typeof getServerSession
>;
const mockSyncUserData = syncUserData as jest.MockedFunction<
  typeof syncUserData
>;

describe("POST /api/sync/github", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if not authenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const response = await POST();
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized. Please login first.");
    expect(mockSyncUserData).not.toHaveBeenCalled();
  });

  it("should return 200 with sync results", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { username: "testuser" },
      expires: "2025-12-31",
    });

    mockSyncUserData.mockResolvedValue({
      projects: 5,
      posts: 2,
      warnings: [],
    });

    const response = await POST();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.projects).toBe(5);
    expect(body.posts).toBe(2);
    expect(body.warnings).toBeUndefined();
    expect(mockSyncUserData).toHaveBeenCalledWith("testuser");
  });

  it("should include warnings when fetch partially fails", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { username: "testuser" },
      expires: "2025-12-31",
    });

    mockSyncUserData.mockResolvedValue({
      projects: 3,
      posts: -1,
      warnings: ["Falha ao buscar posts do blog. Posts não foram atualizados."],
    });

    const response = await POST();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.projects).toBe(3);
    expect(body.posts).toBe(0);
    expect(body.warnings).toHaveLength(1);
  });

  it("should return 500 when syncUserData throws", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { username: "testuser" },
      expires: "2025-12-31",
    });

    mockSyncUserData.mockRejectedValue(new Error("DB down"));

    const response = await POST();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Sync failed");
  });
});
