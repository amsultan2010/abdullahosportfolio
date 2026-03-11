import { useState, useRef, useEffect } from 'react';
import type { ProjectDetail, DetailContent } from './DetailPanel';

interface ProjectsProps {
  onCardClick?: (detail: DetailContent) => void;
  windowMode?: boolean;
}

const projects = [
  {
    id: 1,
    title: "QuantZoo",
    description: "Production-grade Python framework for systematic strategy research, backtesting, walk-forward validation, real-time streaming, and risk analytics. Built with PyTorch, Hugging Face, and FastAPI.",
    gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    coverImage: "/trading.png",
    repoUrl: "https://github.com/ronnielgandhe/quantzoo",
    language: "Python",
    files: ["README.md", "requirements.txt", "setup.py", "src/", "tests/", "config/"],
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
    language: "Python",
    files: ["README.md", "requirements.txt", "main.py", "api/", "models/", "static/"],
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
    language: "Python",
    files: ["README.md", "requirements.txt", "app.py", "ranking/", "models/", "templates/"],
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
    language: "JavaScript",
    files: ["README.md", "package.json", "vite.config.js", "src/", "public/", "index.html"],
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

// File icon by extension/name
function getFileIcon(name: string): { icon: string; color: string } {
  if (name === 'README.md') return { icon: 'M', color: '#519aba' };
  if (name.endsWith('.py')) return { icon: 'Py', color: '#3572A5' };
  if (name.endsWith('.js')) return { icon: 'JS', color: '#f1e05a' };
  if (name.endsWith('.ts') || name.endsWith('.tsx')) return { icon: 'TS', color: '#3178c6' };
  if (name.endsWith('.json')) return { icon: '{ }', color: '#cbcb41' };
  if (name.endsWith('.txt')) return { icon: 'T', color: '#8a8a8a' };
  if (name.endsWith('.html')) return { icon: '<>', color: '#e34c26' };
  if (name.endsWith('/')) return { icon: '📁', color: '' };
  return { icon: '·', color: '#8a8a8a' };
}

function getLangColor(lang: string): string {
  if (lang === 'Python') return '#3572A5';
  if (lang === 'JavaScript') return '#f1e05a';
  if (lang === 'TypeScript') return '#3178c6';
  return '#8a8a8a';
}

const Projects = ({ onCardClick, windowMode }: ProjectsProps) => {
  const [selectedProject, setSelectedProject] = useState(0);
  const [expandedFolders, setExpandedFolders] = useState<Record<number, boolean>>({ 0: true });
  const [activeTab, setActiveTab] = useState(0);
  const [openTabs, setOpenTabs] = useState<number[]>([0]);
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [sidebarWidth] = useState(220);
  const editorRef = useRef<HTMLDivElement>(null);

  const selectProject = (idx: number) => {
    setSelectedProject(idx);
    setActiveTab(idx);
    if (!openTabs.includes(idx)) {
      setOpenTabs(prev => [...prev, idx]);
    }
  };

  const closeTab = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newTabs = openTabs.filter(t => t !== idx);
    setOpenTabs(newTabs);
    if (activeTab === idx) {
      setActiveTab(newTabs.length > 0 ? newTabs[newTabs.length - 1] : -1);
      setSelectedProject(newTabs.length > 0 ? newTabs[newTabs.length - 1] : 0);
    }
  };

  const toggleFolder = (idx: number) => {
    setExpandedFolders(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const project = projects[selectedProject];
  const detail = project.detail;

  // Scroll editor to top when switching projects
  useEffect(() => {
    editorRef.current?.scrollTo(0, 0);
  }, [selectedProject]);

  return (
    <div className="vsc-root" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      fontFamily: "'SF Mono', 'Cascadia Code', 'JetBrains Mono', 'Menlo', 'Consolas', monospace",
      fontSize: '13px',
      color: '#cccccc',
      background: '#1e1e1e',
      overflow: 'hidden',
    }}>
      {/* Main area: activity bar + sidebar + editor */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

        {/* ── Activity Bar ── */}
        <div style={{
          width: '48px',
          minWidth: '48px',
          background: '#333333',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '4px',
          gap: '2px',
          borderRight: '1px solid #252526',
        }}>
          <ActivityIcon active label="Explorer">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 7V5a2 2 0 012-2h4l2 2h8a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
            </svg>
          </ActivityIcon>
          <ActivityIcon label="Search">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="10" cy="10" r="6" />
              <line x1="14.5" y1="14.5" x2="20" y2="20" />
            </svg>
          </ActivityIcon>
          <ActivityIcon label="Source Control">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="6" cy="6" r="2.5" />
              <circle cx="18" cy="10" r="2.5" />
              <circle cx="6" cy="18" r="2.5" />
              <path d="M6 8.5v7M8.5 6h5.5a2 2 0 012 2v2" />
            </svg>
          </ActivityIcon>
          <ActivityIcon label="Extensions">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="8" height="8" rx="1" />
              <rect x="13" y="3" width="8" height="8" rx="1" />
              <rect x="3" y="13" width="8" height="8" rx="1" />
              <rect x="13" y="13" width="8" height="8" rx="1" />
            </svg>
          </ActivityIcon>

          <div style={{ flex: 1 }} />

          <ActivityIcon label="Settings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </ActivityIcon>
        </div>

        {/* ── Explorer Sidebar ── */}
        <div style={{
          width: `${sidebarWidth}px`,
          minWidth: `${sidebarWidth}px`,
          background: '#252526',
          borderRight: '1px solid #1e1e1e',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Sidebar header */}
          <div style={{
            padding: '10px 16px 8px',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#bbbbbb',
            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
          }}>
            Explorer
          </div>

          {/* File tree */}
          <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '8px' }}>
            {projects.map((proj, idx) => {
              const isExpanded = expandedFolders[idx] || false;
              const folderSlug = proj.title.toUpperCase().replace(/\s+/g, '-');
              return (
                <div key={proj.id}>
                  {/* Folder row */}
                  <div
                    onClick={() => {
                      if (selectedProject === idx && expandedFolders[idx]) {
                        // Already selected + expanded: just collapse
                        setExpandedFolders(prev => ({ ...prev, [idx]: false }));
                      } else {
                        // Select + expand
                        setExpandedFolders(prev => ({ ...prev, [idx]: true }));
                        selectProject(idx);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px 3px 12px',
                      cursor: 'pointer',
                      background: selectedProject === idx ? 'rgba(255,255,255,0.06)' : 'transparent',
                      color: '#cccccc',
                      fontSize: '13px',
                      userSelect: 'none',
                    }}
                    className="vsc-tree-item"
                  >
                    <span style={{
                      fontSize: '10px',
                      width: '14px',
                      textAlign: 'center',
                      color: '#888',
                      transition: 'transform 0.15s',
                      transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                      display: 'inline-block',
                    }}>▶</span>
                    <span style={{ fontSize: '14px' }}>📁</span>
                    <span style={{
                      fontWeight: 600,
                      fontSize: '12px',
                      letterSpacing: '0.04em',
                    }}>{folderSlug}</span>
                  </div>

                  {/* Files */}
                  {isExpanded && proj.files.map((file, fi) => {
                    const { icon, color } = getFileIcon(file);
                    const isDir = file.endsWith('/');
                    return (
                      <div
                        key={fi}
                        onClick={() => { if (!isDir) selectProject(idx); }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px 2px 38px',
                          cursor: isDir ? 'default' : 'pointer',
                          color: isDir ? '#888' : '#cccccc',
                          fontSize: '13px',
                          userSelect: 'none',
                        }}
                        className="vsc-tree-item"
                      >
                        {isDir ? (
                          <span style={{ fontSize: '10px', width: '14px', textAlign: 'center', color: '#666' }}>▶</span>
                        ) : (
                          <span style={{
                            fontSize: '9px',
                            fontWeight: 700,
                            width: '14px',
                            textAlign: 'center',
                            color: color,
                          }}>{icon}</span>
                        )}
                        <span>{file}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Editor + Terminal ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* Tab bar */}
          <div style={{
            display: 'flex',
            alignItems: 'stretch',
            height: '35px',
            background: '#252526',
            borderBottom: '1px solid #1e1e1e',
            overflow: 'hidden',
          }}>
            {openTabs.map(idx => {
              const p = projects[idx];
              const isActive = idx === activeTab;
              return (
                <div
                  key={idx}
                  onClick={() => { setActiveTab(idx); setSelectedProject(idx); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0 12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    background: isActive ? '#1e1e1e' : '#2d2d2d',
                    color: isActive ? '#ffffff' : '#969696',
                    borderRight: '1px solid #1e1e1e',
                    position: 'relative',
                    minWidth: 0,
                    whiteSpace: 'nowrap',
                  }}
                  className="vsc-tab"
                >
                  <span style={{ fontSize: '9px', fontWeight: 700, color: '#519aba' }}>M</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>README.md</span>
                  <span style={{ fontSize: '10px', color: '#666', marginLeft: '2px' }}>— {p.title}</span>
                  <span
                    onClick={(e) => closeTab(idx, e)}
                    style={{
                      marginLeft: '6px',
                      fontSize: '14px',
                      lineHeight: 1,
                      color: '#666',
                      cursor: 'pointer',
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '3px',
                    }}
                    className="vsc-tab-close"
                  >×</span>
                  {isActive && <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: '#007acc',
                  }} />}
                </div>
              );
            })}
            <div style={{ flex: 1, background: '#252526' }} />
          </div>

          {/* Breadcrumb */}
          <div style={{
            padding: '4px 16px',
            fontSize: '12px',
            color: '#888',
            background: '#1e1e1e',
            borderBottom: '1px solid #252526',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            <span>{project.title.toUpperCase().replace(/\s+/g, '-')}</span>
            <span style={{ color: '#555' }}>/</span>
            <span style={{ color: '#cccccc' }}>README.md</span>
          </div>

          {/* Editor content */}
          <div
            ref={editorRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              background: '#1e1e1e',
              padding: '20px 32px 32px',
              minHeight: 0,
            }}
          >
            {/* Render README content */}
            <div className="vsc-readme">
              {/* Demo video */}
              {detail.demoVideo && (
                <div style={{
                  width: '100%',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  marginBottom: '24px',
                  background: '#000',
                  border: '1px solid #333',
                }}>
                  <video
                    autoPlay loop muted playsInline
                    style={{ width: '100%', display: 'block', borderRadius: '8px' }}
                  >
                    <source src={detail.demoVideo} type="video/mp4" />
                    <source src={detail.demoVideo} type="video/quicktime" />
                  </video>
                </div>
              )}

              {/* Cover image (show only when no video) */}
              {!detail.demoVideo && detail.coverImage && (
                <div style={{
                  width: '100%',
                  height: '180px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  marginBottom: '24px',
                  background: detail.gradient,
                }}>
                  <img
                    src={detail.coverImage}
                    alt={detail.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                  />
                </div>
              )}

              {/* Title */}
              <h1 style={{
                fontSize: '26px',
                fontWeight: 600,
                color: '#e6e6e6',
                margin: '0 0 8px',
                fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                {detail.title}
                {detail.repoUrl && (
                  <a
                    href={detail.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      fontSize: '13px',
                      fontWeight: 400,
                      color: '#4daafc',
                      textDecoration: 'none',
                      fontFamily: "'SF Mono', monospace",
                    }}
                  >
                    ↗ GitHub
                  </a>
                )}
              </h1>

              {/* Description */}
              <p style={{
                color: '#b0b0b0',
                fontSize: '14px',
                lineHeight: 1.7,
                margin: '0 0 20px',
                fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
              }}>
                {project.description}
              </p>

              {/* Tech stack badges */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                marginBottom: '24px',
              }}>
                {detail.techStack.map((tech, i) => (
                  <span key={i} style={{
                    padding: '3px 10px',
                    fontSize: '11px',
                    fontWeight: 500,
                    borderRadius: '4px',
                    background: 'rgba(77, 170, 252, 0.12)',
                    color: '#4daafc',
                    border: '1px solid rgba(77, 170, 252, 0.2)',
                    fontFamily: "'SF Mono', monospace",
                  }}>
                    {tech}
                  </span>
                ))}
              </div>

              {/* Architecture */}
              {detail.architecture && (
                <>
                  <h2 style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#e6e6e6',
                    margin: '0 0 8px',
                    fontFamily: "-apple-system, sans-serif",
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <span style={{ color: '#4daafc' }}>#</span>
                    Architecture
                  </h2>
                  <p style={{
                    color: '#a0a0a0',
                    fontSize: '13px',
                    lineHeight: 1.8,
                    margin: '0 0 20px',
                    fontFamily: "-apple-system, sans-serif",
                  }}>
                    {detail.architecture}
                  </p>
                </>
              )}

              {/* Technical Challenges */}
              {detail.technicalChallenges && detail.technicalChallenges.length > 0 && (
                <>
                  <h2 style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#e6e6e6',
                    margin: '0 0 8px',
                    fontFamily: "-apple-system, sans-serif",
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <span style={{ color: '#f1b73a' }}>#</span>
                    Technical Challenges
                  </h2>
                  <ul style={{
                    color: '#a0a0a0',
                    fontSize: '13px',
                    lineHeight: 1.8,
                    margin: '0 0 20px',
                    paddingLeft: '20px',
                    fontFamily: "-apple-system, sans-serif",
                  }}>
                    {detail.technicalChallenges.map((c, i) => (
                      <li key={i} style={{ marginBottom: '4px' }}>{c}</li>
                    ))}
                  </ul>
                </>
              )}

              {/* Lessons Learned */}
              {detail.lessonsLearned && detail.lessonsLearned.length > 0 && (
                <>
                  <h2 style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#e6e6e6',
                    margin: '0 0 8px',
                    fontFamily: "-apple-system, sans-serif",
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <span style={{ color: '#4ec9b0' }}>#</span>
                    Lessons Learned
                  </h2>
                  <ul style={{
                    color: '#a0a0a0',
                    fontSize: '13px',
                    lineHeight: 1.8,
                    margin: '0 0 20px',
                    paddingLeft: '20px',
                    fontFamily: "-apple-system, sans-serif",
                  }}>
                    {detail.lessonsLearned.map((l, i) => (
                      <li key={i} style={{ marginBottom: '4px' }}>{l}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>

          {/* ── Terminal Panel ── */}
          {terminalOpen && (
            <div style={{
              height: '120px',
              minHeight: '120px',
              borderTop: '1px solid #333',
              display: 'flex',
              flexDirection: 'column',
              background: '#1e1e1e',
            }}>
              {/* Terminal tabs */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 12px',
                height: '28px',
                background: '#252526',
                borderBottom: '1px solid #333',
                gap: '16px',
              }}>
                <span style={{ fontSize: '11px', color: '#cccccc', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Terminal</span>
                <span style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Problems</span>
                <span style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Output</span>
                <div style={{ flex: 1 }} />
                <span
                  onClick={() => setTerminalOpen(false)}
                  style={{ color: '#666', cursor: 'pointer', fontSize: '14px', lineHeight: 1 }}
                >×</span>
              </div>

              {/* Terminal content */}
              <div style={{
                flex: 1,
                padding: '6px 14px',
                fontSize: '12px',
                lineHeight: 1.7,
                overflowY: 'auto',
                color: '#cccccc',
              }}>
                <div>
                  <span style={{ color: '#4ec9b0' }}>ronniel@MacBookPro</span>
                  <span style={{ color: '#666' }}>:</span>
                  <span style={{ color: '#569cd6' }}>~/{project.title.toLowerCase().replace(/\s+/g, '-')}</span>
                  <span style={{ color: '#666' }}> $ </span>
                  <span style={{ color: '#cccccc' }}>git log --oneline -3</span>
                </div>
                <div style={{ color: '#ce9178' }}>
                  <span style={{ color: '#f1b73a' }}>a3f2e1d</span> feat: initial project setup
                </div>
                <div style={{ color: '#ce9178' }}>
                  <span style={{ color: '#f1b73a' }}>b7c4a2e</span> docs: add README
                </div>
                <div style={{ color: '#ce9178' }}>
                  <span style={{ color: '#f1b73a' }}>c8d5b3f</span> chore: configure build pipeline
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Status Bar ── */}
      <div style={{
        height: '22px',
        minHeight: '22px',
        background: '#007acc',
        display: 'flex',
        alignItems: 'center',
        padding: '0 10px',
        gap: '14px',
        fontSize: '11.5px',
        color: 'rgba(255,255,255,0.9)',
        fontFamily: "'SF Pro Text', -apple-system, sans-serif",
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" opacity="0.9">
            <path d="M13.5 3.5L8 1 2.5 3.5v4c0 3.5 2.5 6.5 5.5 7.5 3-1 5.5-4 5.5-7.5v-4z" fillRule="evenodd" />
          </svg>
          main
        </span>
        <span>○ 0 △ 0</span>
        <div style={{ flex: 1 }} />
        <span>Ln 1, Col 1</span>
        <span>Spaces: 2</span>
        <span>UTF-8</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: getLangColor(project.language),
          }} />
          {project.language}
        </span>
      </div>

      <style>{`
        .vsc-root ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        .vsc-root ::-webkit-scrollbar-track {
          background: transparent;
        }
        .vsc-root ::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 0;
        }
        .vsc-root ::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
        .vsc-tree-item:hover {
          background: rgba(255,255,255,0.05) !important;
        }
        .vsc-tab:hover .vsc-tab-close {
          color: #ccc !important;
        }
        .vsc-tab-close:hover {
          background: rgba(255,255,255,0.1) !important;
          color: #fff !important;
        }
        .vsc-readme h2 {
          border-bottom: 1px solid #333;
          padding-bottom: 6px;
        }
      `}</style>
    </div>
  );
};

// ── Activity Bar Icon ──

function ActivityIcon({ children, active, label }: { children: React.ReactNode; active?: boolean; label: string }) {
  return (
    <div
      title={label}
      style={{
        width: '48px',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: active ? '#ffffff' : '#858585',
        position: 'relative',
        transition: 'color 0.15s',
      }}
    >
      {children}
      {active && (
        <div style={{
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: '2px',
          height: '24px',
          background: '#ffffff',
          borderRadius: '0 1px 1px 0',
        }} />
      )}
    </div>
  );
}

export default Projects;
