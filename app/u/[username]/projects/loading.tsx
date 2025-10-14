export default function Loading() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "10s" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header skeleton */}
        <div className="mb-8 space-y-1">
          <div className="h-8 bg-slate-800/50 rounded w-40 animate-pulse" />
          <div className="h-3 bg-slate-800/30 rounded w-24 animate-pulse" />
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-slate-900/30 backdrop-blur-xl border border-slate-800/50 rounded-xl p-5 animate-pulse"
            >
              <div className="space-y-3">
                <div className="h-5 bg-slate-800/50 rounded w-3/4" />
                <div className="h-4 bg-slate-800/30 rounded w-20" />
                <div className="flex gap-1.5">
                  <div className="h-5 bg-slate-800/30 rounded w-16" />
                  <div className="h-5 bg-slate-800/30 rounded w-16" />
                </div>
                <div className="flex gap-2 pt-1">
                  <div className="h-8 bg-slate-800/40 rounded w-20" />
                  <div className="h-8 bg-slate-800/40 rounded w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
