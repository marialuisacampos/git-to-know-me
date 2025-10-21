"use client";

import { useState } from "react";
import { HiEye, HiDocumentText } from "react-icons/hi";
import type { ProjectMeta } from "@/types/portfolio";
import { PreviewModal } from "./PreviewModal";

interface ProjectCardProps {
  project: ProjectMeta;
  onClick: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const [showPreview, setShowPreview] = useState(false);

  const updatedAt = project.pushedAt
    ? new Date(project.pushedAt).toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Data não disponível";

  const hasPreview = Boolean(project.previewUrl);

  return (
    <>
      <div className="group relative w-full overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.01]">
        <div className="relative h-full bg-slate-900/30 backdrop-blur-xl border border-slate-800/50 group-hover:border-slate-700/80 rounded-xl transition-all duration-300">
          <div className="relative p-5 space-y-3">
            <button
              onClick={onClick}
              className="w-full text-left focus:outline-none"
            >
              <h3 className="text-base font-semibold text-slate-100 group-hover:text-white transition-colors duration-300 line-clamp-1">
                {project.name}
              </h3>
            </button>

            {project.language && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/40 border border-slate-700/30">
                <span className="w-2 h-2 rounded-full bg-blue-400/70" />
                <span className="text-xs text-slate-400">
                  {project.language}
                </span>
              </div>
            )}

            {project.topics && project.topics.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {project.topics.slice(0, 3).map((topic) => (
                  <span
                    key={topic}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-800/30 text-slate-500 border border-slate-700/20"
                  >
                    {topic}
                  </span>
                ))}
                {project.topics.length > 3 && (
                  <span className="inline-flex items-center px-2 py-0.5 text-xs text-slate-600">
                    +{project.topics.length - 3}
                  </span>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              {hasPreview && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPreview(true);
                  }}
                  className="inline-flex items-center gap-1.5 h-8 px-3 bg-blue-600/90 hover:bg-blue-600 text-white text-xs rounded-md transition-colors duration-300"
                >
                  <HiEye className="w-3.5 h-3.5" />
                  Preview
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
                className="inline-flex items-center gap-1.5 h-8 px-3 bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-slate-300 text-xs rounded-md transition-all duration-300"
              >
                <HiDocumentText className="w-3.5 h-3.5" />
                README
              </button>
            </div>

            <div className="pt-2">
              <p className="text-xs text-slate-600">{updatedAt}</p>
            </div>
          </div>
        </div>
      </div>

      {hasPreview && project.previewUrl && (
        <PreviewModal
          url={project.previewUrl}
          title={project.name}
          open={showPreview}
          onOpenChange={setShowPreview}
        />
      )}
    </>
  );
}
