interface SkeletonProps {
  className?: string;
}

export function SkeletonPulse({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`bg-slate-800/50 rounded-lg animate-pulse ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({ className = "" }: SkeletonProps) {
  return <SkeletonPulse className={`h-3 ${className}`} />;
}

export function SkeletonTitle({ className = "" }: SkeletonProps) {
  return <SkeletonPulse className={`h-8 ${className}`} />;
}

export function SkeletonButton({ className = "" }: SkeletonProps) {
  return <SkeletonPulse className={`h-9 ${className}`} />;
}

export function SkeletonCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-slate-900/30 backdrop-blur-xl border border-slate-800/50 rounded-xl p-5 ${className}`}
    >
      {children}
    </div>
  );
}

export function SkeletonHeader() {
  return (
    <div className="mb-8 space-y-1 animate-pulse">
      <SkeletonTitle className="w-40" />
      <SkeletonText className="w-24 bg-slate-800/30" />
    </div>
  );
}

export function SkeletonProjectCard() {
  return (
    <SkeletonCard className="animate-pulse">
      <div className="space-y-3">
        <SkeletonPulse className="h-5 w-3/4" />
        <SkeletonText className="w-20 bg-slate-800/30" />
        <div className="flex gap-1.5">
          <SkeletonPulse className="h-5 w-16 bg-slate-800/30" />
          <SkeletonPulse className="h-5 w-16 bg-slate-800/30" />
        </div>
        <div className="flex gap-2 pt-1">
          <SkeletonButton className="w-20 bg-slate-800/40" />
          <SkeletonButton className="w-20 bg-slate-800/40" />
        </div>
      </div>
    </SkeletonCard>
  );
}

export function SkeletonPostCard() {
  return (
    <SkeletonCard className="animate-pulse">
      <div className="space-y-3">
        <SkeletonText className="w-28 bg-slate-800/30" />
        <SkeletonPulse className="h-5 w-3/4" />
        <SkeletonText className="w-full bg-slate-800/30" />
        <SkeletonText className="w-2/3 bg-slate-800/30" />
        <div className="flex gap-1.5">
          <SkeletonPulse className="h-5 w-16 bg-slate-800/30" />
          <SkeletonPulse className="h-5 w-16 bg-slate-800/30" />
        </div>
      </div>
    </SkeletonCard>
  );
}

export function SkeletonBackground() {
  return (
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
  );
}

export function SkeletonBlogPost() {
  return (
    <SkeletonCard className="p-6 md:p-8 rounded-xl shadow-xl">
      <div className="space-y-3 pb-6 mb-6 border-b border-slate-800/50 animate-pulse">
        <SkeletonText className="w-32 bg-slate-800/30" />
        <SkeletonTitle className="w-3/4" />
        <div className="space-y-2">
          <SkeletonText className="w-full bg-slate-800/30" />
          <SkeletonText className="w-2/3 bg-slate-800/30" />
        </div>
        <div className="flex gap-1.5">
          <SkeletonPulse className="h-5 w-16 bg-slate-800/30" />
          <SkeletonPulse className="h-5 w-16 bg-slate-800/30" />
        </div>
      </div>

      <div className="space-y-4 animate-pulse">
        <SkeletonText className="w-full bg-slate-800/30" />
        <SkeletonText className="w-5/6 bg-slate-800/30" />
        <SkeletonText className="w-4/5 bg-slate-800/30" />
        <SkeletonText className="w-full bg-slate-800/30" />
        <SkeletonText className="w-3/4 bg-slate-800/30" />
      </div>
    </SkeletonCard>
  );
}
