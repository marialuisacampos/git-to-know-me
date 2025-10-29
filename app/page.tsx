import { getServerSession } from "@/lib/auth";
import { AuthButton } from "@/components/AuthButton";
import { Logo } from "@/components/Logo";
import Link from "next/link";
import { Button } from "@/components/base-ui/Button";
import Image from "next/image";
import { BackgroundAnimation } from "@/components/BackgroundAnimation";

export default async function Home() {
  const session = await getServerSession();

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 overflow-hidden">
      <BackgroundAnimation />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6">
        <header className="pt-6 pb-12 flex justify-between items-center animate-in fade-in duration-500 ease-out">
          <div className="flex items-center gap-6">
            <Logo href="/" size="md" />
            <Link
              href="/getting-started"
              className="text-slate-500 hover:text-slate-300 transition-colors text-sm"
            >
              Como usar
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {session?.user && (
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
            )}
            <AuthButton />
          </div>
        </header>

        <div className="flex flex-col justify-center min-h-[calc(100vh-200px)] pb-20">
          <div className="space-y-4 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-100 leading-tight max-w-2xl">
              Transforme seu GitHub em um portfólio profissional
            </h1>

            <p className="text-base text-slate-400 max-w-xl leading-relaxed">
              Sincronize seus projetos automaticamente. Compartilhe seu
              trabalho. Destaque-se.
            </p>
          </div>

          {!session ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out delay-100">
              <AuthButton />

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
                <span>Grátis</span>
                <span className="text-slate-700">•</span>
                <span>2 minutos</span>
                <span className="text-slate-700">•</span>
                <span>Automático</span>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out delay-100">
              <div className="inline-flex items-center gap-3 bg-slate-900/30 backdrop-blur-xl border border-slate-800/50 rounded-2xl px-5 py-3">
                {session.user.image && (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-700/50">
                    <Image
                      src={session.user.image}
                      alt={session.user.name || session.user.username}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-200">
                    {session.user.name || session.user.username}
                  </p>
                  <p className="text-xs text-slate-500">
                    @{session.user.username}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href={`/u/${session.user.username}`}>
                  <Button variant="outline" size="sm">
                    Ver portfólio
                  </Button>
                </Link>

                <Link href="/dashboard">
                  <Button variant="primary" size="sm">
                    Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          )}

          <div className="space-y-3 pt-12 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out delay-200">
            <div className="flex items-start gap-3 group">
              <div className="w-1 h-1 rounded-full bg-blue-400/60 mt-2 group-hover:bg-blue-400 transition-colors" />
              <div>
                <h3 className="text-sm font-medium text-slate-300 group-hover:text-slate-100 transition-colors">
                  Sincronização automática
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Seus repos aparecem aqui sem esforço
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 group">
              <div className="w-1 h-1 rounded-full bg-purple-400/60 mt-2 group-hover:bg-purple-400 transition-colors" />
              <div>
                <h3 className="text-sm font-medium text-slate-300 group-hover:text-slate-100 transition-colors">
                  Personalize como quiser
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Escolha projetos, bio customizada, preview links
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 group">
              <div className="w-1 h-1 rounded-full bg-cyan-400/60 mt-2 group-hover:bg-cyan-400 transition-colors" />
              <div>
                <h3 className="text-sm font-medium text-slate-300 group-hover:text-slate-100 transition-colors">
                  Compartilhe seu trabalho
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Link único para mostrar em currículos e LinkedIn
                </p>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/getting-started"
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors group"
              >
                <span>Veja como funciona</span>
                <span className="group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </Link>
            </div>
          </div>

          <div className="pt-16 space-y-4 animate-in fade-in delay-300 motion-reduce:animate-none">
            <div className="flex justify-center">
              <Logo size="sm" />
            </div>
            <p className="text-slate-600 text-xs text-center">
              Desenvolvido por @marialuisacampos
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
