"use client";

import { useEffect } from "react";
import { HiStar, HiX } from "react-icons/hi";
import type { ProjectMeta } from "@/types/portfolio";
import { Button } from "@/components/base-ui/Button";
import { MarkdownPreview } from "@/components/MarkdownPreview";

interface ProjectModalProps {
  project: ProjectMeta;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const githubUrl = `https://github.com/${project.fullName}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 motion-reduce:animate-none"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-lg shadow-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 motion-reduce:animate-none"
      >
        <div className="flex items-start justify-between p-5 border-b border-slate-800">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-xl font-bold text-slate-100 mb-2 truncate">
              {project.name}
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              {project.language && (
                <span className="flex items-center gap-1.5 text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-slate-600" />
                  {project.language}
                </span>
              )}

              {project.stars > 0 && (
                <span className="flex items-center gap-1 text-slate-500">
                  <HiStar className="w-3.5 h-3.5" />
                  {project.stars}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors"
            aria-label="Fechar"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {project.topics && project.topics.length > 0 && (
          <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/50">
            <div className="flex flex-wrap gap-1.5">
              {project.topics.map((topic) => (
                <span
                  key={topic}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700/50"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5">
          {project.descriptionHtml ? (
            <MarkdownPreview source={project.descriptionHtml} isReadme />
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-600 text-sm">README não disponível</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 p-5 border-t border-slate-800 bg-slate-900/50">
          <Button asChild size="sm" variant="outline" className="w-full">
            <a href={githubUrl} target="_blank" rel="noopener noreferrer">
              Ver no GitHub
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
