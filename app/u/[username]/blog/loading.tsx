export default function Loading() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "12s" }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header skeleton */}
        <div className="mb-8 space-y-1">
          <div className="h-8 bg-slate-800/50 rounded w-32 animate-pulse" />
          <div className="h-3 bg-slate-800/30 rounded w-24 animate-pulse" />
        </div>

        {/* Post cards skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-slate-900/30 backdrop-blur-xl border border-slate-800/50 rounded-xl p-5 animate-pulse"
            >
              <div className="space-y-3">
                <div className="h-3 bg-slate-800/30 rounded w-28" />
                <div className="h-5 bg-slate-800/50 rounded w-3/4" />
                <div className="h-3 bg-slate-800/30 rounded w-full" />
                <div className="h-3 bg-slate-800/30 rounded w-2/3" />
                <div className="flex gap-1.5">
                  <div className="h-5 bg-slate-800/30 rounded w-16" />
                  <div className="h-5 bg-slate-800/30 rounded w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
