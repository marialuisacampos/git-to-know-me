"use client";

import { useState, useEffect, useTransition, useActionState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useFormStatus } from "react-dom";
import {
  HiRefresh,
  HiEye,
  HiExternalLink,
  HiCheck,
  HiSearch,
} from "react-icons/hi";
import { FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";
import { AiOutlineLoading } from "react-icons/ai";
import { Button } from "@/components/base-ui/Button";
import { Textarea } from "@/components/base-ui/TextArea";
import { updateConfigAction } from "@/app/actions/config";
import { syncGitHubAction } from "@/app/actions/sync";
import type { UserConfig, ProjectMeta } from "@/types/portfolio";

interface DashboardFormProps {
  username: string;
  initialConfig: UserConfig;
  projects: ProjectMeta[];
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} variant="primary" size="sm">
      {pending ? (
        <>
          <AiOutlineLoading className="w-4 h-4 mr-1.5 animate-spin" />
          Salvando...
        </>
      ) : (
        <>
          <HiCheck className="w-4 h-4 mr-1.5" />
          Salvar
        </>
      )}
    </Button>
  );
}

function SyncButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSync = async () => {
    startTransition(async () => {
      const result = await syncGitHubAction();

      if (result.success) {
        toast.success(result.success, {
          description: `${result.projects} projetos e ${result.posts} posts atualizados.`,
        });
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao sincronizar");
      }
    });
  };

  return (
    <Button
      type="button"
      onClick={handleSync}
      disabled={isPending}
      size="sm"
      variant="primary"
    >
      {isPending ? (
        <>
          <AiOutlineLoading className="w-4 h-4 mr-1.5 animate-spin" />
          Sincronizando...
        </>
      ) : (
        <>
          <HiRefresh className="w-4 h-4 mr-1.5" />
          Sincronizar
        </>
      )}
    </Button>
  );
}

