import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession();

  if (!session?.user?.username) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let user = await db.user.findUnique({
      where: { username: session.user.username },
      include: { consents: true },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          githubId: `github_${session.user.username}`,
          username: session.user.username,
          name: session.user.name || null,
          email: session.user.email || null,
          avatarUrl: session.user.image || null,
          emailVerifiedAt: session.user.email ? new Date() : null,
        },
        include: { consents: true },
      });
    }

    return NextResponse.json({
      consents: user.consents || null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession();

  if (!session?.user?.username) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let user = await db.user.findUnique({
      where: { username: session.user.username },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          githubId: `github_${session.user.username}`,
          username: session.user.username,
          name: session.user.name || null,
          email: session.user.email || null,
          avatarUrl: session.user.image || null,
          emailVerifiedAt: session.user.email ? new Date() : null,
        },
      });
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

    return NextResponse.json({ consents: updated });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: (error as Error).message },
      { status: 500 }
    );
  }
}
