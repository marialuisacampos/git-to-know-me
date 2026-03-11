"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/auth";
import { syncUserData } from "@/lib/sync";

export async function syncGitHubAction() {
  const session = await getServerSession();

  if (!session?.user?.username) {
    return { error: "Não autenticado" };
  }

  try {
    const username = session.user.username;
    const result = await syncUserData(username);

    revalidatePath(`/u/${username}`);
    revalidatePath(`/u/${username}/projects`);
    revalidatePath(`/u/${username}/blog`);
    revalidatePath("/dashboard");

    if (result.warnings.length > 0) {
      return {
        success: "Sincronização parcial concluída.",
        projects: Math.max(result.projects, 0),
        posts: Math.max(result.posts, 0),
        warnings: result.warnings,
      };
    }

    return {
      success: "Sincronização concluída!",
      projects: result.projects,
      posts: result.posts,
    };
  } catch {
    return { error: "Erro ao sincronizar com o GitHub" };
  }
}
