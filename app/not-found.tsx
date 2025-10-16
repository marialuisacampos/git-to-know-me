import Link from "next/link";
import { Button } from "@/components/base-ui/Button";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-6">
        <div className="text-7xl font-black text-slate-900">404</div>

        <h1 className="text-2xl font-bold text-slate-100">
          Página não encontrada
        </h1>

        <p className="text-slate-400">
          A página que você está procurando não existe ou foi removida.
        </p>

        <div className="pt-4">
          <Button asChild variant="outline">
            <Link href="/">Voltar para home</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

export const metadata = {
  title: "404 - Página não encontrada",
  description: "A página que você procura não existe.",
};
