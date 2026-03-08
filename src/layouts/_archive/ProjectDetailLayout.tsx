import { type ReactNode } from 'react';
import { FaRegFolderClosed } from 'react-icons/fa6';
import MobileDock from '../../components/global/MobileDock';
import DesktopDock from '../../components/global/DesktopDock';
import Nav from '../../components/global/Nav';

interface ProjectDetailLayoutProps {
  title: string;
  summary: string;
  year: number;
  tech: string[];
  slug: string;
  highlights?: string[];
  repoUrl?: string;
  liveUrl?: string;
  children?: ReactNode;
  initialBg: string;
  backgroundMap: Record<string, string>;
  recentPosts?: Array<{
    title: string;
    slug: string;
    publishedAt: string;
    readingTime: number;
  }>;
}

export default function ProjectDetailLayout({
  title,
  summary,
  year,
  tech,
  slug,
  highlights,
  repoUrl,
  liveUrl,
  children,
  initialBg,
  backgroundMap,
  recentPosts,
}: ProjectDetailLayoutProps) {
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
      <div className="relative z-0 pt-12 pb-32 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <a
              href="/projects"
              className="inline-flex items-center space-x-2 text-gray-300 hover:text-white transition-colors font-mono text-sm glass px-4 py-2 rounded"
            >
              <span className="text-green-400">$</span>
              <span>cd ..</span>
            </a>
          </div>

          {/* Project Terminal Window */}
          <div className="glass rounded-lg overflow-hidden shadow-2xl">
            {/* Terminal Title Bar */}
            <div className="h-6 flex items-center space-x-2 px-4 border-b border-white/10">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-200 flex-grow text-center font-semibold flex items-center justify-center gap-2">
                <FaRegFolderClosed size={14} className="text-gray-200" />
                {slug} — project
              </span>
            </div>

            {/* Terminal Content */}
            <div className="p-8 lg:p-12">
              {/* Header */}
              <header className="mb-8 pb-6 border-b border-gray-700/50">
                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-3xl lg:text-4xl font-bold text-white font-mono">
                    {title}
                  </h1>
                  <span className="text-sm text-gray-400 font-mono ml-4">
                    {year}
                  </span>
                </div>

                <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                  {summary}
                </p>

                {/* Tech Stack */}
                <div className="tag-list flex flex-wrap gap-2 mb-6">
                  {tech.map((techItem, index) => (
                    <span
                      key={index}
                      className="pill"
                    >
                      #{techItem}
                    </span>
                  ))}
                </div>

                {/* Links */}
                {(repoUrl || liveUrl) && (
                  <div className="flex flex-wrap gap-3">
                    {repoUrl && (
                      <a
                        href={repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700/50 text-gray-300 border border-gray-600 rounded hover:bg-gray-700 hover:text-white transition-all font-mono text-sm"
                      >
                        <span>GitHub</span>
                        <span>↗</span>
                      </a>
                    )}
                    {liveUrl && (
                      <a
                        href={liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded hover:bg-green-500/30 transition-all font-mono text-sm"
                      >
                        <span>Live Demo</span>
                        <span>↗</span>
                      </a>
                    )}
                  </div>
                )}
              </header>

              {/* Article Content */}
              <article className="prose">
                {children}
              </article>

              {/* Highlights */}
              {highlights && highlights.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-700/50">
                  <h2 className="text-xl font-bold text-white mb-6 font-mono">
                    <span className="text-green-400">$</span> cat highlights.txt
                  </h2>
                  <ul className="space-y-3">
                    {highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-300">
                        <span className="text-green-400 mt-1 font-mono">•</span>
                        <span className="leading-relaxed">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Footer */}
              <footer className="mt-12 pt-8 border-t border-gray-700/50">
                <div className="text-center">
                  <p className="text-gray-400 mb-4 font-mono text-sm">
                    <span className="text-green-400">$</span> Interested in this project?
                  </p>
                  <a
                    href="/contact"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-all font-mono text-sm"
                  >
                    <span>Get in touch</span>
                    <span>→</span>
                  </a>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </div>

      {/* Docks */}
      <MobileDock />
      <DesktopDock />
    </div>
  );
}
