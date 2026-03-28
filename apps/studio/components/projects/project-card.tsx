"use client";

import Link from "next/link";

interface Project {
  id: string;
  name: string;
  description: string | null;
  updatedAt: string | Date;
}

interface ProjectCardProps {
  project: Project;
  onDelete?: (id: string) => void;
}

function formatRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;

  return d.toLocaleDateString();
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`} className="project-card">
      {onDelete && (
        <button
          className="project-card-delete"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(project.id);
          }}
          title="Delete project"
          aria-label={`Delete ${project.name}`}
        >
          &times;
        </button>
      )}

      <div className="project-card-name">{project.name}</div>

      <div className="project-card-desc">
        {project.description || "No description"}
      </div>

      <div className="project-card-meta">
        Updated {formatRelativeTime(project.updatedAt)}
      </div>
    </Link>
  );
}
