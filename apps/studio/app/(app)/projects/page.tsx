import { ProjectsPageClient } from "./projects-page-client";

// Force dynamic rendering — database connection only available at runtime
export const dynamic = "force-dynamic";

export default function ProjectsPage() {
  return <ProjectsPageClient initialProjects={[]} />;
}
