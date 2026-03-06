import { useState, useEffect, useRef } from 'react';

const Projects = () => {
  const [titleAnimated, setTitleAnimated] = useState(false);
  const [animatedCards, setAnimatedCards] = useState(new Set<string>());
  const projectsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target.classList.contains('projects-title')) {
              setTitleAnimated(true);
            } else if (!(entry.target as HTMLElement).dataset.projectId || !animatedCards.has((entry.target as HTMLElement).dataset.projectId!)) {
              const projectId = (entry.target as HTMLElement).dataset.projectId;
              if (projectId) {
                setAnimatedCards(prev => new Set([...prev, projectId]));
              }
            }
          }
        });
      },
      {
        threshold: 0,
        rootMargin: '0px 0px 0px 0px'
      }
    );

    const title = projectsRef.current?.querySelector('.projects-title');
    const projectCards = projectsRef.current?.querySelectorAll('.project-card');

    if (title) observer.observe(title);
    if (projectCards) {
      projectCards.forEach(card => observer.observe(card));
    }

    return () => observer.disconnect();
  }, [animatedCards]);

  const projects = [
    {
      id: 1,
      title: "QuantZoo",
      description: "Production-grade Python framework for systematic strategy research, backtesting, walk-forward validation, real-time streaming, and risk analytics. Built with PyTorch, Hugging Face, and FastAPI.",
      gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      repoUrl: "https://github.com/ronnielgandhe/quantzoo"
    },
    {
      id: 2,
      title: "CreatorScope",
      description: "Go-to-market automation tool for sourcing TikTok creators for brand partnerships. Multi-source discovery, three-tier classification, and Creator Intent Scoring (0-100). Built with FastAPI, SQLAlchemy, and RapidAPI.",
      gradient: "linear-gradient(135deg, #0d1117 0%, #161b22 50%, #21262d 100%)",
      repoUrl: "https://github.com/ronnielgandhe/creatorscope"
    },
    {
      id: 3,
      title: "YourNews",
      description: "AI-powered personalized news aggregator using TF-IDF/BM25 ranking and GPT-4 summaries. Profile-aware ranking with smart query classification and click-feedback personalization.",
      gradient: "linear-gradient(135deg, #1a1a1a 0%, #2d1f3d 50%, #1a1a2e 100%)",
      repoUrl: "https://github.com/ronnielgandhe/yournews"
    }
  ];

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
        minWidth: '320px',
        overflow: 'hidden',
        paddingBottom: '80px'
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

      {/* Projects Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        width: '100%'
      }}>
        {projects.map((project) => {
          const isAnimated = animatedCards.has(project.id.toString());
          return (
            <div
              key={project.id}
              data-project-id={project.id}
              className={`project-card glass-project-card ${isAnimated ? 'animated' : ''}`}
              onClick={() => {
                if (project.repoUrl) {
                  window.open(project.repoUrl, '_blank', 'noopener,noreferrer');
                }
              }}
              style={{
                cursor: 'pointer'
              }}
            >
              {/* Project Image Placeholder with Gradient */}
              <div style={{
                width: '100%',
                height: '200px',
                borderRadius: '12px',
                overflow: 'hidden',
                marginBottom: '1rem',
                background: project.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
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
              </div>

              {/* Project Content */}
              <h3 style={{
                fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
                color: 'rgba(255, 255, 255, 0.75)',
                fontFamily: 'NeueMontreal-Medium, sans-serif',
                fontStyle: 'normal',
                margin: '0 0 1rem 0',
                fontWeight: '500',
                wordWrap: 'break-word',
                overflowWrap: 'break-word'
              }}>
                {project.title}
              </h3>

              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                fontFamily: 'NeueMontreal-Light, sans-serif',
                lineHeight: '1.6',
                margin: 0,
                fontWeight: '300',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                wordBreak: 'break-word',
                hyphens: 'auto',
                letterSpacing: '0.01em'
              }}>
                {project.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Responsive CSS */}
      <style>{`
        @font-face {
          font-family: 'NeueMontreal-MediumItalic';
          src: url('/NeueMontreal-MediumItalic.otf') format('opentype');
          font-weight: 500;
          font-style: italic;
        }

        @font-face {
          font-family: 'NeueMontreal-Light';
          src: url('/NeueMontreal-Light.otf') format('opentype');
          font-weight: 300;
          font-style: normal;
        }

        .glass-project-card {
          position: relative;
          background: rgba(128, 128, 128, 0.12);
          border-radius: 20px;
          border: 0.5px solid rgba(255, 255, 255, 0.2);
          padding: 1.5rem;
          overflow: hidden;
          box-sizing: border-box;
          transition: all 0.3s ease;
          cursor: pointer;
          opacity: 0;
          transform: translateY(20px);
        }

        .glass-project-card.animated {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }

        .glass-project-card:hover {
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.4);
          transform: translateZ(10px) scale(1.02);
          transition: all 0.3s ease;
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

        @media (max-width: 768px) {
          .projects-container {
            width: calc(95% - 40px) !important;
            min-width: 300px !important;
            padding: 0 20px 80px 20px !important;
          }
        }

        @media (max-width: 480px) {
          .projects-container {
            width: calc(98% - 40px) !important;
            min-width: 280px !important;
            padding: 0 20px 80px 20px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Projects;
