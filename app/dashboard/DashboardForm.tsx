"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { UserConfig, ProjectMeta } from "@/types/portfolio";

// Schema de validação client-side
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

  // Estados
  const [bio, setBio] = useState(initialConfig.bio || "");
  const [selectedRepos, setSelectedRepos] = useState<string[]>(
    initialConfig.includeRepos || []
  );
  const [customPreviewUrls, setCustomPreviewUrls] = useState<
    Record<string, string>
  >(initialConfig.customPreviewUrls || {});
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Contador de caracteres
  const charCount = bio.length;
  const charLimit = 240;

  // Salvar configurações
  async function handleSave() {
    setIsSaving(true);

    try {
      const config: Partial<UserConfig> = {
        bio: bio || undefined,
        includeRepos: selectedRepos.length > 0 ? selectedRepos : undefined,
        excludeRepos: undefined, // Sempre limpar excludeRepos
      };

      // Salvar preview URLs customizadas (limpar vazias)
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

      // Validar com Zod client-side
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

  // Sincronizar com GitHub
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

  // Toggle repo
  function toggleRepo(repoName: string) {
    if (selectedRepos.includes(repoName)) {
      setSelectedRepos(selectedRepos.filter((r) => r !== repoName));
    } else {
      setSelectedRepos([...selectedRepos, repoName]);
    }
  }

  // Verificar se repo está selecionado
  function isRepoSelected(repoName: string): boolean {
    return selectedRepos.includes(repoName);
  }

  return (
    <div className="space-y-6">
      {/* Seção: Sincronizar */}
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

      {/* Seção: Bio */}
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

      {/* Seção: Repositórios */}
      <section className="bg-slate-900/30 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
        <h2 className="text-base font-semibold text-slate-100 mb-1">
          Repositórios
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Selecione os repositórios que você deseja exibir no portfólio
        </p>

        {/* Lista de repositórios */}
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
                  {/* Header com switch */}
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

                  {/* Input de Preview URL */}
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

        {/* Info de seleção */}
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

      {/* Botões de ação */}
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
