import Link from "next/link";
import { HiFolder, HiBookOpen } from "react-icons/hi";
import { FaGithub, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";
import { AuthButton } from "@/components/AuthButton";
import { ProfileSettings } from "@/components/ProfileSettings";
import { ClaimProfile } from "@/components/ClaimProfile";
import { getGitHubUser } from "@/lib/github";
import { getUserConfig } from "@/lib/db/config";
import { getUserPosts } from "@/lib/db/posts";
import { isUserRegistered } from "@/lib/db/users";
import { getServerSession } from "@/lib/auth";
import { BackgroundAnimation } from "@/components/BackgroundAnimation";

interface PageProps {
  params: {
    username: string;
  };
}

export default async function UserPage({ params }: PageProps) {
  const { username } = await params;

  const registered = await isUserRegistered(username);
  if (!registered) {
    return <ClaimProfile username={username} />;
  }

  const githubUser = await getGitHubUser(username);
  if (!githubUser) {
    return <ClaimProfile username={username} />;
  }

  const session = await getServerSession();
  const isOwnProfile = session?.user?.username === username;

  const [userConfig, posts] = await Promise.all([
    getUserConfig(username),
    getUserPosts(username),
  ]);

  const displayName = githubUser.name || githubUser.login;
  const bio = userConfig.bio || githubUser.bio;
  const portfolioUrl = `https://www.gittoknowme.com/u/${username}`;
  const hasBlogPosts = posts.length > 0;

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      <BackgroundAnimation />

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

      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-6">
        <div className="w-full max-w-3xl">
          <div className="relative bg-slate-900/30 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-8 md:p-10 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-100">
                  {displayName}
                </h1>
                <p className="text-sm text-slate-500">@{username}</p>
              </div>

              {bio && (
                <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
                  {bio}
                </p>
              )}

              <div className="flex flex-wrap gap-3 pt-4">
                <Link href={`/u/${username}/projects`}>
                  <button className="group inline-flex items-center gap-2 h-9 px-4 bg-blue-600/90 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors duration-300">
                    <HiFolder className="w-4 h-4" />
                    Projetos
                  </button>
                </Link>

                {hasBlogPosts && (
                  <Link href={`/u/${username}/blog`}>
                    <button className="group inline-flex items-center gap-2 h-9 px-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 text-slate-300 hover:text-slate-100 text-sm rounded-lg transition-all duration-300">
                      <HiBookOpen className="w-4 h-4" />
                      Blog
                    </button>
                  </Link>
                )}
              </div>

              <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-800/50">
                <a
                  href={`https://github.com/${username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors duration-150"
                >
                  <FaGithub className="w-3.5 h-3.5" />
                  GitHub
                </a>

                {userConfig.twitterUrl && (
                  <a
                    href={userConfig.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors duration-150"
                  >
                    <FaTwitter className="w-3.5 h-3.5" />
                    Twitter
                  </a>
                )}

                {userConfig.linkedinUrl && (
                  <a
                    href={userConfig.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors duration-150"
                  >
                    <FaLinkedin className="w-3.5 h-3.5" />
                    LinkedIn
                  </a>
                )}

                {userConfig.instagramUrl && (
                  <a
                    href={userConfig.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors duration-150"
                  >
                    <FaInstagram className="w-3.5 h-3.5" />
                    Instagram
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-500 transition-colors duration-150"
            >
              <span>Crie seu portfólio com</span>
              <span className="font-medium">Git To Know Me</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
