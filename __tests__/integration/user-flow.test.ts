/**
 * @jest-environment node
 */

import { updateConfigAction } from "@/app/actions/config";
import { syncGitHubAction } from "@/app/actions/sync";
import { getServerSession } from "@/lib/auth";
import { syncUserData } from "@/lib/sync";
import { setUserConfig } from "@/lib/db/config";

jest.mock("@/lib/auth");
jest.mock("@/lib/db/config");
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
const mockSetUserConfig = setUserConfig as jest.MockedFunction<
  typeof setUserConfig
>;

describe("User Flow Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue({
      user: { username: "testuser" },
      expires: "2025-12-31",
    });
  });

  describe("Complete User Onboarding Flow", () => {
    it("should handle first login sync → config update → profile view", async () => {
      mockSyncUserData.mockResolvedValue({
        projects: 1,
        posts: 1,
        warnings: [],
      });

      const syncResult = await syncGitHubAction();

      expect(syncResult).toMatchObject({
        success: "Sincronização concluída!",
        projects: 1,
        posts: 1,
      });

      mockSetUserConfig.mockResolvedValue(undefined);

      const formData = new FormData();
      formData.append(
        "bio",
        "Full-stack developer passionate about open source"
      );
      formData.append("twitterUrl", "https://twitter.com/testuser");
      formData.append("includeRepos", "awesome-project");
      formData.append(
        "customPreviewUrls",
        JSON.stringify({ "awesome-project": "https://demo.vercel.app" })
      );

      const configResult = await updateConfigAction(null, formData);

      expect(configResult).toEqual({
        success: "Configurações salvas com sucesso!",
      });

      expect(mockSetUserConfig).toHaveBeenCalledWith("testuser", {
        bio: "Full-stack developer passionate about open source",
        twitterUrl: "https://twitter.com/testuser",
        linkedinUrl: "",
        instagramUrl: "",
        includeRepos: ["awesome-project"],
        customPreviewUrls: {
          "awesome-project": "https://demo.vercel.app",
        },
      });
    });

    it("should handle user with many repos selecting only specific ones", async () => {
      mockSyncUserData.mockResolvedValue({
        projects: 30,
        posts: 0,
        warnings: [],
      });

      const syncResult = await syncGitHubAction();

      expect(syncResult).toMatchObject({
        success: "Sincronização concluída!",
        projects: 30,
        posts: 0,
      });

      mockSetUserConfig.mockResolvedValue(undefined);

      const formData = new FormData();
      formData.append("bio", "Developer");
      formData.append("includeRepos", "repo-0");
      formData.append("includeRepos", "repo-1");
      formData.append("includeRepos", "repo-2");

      const configResult = await updateConfigAction(null, formData);

      expect(configResult.success).toBeTruthy();
      expect(mockSetUserConfig).toHaveBeenCalledWith("testuser", {
        bio: "Developer",
        twitterUrl: "",
        linkedinUrl: "",
        instagramUrl: "",
        includeRepos: ["repo-0", "repo-1", "repo-2"],
        customPreviewUrls: undefined,
      });
    });

    it("should handle sync → config → re-sync workflow", async () => {
      mockSyncUserData
        .mockResolvedValueOnce({ projects: 1, posts: 0, warnings: [] })
        .mockResolvedValueOnce({ projects: 2, posts: 0, warnings: [] });

      const firstSync = await syncGitHubAction();
      expect(firstSync.projects).toBe(1);

      mockSetUserConfig.mockResolvedValue(undefined);

      const formData = new FormData();
      formData.append("bio", "Updated bio");
      formData.append("includeRepos", "project1");

      const configUpdate = await updateConfigAction(null, formData);
      expect(configUpdate.success).toBeTruthy();

      const secondSync = await syncGitHubAction();
      expect(secondSync.projects).toBe(2);

      expect(mockSyncUserData).toHaveBeenCalledTimes(2);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle config update with no selected repos", async () => {
      mockSetUserConfig.mockResolvedValue(undefined);

      const formData = new FormData();
      formData.append("bio", "Just a bio");

      const result = await updateConfigAction(null, formData);

      expect(result.success).toBeTruthy();
      expect(mockSetUserConfig).toHaveBeenCalledWith("testuser", {
        bio: "Just a bio",
        twitterUrl: "",
        linkedinUrl: "",
        instagramUrl: "",
        includeRepos: undefined,
        customPreviewUrls: undefined,
      });
    });

    it("should report partial sync when blog fetch fails", async () => {
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
        warnings: expect.arrayContaining([
          expect.stringContaining("Posts não foram atualizados"),
        ]),
      });
    });
  });
});
