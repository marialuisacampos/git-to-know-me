import {
  SkeletonPulse,
  SkeletonText,
  SkeletonTitle,
  SkeletonButton,
  SkeletonCard,
} from "@/components/skeleton/SkeletonBase";

export default function Loading() {
  return (
    <main className="relative min-h-screen bg-slate-950">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute top-60 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-10 animate-pulse">
          <SkeletonTitle className="h-9 w-48 mb-2" />
          <SkeletonText className="h-4 w-32 bg-slate-800/30" />
        </div>

        <div className="space-y-6">
          <SkeletonCard className="p-6 animate-pulse">
            <SkeletonPulse className="h-5 w-48 mb-1" />
            <SkeletonText className="w-56 bg-slate-800/30" />
          </SkeletonCard>

          <SkeletonCard className="p-6 animate-pulse">
            <SkeletonPulse className="h-5 w-20 mb-1" />
            <SkeletonText className="w-40 bg-slate-800/30 mb-4" />
            <SkeletonPulse className="h-24 rounded-lg" />
          </SkeletonCard>

          <SkeletonCard className="p-6 animate-pulse">
            <SkeletonPulse className="h-5 w-32 mb-1" />
            <SkeletonText className="w-56 bg-slate-800/30 mb-6" />

            <div className="mb-6 p-4 bg-slate-800/20 rounded-lg">
              <SkeletonText className="w-full max-w-md bg-slate-800/40" />
            </div>

            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-4 bg-slate-800/20 rounded-lg space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <SkeletonPulse className="w-10 h-5 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <SkeletonPulse className="h-4 w-40" />
                      <SkeletonText className="w-24 bg-slate-800/30" />
                    </div>
                  </div>
                  <div className="pl-8">
                    <SkeletonText className="w-20 bg-slate-800/30 mb-2" />
                    <SkeletonPulse className="h-8 rounded-md bg-slate-800/40" />
                  </div>
                </div>
              ))}
            </div>
          </SkeletonCard>

          <SkeletonCard className="p-6 animate-pulse">
            <div className="flex gap-3">
              <SkeletonButton className="w-28" />
              <SkeletonButton className="w-28" />
            </div>
          </SkeletonCard>
        </div>
      </div>
    </main>
  );
}
