import { NavUser } from "@/components/NavUser";
import { EmptyState } from "@/components/EmptyState";
import { ClaimProfile } from "@/components/ClaimProfile";
import { ProjectsList } from "./ProjectsList";
import { getUserProjects, getUserConfig, isUserRegistered } from "@/lib/kv";
import { getGitHubUser } from "@/lib/github";
import type { ProjectMeta } from "@/types/portfolio";

interface PageProps {
  params: {
    username: string;
  };
}

export default async function ProjectsPage({ params }: PageProps) {
  const { username } = await params;

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

  // 3. Carregar dados
  const [allProjects, userConfig] = await Promise.all([
    getUserProjects(username),
    getUserConfig(username),
  ]);

  console.log(`[Projects] Username: ${username}`);
  console.log(`[Projects] Total projects from KV: ${allProjects.length}`);
  console.log(`[Projects] UserConfig:`, userConfig);

  // 4. Aplicar preview URLs customizadas
  const projectsWithCustomPreviews = allProjects.map((project) => {
    const customUrl = userConfig.customPreviewUrls?.[project.name];
    if (customUrl) {
      return { ...project, previewUrl: customUrl };
    }
    return project;
  });

  // 5. Filtrar projetos
  let filteredProjects: ProjectMeta[] = projectsWithCustomPreviews;

  if (userConfig.includeRepos && userConfig.includeRepos.length > 0) {
    console.log(`[Projects] Aplicando includeRepos:`, userConfig.includeRepos);
    filteredProjects = projectsWithCustomPreviews.filter((project) =>
      userConfig.includeRepos!.includes(project.name)
    );
  } else if (userConfig.excludeRepos && userConfig.excludeRepos.length > 0) {
    console.log(`[Projects] Aplicando excludeRepos:`, userConfig.excludeRepos);
    filteredProjects = projectsWithCustomPreviews.filter(
      (project) => !userConfig.excludeRepos!.includes(project.name)
    );
  }

  console.log(`[Projects] Filtered projects: ${filteredProjects.length}`);

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "10s" }}
        />
        <div
          className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "15s", animationDelay: "3s" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Nav with slide in */}
        <div className="animate-in fade-in slide-in-from-top-4 duration-700">
          <NavUser username={username} currentPage="projects" />
        </div>

        {/* Header minimalista */}
        <div className="mb-8 space-y-1 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100">
            Projetos
          </h1>
          <p className="text-xs text-slate-500">
            {filteredProjects.length}{" "}
            {filteredProjects.length === 1 ? "projeto" : "projetos"}
          </p>
        </div>

        {/* Content with fade in */}
        <div className="animate-in fade-in duration-700 delay-300">
          {filteredProjects.length > 0 ? (
            <ProjectsList projects={filteredProjects} />
          ) : (
            <EmptyState
              icon="folder"
              title="Nenhum projeto disponível"
              description="Este usuário ainda não possui projetos públicos ou não sincronizou seu portfólio."
              actionLabel="Ver no GitHub"
              actionHref={`https://github.com/${username}`}
            />
          )}
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
      title: "Projetos - Usuário não encontrado",
    };
  }

  const displayName = githubUser.name || githubUser.login;
  const bio = userConfig.bio || githubUser.bio;

  return {
    title: `Projetos - ${displayName}`,
    description: bio
      ? `${bio} - Veja os projetos de ${displayName}`
      : `Projetos open source de ${displayName}`,
  };
}
