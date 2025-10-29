"use client";

import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { useUserData } from "@/contexts/UserDataContext";
import { DashboardForm } from "./DashboardForm";
import { Logo } from "@/components/Logo";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { userConfig, projects, isLoading } = useUserData();

  if (status === "loading" || isLoading) {
    return (
      <main className="relative min-h-screen bg-slate-950">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute top-60 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className="mb-4">
                <Logo size="lg" showText={false} />
              </div>
              <div className="inline-block w-8 h-8 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm text-slate-400">Carregando...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!session?.user?.username) {
    redirect("/api/auth/signin");
  }

  const username = session.user.username;

  return (
    <main className="relative min-h-screen bg-slate-950">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute top-60 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-100 mb-2">
              Dashboard
            </h1>
            <p className="text-sm text-slate-400">@{username}</p>
          </div>
          <Logo size="md" />
        </header>

        <DashboardForm
          username={username}
          initialConfig={userConfig || {}}
          projects={projects}
        />
      </div>
    </main>
  );
}
