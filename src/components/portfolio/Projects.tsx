import { useState, useEffect, useRef } from 'react';
import type { ProjectDetail, DetailContent } from './DetailPanel';

interface ProjectsProps {
  onCardClick?: (detail: DetailContent) => void;
}

const Projects = ({ onCardClick }: ProjectsProps) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [perPage, setPerPage] = useState(2);
  const [isMobile, setIsMobile] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [titleAnimated, setTitleAnimated] = useState(false);
  const [cardAnimated, setCardAnimated] = useState(false);
  const projectsRef = useRef<HTMLDivElement>(null);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Intersection observer for scroll-triggered animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target.classList.contains('projects-title')) {
              setTitleAnimated(true);
            } else if (entry.target.classList.contains('projects-carousel')) {
              setCardAnimated(true);
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    const title = projectsRef.current?.querySelector('.projects-title');
    const carousel = projectsRef.current?.querySelector('.projects-carousel');
    if (title) observer.observe(title);
    if (carousel) observer.observe(carousel);

    return () => observer.disconnect();
  }, []);

  const projects = [
    {
      id: 0,
      title: "AbdullahOS",
      description: "Main Abdullah-focused OS project shell for this static portfolio stage.",
      gradient: "linear-gradient(135deg, #111827 0%, #1f2937 50%, #0f172a 100%)",
      coverImage: "/terminal.png",
      repoUrl: "https://github.com/abdullah-placeholder",
      detail: {
        type: 'project' as const,
        id: 0,
        title: "AbdullahOS",
        gradient: "linear-gradient(135deg, #111827 0%, #1f2937 50%, #0f172a 100%)",
        coverImage: "/terminal.png",
        liveUrl: "/desktop",
        architecture: "Main Abdullah-focused OS project shell for this static portfolio stage. This is placeholder architecture copy for Abdullah Sultan.",
        technicalChallenges: [
          "Placeholder technical challenge",
          "Placeholder implementation note",
          "Placeholder future detail"
        ],
        lessonsLearned: [
          "Placeholder lesson",
          "Final writing will be added later"
        ],
        techStack: ["Astro","React","TypeScript"],
        repoUrl: "https://github.com/abdullah-placeholder"
      } satisfies ProjectDetail
    },
    {
      id: 1,
      title: "Project Shell 01",
      description: "Static placeholder project card. Final project copy will be added later.",
      gradient: "linear-gradient(135deg, #111827 0%, #1f2937 50%, #0f172a 100%)",
      coverImage: "/icons/folder.png",
      repoUrl: "https://github.com/abdullah-placeholder",
      detail: {
        type: 'project' as const,
        id: 1,
        title: "Project Shell 01",
        gradient: "linear-gradient(135deg, #111827 0%, #1f2937 50%, #0f172a 100%)",
        coverImage: "/icons/folder.png",
        architecture: "Static placeholder project card. Final project copy will be added later. This is placeholder architecture copy for Abdullah Sultan.",
        technicalChallenges: [
          "Placeholder technical challenge",
          "Placeholder implementation note",
          "Placeholder future detail"
        ],
        lessonsLearned: [
          "Placeholder lesson",
          "Final writing will be added later"
        ],
        techStack: ["Placeholder"],
        repoUrl: "https://github.com/abdullah-placeholder"
      } satisfies ProjectDetail
    },
    {
      id: 2,
      title: "Project Shell 02",
      description: "Static placeholder project card. Final project copy will be added later.",
      gradient: "linear-gradient(135deg, #111827 0%, #1f2937 50%, #0f172a 100%)",
      coverImage: "/vscode.png",
      repoUrl: "https://github.com/abdullah-placeholder",
      detail: {
        type: 'project' as const,
        id: 2,
        title: "Project Shell 02",
        gradient: "linear-gradient(135deg, #111827 0%, #1f2937 50%, #0f172a 100%)",
        coverImage: "/vscode.png",
        architecture: "Static placeholder project card. Final project copy will be added later. This is placeholder architecture copy for Abdullah Sultan.",
        technicalChallenges: [
          "Placeholder technical challenge",
          "Placeholder implementation note",
          "Placeholder future detail"
        ],
        lessonsLearned: [
          "Placeholder lesson",
          "Final writing will be added later"
        ],
        techStack: ["Placeholder"],
        repoUrl: "https://github.com/abdullah-placeholder"
      } satisfies ProjectDetail
    },
    {
      id: 3,
      title: "Project Shell 03",
      description: "Static placeholder project card. Final project copy will be added later.",
      gradient: "linear-gradient(135deg, #111827 0%, #1f2937 50%, #0f172a 100%)",
      coverImage: "/notes.png",
      repoUrl: "https://github.com/abdullah-placeholder",
      detail: {
        type: 'project' as const,
        id: 3,
        title: "Project Shell 03",
        gradient: "linear-gradient(135deg, #111827 0%, #1f2937 50%, #0f172a 100%)",
        coverImage: "/notes.png",
        architecture: "Static placeholder project card. Final project copy will be added later. This is placeholder architecture copy for Abdullah Sultan.",
        technicalChallenges: [
          "Placeholder technical challenge",
          "Placeholder implementation note",
          "Placeholder future detail"
        ],
        lessonsLearned: [
          "Placeholder lesson",
          "Final writing will be added later"
        ],
        techStack: ["Placeholder"],
        repoUrl: "https://github.com/abdullah-placeholder"
      } satisfies ProjectDetail
    },
    {
      id: 4,
      title: "Robotics Project Shell",
      description: "Static placeholder for future robotics and creative hardware work.",
      gradient: "linear-gradient(135deg, #111827 0%, #1f2937 50%, #0f172a 100%)",
      coverImage: "/icons/folder.png",
      repoUrl: "https://github.com/abdullah-placeholder",
      detail: {
        type: 'project' as const,
        id: 4,
        title: "Robotics Project Shell",
        gradient: "linear-gradient(135deg, #111827 0%, #1f2937 50%, #0f172a 100%)",
        coverImage: "/icons/folder.png",
        architecture: "Static placeholder for future robotics and creative hardware work. This is placeholder architecture copy for Abdullah Sultan.",
        technicalChallenges: [
          "Placeholder technical challenge",
          "Placeholder implementation note",
          "Placeholder future detail"
        ],
        lessonsLearned: [
          "Placeholder lesson",
          "Final writing will be added later"
        ],
        techStack: ["Robotics","Hardware","Prototype"],
        repoUrl: "https://github.com/abdullah-placeholder"
      } satisfies ProjectDetail
    },
    {
      id: 5,
      title: "Quant Project Shell",
      description: "Static placeholder for future quant finance work.",
      gradient: "linear-gradient(135deg, #111827 0%, #1f2937 50%, #0f172a 100%)",
      coverImage: "/trading.png",
      repoUrl: "https://github.com/abdullah-placeholder",
      detail: {
        type: 'project' as const,
        id: 5,
        title: "Quant Project Shell",
        gradient: "linear-gradient(135deg, #111827 0%, #1f2937 50%, #0f172a 100%)",
        coverImage: "/trading.png",
        architecture: "Static placeholder for future quant finance work. This is placeholder architecture copy for Abdullah Sultan.",
        technicalChallenges: [
          "Placeholder technical challenge",
          "Placeholder implementation note",
          "Placeholder future detail"
        ],
        lessonsLearned: [
          "Placeholder lesson",
          "Final writing will be added later"
        ],
        techStack: ["Python","Finance","Research"],
        repoUrl: "https://github.com/abdullah-placeholder"
      } satisfies ProjectDetail
    },
    {
      id: 6,
      title: "Startup Project Shell",
      description: "Static placeholder for future startup-focused work.",
      gradient: "linear-gradient(135deg, #111827 0%, #1f2937 50%, #0f172a 100%)",
      coverImage: "/cover.png",
      repoUrl: "https://github.com/abdullah-placeholder",
      detail: {
        type: 'project' as const,
        id: 6,
        title: "Startup Project Shell",
        gradient: "linear-gradient(135deg, #111827 0%, #1f2937 50%, #0f172a 100%)",
        coverImage: "/cover.png",
        architecture: "Static placeholder for future startup-focused work. This is placeholder architecture copy for Abdullah Sultan.",
        technicalChallenges: [
          "Placeholder technical challenge",
          "Placeholder implementation note",
          "Placeholder future detail"
        ],
        lessonsLearned: [
          "Placeholder lesson",
          "Final writing will be added later"
        ],
        techStack: ["Product","Startup","AI"],
        repoUrl: "https://github.com/abdullah-placeholder"
      } satisfies ProjectDetail
    }
  ];
  const effectivePerPage = isMobile ? 1 : perPage;
  const totalPages = Math.ceil(projects.length / effectivePerPage);
  const safePageIndex = Math.min(pageIndex, totalPages - 1);
  const pageProjects = projects.slice(safePageIndex * effectivePerPage, safePageIndex * effectivePerPage + effectivePerPage);

  const goToPage = (idx: number) => {
    if (isTransitioning || idx === safePageIndex) return;
    setIsTransitioning(true);
    setPageIndex(idx);
    setTimeout(() => setIsTransitioning(false), 400);
  };

  const switchView = (newPerPage: number) => {
    if (newPerPage === perPage) return;
    setIsTransitioning(true);
    setPerPage(newPerPage);
    setPageIndex(0);
    setTimeout(() => setIsTransitioning(false), 400);
  };

  const goNext = () => {
    if (safePageIndex < totalPages - 1) goToPage(safePageIndex + 1);
  };
  const goPrev = () => {
    if (safePageIndex > 0) goToPage(safePageIndex - 1);
  };

  return (
    <div
      ref={projectsRef}
      id="projects"
      className="projects-container"
      style={{
        position: 'relative',
        marginTop: '80px',
        marginLeft: 'auto',
        marginRight: 'auto',
        zIndex: 10,
        width: '90%',
        maxWidth: '1200px',
        minWidth: '320px'
      }}
    >
      {/* Section Title */}
      <h2
        className="projects-title"
        style={{
          fontSize: '1.5rem',
          color: 'rgba(255, 255, 255, 0.75)',
          fontFamily: 'NeueMontreal-MediumItalic, sans-serif',
          fontStyle: 'italic',
          margin: '0 0 1rem 0',
          fontWeight: '500',
          opacity: titleAnimated ? 1 : 0,
          transform: titleAnimated ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.8s ease-out, transform 0.8s ease-out'
        }}>
        Projects
      </h2>

      {/* Carousel */}
      <div
        className="projects-carousel"
        style={{
          opacity: cardAnimated ? 1 : 0,
          transform: cardAnimated ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.8s ease-out 0.15s, transform 0.8s ease-out 0.15s'
        }}
      >
        {/* Cards with overlapping arrows */}
        <div className="projects-carousel-row">
          {/* Cards Grid */}
          <div
            key={`${safePageIndex}-${effectivePerPage}`}
            className={`projects-page-grid projects-grid-${effectivePerPage}`}
            style={{ animation: 'projFadeSlide 0.4s ease-out forwards' }}
          >
          {pageProjects.map((project) => (
            <div
              key={project.id}
              className="glass-project-card"
              data-project-id={project.id}
              onClick={() => {
                if (onCardClick && project.detail) {
                  onCardClick(project.detail);
                } else if (project.repoUrl) {
                  window.open(project.repoUrl, '_blank', 'noopener,noreferrer');
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              {/* Cover Image */}
              <div style={{
                width: '100%',
                height: '200px',
                borderRadius: '12px',
                overflow: 'hidden',
                marginBottom: '1.25rem',
                background: project.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                {project.id === 0 && project.coverImage ? (
                  <div style={{ width: '100%', height: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                      src={project.coverImage}
                      alt={`${project.title} logo`}
                      style={{ width: '80px', height: '80px', opacity: 0.6, filter: 'brightness(0) invert(1)' }}
                    />
                  </div>
                ) : project.coverImage ? (
                  <img
                    src={project.coverImage}
                    alt={`${project.title} preview`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                  />
                ) : (
                  <span style={{
                    fontSize: '2rem',
                    fontFamily: 'NeueMontreal-Medium, sans-serif',
                    color: 'rgba(255, 255, 255, 0.15)',
                    fontWeight: '500',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                  }}>
                    {project.title}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 style={{
                fontSize: 'clamp(1.05rem, 2vw, 1.3rem)',
                color: 'rgba(255, 255, 255, 0.9)',
                fontFamily: 'NeueMontreal-Medium, sans-serif',
                margin: '0 0 0.75rem 0',
                fontWeight: '500'
              }}>
                {project.title}
              </h3>

              {/* Description */}
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: 'clamp(0.85rem, 1.8vw, 0.95rem)',
                fontFamily: 'NeueMontreal-Light, sans-serif',
                lineHeight: '1.7',
                margin: 0,
                fontWeight: '300'
              }}>
                {project.description}
              </p>
            </div>
          ))}
          </div>

          {/* Navigation arrows - absolute positioned */}
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            aria-label="Previous projects"
            className={`proj-nav-btn proj-nav-prev${safePageIndex === 0 ? ' proj-nav-hidden' : ''}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            aria-label="Next projects"
            className={`proj-nav-btn proj-nav-next${safePageIndex >= totalPages - 1 ? ' proj-nav-hidden' : ''}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Bottom controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          position: 'relative',
          marginTop: '0.75rem'
        }}>
          {/* Dot Indicators — centered via flex spacer trick */}
          {totalPages > 1 && (
            <div style={{
              position: 'absolute',
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              pointerEvents: 'none'
            }}>
              <div style={{
                display: 'flex',
                gap: '6px',
                alignItems: 'center',
                pointerEvents: 'auto'
              }}>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToPage(i)}
                    aria-label={`Go to projects page ${i + 1}`}
                    style={{
                      width: i === safePageIndex ? '20px' : '6px',
                      height: '6px',
                      borderRadius: '3px',
                      border: 'none',
                      background: i === safePageIndex ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.25)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      padding: 0
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* View Mode Switcher — bottom right */}
          <div className="view-switcher">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                onClick={() => switchView(n)}
                aria-label={`${n}-column view`}
                className={`view-switcher-btn${perPage === n ? ' view-active' : ''}`}
              >
                <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                  {n === 1 && (
                    <rect x="2" y="1" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                  )}
                  {n === 2 && (<>
                    <rect x="1" y="1" width="6" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                    <rect x="9" y="1" width="6" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                  </>)}
                  {n === 3 && (<>
                    <rect x="0.5" y="1" width="4" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                    <rect x="6" y="1" width="4" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                    <rect x="11.5" y="1" width="4" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                  </>)}
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes projFadeSlide {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .projects-carousel-row {
          position: relative;
        }

        .projects-page-grid {
          display: grid;
          gap: 1.5rem;
          flex: 1;
          min-width: 0;
        }

        .projects-grid-1 { grid-template-columns: 1fr; }
        .projects-grid-2 { grid-template-columns: 1fr 1fr; }
        .projects-grid-3 { grid-template-columns: 1fr 1fr 1fr; }

        .glass-project-card {
          position: relative;
          background: rgba(128, 128, 128, 0.12);
          border-radius: 20px;
          border: 0.5px solid rgba(255, 255, 255, 0.2);
          padding: 1.5rem;
          overflow: hidden;
          box-sizing: border-box;
          transition: box-shadow 0.3s ease, transform 0.3s ease;
        }

        .glass-project-card:hover {
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.4);
          transform: translateY(-4px);
        }

        .glass-project-card h3,
        .glass-project-card p {
          transition: color 0.3s ease !important;
        }

        .glass-project-card:hover h3,
        .glass-project-card:hover p {
          color: rgb(255, 255, 255) !important;
        }

        .glass-project-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
        }

        .glass-project-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 1px;
          height: 100%;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.3), transparent, rgba(255, 255, 255, 0.1));
          pointer-events: none;
        }

        .proj-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 0.5px solid rgba(255, 255, 255, 0.15);
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 0;
          z-index: 2;
        }

        .proj-nav-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          color: white;
        }

        .proj-nav-prev { left: -48px; }
        .proj-nav-next { right: -48px; }

        .proj-nav-btn.proj-nav-hidden {
          opacity: 0;
          pointer-events: none;
        }

        /* View Switcher */
        .view-switcher {
          display: flex;
          align-items: center;
          gap: 2px;
          background: rgba(255, 255, 255, 0.06);
          border: 0.5px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
          padding: 3px;
        }

        .view-switcher-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 22px;
          border: none;
          border-radius: 5px;
          background: transparent;
          color: rgba(255, 255, 255, 0.3);
          cursor: pointer;
          transition: all 0.25s ease;
          padding: 0;
        }

        .view-switcher-btn:hover {
          color: rgba(255, 255, 255, 0.6);
        }

        .view-switcher-btn.view-active {
          background: rgba(255, 255, 255, 0.12);
          color: rgba(255, 255, 255, 0.85);
        }

        @media (max-width: 768px) {
          .projects-container {
            width: calc(95% - 40px) !important;
            min-width: 300px !important;
            padding: 0 20px 40px 20px !important;
          }
          .proj-nav-btn { width: 30px; height: 30px; }
          .proj-nav-prev { left: -40px; }
          .proj-nav-next { right: -40px; }
          .view-switcher { display: none; }
        }

        @media (max-width: 480px) {
          .projects-container {
            width: calc(98% - 40px) !important;
            min-width: 280px !important;
            padding: 0 20px 40px 20px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Projects;
