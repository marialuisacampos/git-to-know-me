import { NavUser } from "@/components/NavUser";
import { EmptyState } from "@/components/EmptyState";
import { ClaimProfile } from "@/components/ClaimProfile";
import { getUserProjects } from "@/lib/db/projects";
import { getUserConfig } from "@/lib/db/config";
import { isUserRegistered } from "@/lib/db/users";
import { getGitHubUser } from "@/lib/github";
import type { ProjectMeta } from "@/types/portfolio";
import { ProjectsList } from "./ProjectsList";

interface PageProps {
  params: {
    username: string;
  };
}

export default async function ProjectsPage({ params }: PageProps) {
  const { username } = await params;

  const registered = await isUserRegistered(username);
  if (!registered) {
    return <ClaimProfile username={username} />;
  }

  const githubUser = await getGitHubUser(username);
  if (!githubUser) {
    return <ClaimProfile username={username} />;
  }

  const [allProjects, userConfig] = await Promise.all([
    getUserProjects(username),
    getUserConfig(username),
  ]);

  const projectsWithCustomPreviews = allProjects.map((project) => {
    const customUrl = userConfig.customPreviewUrls?.[project.name];
    if (customUrl) {
      return { ...project, previewUrl: customUrl };
    }
    return project;
  });

  let filteredProjects: ProjectMeta[] = projectsWithCustomPreviews;

  if (userConfig.includeRepos && userConfig.includeRepos.length > 0) {
    filteredProjects = projectsWithCustomPreviews.filter((project) =>
      userConfig.includeRepos!.includes(project.name)
    );
  } else if (userConfig.excludeRepos && userConfig.excludeRepos.length > 0) {
    filteredProjects = projectsWithCustomPreviews.filter(
      (project) => !userConfig.excludeRepos!.includes(project.name)
    );
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
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
        <div className="animate-in fade-in slide-in-from-top-4 duration-700">
          <NavUser username={username} currentPage="projects" />
        </div>

        <div className="mb-8 space-y-1 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100">
            Projetos
          </h1>
          <p className="text-xs text-slate-500">
            {filteredProjects.length}{" "}
            {filteredProjects.length === 1 ? "projeto" : "projetos"}
          </p>
        </div>

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
