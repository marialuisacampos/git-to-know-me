"use client";

import { useEffect } from "react";
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
                  <svg
                    className="w-3.5 h-3.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
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
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
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
