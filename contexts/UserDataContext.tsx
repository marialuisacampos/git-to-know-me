"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import type { UserConfig } from "@/types/portfolio";

interface ProjectMeta {
  fullName: string;
  name: string;
  language: string | null;
  topics: string[];
  stars: number;
  pushedAt: string | null;
  homepageUrl: string | null;
  previewUrl: string | null;
  summary?: string;
}

interface UserDataContextType {
  userConfig: UserConfig | null;
  projects: ProjectMeta[];
  isLoading: boolean;
  refetch: () => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(
  undefined
);

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [userConfig, setUserConfig] = useState<UserConfig | null>(null);
  const [projects, setProjects] = useState<ProjectMeta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const hasRun = useRef(false);
  const hasTriedAutoSync = useRef(false);

  const username = session?.user?.username;

  const fetchUserData = useCallback(async () => {
    if (!username) return;

    setIsLoading(true);

    try {
      const [configRes, projectsRes] = await Promise.all([
        fetch(`/api/user/config?username=${username}`),
        fetch(`/api/user/projects?username=${username}`),
      ]);

      if (configRes.ok) {
        const configData = await configRes.json();
        setUserConfig(configData);
      }

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setProjects(projectsData);
      }
    } finally {
      setIsLoading(false);
      setInitialFetchDone(true);
    }
  }, [username]);

  useEffect(() => {
    if (status !== "authenticated" || !username) return;
    if (hasRun.current) return;

    hasRun.current = true;

    const timer = setTimeout(() => {
      fetchUserData();
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, username]);

  useEffect(() => {
    if (!initialFetchDone) return;
    if (status !== "authenticated" || !username) return;
    if (hasTriedAutoSync.current) return;
    if (projects.length > 0) return;

    const syncKey = `auto-sync-done-${username}`;
    if (sessionStorage.getItem(syncKey)) return;

    hasTriedAutoSync.current = true;

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

          sessionStorage.setItem(syncKey, "true");
          await fetchUserData();
        } else {
          const error = await response.json();

          toast.error("Erro ao sincronizar", {
            description: error.error || "Tente novamente manualmente.",
          });
        }
      } catch {
        toast.error("Erro ao sincronizar", {
          description: "Verifique sua conexão e tente novamente.",
        });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [initialFetchDone, status, username, projects.length, fetchUserData]);

  const value: UserDataContextType = {
    userConfig,
    projects,
    isLoading,
    refetch: fetchUserData,
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error("useUserData must be used within a UserDataProvider");
  }
  return context;
}
