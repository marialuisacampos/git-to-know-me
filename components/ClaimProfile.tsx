import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ClaimProfileProps {
  username: string;
}

export function ClaimProfile({ username }: ClaimProfileProps) {
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="max-w-lg text-center space-y-6">
        {/* Ícone */}
        <div className="flex justify-center">
          <svg
            className="w-20 h-20 text-slate-800"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>

        {/* Título */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100">
            Este perfil ainda não existe
          </h1>
          <p className="text-slate-500">@{username}</p>
        </div>

        {/* Descrição */}
        <p className="text-slate-400 leading-relaxed">
          Para criar uma página pública e compartilhar seus projetos e artigos,
          entre com sua conta do GitHub e conecte seu perfil.
        </p>

        {/* CTA */}
        <div className="pt-4">
          <Button
            asChild
            size="lg"
            className="bg-slate-800 hover:bg-slate-700 text-slate-100"
          >
            <Link href="/api/auth/signin">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Entrar com GitHub
            </Link>
          </Button>
        </div>

        {/* Info adicional */}
        <p className="text-xs text-slate-600 pt-4">
          Você é @{username}?{" "}
          <Link
            href="/api/auth/signin"
            className="text-slate-500 hover:text-slate-400 underline"
          >
            Faça login
          </Link>{" "}
          para reivindicar este perfil.
        </p>
      </div>
    </main>
  );
}
