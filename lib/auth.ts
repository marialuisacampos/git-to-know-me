import {
  NextAuthOptions,
  getServerSession as nextGetServerSession,
} from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { db } from "./db";

interface GitHubProfile {
  id: string | number;
  login: string;
  avatar_url: string;
  name: string;
  email?: string;
  bio?: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      if (!profile) return false;

      const githubProfile = profile as GitHubProfile;
      const githubId = String(githubProfile.id);
      const username = githubProfile.login;
      const name = githubProfile.name || null;
      const avatarUrl = githubProfile.avatar_url || null;
      const bio = githubProfile.bio || null;
      const email = githubProfile.email || null;
      const emailVerifiedAt = email ? new Date() : null;

      try {
        await db.user.upsert({
          where: { githubId },
          update: {
            username,
            name,
            avatarUrl,
            bio,
            email,
            emailVerifiedAt,
          },
          create: {
            githubId,
            username,
            name,
            avatarUrl,
            bio,
            email,
            emailVerifiedAt,
          },
        });
      } catch {
        return true;
      }

      return true;
    },
    async jwt({ token, profile }) {
      if (profile) {
        const githubProfile = profile as GitHubProfile;
        token.username = githubProfile.login;
        token.picture = githubProfile.avatar_url;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.username = token.username as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};

export async function getServerSession() {
  if (process.env.NODE_ENV === "development") {
    const { cookies: getCookies } = await import("next/headers");
    const cookieStore = await getCookies();
    const devSession = cookieStore.get("dev-session");

    if (devSession) {
      try {
        return JSON.parse(devSession.value);
      } catch {
        return null;
      }
    }
  }

  return nextGetServerSession(authOptions);
}
