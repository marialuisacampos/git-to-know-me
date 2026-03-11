import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/auth";
import { syncUserData } from "@/lib/sync";

export async function POST() {
  try {
    const session = await getServerSession();

    if (!session?.user?.username) {
      return NextResponse.json(
        { error: "Unauthorized. Please login first." },
        { status: 401 }
      );
    }

    const username = session.user.username;
    const result = await syncUserData(username);

    revalidatePath(`/u/${username}`);
    revalidatePath(`/u/${username}/projects`);
    revalidatePath(`/u/${username}/blog`);

    return NextResponse.json(
      {
        ok: true,
        projects: Math.max(result.projects, 0),
        posts: Math.max(result.posts, 0),
        warnings: result.warnings.length > 0 ? result.warnings : undefined,
        message: `Sincronizados ${Math.max(result.projects, 0)} projetos e ${Math.max(result.posts, 0)} posts`,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Sync failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
