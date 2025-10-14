export default function Loading() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "8s" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "12s", animationDelay: "2s" }}
        />
      </div>

      {/* Loading content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-6">
        <div className="w-full max-w-3xl">
          <div className="relative bg-slate-900/30 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-8 md:p-10 shadow-xl animate-pulse">
            {/* Skeleton content */}
            <div className="space-y-6">
              {/* Name skeleton */}
              <div className="space-y-2">
                <div className="h-10 bg-slate-800/50 rounded-lg w-64" />
                <div className="h-4 bg-slate-800/30 rounded w-32" />
              </div>

              {/* Bio skeleton */}
              <div className="space-y-2">
                <div className="h-3 bg-slate-800/30 rounded w-full max-w-xl" />
                <div className="h-3 bg-slate-800/30 rounded w-4/5 max-w-xl" />
              </div>

              {/* Buttons skeleton */}
              <div className="flex gap-3 pt-4">
                <div className="h-9 bg-slate-800/40 rounded-lg w-28" />
                <div className="h-9 bg-slate-800/40 rounded-lg w-24" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
