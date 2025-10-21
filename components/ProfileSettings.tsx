"use client";

import { useState, useEffect } from "react";
import {
  HiCog,
  HiX,
  HiViewGrid,
  HiChevronRight,
  HiShare,
  HiRefresh,
  HiExternalLink,
} from "react-icons/hi";
import { FaGithub } from "react-icons/fa";
import { AiOutlineLoading } from "react-icons/ai";
import { Button } from "@/components/base-ui/Button";
import { CopyLink } from "@/components/CopyLink";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ProfileSettingsProps {
  username: string;
  portfolioUrl: string;
}

export function ProfileSettings({
  username,
  portfolioUrl,
}: ProfileSettingsProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    } else if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isAnimating]);

  async function handleSync() {
    setIsSyncing(true);

    try {
      toast.info("Sincronizando seus dados do GitHub...", {
        description: "Isso pode levar alguns segundos.",
      });

      const res = await fetch("/api/sync/github", {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Sincronização concluída!", {
          description: `${data.projects} projetos e ${data.posts} posts atualizados.`,
        });

        setIsOpen(false);
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

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="sm"
        aria-label="Configurações do perfil"
      >
        <HiCog
          className={`w-4 h-4 transition-transform duration-300 ${
            isOpen ? "rotate-90" : ""
          }`}
        />
      </Button>

      {isAnimating && (
        <>
          <div
            className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] transition-opacity duration-200 ${
              isOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setIsOpen(false)}
          />

          <div
            className={`fixed top-20 right-6 w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-800/50 rounded-xl shadow-2xl z-[101] transition-all duration-300 ease-out ${
              isOpen
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
            }`}
          >
            <div className="flex items-center justify-between p-5 pb-4 border-b border-slate-800/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <HiCog className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">
                    Configurações
                  </h3>
                  <p className="text-xs text-slate-600">@{username}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-500 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg p-1.5 transition-all duration-150"
                aria-label="Fechar"
              >
                <HiX className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <Link
                href="/dashboard"
                className="group flex items-center gap-2.5 p-3 bg-blue-500/10 hover:bg-blue-500/15 border border-blue-500/20 rounded-lg transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <HiViewGrid className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-200 group-hover:text-slate-100 transition-colors">
                    Dashboard
                  </p>
                  <p className="text-xs text-slate-600">Gerenciar perfil</p>
                </div>
                <HiChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all duration-200" />
              </Link>

              <div className="p-3 bg-slate-800/20 border border-slate-800/50 rounded-lg space-y-2">
                <div className="flex items-center gap-1.5">
                  <HiShare className="w-3.5 h-3.5 text-slate-500" />
                  <label className="text-xs font-medium text-slate-400">
                    Compartilhar perfil
                  </label>
                </div>
                <div className="w-full">
                  <CopyLink url={portfolioUrl} variant="outline" size="sm" />
                </div>
              </div>

              <div className="p-3 bg-slate-800/20 border border-slate-800/50 rounded-lg space-y-2">
                <div className="flex items-center gap-1.5">
                  <HiRefresh className="w-3.5 h-3.5 text-slate-500" />
                  <label className="text-xs font-medium text-slate-400">
                    Sincronizar dados
                  </label>
                </div>
                <Button
                  onClick={handleSync}
                  disabled={isSyncing}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {isSyncing ? (
                    <>
                      <AiOutlineLoading className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Sincronizando...
                    </>
                  ) : (
                    <>
                      <HiRefresh className="w-3.5 h-3.5 mr-1.5 group-hover:rotate-180 transition-transform duration-500" />
                      Sincronizar
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="p-5 pt-3 border-t border-slate-800/50">
              <a
                href={`https://github.com/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors group"
              >
                <FaGithub className="w-3.5 h-3.5" />
                Ver no GitHub
                <HiExternalLink className="w-3 h-3 opacity-50 group-hover:translate-x-0.5 transition-transform duration-200" />
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
