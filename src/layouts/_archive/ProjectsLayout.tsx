import MobileDock from '../../components/global/MobileDock';
import DesktopDock from '../../components/global/DesktopDock';
import Nav from '../../components/global/Nav';
import ProjectCarousel from '../../components/ProjectCarousel';

interface Project {
  title: string;
  slug: string;
  year: number;
  tech: string[];
  summary: string;
  status: string;
  repoUrl?: string;
}

interface ProjectsLayoutProps {
  projects: Project[];
  initialBg: string;
  backgroundMap: Record<string, string>;
  recentPosts?: Array<{
    title: string;
    slug: string;
    publishedAt: string;
    readingTime: number;
  }>;
}

export default function ProjectsLayout({ projects, initialBg, backgroundMap, recentPosts }: ProjectsLayoutProps) {
  // Always use bg-1 (the sand/mountain background)
  const currentBg = 'bg-1';

  return (
    <div className="relative w-screen min-h-screen overflow-x-hidden">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundMap[currentBg]})` }}
      />

      {/* Navbar */}
      <div className="relative z-10">
        <Nav currentPath="/projects" recentPosts={recentPosts} />
      </div>

      {/* Main Content */}
      <div className="relative z-0 pt-12 pb-24 md:pb-32 px-4 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12 mt-8 flex justify-center">
            <div className="glass rounded-lg p-6">
              <h1 className="text-base font-bold text-white mb-2 font-mono">
                <span className="text-green-400">$</span> cd ~/projects
              </h1>
              <p className="text-gray-300 font-mono text-sm">
                Software projects focused on trading, infrastructure, and developer tools.
              </p>
            </div>
          </div>
        </div>

        {/* Projects Carousel - Full Width */}
        <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center">
          {/* Projects Carousel */}
          {projects.length > 0 ? (
            <ProjectCarousel projects={projects} />
          ) : (
            /* Empty State */
            <div className="text-center py-12">
              <div className="glass rounded-lg p-8 inline-block">
                <p className="text-gray-300 font-mono">
                  <span className="text-green-400">$</span> ls -la
                  <br />
                  <span className="text-gray-500">No projects yet. Check back soon!</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Docks */}
      <MobileDock />
      <DesktopDock />
    </div>
  );
}
