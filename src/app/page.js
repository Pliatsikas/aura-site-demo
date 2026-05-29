import HeroSection from '@/components/sections/HeroSection';
import SensoryShowcase from '@/components/sections/SensoryShowcase';
import { getProjects } from '@/lib/projects';

export default async function Home() {
  const projects = await getProjects();

  return (
    <>
      <HeroSection />
      <SensoryShowcase projects={projects} />
    </>
  );
}