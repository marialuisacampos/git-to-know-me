import { notFound } from "next/navigation";
import { NavUser } from "@/components/NavUser";
import { ClaimProfile } from "@/components/ClaimProfile";
import { getUserPost } from "@/lib/db/posts";
import { isUserRegistered } from "@/lib/db/users";
import { getGitHubUser } from "@/lib/github";
import { MarkdownPreview } from "@/components/MarkdownPreview";

interface PageProps {
  params: {
    username: string;
    slug: string;
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { username, slug } = await params;

  const registered = await isUserRegistered(username);
  if (!registered) {
    return <ClaimProfile username={username} />;
  }

  const githubUser = await getGitHubUser(username);
  if (!githubUser) {
    return <ClaimProfile username={username} />;
  }

  const post = await getUserPost(username, slug);

  if (!post) {
    notFound();
  }

  const publishedDate = new Date(post.publishedAt).toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "20s" }}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="animate-in fade-in slide-in-from-top-4 duration-700">
          <NavUser username={username} currentPage="blog" />
        </div>

        <article className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <div className="relative bg-slate-900/30 backdrop-blur-xl border border-slate-800/50 rounded-xl p-6 md:p-8 shadow-xl">
            <header className="space-y-3 pb-6 mb-6 border-b border-slate-800/50">
              <time
                dateTime={post.publishedAt}
                className="block text-xs text-slate-500"
              >
                {publishedDate}
              </time>

              {post.summary && (
                <p className="text-sm text-slate-400 leading-relaxed">
                  {post.summary}
                </p>
              )}

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-purple-500/10 text-purple-400/80 border border-purple-500/20"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            <MarkdownPreview source={post.contentMdx} />
          </div>
        </article>
      </div>
    </main>
  );
}
