import Link from "next/link";
import { HiUser } from "react-icons/hi";
import { FaGithub } from "react-icons/fa";
import { Button } from "@/components/base-ui/Button";

interface ClaimProfileProps {
  username: string;
}

export function ClaimProfile({ username }: ClaimProfileProps) {
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="max-w-lg text-center space-y-6">
        <div className="flex justify-center">
          <HiUser className="w-20 h-20 text-slate-800" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100">
            Este perfil ainda não existe
          </h1>
          <p className="text-slate-500">@{username}</p>
        </div>

        <p className="text-slate-400 leading-relaxed">
          Para criar uma página pública e compartilhar seus projetos e artigos,
          entre com sua conta do GitHub e conecte seu perfil.
        </p>

        <div className="pt-4">
          <Button asChild size="lg" variant="outline">
            <Link href="/api/auth/signin">
              <FaGithub className="w-5 h-5 mr-2" />
              Entrar com GitHub
            </Link>
          </Button>
        </div>

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
