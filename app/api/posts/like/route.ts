import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import {
  getPostLikesCount,
  hasAlreadyLiked,
  toggleLike,
  getPostIdBySlug,
} from "@/lib/db/likes";

function generateFingerprint(ip: string, ua: string): string {
  const raw = `${ip}:${ua}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

async function resolvePostId(request: NextRequest): Promise<string | null> {
  const { searchParams } = new URL(request.url);

  const postId = searchParams.get("postId");
  if (postId) return postId;

  const username = searchParams.get("username");
  const slug = searchParams.get("slug");
  if (username && slug) {
    return getPostIdBySlug(username, slug);
  }

  return null;
}

async function getFingerprint(): Promise<string> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown";
  const ua = h.get("user-agent") || "unknown";
  return generateFingerprint(ip, ua);
}

export async function GET(request: NextRequest) {
  const postId = await resolvePostId(request);
  if (!postId) {
    return NextResponse.json(
      { error: "postId ou username+slug obrigatório" },
      { status: 400 }
    );
  }

  try {
    const fingerprint = await getFingerprint();
    const [likesCount, liked] = await Promise.all([
      getPostLikesCount(postId),
      hasAlreadyLiked(postId, fingerprint),
    ]);

    return NextResponse.json({ likesCount, liked });
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar likes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const postId = await resolvePostId(request);
  if (!postId) {
    return NextResponse.json(
      { error: "postId ou username+slug obrigatório" },
      { status: 400 }
    );
  }

  try {
    const fingerprint = await getFingerprint();
    const result = await toggleLike(postId, fingerprint);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Erro ao registrar like" },
      { status: 500 }
    );
  }
}
