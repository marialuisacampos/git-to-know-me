import { notFound } from "next/navigation";
import { NavUser } from "@/components/NavUser";
import { ClaimProfile } from "@/components/ClaimProfile";
import { getUserPosts, getUserConfig, isUserRegistered } from "@/lib/kv";
import { getGitHubUser } from "@/lib/github";
import { mdToHtml } from "@/lib/markdown";

interface PageProps {
  params: {
    username: string;
    slug: string;
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { username, slug } = await params;

  // 1. Verificar registro
  const registered = await isUserRegistered(username);
  if (!registered) {
    return <ClaimProfile username={username} />;
  }

  // 2. Verificar existência
  const githubUser = await getGitHubUser(username);
  if (!githubUser) {
    return <ClaimProfile username={username} />;
  }

  // 3. Buscar post
  const posts = await getUserPosts(username);
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  // 4. Converter MDX
  const contentHtml = await mdToHtml(post.contentMdx);

  const publishedDate = new Date(post.publishedAt).toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Ambient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "20s" }}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Nav */}
        <div className="animate-in fade-in slide-in-from-top-4 duration-700">
          <NavUser username={username} currentPage="blog" />
        </div>

        {/* Article minimalista */}
        <article className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <div className="relative bg-slate-900/30 backdrop-blur-xl border border-slate-800/50 rounded-xl p-6 md:p-8 shadow-xl">
            {/* Header */}
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

            {/* Content com tipografia refinada */}
            <div
              className="prose prose-invert prose-slate prose-sm max-w-none
                prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-slate-100
                prose-h1:text-2xl prose-h1:mb-4 prose-h1:mt-6
                prose-h2:text-xl prose-h2:mb-3 prose-h2:mt-6
                prose-h3:text-base prose-h3:mb-2 prose-h3:mt-4
                prose-p:text-slate-400 prose-p:leading-relaxed
                prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-a:transition-colors
                prose-strong:text-slate-200 prose-strong:font-medium
                prose-code:text-pink-400 prose-code:bg-slate-800/60 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-[''] prose-code:after:content-['']
                prose-pre:bg-slate-900/50 prose-pre:border prose-pre:border-slate-800/50 prose-pre:rounded-lg prose-pre:p-4 prose-pre:text-xs
                prose-ul:text-slate-400 prose-ol:text-slate-400 prose-li:text-slate-400
                prose-blockquote:border-l-2 prose-blockquote:border-purple-500/30 prose-blockquote:pl-4 prose-blockquote:text-slate-500 prose-blockquote:italic
                prose-img:rounded-lg prose-img:border prose-img:border-slate-800/50
                prose-hr:border-slate-800/30"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          </div>
        </article>
      </div>
    </main>
  );
}

// Metadata
export async function generateMetadata({ params }: PageProps) {
  const { username, slug } = await params;

  const [githubUser, posts, userConfig] = await Promise.all([
    getGitHubUser(username),
    getUserPosts(username),
    getUserConfig(username),
  ]);

  if (!githubUser) {
    return {
      title: "Post não encontrado",
    };
  }

  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: "Post não encontrado",
    };
  }

  const displayName = githubUser.name || githubUser.login;
  const bio = userConfig.bio || githubUser.bio;

  return {
    title: `${post.title} - ${displayName}`,
    description: post.summary || bio || `Artigo por ${displayName}`,
  };
}
