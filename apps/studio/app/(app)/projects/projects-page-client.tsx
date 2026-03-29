"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@entropix/react";
import { ProjectCard } from "@/components/projects/project-card";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import { TEMPLATES } from "@/lib/templates";

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

  const [isCreatingFromTemplate, setIsCreatingFromTemplate] = useState<string | null>(null);

  function handleCreated(project: { id: string; name: string; description: string | null }) {
    router.push(`/projects/${project.id}`);
    router.refresh();
  }

  async function handleTemplateClick(templateId: string) {
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (!template || isCreatingFromTemplate) return;

    setIsCreatingFromTemplate(templateId);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: template.name,
          description: template.description,
        }),
      });
      if (!res.ok) throw new Error("Failed to create project");
      const data = await res.json();
      router.push(`/projects/${data.project.id}?template=${templateId}`);
      router.refresh();
    } catch (err) {
      console.error("Create from template error:", err);
    } finally {
      setIsCreatingFromTemplate(null);
    }
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

      <div className="templates-section">
        <h2 className="templates-section-title">Start from Template</h2>
        <p className="templates-section-desc">
          Jump-start your project with a pre-built template.
        </p>
        <div className="templates-grid">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              className="template-card"
              onClick={() => handleTemplateClick(template.id)}
              disabled={isCreatingFromTemplate !== null}
            >
              <span className="template-card-icon">{template.icon}</span>
              <span className="template-card-name">{template.name}</span>
              <span className="template-card-desc">{template.description}</span>
              {isCreatingFromTemplate === template.id && (
                <span className="template-card-loading">Creating...</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
