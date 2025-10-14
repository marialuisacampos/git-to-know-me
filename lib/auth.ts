import {
  NextAuthOptions,
  getServerSession as nextGetServerSession,
} from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { setUserRegistered } from "./kv";
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
        // 1. Upsert User no Postgres
        const user = await db.user.upsert({
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

        // 2. Activity (firstSeenAt + lastSeenAt + signupSource)
        const existingActivity = await db.activity.findUnique({
          where: { userId: user.id },
        });

        // Capturar UTM dos cookies
        let signupSource: string | null = null;
        if (typeof window === "undefined") {
          // Server-side
          const { cookies: getCookies } = await import("next/headers");
          const cookieStore = await getCookies();
          const utmParams = ["utm_source", "utm_medium", "utm_campaign", "ref"]
            .map((key) => {
              const value = cookieStore.get(key)?.value;
              return value ? `${key}=${value}` : null;
            })
            .filter(Boolean)
            .join("&");

          if (utmParams) {
            signupSource = utmParams;
          }
        }

        if (!existingActivity) {
          await db.activity.create({
            data: {
              userId: user.id,
              firstSeenAt: new Date(),
              lastSeenAt: new Date(),
              signupSource: signupSource || "direct",
            },
          });

          console.log(
            `[Auth] Primeiro login de ${username} - sync automático será disparado no dashboard`
          );
        } else {
          await db.activity.update({
            where: { userId: user.id },
            data: { lastSeenAt: new Date() },
          });
        }

        // 3. Manter compatibilidade com KV (marcar como registrado)
        await setUserRegistered(username);
      } catch (error) {
        console.error("Erro ao persistir usuário no Postgres:", error);
        // Não bloquear o login por erro de persistência
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
  // Em dev, verificar se existe sessão fake
  if (process.env.NODE_ENV === "development") {
    const { cookies: getCookies } = await import("next/headers");
    const cookieStore = await getCookies();
    const devSession = cookieStore.get("dev-session");

    if (devSession) {
      try {
        return JSON.parse(devSession.value);
      } catch (error) {
        console.error("Erro ao parsear dev-session:", error);
      }
    }
  }

  return nextGetServerSession(authOptions);
}