export function DashboardForm({
  username,
  initialConfig,
  projects,
}: DashboardFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(updateConfigAction, null);

  const displayableProjects = projects.filter(
    (project) => project.name !== "blog-posts"
  );

  const [customPreviewUrls, setCustomPreviewUrls] = useState<
    Record<string, string>
  >(initialConfig.customPreviewUrls || {});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRepos, setSelectedRepos] = useState<Set<string>>(
    new Set(
      initialConfig.includeRepos || displayableProjects.map((p) => p.name)
    )
  );

  const filteredProjects = displayableProjects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectAll = () => {
    setSelectedRepos(new Set(filteredProjects.map((p) => p.name)));
  };

  const handleDeselectAll = () => {
    setSelectedRepos(new Set());
  };

  const toggleRepo = (repoName: string) => {
    const newSelected = new Set(selectedRepos);
    if (newSelected.has(repoName)) {
      newSelected.delete(repoName);
    } else {
      newSelected.add(repoName);
    }
    setSelectedRepos(newSelected);
  };

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success, {
        description: "Suas alterações foram aplicadas com sucesso.",
      });
      router.refresh();
    }
    if (state?.error) {
      toast.error("Erro ao salvar", {
        description: state.error,
      });
    }
  }, [state, router]);

  return (
    <div className="space-y-6">
      <section className="bg-slate-900/30 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-100 mb-1">
              Sincronizar com GitHub
            </h2>
            <p className="text-xs text-slate-500">
              Busque seus repositórios e posts mais recentes
            </p>
          </div>

          <SyncButton />
        </div>
      </section>

      <form action={formAction} className="space-y-6">
        <section className="bg-slate-900/30 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
          <h2 className="text-base font-semibold text-slate-100 mb-1">Bio</h2>
          <p className="text-xs text-slate-500 mb-4">Máximo 240 caracteres</p>

          <div className="space-y-2">
            <Textarea
              name="bio"
              defaultValue={initialConfig.bio || ""}
              placeholder="Desenvolvedor full-stack apaixonado por open source..."
              className="min-h-[100px] bg-slate-800/40 border-slate-700 focus:border-blue-500 text-slate-100 resize-none text-sm"
              maxLength={240}
            />

            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Aparece em /u/{username}</span>
            </div>
          </div>
        </section>

        <section className="bg-slate-900/30 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
          <h2 className="text-base font-semibold text-slate-100 mb-1">
            Redes Sociais
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Adicione seus perfis (opcional)
          </p>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs text-slate-400">
                <FaTwitter className="w-3.5 h-3.5" />
                Twitter/X
              </label>
              <input
                type="url"
                name="twitterUrl"
                defaultValue={initialConfig.twitterUrl || ""}
                placeholder="https://twitter.com/seu_usuario"
                className="w-full px-3 py-1.5 text-xs bg-slate-900/40 border border-slate-700/50 rounded-md text-slate-200 placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs text-slate-400">
                <FaLinkedin className="w-3.5 h-3.5" />
                LinkedIn
              </label>
              <input
                type="url"
                name="linkedinUrl"
                defaultValue={initialConfig.linkedinUrl || ""}
                placeholder="https://linkedin.com/in/seu_usuario"
                className="w-full px-3 py-1.5 text-xs bg-slate-900/40 border border-slate-700/50 rounded-md text-slate-200 placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs text-slate-400">
                <FaInstagram className="w-3.5 h-3.5" />
                Instagram
              </label>
              <input
                type="url"
                name="instagramUrl"
                defaultValue={initialConfig.instagramUrl || ""}
                placeholder="https://instagram.com/seu_usuario"
                className="w-full px-3 py-1.5 text-xs bg-slate-900/40 border border-slate-700/50 rounded-md text-slate-200 placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
          </div>
        </section>

        <section className="bg-slate-900/30 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-slate-100 mb-1">
                Repositórios
              </h2>
              <p className="text-xs text-slate-500">
                Selecione os repositórios que você deseja exibir no portfólio
              </p>
            </div>

            {displayableProjects.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar repositórios..."
                    className="w-full pl-10 pr-3 py-2 text-sm bg-slate-900/40 border border-slate-700/50 rounded-md text-slate-200 placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleSelectAll}
                    variant="outline"
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    Marcar {searchQuery ? "filtrados" : "todos"}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleDeselectAll}
                    variant="outline"
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    Desmarcar todos
                  </Button>
                </div>
              </div>
            )}
          </div>

          {displayableProjects.length > 0 ? (
            <>
              <div className="mt-4 space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => {
                    const isSelected = selectedRepos.has(project.name);
                    const currentPreviewUrl =
                      customPreviewUrls[project.name] ||
                      project.previewUrl ||
                      "";

                    return (
                      <div
                        key={project.fullName}
                        className="p-4 bg-slate-800/20 rounded-lg hover:bg-slate-800/30 transition-colors space-y-3"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRepo(project.name)}
                            className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm text-slate-200 font-medium truncate">
                              {project.name}
                            </h3>
                            {project.language && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400/50" />
                                {project.language}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="pl-8 space-y-2">
                          <label className="flex items-center gap-1.5 text-xs text-slate-500">
                            <HiEye className="w-3 h-3" />
                            Preview
                            {project.previewUrl &&
                              !customPreviewUrls[project.name] && (
                                <span className="text-xs text-blue-400">
                                  (auto)
                                </span>
                              )}
                          </label>
                          <input
                            type="url"
                            value={currentPreviewUrl}
                            onChange={(e) => {
                              setCustomPreviewUrls({
                                ...customPreviewUrls,
                                [project.name]: e.target.value,
                              });
                            }}
                            placeholder="https://meu-projeto.vercel.app"
                            className="w-full px-3 py-1.5 text-xs bg-slate-900/40 border border-slate-700/50 rounded-md text-slate-200 placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                          />
                          {currentPreviewUrl && (
                            <div className="flex items-center gap-2">
                              <a
                                href={currentPreviewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                              >
                                <HiExternalLink className="w-3 h-3" />
                                Testar link
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 bg-slate-800/10 rounded-lg">
                    <p className="text-xs text-slate-600">
                      Nenhum repositório encontrado para &quot;{searchQuery}
                      &quot;
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-slate-800/10 rounded-lg mt-4">
              <p className="text-xs text-slate-600">
                Nenhum projeto. Sincronize seus dados!
              </p>
            </div>
          )}

          {selectedRepos.size > 0 && (
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-blue-300">
                {selectedRepos.size} de {displayableProjects.length}{" "}
                {selectedRepos.size === 1
                  ? "repositório selecionado"
                  : "repositórios selecionados"}
              </p>
            </div>
          )}
        </section>

        {Array.from(selectedRepos).map((repoName) => (
          <input
            key={repoName}
            type="hidden"
            name="includeRepos"
            value={repoName}
          />
        ))}

        <input
          type="hidden"
          name="customPreviewUrls"
          value={JSON.stringify(customPreviewUrls)}
        />

        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-slate-900/30 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
          <div className="flex gap-3">
            <SubmitButton />

            <Button
              type="button"
              onClick={() => router.push(`/u/${username}`)}
              variant="outline"
              size="sm"
            >
              Ver perfil
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
