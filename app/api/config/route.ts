import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/auth";
import { setUserConfig } from "@/lib/kv";
import { z } from "zod";

// Schema de validação
const configSchema = z.object({
  bio: z.string().max(240).optional(),
  includeRepos: z.array(z.string()).optional(),
  excludeRepos: z.array(z.string()).optional(),
  customPreviewUrls: z.record(z.string(), z.string().url()).optional(),
});

/**
 * POST /api/config
 * Salva configurações do usuário
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Autenticar
    const session = await getServerSession();

    if (!session?.user?.username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const username = session.user.username;

    // 2. Parsear e validar body
    const body = await request.json();
    const result = configSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid data", details: result.error.issues },
        { status: 400 }
      );
    }

    // 3. Salvar no KV
    await setUserConfig(username, result.data);

    // 4. Revalidar páginas públicas
    revalidatePath(`/u/${username}`);
    revalidatePath(`/u/${username}/projects`);
    revalidatePath(`/u/${username}/blog`);

    console.log(`[Config] Configurações salvas para ${username}`);

    return NextResponse.json({
      ok: true,
      message: "Configurações salvas com sucesso",
    });
  } catch (error) {
    console.error("[Config] Erro ao salvar:", error);
    return NextResponse.json(
      {
        error: "Failed to save configuration",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
