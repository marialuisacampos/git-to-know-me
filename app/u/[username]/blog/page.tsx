import { NavUser } from "@/components/NavUser";
import { EmptyState } from "@/components/EmptyState";
import { ClaimProfile } from "@/components/ClaimProfile";
import { PostCard } from "@/components/PostCard";
import { getUserPosts } from "@/lib/db/posts";
import { isUserRegistered } from "@/lib/db/users";
import { getGitHubUser } from "@/lib/github";

interface PageProps {
  params: {
    username: string;
  };
}

export default async function BlogPage({ params }: PageProps) {
  const { username } = await params;

  const registered = await isUserRegistered(username);
  if (!registered) {
    return <ClaimProfile username={username} />;
  }

  const githubUser = await getGitHubUser(username);
  if (!githubUser) {
    return <ClaimProfile username={username} />;
  }

  const posts = await getUserPosts(username);

  const sortedPosts = [...posts].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "12s" }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "18s", animationDelay: "4s" }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="animate-in fade-in slide-in-from-top-4 duration-700">
          <NavUser username={username} currentPage="blog" />
        </div>

        <div className="mb-8 space-y-1 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100">
            Blog
          </h1>
          <p className="text-xs text-slate-500">
            {sortedPosts.length}{" "}
            {sortedPosts.length === 1 ? "artigo" : "artigos"}
          </p>
        </div>

        <div className="animate-in fade-in duration-700 delay-200">
          {sortedPosts.length > 0 ? (
            <div className="space-y-4">
              {sortedPosts.map((post) => (
                <PostCard key={post.slug} post={post} username={username} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="book"
              title="Nenhum artigo publicado"
              description="Este usuário ainda não publicou nenhum artigo no blog ou não sincronizou seu conteúdo."
              actionLabel="Ver repositório de posts"
              actionHref={`https://github.com/${username}/blog-posts`}
            />
          )}
        </div>
      </div>
    </main>
  );
}
