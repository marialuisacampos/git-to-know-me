import {
  SkeletonBackground,
  SkeletonCard,
  SkeletonTitle,
  SkeletonText,
  SkeletonButton,
} from "@/components/skeleton/SkeletonBase";

export default function Loading() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <SkeletonBackground />

      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-6">
        <div className="w-full max-w-3xl">
          <SkeletonCard className="p-8 md:p-10 rounded-2xl animate-pulse">
            <div className="space-y-6">
              <div className="space-y-2">
                <SkeletonTitle className="h-10 w-64" />
                <SkeletonText className="h-4 w-32 bg-slate-700/50" />
              </div>

              <div className="space-y-2">
                <SkeletonText className="w-full max-w-xl bg-slate-700/50" />
                <SkeletonText className="w-4/5 max-w-xl bg-slate-700/50" />
              </div>

              <div className="flex gap-3 pt-4">
                <SkeletonButton className="w-28" />
                <SkeletonButton className="w-24" />
              </div>
            </div>
          </SkeletonCard>
        </div>
      </div>
    </main>
  );
}
