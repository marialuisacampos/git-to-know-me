export default function Loading() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "20s" }}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Article skeleton */}
        <article className="animate-pulse">
          <div className="relative bg-slate-900/30 backdrop-blur-xl border border-slate-800/50 rounded-xl p-6 md:p-8 shadow-xl">
            {/* Header skeleton */}
            <header className="space-y-3 pb-6 mb-6 border-b border-slate-800/50">
              <div className="h-3 bg-slate-800/30 rounded w-32" />
              <div className="h-8 bg-slate-800/50 rounded w-3/4" />
              <div className="space-y-2">
                <div className="h-3 bg-slate-800/30 rounded w-full" />
                <div className="h-3 bg-slate-800/30 rounded w-2/3" />
              </div>
              <div className="flex gap-1.5">
                <div className="h-5 bg-slate-800/30 rounded w-16" />
                <div className="h-5 bg-slate-800/30 rounded w-16" />
              </div>
            </header>

            {/* Content skeleton */}
            <div className="space-y-4">
              <div className="h-3 bg-slate-800/30 rounded w-full" />
              <div className="h-3 bg-slate-800/30 rounded w-5/6" />
              <div className="h-3 bg-slate-800/30 rounded w-4/5" />
              <div className="h-3 bg-slate-800/30 rounded w-full" />
              <div className="h-3 bg-slate-800/30 rounded w-3/4" />
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
