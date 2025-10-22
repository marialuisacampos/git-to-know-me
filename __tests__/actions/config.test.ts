/**
 * @jest-environment node
 */

import { updateConfigAction } from "@/app/actions/config";
import { getServerSession } from "@/lib/auth";
import { setUserConfig } from "@/lib/db/config";

jest.mock("@/lib/auth");
jest.mock("@/lib/db/config");
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

const mockGetServerSession = getServerSession as jest.MockedFunction<
  typeof getServerSession
>;
const mockSetUserConfig = setUserConfig as jest.MockedFunction<
  typeof setUserConfig
>;

describe("updateConfigAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return error if user is not authenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const formData = new FormData();
    formData.append("bio", "Test bio");

    const result = await updateConfigAction(null, formData);

    expect(result).toEqual({ error: "Não autenticado" });
    expect(mockSetUserConfig).not.toHaveBeenCalled();
  });

  it("should successfully update user config with valid data", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { username: "testuser" },
      expires: "2025-12-31",
    });
    mockSetUserConfig.mockResolvedValue(undefined);

    const formData = new FormData();
    formData.append("bio", "Full-stack developer");
    formData.append("twitterUrl", "https://twitter.com/testuser");
    formData.append("linkedinUrl", "");
    formData.append("instagramUrl", "");
    formData.append("includeRepos", "repo1");
    formData.append("includeRepos", "repo2");
    formData.append(
      "customPreviewUrls",
      JSON.stringify({ repo1: "https://example.com" })
    );

    const result = await updateConfigAction(null, formData);

    expect(result).toEqual({ success: "Configurações salvas com sucesso!" });
    expect(mockSetUserConfig).toHaveBeenCalledWith("testuser", {
      bio: "Full-stack developer",
      twitterUrl: "https://twitter.com/testuser",
      linkedinUrl: "",
      instagramUrl: "",
      includeRepos: ["repo1", "repo2"],
      customPreviewUrls: { repo1: "https://example.com" },
    });
  });

  it("should return error for bio exceeding 240 characters", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { username: "testuser" },
      expires: "2025-12-31",
    });

    const longBio = "a".repeat(241);
    const formData = new FormData();
    formData.append("bio", longBio);

    const result = await updateConfigAction(null, formData);

    expect(result).toEqual({ error: "Bio deve ter no máximo 240 caracteres" });
    expect(mockSetUserConfig).not.toHaveBeenCalled();
  });

  it("should return error for invalid URL", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { username: "testuser" },
      expires: "2025-12-31",
    });

    const formData = new FormData();
    formData.append("bio", "Test");
    formData.append("twitterUrl", "not-a-valid-url");

    const result = await updateConfigAction(null, formData);

    expect(result).toEqual({ error: "URL inválida" });
    expect(mockSetUserConfig).not.toHaveBeenCalled();
  });

  it("should handle empty includeRepos", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { username: "testuser" },
      expires: "2025-12-31",
    });
    mockSetUserConfig.mockResolvedValue(undefined);

    const formData = new FormData();
    formData.append("bio", "Developer");

    const result = await updateConfigAction(null, formData);

    expect(result).toEqual({ success: "Configurações salvas com sucesso!" });
    expect(mockSetUserConfig).toHaveBeenCalledWith("testuser", {
      bio: "Developer",
      twitterUrl: "",
      linkedinUrl: "",
      instagramUrl: "",
      includeRepos: undefined,
      customPreviewUrls: undefined,
    });
  });

  it("should return error when database operation fails", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { username: "testuser" },
      expires: "2025-12-31",
    });
    mockSetUserConfig.mockRejectedValue(new Error("Database error"));

    const formData = new FormData();
    formData.append("bio", "Test");

    const result = await updateConfigAction(null, formData);

    expect(result).toEqual({ error: "Erro ao salvar configurações" });
  });

  it("should accept empty strings for social URLs", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { username: "testuser" },
      expires: "2025-12-31",
    });
    mockSetUserConfig.mockResolvedValue(undefined);

    const formData = new FormData();
    formData.append("bio", "");
    formData.append("twitterUrl", "");
    formData.append("linkedinUrl", "");
    formData.append("instagramUrl", "");

    const result = await updateConfigAction(null, formData);

    expect(result).toEqual({ success: "Configurações salvas com sucesso!" });
  });
});
