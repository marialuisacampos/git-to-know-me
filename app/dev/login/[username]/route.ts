import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

interface RouteParams {
  params: Promise<{
    username: string;
  }>;
}

/**
 * Route Handler de desenvolvimento para simular login
 * Apenas disponível em modo dev (NODE_ENV !== production)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  // Bloquear em produção
  if (process.env.NODE_ENV === "production") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Await params (Next.js 15)
  const { username } = await params;

  // Criar cookie de sessão fake
  const cookieStore = await cookies();

  // Sessão fake no formato NextAuth
  const fakeSession = {
    user: {
      name: username,
      email: `${username}@fake.dev`,
      image: `https://avatars.githubusercontent.com/u/765350?v=4`,
      username: username,
    },
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
  };

  // Salvar no cookie (formato simplificado para dev)
  cookieStore.set("dev-session", JSON.stringify(fakeSession), {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
    path: "/",
  });

  // Redirecionar para dashboard
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
