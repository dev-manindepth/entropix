"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@entropix/react";
import { ProjectCard } from "@/components/projects/project-card";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";

interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  currentSpecJson: string | null;
}

interface ProjectsPageClientProps {
  initialProjects: Project[];
}

export function ProjectsPageClient({ initialProjects }: ProjectsPageClientProps) {
  const [projects, setProjects] = useState(initialProjects);
  const router = useRouter();

  function handleCreated(project: { id: string; name: string; description: string | null }) {
    router.push(`/projects/${project.id}`);
    router.refresh();
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Delete project error:", err);
    }
  }

  return (
    <div className="projects-page">
      <div className="projects-header">
        <h1>Projects</h1>
        <CreateProjectDialog onCreated={handleCreated} />
      </div>

      {projects.length === 0 ? (
        <div className="projects-empty">
          <h2>No projects yet</h2>
          <p>Create your first project to start generating UI components with AI.</p>
          <CreateProjectDialog
            onCreated={handleCreated}
            trigger={<Button variant="primary">Create Your First Project</Button>}
          />
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
