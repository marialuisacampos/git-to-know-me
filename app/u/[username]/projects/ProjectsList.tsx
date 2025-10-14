"use client";

import { useState } from "react";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectModal } from "@/components/ProjectModal";
import type { ProjectMeta } from "@/types/portfolio";

interface ProjectsListProps {
  projects: ProjectMeta[];
}

export function ProjectsList({ projects }: ProjectsListProps) {
  const [selectedProject, setSelectedProject] = useState<ProjectMeta | null>(
    null
  );

  return (
    <>
      {/* Grid responsivo: 3 cols desktop, 2 tablet, 1 mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard
            key={project.fullName}
            project={project}
            onClick={() => setSelectedProject(project)}
          />
        ))}
      </div>

      {/* Modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </>
  );
}
