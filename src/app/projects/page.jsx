import ProjectsPageClient from '@/components/sections/ProjectsPageClient';
import { getProjects } from '@/lib/projects';

export default async function ProjectsPage() {
  const projects = await getProjects();

  return <ProjectsPageClient projects={projects} />;
}
