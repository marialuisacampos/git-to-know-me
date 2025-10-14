import Link from "next/link";
import { AuthButton } from "@/components/AuthButton";
import { ProfileSettings } from "@/components/ProfileSettings";
import { ClaimProfile } from "@/components/ClaimProfile";
import { getGitHubUser } from "@/lib/github";
import { getUserConfig, isUserRegistered, getUserPosts } from "@/lib/kv";
import { getServerSession } from "@/lib/auth";

interface PageProps {
  params: {
    username: string;
  };
}

export default async function UserPage({ params }: PageProps) {
  const { username } = await params;

  // 1. Verificar registro
  const registered = await isUserRegistered(username);
  if (!registered) {
    return <ClaimProfile username={username} />;
  }

  // 2. Buscar dados
  const githubUser = await getGitHubUser(username);
  if (!githubUser) {
    return <ClaimProfile username={username} />;
  }

  const session = await getServerSession();
  const isOwnProfile = session?.user?.username === username;

  // 3. Buscar config e posts
  const [userConfig, posts] = await Promise.all([
    getUserConfig(username),
    getUserPosts(username),
  ]);

  const displayName = githubUser.name || githubUser.login;
  const bio = userConfig.bio || githubUser.bio;
  const portfolioUrl = `https://git-to-know-me.vercel.app/u/${username}`;
  const hasBlogPosts = posts.length > 0;

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "8s" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "12s", animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/3 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "15s", animationDelay: "4s" }}
        />
      </div>

      {/* Floating header */}
      <div className="relative z-20 flex justify-end items-center p-6">
        {!session && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-700">
            <AuthButton />
          </div>
        )}
        {isOwnProfile && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-700 delay-100">
            <ProfileSettings username={username} portfolioUrl={portfolioUrl} />
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-6">
        <div className="w-full max-w-3xl">
          {/* Glass card minimalista */}
          <div className="relative bg-slate-900/30 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-8 md:p-10 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Content */}
            <div className="space-y-6">
              {/* Name section */}
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-100">
                  {displayName}
                </h1>
                <p className="text-sm text-slate-500">@{username}</p>
              </div>

              {/* Bio */}
              {bio && (
                <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
                  {bio}
                </p>
              )}

              {/* Navigation buttons */}
              <div className="flex flex-wrap gap-3 pt-4">
                <Link href={`/u/${username}/projects`}>
                  <button className="group inline-flex items-center gap-2 h-9 px-4 bg-blue-600/90 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors duration-300">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                      />
                    </svg>
                    Projetos
                  </button>
                </Link>

                {hasBlogPosts && (
                  <Link href={`/u/${username}/blog`}>
                    <button className="group inline-flex items-center gap-2 h-9 px-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 text-slate-300 hover:text-slate-100 text-sm rounded-lg transition-all duration-300">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                      Blog
                    </button>
                  </Link>
                )}
              </div>

              {/* Social links */}
              {githubUser.twitterUsername && (
                <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-800/50">
                  <a
                    href={`https://github.com/${username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors duration-150"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    GitHub
                  </a>
                  <a
                    href={`https://twitter.com/${githubUser.twitterUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors duration-150"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                    Twitter
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Footer discreto */}
          <div className="text-center mt-12">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-500 transition-colors duration-150"
            >
              <span>Crie seu portfólio com</span>
              <span className="font-medium">git-to-know-me</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

// Metadata
export async function generateMetadata({ params }: PageProps) {
  const { username } = await params;
  const [githubUser, userConfig] = await Promise.all([
    getGitHubUser(username),
    getUserConfig(username),
  ]);

  if (!githubUser) {
    return {
      title: "Usuário não encontrado",
    };
  }

  const displayName = githubUser.name || githubUser.login;
  const bio = userConfig.bio || githubUser.bio;

  return {
    title: `${displayName} (@${username})`,
    description: bio || `Portfolio de ${displayName}`,
  };
}
