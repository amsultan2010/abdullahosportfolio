import { FaRegFolderClosed } from 'react-icons/fa6';

interface Project {
  title: string;
  slug: string;
  year: number;
  tech: string[];
  summary: string;
  status: string;
  repoUrl?: string;
}

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <a
      href={`/projects/${project.slug}`}
      className="block glass rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
    >
      {/* Terminal Title Bar */}
      <div className="h-6 flex items-center space-x-2 px-4 border-b border-white/10">
        <div className="w-3 h-3 rounded-full bg-red-500 group-hover:bg-red-400 transition-colors"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500 group-hover:bg-yellow-400 transition-colors"></div>
        <div className="w-3 h-3 rounded-full bg-green-500 group-hover:bg-green-400 transition-colors"></div>
        <span className="text-sm text-gray-200 flex-grow text-center font-semibold flex items-center justify-center gap-2">
          <FaRegFolderClosed size={14} className="text-gray-200" />
          ~/projects/{project.slug}
        </span>
      </div>

      {/* Terminal Content */}
      <div className="p-8 text-gray-200 font-mono text-sm">
        {/* Title and Status */}
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-base font-bold text-white group-hover:text-green-400 transition-colors">
            {project.title}
          </h2>
          <div className="flex items-center gap-2 ml-2">
            <span className={`text-xs px-2 py-1 rounded ${
              project.status === 'Live' 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}>
              {project.status}
            </span>
            <span className="text-xs text-gray-500">{project.year}</span>
          </div>
        </div>

        {/* Summary */}
        <p className="text-gray-300 leading-relaxed mb-5">
          {project.summary}
        </p>

        {/* Tech Stack Tags */}
        <div className="tag-list flex flex-wrap gap-2 mb-5">
          {project.tech.map((tech, index) => (
            <span
              key={index}
              className="pill"
            >
              #{tech}
            </span>
          ))}
        </div>

        {/* Links */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <span className="text-green-400">$</span>
            <span className="text-green-400 group-hover:text-green-300 transition-colors">
              cat README.md →
            </span>
          </div>
          {project.repoUrl && (
            <a 
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-gray-400 hover:text-green-400 transition-colors flex items-center gap-1"
            >
              GitHub ↗
            </a>
          )}
        </div>
      </div>
    </a>
  );
}
