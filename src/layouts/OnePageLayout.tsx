import { useRef, useEffect, useState } from 'react';
import { FaRegFolderClosed, FaGithub, FaEnvelope } from 'react-icons/fa6';

interface Project {
  title: string;
  slug: string;
  year: number;
  tech: string[];
  summary: string;
  repoUrl?: string;
  liveUrl?: string;
}

interface CaseStudy {
  title: string;
  slug: string;
  company: string;
  summary: string;
}

interface OnePageLayoutProps {
  initialBg: string;
  backgroundMap: Record<string, string>;
  projects: Project[];
  caseStudies: CaseStudy[];
}

export default function OnePageLayout({
  initialBg,
  backgroundMap,
  projects,
  caseStudies,
}: OnePageLayoutProps) {
  const currentBg = 'bg-1';
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [expandedCase, setExpandedCase] = useState<string | null>(null);
  const [terminalInput, setTerminalInput] = useState('');
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="relative min-h-screen w-screen bg-gray-950 overflow-x-hidden">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${backgroundMap[currentBg]})` }}
      />

      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-0" />

      {/* Content */}
      <div className="relative z-10 w-full">
        {/* Hero Section */}
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-2xl">
            <div className="glass rounded-lg overflow-hidden shadow-2xl">
              {/* Terminal Header */}
              <div className="h-6 flex items-center space-x-2 px-4 border-b border-white/10 bg-black/20">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-200 flex-grow text-center font-semibold flex items-center justify-center gap-2">
                  <FaRegFolderClosed size={14} className="text-gray-200" />
                  ronnielgandhe.com — zsh
                </span>
              </div>

              {/* Terminal Content */}
              <div className="p-6 text-gray-100 font-mono text-sm min-h-[400px] flex flex-col">
                <div className="flex-1">
                  <div className="text-white font-bold text-base mb-2">Ronniel Gandhe — Software Engineer</div>
                  <div className="h-2" />
                  <div className="text-gray-300 mb-1">
                    <span style={{ color: '#ff79c6' }}>Location:</span> Waterloo, ON
                  </div>
                  <div className="text-gray-300 mb-1">
                    <span style={{ color: '#f1fa8c' }}>Email:</span> ronnielgandhe@gmail.com
                  </div>
                  <div className="text-gray-300 mb-6">
                    <span style={{ color: '#8be9fd' }}>GitHub:</span> github.com/ronnielgandhe
                  </div>
                  <div className="text-gray-300 mt-8 leading-relaxed">
                    I build systems that think, design that feels, and code that connects ideas to impact.
                  </div>
                </div>

                {/* Input */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <span className="whitespace-nowrap text-green-400 font-semibold">ronnielgandhe.tech %</span>
                    <input
                      type="text"
                      value={terminalInput}
                      onChange={(e) => setTerminalInput(e.target.value)}
                      className="w-full sm:flex-1 bg-transparent outline-none text-white placeholder-gray-400"
                      placeholder="Scroll to explore"
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Scroll hint */}
            <div className="text-center mt-8">
              <p className="text-gray-400 text-sm font-mono">↓ Scroll to explore projects, case studies, and more</p>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="relative z-10 py-24 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white font-mono mb-2">
                <span className="text-green-400">$</span> cd ~/projects
              </h2>
              <p className="text-gray-300 font-mono text-sm">
                Software projects focused on trading, infrastructure, and developer tools.
              </p>
            </div>

            <div className="space-y-4">
              {projects.map((project) => (
                <div
                  key={project.slug}
                  className="glass rounded-lg overflow-hidden hover:bg-white/10 transition-all cursor-pointer"
                  onClick={() => setExpandedProject(expandedProject === project.slug ? null : project.slug)}
                >
                  {/* Project Header */}
                  <div className="p-6 border-b border-white/10">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-2">{project.title}</h3>
                        <p className="text-gray-300 text-sm mb-3">{project.summary}</p>
                        <div className="flex flex-wrap gap-2">
                          {project.tech.map((tech, idx) => (
                            <span key={idx} className="pill text-xs">
                              #{tech}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="text-gray-400 text-xs whitespace-nowrap ml-4">{project.year}</span>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedProject === project.slug && (
                    <div className="p-6 bg-black/20 border-t border-white/10">
                      <div className="space-y-4">
                        <p className="text-gray-300 text-sm leading-relaxed">
                          Click the title to view full project details.
                        </p>
                        {project.repoUrl && (
                          <a
                            href={project.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded hover:bg-green-500/30 transition-all text-sm"
                          >
                            <FaGithub size={14} />
                            View Repository
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Case Studies Section */}
        <div className="relative z-10 py-24 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white font-mono mb-2">
                <span className="text-green-400">$</span> case-studies
              </h2>
              <p className="text-gray-300 font-mono text-sm">
                Strategic analysis of architecture decisions at scale.
              </p>
            </div>

            <div className="space-y-4">
              {caseStudies.map((caseStudy) => (
                <div
                  key={caseStudy.slug}
                  className="glass rounded-lg overflow-hidden hover:bg-white/10 transition-all cursor-pointer"
                  onClick={() => setExpandedCase(expandedCase === caseStudy.slug ? null : caseStudy.slug)}
                >
                  {/* Case Header */}
                  <div className="p-6 border-b border-white/10">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-2">{caseStudy.company}</h3>
                        <p className="text-gray-300 text-sm">{caseStudy.title}</p>
                        <p className="text-gray-400 text-xs mt-2">{caseStudy.summary}</p>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedCase === caseStudy.slug && (
                    <div className="p-6 bg-black/20 border-t border-white/10">
                      <p className="text-gray-300 text-sm mb-4">
                        Full case study analysis available on the dedicated case study page.
                      </p>
                      <a
                        href={`/case-studies/${caseStudy.slug}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded hover:bg-blue-500/30 transition-all text-sm"
                      >
                        Read Full Analysis →
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact/About Section */}
        <div className="relative z-10 py-24 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="glass rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white font-mono mb-6">
                <span className="text-green-400">$</span> about
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-white font-semibold mb-3">About Me</h3>
                    <p className="text-gray-300 leading-relaxed text-sm">
                      Software engineer based in Waterloo, ON specializing in systematic trading strategies and scalable infrastructure. I focus on building systems that think clearly, design that feels natural, and code that creates impact.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-white font-semibold mb-3">Interests</h3>
                    <p className="text-gray-300 leading-relaxed text-sm">
                      Quantitative finance, cloud architecture, developer tooling, long-distance running, strength training, and photography.
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-white font-semibold mb-4">Connect</h3>
                    <div className="space-y-3">
                      <a
                        href="mailto:ronnielgandhe@gmail.com"
                        className="flex items-center gap-3 text-gray-300 hover:text-green-400 transition-colors group"
                      >
                        <FaEnvelope size={16} className="text-green-400" />
                        <span className="text-sm group-hover:underline">ronnielgandhe@gmail.com</span>
                      </a>
                      <a
                        href="https://github.com/ronnielgandhe"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-gray-300 hover:text-green-400 transition-colors group"
                      >
                        <FaGithub size={16} className="text-green-400" />
                        <span className="text-sm group-hover:underline">github.com/ronnielgandhe</span>
                      </a>
                      <a
                        href="/Ronniel_Gandhe_Resume.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded hover:bg-green-500/30 transition-all text-sm mt-3"
                      >
                        Download Resume →
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-gray-400 text-xs text-center">
                  © 2024 Ronniel Gandhe. Built with Astro + React.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
