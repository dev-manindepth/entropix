import { getProjects } from "@/lib/db/queries";
import { ProjectsPageClient } from "./projects-page-client";

export default function ProjectsPage() {
  const projects = getProjects();
  return <ProjectsPageClient initialProjects={projects} />;
}
