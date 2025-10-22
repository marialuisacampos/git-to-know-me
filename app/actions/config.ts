"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/auth";
import { setUserConfig } from "@/lib/db/config";

const configSchema = z.object({
  bio: z
    .string()
    .max(240, "Bio deve ter no máximo 240 caracteres")
    .optional()
    .or(z.literal("")),
  twitterUrl: z
    .union([z.string().url("URL inválida"), z.literal("")])
    .optional(),
  linkedinUrl: z
    .union([z.string().url("URL inválida"), z.literal("")])
    .optional(),
  instagramUrl: z
    .union([z.string().url("URL inválida"), z.literal("")])
    .optional(),
  includeRepos: z.array(z.string()).optional(),
  customPreviewUrls: z.record(z.string(), z.string()).optional(),
});

export async function updateConfigAction(
  prevState: unknown,
  formData: FormData
) {
  const session = await getServerSession();

  if (!session?.user?.username) {
    return { error: "Não autenticado" };
  }

  const includeRepos = formData.getAll("includeRepos") as string[];
  const customPreviewUrlsRaw = formData.get("customPreviewUrls") as
    | string
    | null;

  const rawData = {
    bio: (formData.get("bio") as string | null) || "",
    twitterUrl: (formData.get("twitterUrl") as string | null) || "",
    linkedinUrl: (formData.get("linkedinUrl") as string | null) || "",
    instagramUrl: (formData.get("instagramUrl") as string | null) || "",
    includeRepos: includeRepos.length > 0 ? includeRepos : undefined,
    customPreviewUrls: customPreviewUrlsRaw
      ? JSON.parse(customPreviewUrlsRaw)
      : undefined,
  };

  const result = configSchema.safeParse(rawData);

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  try {
    await setUserConfig(session.user.username, result.data);
    revalidatePath(`/u/${session.user.username}`);
    revalidatePath("/dashboard");

    return { success: "Configurações salvas com sucesso!" };
  } catch {
    return { error: "Erro ao salvar configurações" };
  }
}
