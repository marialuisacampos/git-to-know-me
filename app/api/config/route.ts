import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/auth";
import { setUserConfig } from "@/lib/db/config";
import { z } from "zod";

const configSchema = z.object({
  bio: z.string().max(240).optional(),
  includeRepos: z.array(z.string()).optional(),
  excludeRepos: z.array(z.string()).optional(),
  customPreviewUrls: z.record(z.string(), z.string().url()).optional(),
  twitterUrl: z.string().url().optional().or(z.literal("")),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  instagramUrl: z.string().url().optional().or(z.literal("")),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const username = session.user.username;

    const body = await request.json();
    const result = configSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid data", details: result.error.issues },
        { status: 400 }
      );
    }

    await setUserConfig(username, result.data);

    revalidatePath(`/u/${username}`);
    revalidatePath(`/u/${username}/projects`);
    revalidatePath(`/u/${username}/blog`);

    return NextResponse.json({
      ok: true,
      message: "Configurações salvas com sucesso",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to save configuration",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
