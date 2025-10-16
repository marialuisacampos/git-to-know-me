import Link from "next/link";
import type { PostMeta } from "@/types/portfolio";

interface PostCardProps {
  post: PostMeta;
  username: string;
}

export function PostCard({ post, username }: PostCardProps) {
  const publishedDate = new Date(post.publishedAt).toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link
      href={`/u/${username}/blog/${post.slug}`}
      className="group relative block overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.01]"
    >
      <div className="relative h-full bg-slate-900/30 backdrop-blur-xl border border-slate-800/50 group-hover:border-slate-700/80 rounded-xl p-5 transition-all duration-300">
        <div className="relative space-y-3">
          <time
            dateTime={post.publishedAt}
            className="block text-xs text-slate-500"
          >
            {publishedDate}
          </time>

          <h2 className="text-base font-semibold text-slate-100 group-hover:text-white transition-colors duration-300 line-clamp-2 leading-snug">
            {post.title}
          </h2>

          {post.summary && (
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
              {post.summary}
            </p>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-purple-500/10 text-purple-400/80 border border-purple-500/20"
                >
                  #{tag}
                </span>
              ))}
              {post.tags.length > 3 && (
                <span className="inline-flex items-center px-2 py-0.5 text-xs text-slate-600">
                  +{post.tags.length - 3}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center gap-1.5 pt-1 text-xs text-slate-500 group-hover:text-slate-400 transition-colors duration-300">
            <span>Ler artigo</span>
            <svg
              className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-300"
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
          </div>
        </div>
      </div>
    </Link>
  );
}
