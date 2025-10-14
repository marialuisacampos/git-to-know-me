import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { getUserConfig, getUserProjects } from "@/lib/kv";
import { DashboardForm } from "./DashboardForm";
import { AutoSync } from "@/components/AutoSync";

export default async function DashboardPage() {
  // Proteção de rota
  const session = await getServerSession();

  if (!session?.user?.username) {
    redirect("/api/auth/signin");
  }

  const username = session.user.username;

  // Carregar dados
  const [userConfig, projects] = await Promise.all([
    getUserConfig(username),
    getUserProjects(username),
  ]);

  return (
    <main className="relative min-h-screen bg-slate-950">
      {/* Auto-sync no primeiro acesso */}
      <AutoSync hasProjects={projects.length > 0} username={username} />

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute top-60 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header minimalista */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-100 mb-2">
            Dashboard
          </h1>
          <p className="text-sm text-slate-400">@{username}</p>
        </div>

        {/* Form */}
        <DashboardForm
          username={username}
          initialConfig={userConfig}
          projects={projects}
        />
      </div>
    </main>
  );
}

// Metadata
export const metadata = {
  title: "Dashboard - Git to know me",
  description: "Configure seu portfólio",
};
