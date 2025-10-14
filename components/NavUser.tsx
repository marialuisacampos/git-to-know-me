import Link from "next/link";

interface NavUserProps {
  username: string;
  currentPage?: "profile" | "projects" | "blog";
}

export function NavUser({ username, currentPage }: NavUserProps) {
  return (
    <nav
      className="mb-8 flex items-center justify-between gap-3 text-sm"
      aria-label="Navegação do perfil"
    >
      <div className="flex items-center gap-3">
        {/* Voltar */}
        {currentPage && currentPage !== "profile" && (
          <Link
            href={`/u/${username}`}
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors group"
          >
            <svg
              className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform motion-reduce:transition-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Voltar
          </Link>
        )}

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-slate-500">
          <Link
            href={`/u/${username}`}
            className="hover:text-slate-300 transition-colors"
          >
            @{username}
          </Link>

          {currentPage === "projects" && (
            <>
              <span>/</span>
              <span className="text-slate-300">projetos</span>
            </>
          )}

          {currentPage === "blog" && (
            <>
              <span>/</span>
              <span className="text-slate-300">blog</span>
            </>
          )}
        </div>
      </div>

      {/* CTA discreto */}
      <Link
        href="/"
        className="group flex items-center gap-1 text-xs text-slate-600 hover:text-slate-400 transition-colors duration-150"
      >
        <span>Crie o seu</span>
        <svg
          className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
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
      </Link>
    </nav>
  );
}
