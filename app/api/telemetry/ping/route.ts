import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * POST /api/telemetry/ping
 * Atualiza lastSeenAt para telemetria de atividade
 */
export async function POST() {
  const session = await getServerSession();

  // Anônimos são ignorados
  if (!session?.user?.username) {
    return NextResponse.json({ ok: true });
  }

  try {
    const user = await db.user.findUnique({
      where: { username: session.user.username },
    });

    if (!user) {
      return NextResponse.json({ ok: true });
    }

    // Atualizar lastSeenAt
    await db.activity.update({
      where: { userId: user.id },
      data: { lastSeenAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao atualizar telemetria:", error);
    // Não falhar silenciosamente
    return NextResponse.json({ ok: true });
  }
}
