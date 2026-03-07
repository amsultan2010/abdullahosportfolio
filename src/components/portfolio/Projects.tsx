import { useState, useEffect, useRef } from 'react';
import type { ProjectDetail, DetailContent } from './DetailPanel';

interface ProjectsProps {
  onCardClick?: (detail: DetailContent) => void;
}

const Projects = ({ onCardClick }: ProjectsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [titleAnimated, setTitleAnimated] = useState(false);
  const [cardAnimated, setCardAnimated] = useState(false);
  const projectsRef = useRef<HTMLDivElement>(null);

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

  const goTo = (index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 400);
  };

  const goNext = () => goTo((currentIndex + 1) % projects.length);
  const goPrev = () => goTo((currentIndex - 1 + projects.length) % projects.length);

  const projects = [
    {
      id: 1,
      title: "QuantZoo",
      description: "Production-grade Python framework for systematic strategy research, backtesting, walk-forward validation, real-time streaming, and risk analytics. Built with PyTorch, Hugging Face, and FastAPI.",
      gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      coverImage: "/trading.png",
      repoUrl: "https://github.com/ronnielgandhe/quantzoo",
      detail: {
        type: 'project' as const,
        id: 1,
        title: "QuantZoo",
        gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        coverImage: "/trading.png",
        architecture: "Modular Python framework with a plugin-based strategy engine. Backtesting core uses vectorized operations for performance. Walk-forward validation with configurable rolling windows. Real-time streaming via WebSocket connections with FastAPI backend.",
        technicalChallenges: [
          "Implementing walk-forward validation without look-ahead bias",
          "Building a real-time streaming pipeline that handles market data at sub-second latency",
          "Designing a plugin architecture flexible enough for diverse strategy types"
        ],
        lessonsLearned: [
          "Vectorized operations in NumPy/Pandas dramatically outperform loop-based approaches for backtesting",
          "Proper data alignment and timezone handling is critical for financial data",
          "Walk-forward validation is essential to avoid overfitting in strategy research"
        ],
        techStack: ["Python", "PyTorch", "Hugging Face", "FastAPI", "NumPy", "Pandas", "WebSocket"],
        repoUrl: "https://github.com/ronnielgandhe/quantzoo"
      } satisfies ProjectDetail
    },
    {
      id: 2,
      title: "CreatorScope",
      description: "Go-to-market automation tool for sourcing TikTok creators for brand partnerships. Multi-source discovery, three-tier classification, and Creator Intent Scoring (0-100). Built with FastAPI, SQLAlchemy, and RapidAPI.",
      gradient: "linear-gradient(135deg, #0d1117 0%, #161b22 50%, #21262d 100%)",
      coverImage: "/cover.png",
      repoUrl: "https://github.com/ronnielgandhe/creatorscope",
      detail: {
        type: 'project' as const,
        id: 2,
        title: "CreatorScope",
        gradient: "linear-gradient(135deg, #0d1117 0%, #161b22 50%, #21262d 100%)",
        coverImage: "/cover.png",
        demoVideo: "/creatorscope-demo.mov",
        architecture: "FastAPI backend with SQLAlchemy ORM and SQLite. Background task workers handle async scraping via RapidAPI's TikTok scraper. Single-page frontend with real-time dashboard polling. Three-tier classification pipeline with configurable thresholds.",
        technicalChallenges: [
          "Managing API rate limits and budgets (50-400 calls) while maximizing discovery coverage",
          "Building a scoring algorithm that accurately predicts creator openness to brand deals",
          "Handling async scraping with proper error recovery and retry logic"
        ],
        lessonsLearned: [
          "API budget management is crucial when working with paid external APIs",
          "A three-tier classification (Pass/Review/Filter) is more practical than binary classification",
          "Pre-built niche presets dramatically improve user experience for non-technical users"
        ],
        techStack: ["Python", "FastAPI", "SQLAlchemy", "SQLite", "RapidAPI", "HTML/CSS/JS"],
        repoUrl: "https://github.com/ronnielgandhe/creatorscope"
      } satisfies ProjectDetail
    },
    {
      id: 3,
      title: "YourNews",
      description: "AI-powered personalized news aggregator using TF-IDF/BM25 ranking and GPT-4 summaries. Profile-aware ranking with smart query classification and click-feedback personalization.",
      gradient: "linear-gradient(135deg, #1a1a1a 0%, #2d1f3d 50%, #1a1a2e 100%)",
      coverImage: "/yournews-cover.png",
      repoUrl: "https://github.com/ronnielgandhe/yournews",
      detail: {
        type: 'project' as const,
        id: 3,
        title: "YourNews",
        gradient: "linear-gradient(135deg, #1a1a1a 0%, #2d1f3d 50%, #1a1a2e 100%)",
        coverImage: "/yournews-cover.png",
        demoVideo: "/yournews-demo.mp4",
        architecture: "Hybrid ranking pipeline combining TF-IDF and BM25 for relevance scoring. GPT-4 integration for article summarization. User profile system tracks reading preferences via click-feedback loops. Smart query classifier routes searches to appropriate ranking strategy.",
        technicalChallenges: [
          "Balancing relevance scoring between TF-IDF and BM25 for different query types",
          "Implementing real-time click-feedback personalization without cold-start problems",
          "Managing GPT-4 API costs while providing useful summaries"
        ],
        lessonsLearned: [
          "Hybrid ranking approaches outperform single-method approaches for diverse content",
          "Click-feedback personalization needs careful dampening to avoid filter bubbles",
          "Smart query classification (navigational vs informational) improves ranking quality"
        ],
        techStack: ["Python", "GPT-4 API", "TF-IDF", "BM25", "FastAPI", "React"],
        repoUrl: "https://github.com/ronnielgandhe/yournews"
      } satisfies ProjectDetail
    },
    {
      id: 4,
      title: "How Many Clicks",
      description: "Wikipedia connection game where an AI pathfinding algorithm races to link two articles, then users compete to beat it. Real-time beam search with semantic scoring, hub recognition, and journey visualization.",
      gradient: "linear-gradient(135deg, #1a1a1a 0%, #2a1a1a 50%, #1a1a2e 100%)",
      coverImage: "/howmanyclicks-cover.png",
      repoUrl: "https://github.com/ronnielgandhe/how-many-clicks",
      detail: {
        type: 'project' as const,
        id: 4,
        title: "How Many Clicks",
        gradient: "linear-gradient(135deg, #1a1a1a 0%, #2a1a1a 50%, #1a1a2e 100%)",
        coverImage: "/howmanyclicks-cover.png",
        demoVideo: "/howmanyclicks-demo.mp4",
        architecture: "Entirely browser-based React + Vite app with no backend. Uses the Wikipedia MediaWiki API for article data and link traversal. Beam search pathfinding evaluates links based on semantic similarity to the target while penalizing topic clustering and recognizing bridging hub pages. Dual modes: Normal (exploratory beam search) and God Mode (wider search, faster results).",
        technicalChallenges: [
          "Building a real-time pathfinding algorithm that balances exploration breadth with semantic relevance scoring",
          "Implementing hub article recognition and diversity penalties to avoid getting stuck in topic clusters",
          "Visualizing the AI's journey in real-time with article snapshots and reasoning commentary"
        ],
        lessonsLearned: [
          "Beam search with semantic scoring outperforms naive BFS for Wikipedia navigation",
          "Related term expansion and bridging hub recognition are key to finding non-obvious paths",
          "Entirely client-side apps can still deliver rich interactive experiences without a backend"
        ],
        techStack: ["React", "Vite", "JavaScript", "Wikipedia API", "CSS Animations"],
        repoUrl: "https://github.com/ronnielgandhe/how-many-clicks"
      } satisfies ProjectDetail
    }
  ];

  const project = projects[currentIndex];

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
        overflow: 'hidden'
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
          position: 'relative',
          opacity: cardAnimated ? 1 : 0,
          transform: cardAnimated ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.8s ease-out 0.15s, transform 0.8s ease-out 0.15s'
        }}
      >
        {/* Prev / Next Arrows */}
        <button
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
          aria-label="Previous project"
          className="proj-nav-btn proj-nav-prev"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          aria-label="Next project"
          className="proj-nav-btn proj-nav-next"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Card */}
        <div
          key={currentIndex}
          className="glass-project-card"
          data-project-id={project.id}
          onClick={() => {
            if (onCardClick && project.detail) {
              onCardClick(project.detail);
            } else if (project.repoUrl) {
              window.open(project.repoUrl, '_blank', 'noopener,noreferrer');
            }
          }}
          style={{ cursor: 'pointer', animation: 'projFadeSlide 0.4s ease-out forwards' }}
        >
          {/* Cover Image */}
          <div style={{
            width: '100%',
            height: '240px',
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '1.25rem',
            background: project.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {project.coverImage ? (
              <img
                src={project.coverImage}
                alt={`${project.title} preview`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
            fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
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
            fontSize: 'clamp(0.9rem, 2vw, 1rem)',
            fontFamily: 'NeueMontreal-Light, sans-serif',
            lineHeight: '1.7',
            margin: 0,
            fontWeight: '300'
          }}>
            {project.description}
          </p>
        </div>

        {/* Dot Indicators */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '1.25rem'
        }}>
          {projects.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to project ${i + 1}`}
              style={{
                width: i === currentIndex ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                border: 'none',
                background: i === currentIndex ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.25)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0
              }}
            />
          ))}
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes projFadeSlide {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .glass-project-card {
          position: relative;
          background: rgba(128, 128, 128, 0.12);
          border-radius: 20px;
          border: 0.5px solid rgba(255, 255, 255, 0.2);
          padding: 1.5rem;
          overflow: hidden;
          box-sizing: border-box;
          transition: box-shadow 0.3s ease;
        }

        .glass-project-card:hover {
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.4);
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
          top: 140px;
          z-index: 5;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 0.5px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 0;
        }

        .proj-nav-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          color: white;
        }

        .proj-nav-prev { left: -50px; }
        .proj-nav-next { right: -50px; }

        @media (max-width: 1200px) {
          .proj-nav-prev { left: -10px; }
          .proj-nav-next { right: -10px; }
        }

        @media (max-width: 768px) {
          .projects-container {
            width: calc(95% - 40px) !important;
            min-width: 300px !important;
            padding: 0 20px 40px 20px !important;
          }
          .proj-nav-prev { left: -5px; }
          .proj-nav-next { right: -5px; }
          .proj-nav-btn { width: 34px; height: 34px; }
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
