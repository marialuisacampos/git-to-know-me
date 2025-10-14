"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

interface AutoSyncProps {
  hasProjects: boolean;
  username: string;
}

/**
 * Componente que dispara sync automático no primeiro login
 * Só roda se o usuário não tiver projetos ainda
 */
export function AutoSync({ hasProjects, username }: AutoSyncProps) {
  const [syncing, setSyncing] = useState(false);
  const [syncCompleted, setSyncCompleted] = useState(false);

  useEffect(() => {
    // Só rodar se não tiver projetos e ainda não sincronizou
    if (hasProjects || syncing || syncCompleted) {
      return;
    }

    // Verificar se já tentou sync nesta sessão
    const syncKey = `auto-sync-done-${username}`;
    if (sessionStorage.getItem(syncKey)) {
      return;
    }

    console.log("[AutoSync] Primeiro acesso - iniciando sync automático...");
    setSyncing(true);

    // Aguardar 1s antes de disparar (dar tempo do usuário ver o dashboard)
    const timer = setTimeout(async () => {
      try {
        toast.info("Sincronizando seus dados do GitHub...", {
          description: "Isso pode levar alguns segundos.",
        });

        const response = await fetch("/api/sync/github", {
          method: "POST",
        });

        if (response.ok) {
          const data = await response.json();

          toast.success("Sincronização concluída!", {
            description: `${data.projects} projetos e ${data.posts} posts sincronizados.`,
          });

          setSyncCompleted(true);
          sessionStorage.setItem(syncKey, "true");

          // Recarregar página para mostrar os dados
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          const error = await response.json();

          toast.error("Erro ao sincronizar", {
            description: error.error || "Tente novamente manualmente.",
          });
        }
      } catch (error) {
        console.error("[AutoSync] Erro:", error);

        toast.error("Erro ao sincronizar", {
          description: "Verifique sua conexão e tente novamente.",
        });
      } finally {
        setSyncing(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [hasProjects, username, syncing, syncCompleted]);

  // Componente invisível - só dispara o efeito
  return null;
}
