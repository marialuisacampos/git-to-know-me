/**
 * @jest-environment node
 */

import { syncGitHubAction } from "@/app/actions/sync";
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

describe("syncGitHubAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return error if user is not authenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const result = await syncGitHubAction();

    expect(result).toEqual({ error: "Não autenticado" });
    expect(mockSyncUserData).not.toHaveBeenCalled();
  });

  it("should delegate to syncUserData and return success", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { username: "testuser" },
      expires: "2025-12-31",
    });

    mockSyncUserData.mockResolvedValue({
      projects: 5,
      posts: 2,
      warnings: [],
    });

    const result = await syncGitHubAction();

    expect(mockSyncUserData).toHaveBeenCalledWith("testuser");
    expect(result).toMatchObject({
      success: "Sincronização concluída!",
      projects: 5,
      posts: 2,
    });
  });

  it("should return partial success with warnings when fetch partially fails", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { username: "testuser" },
      expires: "2025-12-31",
    });

    mockSyncUserData.mockResolvedValue({
      projects: 3,
      posts: -1,
      warnings: ["Falha ao buscar posts do blog. Posts não foram atualizados."],
    });

    const result = await syncGitHubAction();

    expect(result).toMatchObject({
      success: "Sincronização parcial concluída.",
      projects: 3,
      posts: 0,
      warnings: ["Falha ao buscar posts do blog. Posts não foram atualizados."],
    });
  });

  it("should return error when syncUserData throws", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { username: "testuser" },
      expires: "2025-12-31",
    });

    mockSyncUserData.mockRejectedValue(new Error("Database connection failed"));

    const result = await syncGitHubAction();

    expect(result).toEqual({ error: "Erro ao sincronizar com o GitHub" });
  });
});
