import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "ref"];

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const res = NextResponse.next();

  // Se houver UTM/ref na URL, persistir em cookies (expira em 30 dias)
  for (const key of UTM_KEYS) {
    const value = url.searchParams.get(key);
    if (value) {
      res.cookies.set(key, value, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 dias
        httpOnly: false, // Permitir acesso do client se necessário
        sameSite: "lax",
      });
    }
  }

  return res;
}

// Configurar para rodar em todas as rotas (ou especificar matcher)
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
