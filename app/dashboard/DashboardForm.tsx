"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/base-ui/Button";
import { Textarea } from "@/components/base-ui/TextArea";
import { Switch } from "@/components/base-ui/Switch";
import type { UserConfig, ProjectMeta } from "@/types/portfolio";

const configSchema = z.object({
  bio: z
    .string()
    .max(240, "Bio deve ter no máximo 240 caracteres")
    .optional()
    .or(z.literal("")),
  includeRepos: z.array(z.string()).optional(),
  excludeRepos: z.array(z.string()).optional(),
});

interface DashboardFormProps {
  username: string;
  initialConfig: UserConfig;
  projects: ProjectMeta[];
}

export function DashboardForm({
  username,
  initialConfig,
  projects,
}: DashboardFormProps) {
  const router = useRouter();

  const [bio, setBio] = useState(initialConfig.bio || "");
  const [twitterUrl, setTwitterUrl] = useState(initialConfig.twitterUrl || "");
  const [linkedinUrl, setLinkedinUrl] = useState(
    initialConfig.linkedinUrl || ""
  );
  const [instagramUrl, setInstagramUrl] = useState(
    initialConfig.instagramUrl || ""
  );
  const [selectedRepos, setSelectedRepos] = useState<string[]>(
    initialConfig.includeRepos || []
  );
  const [customPreviewUrls, setCustomPreviewUrls] = useState<
    Record<string, string>
  >(initialConfig.customPreviewUrls || {});
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const charCount = bio.length;
  const charLimit = 240;

  async function handleSave() {
    setIsSaving(true);

    try {
      const config: Partial<UserConfig> = {
        bio: bio || undefined,
        twitterUrl: twitterUrl || undefined,
        linkedinUrl: linkedinUrl || undefined,
        instagramUrl: instagramUrl || undefined,
        includeRepos: selectedRepos.length > 0 ? selectedRepos : undefined,
        excludeRepos: undefined,
      };

      const filteredPreviewUrls: Record<string, string> = {};
      Object.entries(customPreviewUrls).forEach(([repo, url]) => {
        if (url && url.trim()) {
          filteredPreviewUrls[repo] = url.trim();
        }
      });
      config.customPreviewUrls =
        Object.keys(filteredPreviewUrls).length > 0
          ? filteredPreviewUrls
          : undefined;

      const validation = configSchema.safeParse(config);

      if (!validation.success) {
        const firstError = validation.error.issues[0];
        toast.error("Validação falhou", {
          description: firstError.message,
        });
        setIsSaving(false);
        return;
      }

      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Configurações salvas!", {
          description: "Suas alterações foram aplicadas com sucesso.",
        });
        router.refresh();
      } else {
        toast.error("Erro ao salvar", {
          description: data.error || "Tente novamente.",
        });
      }
    } catch {
      toast.error("Erro de conexão", {
        description: "Não foi possível salvar as configurações.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSync() {
    setIsSyncing(true);

    try {
      const res = await fetch("/api/sync/github", {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Sincronização concluída!", {
          description: `${data.projects} projetos e ${data.posts} posts atualizados.`,
        });
        router.refresh();
      } else {
        toast.error("Erro ao sincronizar", {
          description: data.error || "Tente novamente.",
        });
      }
    } catch {
      toast.error("Erro de conexão", {
        description: "Não foi possível sincronizar com o GitHub.",
      });
    } finally {
      setIsSyncing(false);
    }
  }

  function toggleRepo(repoName: string) {
    if (selectedRepos.includes(repoName)) {
      setSelectedRepos(selectedRepos.filter((r) => r !== repoName));
    } else {
      setSelectedRepos([...selectedRepos, repoName]);
    }
  }

  function isRepoSelected(repoName: string): boolean {
    return selectedRepos.includes(repoName);
  }

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

          <Button
            onClick={handleSync}
            disabled={isSyncing}
            size="sm"
            variant="primary"
          >
            {isSyncing ? (
              <>
                <svg
                  className="w-4 h-4 mr-1.5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Sincronizando...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 mr-1.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Sincronizar
              </>
            )}
          </Button>
        </div>
      </section>

      <section className="bg-slate-900/30 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
        <h2 className="text-base font-semibold text-slate-100 mb-1">Bio</h2>
        <p className="text-xs text-slate-500 mb-4">Máximo 240 caracteres</p>

        <div className="space-y-2">
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, charLimit))}
            placeholder="Desenvolvedor full-stack apaixonado por open source..."
            className="min-h-[100px] bg-slate-800/40 border-slate-700 focus:border-blue-500 text-slate-100 resize-none text-sm"
            maxLength={charLimit}
          />

          <div className="flex justify-between text-xs">
            <span className="text-slate-600">Aparece em /u/{username}</span>
            <span
              className={
                charCount > charLimit * 0.9
                  ? "text-orange-400"
                  : "text-slate-600"
              }
            >
              {charCount}/{charLimit}
            </span>
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
              <svg
                className="w-3.5 h-3.5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Twitter/X
            </label>
            <input
              type="url"
              value={twitterUrl}
              onChange={(e) => setTwitterUrl(e.target.value)}
              placeholder="https://twitter.com/seu_usuario"
              className="w-full px-3 py-1.5 text-xs bg-slate-900/40 border border-slate-700/50 rounded-md text-slate-200 placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs text-slate-400">
              <svg
                className="w-3.5 h-3.5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </label>
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/seu_usuario"
              className="w-full px-3 py-1.5 text-xs bg-slate-900/40 border border-slate-700/50 rounded-md text-slate-200 placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs text-slate-400">
              <svg
                className="w-3.5 h-3.5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
              </svg>
              Instagram
            </label>
            <input
              type="url"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://instagram.com/seu_usuario"
              className="w-full px-3 py-1.5 text-xs bg-slate-900/40 border border-slate-700/50 rounded-md text-slate-200 placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>
      </section>

      <section className="bg-slate-900/30 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
        <h2 className="text-base font-semibold text-slate-100 mb-1">
          Repositórios
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Selecione os repositórios que você deseja exibir no portfólio
        </p>

        {projects.length > 0 ? (
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {projects.map((project) => {
              const isSelected = isRepoSelected(project.name);
              const currentPreviewUrl =
                customPreviewUrls[project.name] || project.previewUrl || "";

              return (
                <div
                  key={project.fullName}
                  className="p-4 bg-slate-800/20 rounded-lg hover:bg-slate-800/30 transition-colors space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={isSelected}
                      onCheckedChange={() => toggleRepo(project.name)}
                      className="data-[state=checked]:bg-blue-600 flex-shrink-0"
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
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      Preview
                      {project.previewUrl &&
                        !customPreviewUrls[project.name] && (
                          <span className="text-xs text-blue-400">(auto)</span>
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
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                          Testar link
                        </a>
                        {currentPreviewUrl !== (project.previewUrl || "") && (
                          <button
                            onClick={() => {
                              const newUrls = { ...customPreviewUrls };
                              delete newUrls[project.name];
                              setCustomPreviewUrls(newUrls);
                            }}
                            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                          >
                            Restaurar auto-detectada
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-800/10 rounded-lg">
            <p className="text-xs text-slate-600">
              Nenhum projeto. Sincronize seus dados!
            </p>
          </div>
        )}

        {selectedRepos.length > 0 && (
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-xs text-blue-300">
              {selectedRepos.length}{" "}
              {selectedRepos.length === 1
                ? "repositório selecionado"
                : "repositórios selecionados"}
            </p>
          </div>
        )}
      </section>

      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-slate-900/30 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            variant="primary"
            size="sm"
          >
            {isSaving ? (
              <>
                <svg
                  className="w-4 h-4 mr-1.5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Salvando...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 mr-1.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Salvar
              </>
            )}
          </Button>

          <Button
            onClick={() => router.push(`/u/${username}`)}
            variant="outline"
            size="sm"
          >
            Ver perfil
          </Button>
        </div>
      </div>
    </div>
  );
}
