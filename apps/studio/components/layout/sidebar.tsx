"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Button, Divider } from "@entropix/react";

interface Project {
  id: string;
  name: string;
  description: string | null;
  updatedAt: string;
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetchProjects();
  }, [pathname]);

  async function fetchProjects() {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data.projects ?? []);
    } catch {
      // silently fail
    }
  }

  const activeId = pathname.match(/\/projects\/([^/]+)/)?.[1] ?? null;

  return (
    <aside className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`}>
      <div className="sidebar-header">
        <button className="sidebar-toggle" onClick={onToggle} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          {collapsed ? "▶" : "◀"}
        </button>
        {!collapsed && <>Entropix <span>Studio</span></>}
      </div>

      {!collapsed && (
        <>
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
              onPress={() => router.push("/projects")}
              style={{ width: "100%" }}
            >
              All Projects
            </Button>
            <div style={{ display: "flex", justifyContent: "center", paddingTop: "var(--entropix-spacing-3)" }}>
              <UserButton />
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
