"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@entropix/react";
import { Divider } from "@entropix/react";

interface Project {
  id: string;
  name: string;
  description: string | null;
  updatedAt: string;
}

export function Sidebar() {
  const [projects, setProjects] = useState<Project[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data.projects ?? []);
    } catch {
      // silently fail — sidebar will show empty list
    }
  }

  function getActiveProjectId(): string | null {
    const match = pathname.match(/\/projects\/([^/]+)/);
    return match ? match[1] : null;
  }

  const activeId = getActiveProjectId();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        Entropix <span>Studio</span>
      </div>

      <nav className="sidebar-list">
        {projects.map((project) => (
          <button
            key={project.id}
            className={`sidebar-item ${activeId === project.id ? "sidebar-item--active" : ""}`}
            onClick={() => router.push(`/projects/${project.id}`)}
          >
            {project.name}
          </button>
        ))}

        {projects.length === 0 && (
          <p style={{
            padding: "var(--entropix-spacing-3)",
            fontSize: "0.8125rem",
            color: "var(--entropix-color-text-secondary)",
          }}>
            No projects yet
          </p>
        )}
      </nav>

      <Divider />

      <div className="sidebar-footer">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => router.push("/projects")}
          style={{ width: "100%" }}
        >
          All Projects
        </Button>
      </div>
    </aside>
  );
}
