import Link from "next/link";
import { HiFolder, HiBookOpen, HiExternalLink } from "react-icons/hi";

interface EmptyStateProps {
  icon: "folder" | "book";
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="max-w-sm text-center space-y-4">
        <div className="flex justify-center">
          {icon === "folder" ? (
            <HiFolder className="w-12 h-12 text-slate-700" />
          ) : (
            <HiBookOpen className="w-12 h-12 text-slate-700" />
          )}
        </div>

        <h3 className="text-lg font-semibold text-slate-400">{title}</h3>

        <p className="text-sm text-slate-500">{description}</p>

        {actionLabel && actionHref && (
          <Link
            href={actionHref}
            target={actionHref.startsWith("http") ? "_blank" : undefined}
            rel={
              actionHref.startsWith("http") ? "noopener noreferrer" : undefined
            }
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-300 transition-colors mt-4"
          >
            {actionLabel}
            <HiExternalLink className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
