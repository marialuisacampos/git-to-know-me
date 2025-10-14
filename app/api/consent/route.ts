import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET /api/consent
 * Retorna estado atual dos consentimentos do usuário logado
 */
export async function GET() {
  const session = await getServerSession();

  if (!session?.user?.username) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Buscar ou criar usuário (caso tenha logado antes da migration)
    let user = await db.user.findUnique({
      where: { username: session.user.username },
      include: { consents: true },
    });

    // Se usuário não existe no Postgres, criar agora
    if (!user) {
      console.log(
        `[Consent] Usuário ${session.user.username} não existe, criando...`
      );

      user = await db.user.create({
        data: {
          githubId: `github_${session.user.username}`, // Fallback temporário
          username: session.user.username,
          name: session.user.name || null,
          email: session.user.email || null,
          avatarUrl: session.user.image || null,
          emailVerifiedAt: session.user.email ? new Date() : null,
        },
        include: { consents: true },
      });

      // Criar Activity inicial
      await db.activity.create({
        data: {
          userId: user.id,
          firstSeenAt: new Date(),
          lastSeenAt: new Date(),
          signupSource: "direct",
        },
      });
    }

    return NextResponse.json({
      consents: user.consents || null,
    });
  } catch (error) {
    console.error("Erro ao buscar consentimentos:", error);
    return NextResponse.json(
      { error: "Internal server error", details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/consent
 * Atualiza consentimentos do usuário logado
 */
export async function POST(req: Request) {
  const session = await getServerSession();

  if (!session?.user?.username) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Buscar ou criar usuário (caso tenha logado antes da migration)
    let user = await db.user.findUnique({
      where: { username: session.user.username },
    });

    // Se usuário não existe no Postgres, criar agora
    if (!user) {
      console.log(
        `[Consent] Usuário ${session.user.username} não existe, criando...`
      );

      user = await db.user.create({
        data: {
          githubId: `github_${session.user.username}`, // Fallback temporário
          username: session.user.username,
          name: session.user.name || null,
          email: session.user.email || null,
          avatarUrl: session.user.image || null,
          emailVerifiedAt: session.user.email ? new Date() : null,
        },
      });

      // Criar Activity inicial
      await db.activity.create({
        data: {
          userId: user.id,
          firstSeenAt: new Date(),
          lastSeenAt: new Date(),
          signupSource: "direct",
        },
      });

      console.log(
        `[Consent] Usuário ${session.user.username} criado com sucesso`
      );
    }

    const body = (await req.json()) as {
      emailOptIn?: boolean;
      acceptPrivacy?: boolean;
      acceptTos?: boolean;
    };

    const { emailOptIn, acceptPrivacy, acceptTos } = body;
    const now = new Date();

    const updated = await db.consent.upsert({
      where: { userId: user.id },
      update: {
        emailOptIn: emailOptIn ?? undefined,
        privacyConsentAt: acceptPrivacy ? now : undefined,
        tosAcceptedAt: acceptTos ? now : undefined,
      },
      create: {
        userId: user.id,
        emailOptIn: !!emailOptIn,
        privacyConsentAt: acceptPrivacy ? now : null,
        tosAcceptedAt: acceptTos ? now : null,
      },
    });

    console.log(
      `[Consent] Consentimentos atualizados para ${session.user.username}`
    );

    return NextResponse.json({ consents: updated });
  } catch (error) {
    console.error("Erro ao atualizar consentimentos:", error);
    return NextResponse.json(
      { error: "Internal server error", details: (error as Error).message },
      { status: 500 }
    );
  }
}
