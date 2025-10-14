import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Página de ferramentas de desenvolvimento
 * Apenas disponível em modo dev
 */
export default function DevToolsPage() {
  // Bloquear em produção
  if (process.env.NODE_ENV === "production") {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            🛠️ Dev Tools
          </h1>
          <p className="text-slate-400 text-lg">
            Ferramentas de desenvolvimento (apenas em dev)
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6">
          {/* Login Fake */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-100 mb-2">
                  🔑 Login Fake
                </h2>
                <p className="text-slate-400">
                  Simule login como qualquer usuário sem OAuth
                </p>
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-3">
                  Usuários disponíveis:
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Link href="/dev/login/demouser">
                    <Button
                      variant="outline"
                      className="bg-blue-600/20 border-blue-500/50 hover:bg-blue-600/30 text-blue-100"
                    >
                      Login como demouser
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                <p className="text-xs text-slate-400 mb-2">
                  <strong className="text-slate-300">Nota:</strong> Após o
                  login, você terá acesso ao dashboard como se fosse o usuário.
                </p>
                <p className="text-xs text-slate-500">
                  Para logout, limpe os cookies ou reinicie o servidor.
                </p>
              </div>
            </div>
          </div>

          {/* Seed Data */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-100 mb-2">
                  🌱 Seed Data
                </h2>
                <p className="text-slate-400">
                  Popular dados fake no KV para desenvolvimento
                </p>
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
                <code className="text-sm text-green-400">npm run seed:kv</code>
              </div>

              <div className="text-sm text-slate-400">
                <p className="mb-2">
                  Cria o usuário{" "}
                  <strong className="text-slate-300">demouser</strong> com:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Bio personalizada</li>
                  <li>2 projetos (awesome-portfolio + design-system)</li>
                  <li>1 post de blog</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Links Úteis */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-6">
              🔗 Links Úteis
            </h2>

            <div className="grid gap-4">
              <Link
                href="/u/demouser"
                className="block p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-100">
                      Perfil demouser
                    </p>
                    <p className="text-sm text-slate-400">/u/demouser</p>
                  </div>
                  <svg
                    className="w-5 h-5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>

              <Link
                href="/dashboard"
                className="block p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-100">Dashboard</p>
                    <p className="text-sm text-slate-400">Requer login</p>
                  </div>
                  <svg
                    className="w-5 h-5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Link href="/">
            <Button variant="ghost" className="text-slate-400">
              ← Voltar para home
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

export const metadata = {
  title: "Dev Tools - Git to know me",
  description: "Ferramentas de desenvolvimento",
};
