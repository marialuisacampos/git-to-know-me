import { notFound } from "next/navigation";
import { Metadata } from "next";
import { NavUser } from "@/components/NavUser";
import { ClaimProfile } from "@/components/ClaimProfile";
import { ShareButton } from "@/components/ShareButton";
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

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username, slug } = await params;

  const post = await getUserPost(username, slug);

  if (!post) {
    return {
      title: "Post não encontrado",
    };
  }

  const postUrl = `https://gittoknowme.com.br/u/${username}/blog/${slug}`;

  return {
    title: `${post.title} | @${username}`,
    description: post.summary || `Post por @${username}`,
    openGraph: {
      title: post.title,
      description: post.summary || `Post por @${username}`,
      url: postUrl,
      siteName: "Git to know me",
      type: "article",
      publishedTime: post.publishedAt,
      authors: [username],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
    },
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

  const postUrl = `https://gittoknowme.com.br/u/${username}/blog/${slug}`;

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

              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100 leading-tight">
                {post.title}
              </h1>

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

            <footer className="mt-12 pt-8 border-t border-slate-800/50 space-y-4">
              <div>
                <p className="text-sm text-slate-400 mb-3">
                  Gostou do post? Compartilhe:
                </p>
                <ShareButton
                  url={postUrl}
                  title={post.title}
                  summary={post.summary}
                />
              </div>

              <p className="text-xs text-slate-600">
                Criado com git-to-know-me - transforme seus repos do GitHub em
                portfólio
              </p>
            </footer>
          </div>
        </article>
      </div>
    </main>
  );
}
