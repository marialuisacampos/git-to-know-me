export default function Loading() {
  return (
    <main className="relative min-h-screen bg-slate-950">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute top-60 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header skeleton */}
        <div className="mb-10 animate-pulse">
          <div className="h-9 bg-slate-800/50 rounded-lg w-48 mb-2" />
          <div className="h-4 bg-slate-800/30 rounded w-32" />
        </div>

        {/* Form skeleton */}
        <div className="space-y-6">
          {/* Sync section */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6 animate-pulse">
            <div className="h-5 bg-slate-800/50 rounded w-48 mb-1" />
            <div className="h-3 bg-slate-800/30 rounded w-56" />
          </div>

          {/* Bio section */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6 animate-pulse">
            <div className="h-5 bg-slate-800/50 rounded w-20 mb-1" />
            <div className="h-3 bg-slate-800/30 rounded w-40 mb-4" />
            <div className="h-24 bg-slate-800/40 rounded-lg" />
          </div>

          {/* Repos section */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6 animate-pulse">
            <div className="h-5 bg-slate-800/50 rounded w-32 mb-1" />
            <div className="h-3 bg-slate-800/30 rounded w-56 mb-6" />

            {/* Filter mode */}
            <div className="mb-6 p-4 bg-slate-800/20 rounded-lg">
              <div className="h-3 bg-slate-800/40 rounded w-full max-w-md" />
            </div>

            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-4 bg-slate-800/20 rounded-lg space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-5 bg-slate-800/50 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <div className="h-4 bg-slate-800/40 rounded w-40" />
                      <div className="h-3 bg-slate-800/30 rounded w-24" />
                    </div>
                  </div>
                  <div className="pl-8">
                    <div className="h-3 bg-slate-800/30 rounded w-20 mb-2" />
                    <div className="h-8 bg-slate-800/40 rounded-md w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6 animate-pulse">
            <div className="flex gap-3">
              <div className="h-9 bg-slate-800/50 rounded-lg w-28" />
              <div className="h-9 bg-slate-800/50 rounded-lg w-28" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
