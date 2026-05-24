import { useEffect, useRef, useState } from 'react';
import { getTagColor } from './tagColors';

// ─── Type Definitions ───────────────────────────────────────

interface DetailCourse {
  code: string;
  name: string;
  grade?: string;
}

export interface PitchDeck {
  title: string;
  pdfUrl: string;
  achievement: string;
  competition: string;
  year: number;
  projectName: string;
  description: string;
  totalSlides: number;
}

export interface EducationDetail {
  type: 'education';
  id: number;
  institution: string;
  logo?: string;
  logo2?: string;
  gpa?: string;
  courses: DetailCourse[];
  activities: string[];
  achievements: string[];
  pitchDeck?: PitchDeck;
  reflection?: string;
}

export interface TimelineEntry {
  month: string;
  description: string;
}

export interface ExperienceRole {
  role: string;
  date?: string;
  location?: string;
  timeline: TimelineEntry[];
  reflection: string;
  skillsLearned: string[];
  techStack: string[];
}

export interface ExperienceDetail {
  type: 'experience';
  id: number;
  company: string;
  role: string;
  date?: string;
  location?: string;
  logo?: string;
  timeline: TimelineEntry[];
  reflection: string;
  skillsLearned: string[];
  techStack: string[];
  roles?: ExperienceRole[];
}

export interface ProjectDetail {
  type: 'project';
  id: number;
  title: string;
  gradient: string;
  coverImage?: string;
  demoVideo?: string;
  architecture?: string;
  technicalChallenges: string[];
  lessonsLearned: string[];
  techStack: string[];
  repoUrl?: string;
  liveUrl?: string;
}

export type DetailContent = EducationDetail | ExperienceDetail | ProjectDetail;

// ─── Component ──────────────────────────────────────────────

interface DetailPanelProps {
  detail: DetailContent;
  onClose: () => void;
}

const CloseButton = ({ onClose }: { onClose: () => void }) => (
  <button
    onClick={onClose}
    aria-label="Close panel"
    style={{
      position: 'sticky',
      top: '1.5rem',
      float: 'right',
      marginRight: '1.5rem',
      zIndex: 10,
      background: 'rgba(255, 255, 255, 0.1)',
      border: '0.5px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '50%',
      width: '36px',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: '18px',
      fontFamily: 'NeueMontreal-Light, sans-serif',
      transition: 'all 0.2s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
      e.currentTarget.style.color = 'white';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
    }}
  >
    ✕
  </button>
);

const DetailPanel = ({ detail, onClose }: DetailPanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [livePanelHidden, setLivePanelHidden] = useState(false);
  const hasVideo = detail.type === 'project' && !!(detail as ProjectDetail).demoVideo;
  const hasLiveUrl = detail.type === 'project' && !!(detail as ProjectDetail).liveUrl;

  // Escape key + body scroll lock
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  // Focus panel on mount
  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  // ── Video split layout (project shell) ──
  if (hasVideo) {
    const projectDetail = detail as ProjectDetail;
    return (
      <>
        {/* Backdrop */}
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 200,
            animation: 'detailFadeIn 0.3s ease-out forwards'
          }}
        />

        {/* Split Container */}
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          className="video-split-container"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 201,
            display: 'flex',
            outline: 'none',
            animation: 'detailFadeIn 0.4s ease-out forwards'
          }}
        >
          {/* Left: Video */}
          <div
            className="video-split-left"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
              minWidth: 0
            }}
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: '100%',
                maxHeight: '85vh',
                borderRadius: '16px',
                objectFit: 'contain',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                border: '0.5px solid rgba(255,255,255,0.1)'
              }}
            >
              <source src={projectDetail.demoVideo} type="video/quicktime" />
              <source src={projectDetail.demoVideo} type="video/mp4" />
            </video>
          </div>

          {/* Right: Details */}
          <div
            className="video-split-right"
            style={{
              width: '420px',
              minWidth: '360px',
              maxWidth: '480px',
              height: '100%',
              overflowY: 'auto',
              background: 'rgba(20, 20, 20, 0.75)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderLeft: '0.5px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), inset 0 0 0 0.5px rgba(255, 255, 255, 0.05)',
              animation: 'detailSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
          >
            <CloseButton onClose={onClose} />
            <div style={{ padding: '2rem 2rem 3rem', clear: 'both' }}>
              <ProjectContent detail={projectDetail} />
            </div>
          </div>
        </div>

        <style>{`
          @keyframes detailSlideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          @keyframes detailFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @media (max-width: 900px) {
            .video-split-container {
              flex-direction: column !important;
            }
            .video-split-left {
              flex: none !important;
              height: 40vh !important;
              padding: 1rem !important;
            }
            .video-split-left video {
              max-height: 100% !important;
            }
            .video-split-right {
              width: 100% !important;
              min-width: unset !important;
              max-width: unset !important;
              flex: 1 !important;
              border-left: none !important;
              border-top: 0.5px solid rgba(255,255,255,0.15) !important;
            }
          }
        `}</style>
      </>
    );
  }

  // ── Live URL split layout (AbdullahOS) ──
  if (hasLiveUrl) {
    const projectDetail = detail as ProjectDetail;
    return (
      <>
        {/* Backdrop */}
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 200,
            animation: 'detailFadeIn 0.3s ease-out forwards'
          }}
        />

        {/* Split Container */}
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          className="video-split-container"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 201,
            display: 'flex',
            outline: 'none',
            animation: 'detailFadeIn 0.4s ease-out forwards'
          }}
        >
          {/* Left: Live Demo iframe */}
          <div
            className="video-split-left"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'stretch',
              justifyContent: 'center',
              padding: livePanelHidden ? '0' : '1.5rem',
              minWidth: 0,
              position: 'relative',
              transition: 'padding 0.35s ease',
            }}
          >
            <iframe
              src={projectDetail.liveUrl}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: livePanelHidden ? '0' : '14px',
                border: livePanelHidden ? 'none' : '0.5px solid rgba(255,255,255,0.1)',
                boxShadow: livePanelHidden ? 'none' : '0 20px 60px rgba(0,0,0,0.5)',
                background: '#000',
                transition: 'border-radius 0.35s ease',
              }}
              allow="autoplay; fullscreen"
            />
            {/* Toggle arrow */}
            <button
              onClick={() => setLivePanelHidden(!livePanelHidden)}
              className="live-panel-toggle"
              style={{
                position: 'absolute',
                right: livePanelHidden ? '16px' : '-14px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '28px',
                height: '56px',
                borderRadius: '0 8px 8px 0',
                background: 'rgba(30, 30, 30, 0.85)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderLeft: 'none',
                color: 'rgba(255,255,255,0.6)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                transition: 'all 0.35s ease',
                backdropFilter: 'blur(8px)',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: livePanelHidden ? 'rotate(180deg)' : 'none', transition: 'transform 0.35s ease' }}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Right: Details */}
          <div
            className="video-split-right"
            style={{
              width: livePanelHidden ? '0px' : '420px',
              minWidth: livePanelHidden ? '0px' : '360px',
              maxWidth: livePanelHidden ? '0px' : '480px',
              height: '100%',
              overflowY: livePanelHidden ? 'hidden' : 'auto',
              overflowX: 'hidden',
              background: 'rgba(20, 20, 20, 0.75)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderLeft: livePanelHidden ? 'none' : '0.5px solid rgba(255, 255, 255, 0.12)',
              boxShadow: livePanelHidden ? 'none' : '0 25px 60px rgba(0, 0, 0, 0.5), inset 0 0 0 0.5px rgba(255, 255, 255, 0.05)',
              animation: 'detailSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              transition: 'width 0.35s ease, min-width 0.35s ease, max-width 0.35s ease',
              opacity: livePanelHidden ? 0 : 1,
            }}
          >
            <CloseButton onClose={onClose} />
            <div style={{ padding: '2rem 2rem 3rem', clear: 'both', whiteSpace: 'nowrap' as const }}>
              <div style={{ whiteSpace: 'normal' as const }}>
                <ProjectContent detail={projectDetail} />
              </div>
            </div>
          </div>
        </div>

        <style>{`
          .live-panel-toggle:hover {
            background: rgba(50, 50, 50, 0.95) !important;
            color: rgba(255,255,255,0.9) !important;
          }
          @keyframes detailSlideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          @keyframes detailFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @media (max-width: 900px) {
            .video-split-container {
              flex-direction: column !important;
            }
            .video-split-left {
              flex: none !important;
              height: 50vh !important;
              padding: 0.5rem !important;
            }
            .live-panel-toggle {
              display: none !important;
            }
            .video-split-right {
              width: 100% !important;
              min-width: unset !important;
              max-width: unset !important;
              flex: 1 !important;
              border-left: none !important;
              border-top: 0.5px solid rgba(255,255,255,0.15) !important;
              opacity: 1 !important;
            }
          }
        `}</style>
      </>
    );
  }

  // ── Standard right-side panel ──
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 200,
          animation: 'detailFadeIn 0.3s ease-out forwards'
        }}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100%',
          overflowY: 'auto',
          zIndex: 201,
          background: 'rgba(20, 20, 20, 0.75)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderLeft: '0.5px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), inset 0 0 0 0.5px rgba(255, 255, 255, 0.05)',
          animation: 'detailSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          outline: 'none'
        }}
        className="detail-panel"
      >
        <CloseButton onClose={onClose} />

        {/* Content */}
        <div style={{ padding: '2rem 2.5rem 3rem', clear: 'both' }}>
          {detail.type === 'education' && <EducationContent detail={detail} />}
          {detail.type === 'experience' && <ExperienceContent detail={detail} />}
          {detail.type === 'project' && <ProjectContent detail={detail} />}
        </div>
      </div>

      {/* Animations + Responsive */}
      <style>{`
        @keyframes detailSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes detailFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .detail-panel {
          width: 50%;
          max-width: 700px;
          min-width: 400px;
        }
        @media (max-width: 768px) {
          .detail-panel {
            width: 100% !important;
            min-width: unset !important;
            max-width: unset !important;
          }
        }
      `}</style>
    </>
  );
};

// ─── Pitch Deck Mini Viewer ─────────────────────────────────

const PitchDeckViewer = ({ deck, animDelay }: { deck: PitchDeck; animDelay: number }) => {
  const [expanded, setExpanded] = useState(false);

  const placeColor = deck.achievement.includes('1st')
    ? '#FFD700'
    : deck.achievement.includes('2nd')
    ? '#C0C0C0'
    : '#CD7F32';

  return (
    <div style={{
      opacity: 0.1,
      animation: `sectionFadeIn 0.6s ease ${animDelay}s forwards`,
    }}>
      {/* Trophy card — always visible */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: `1px solid rgba(255, 255, 255, 0.1)`,
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          marginBottom: expanded ? '0' : '0',
          borderBottomLeftRadius: expanded ? '0' : '12px',
          borderBottomRightRadius: expanded ? '0' : '12px',
          transition: 'all 0.3s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Trophy icon */}
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: `linear-gradient(135deg, ${placeColor}22, ${placeColor}11)`,
            border: `1px solid ${placeColor}44`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            flexShrink: 0,
          }}>
            {deck.achievement.includes('1st') ? '\uD83C\uDFC6' : '\uD83C\uDFC5'}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontFamily: 'NeueMontreal-Medium, sans-serif',
              color: placeColor,
              fontSize: '0.8rem',
              margin: '0 0 0.2rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              {deck.achievement}
            </p>
            <p style={{
              fontFamily: 'NeueMontreal-Medium, sans-serif',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '0.95rem',
              margin: '0 0 0.2rem',
              lineHeight: 1.3,
            }}>
              {deck.competition} {deck.year}
            </p>
            <p style={{
              fontFamily: 'NeueMontreal-Light, sans-serif',
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.8rem',
              margin: 0,
            }}>
              {deck.projectName} &middot; {deck.totalSlides} slides
            </p>
          </div>
        </div>

        {/* Description */}
        <p style={{
          fontFamily: 'NeueMontreal-Light, sans-serif',
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '0.85rem',
          lineHeight: 1.6,
          margin: '1rem 0 1rem',
        }}>
          {deck.description}
        </p>

        {/* Expand / Collapse toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: expanded ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '8px',
            padding: '0.55rem 1rem',
            cursor: 'pointer',
            fontFamily: '"SF Mono", "Fira Code", "Fira Mono", Menlo, monospace',
            fontSize: '0.8rem',
            color: 'rgba(255, 255, 255, 0.7)',
            transition: 'all 0.2s ease',
            width: '100%',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = expanded ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
          }}
        >
          <span style={{
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s ease',
            display: 'inline-block',
          }}>
            &#9654;
          </span>
          {expanded ? ' close deck' : ' view deck'}
        </button>
      </div>

      {/* Expandable PDF viewer */}
      <div style={{
        maxHeight: expanded ? '600px' : '0px',
        opacity: expanded ? 1 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
        background: 'rgba(0, 0, 0, 0.3)',
        borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        borderBottom: expanded ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
        borderBottomLeftRadius: '12px',
        borderBottomRightRadius: '12px',
      }}>
        {/* Mini title bar for the embedded viewer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.6rem 1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(255, 255, 255, 0.03)',
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f57' }} />
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#febc2e' }} />
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#28c840' }} />
          <span style={{
            fontFamily: '"SF Mono", "Fira Code", monospace',
            fontSize: '0.7rem',
            color: 'rgba(255, 255, 255, 0.4)',
            marginLeft: '0.5rem',
          }}>
            {deck.title}
          </span>
        </div>

        {/* PDF iframe — only rendered when expanded to avoid heavy loading */}
        {expanded && (
          <iframe
            src={`${deck.pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
            style={{
              width: '100%',
              height: '520px',
              border: 'none',
              display: 'block',
              background: '#111',
            }}
            title={deck.title}
          />
        )}
      </div>
    </div>
  );
};

// ─── Education Detail ───────────────────────────────────────

const EducationContent = ({ detail }: { detail: EducationDetail }) => {
  const totalCourses = detail.courses.length;
  // Time (s) when the last course finishes its animation
  const cascadeEnd = 0.3 + totalCourses * 0.055 + 0.5; // start delay + stagger + animation duration

  return (
    <div>
      {/* Keyframes for pure-CSS cascade */}
      <style>{`
        @keyframes courseLightUp {
          0% {
            background: rgba(255, 255, 255, 0.02);
            border-color: rgba(255, 255, 255, 0.05);
            box-shadow: none;
          }
          100% {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(255, 255, 255, 0.18);
            box-shadow: 0 0 12px rgba(255, 255, 255, 0.04), inset 0 0 8px rgba(255, 255, 255, 0.02);
          }
        }
        @keyframes courseTextLightUp {
          0% { color: rgba(255, 255, 255, 0.2); }
          100% { color: rgba(255, 255, 255, 0.95); }
        }
        @keyframes courseSubTextLightUp {
          0% { color: rgba(255, 255, 255, 0.1); }
          100% { color: rgba(255, 255, 255, 0.65); }
        }
        @keyframes sectionFadeIn {
          0% { opacity: 0.1; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        {detail.logo && (
          <img src={detail.logo} alt="" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
        )}
        {detail.logo2 && (
          <img src={detail.logo2} alt="" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
        )}
        <div>
          <h2 style={{ fontFamily: 'NeueMontreal-Medium, sans-serif', fontSize: '1.5rem', color: 'white', margin: 0 }}>
            {detail.institution}
          </h2>
          {detail.gpa && (
            <p style={{ fontFamily: 'NeueMontreal-Light, sans-serif', color: 'rgba(255,255,255,0.6)', margin: '0.25rem 0 0', fontSize: '0.95rem' }}>
              GPA: {detail.gpa}
            </p>
          )}
        </div>
      </div>

      {/* Courses — pure CSS cascade */}
      {detail.courses.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={sectionTitleStyle}>Courses</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.75rem' }}>
            {detail.courses.map((c, i) => {
              const delay = `${0.3 + i * 0.055}s`;
              return (
                <div
                  key={i}
                  style={{
                    ...pillCardStyle,
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderColor: 'rgba(255, 255, 255, 0.05)',
                    animation: `courseLightUp 0.5s ease ${delay} forwards`,
                  }}
                >
                  <span style={{
                    fontFamily: 'NeueMontreal-Medium, sans-serif',
                    color: 'rgba(255,255,255,0.2)',
                    fontSize: '0.85rem',
                    animation: `courseTextLightUp 0.5s ease ${delay} forwards`,
                  }}>
                    {c.code}
                  </span>
                  <span style={{
                    fontFamily: 'NeueMontreal-Light, sans-serif',
                    color: 'rgba(255,255,255,0.1)',
                    fontSize: '0.8rem',
                    animation: `courseSubTextLightUp 0.5s ease ${delay} forwards`,
                  }}>
                    {c.name}
                  </span>
                  {c.grade && (
                    <span style={{
                      fontFamily: 'NeueMontreal-Medium, sans-serif',
                      color: 'rgba(255,255,255,0.1)',
                      fontSize: '0.75rem',
                      marginLeft: 'auto',
                      animation: `courseSubTextLightUp 0.5s ease ${delay} forwards`,
                    }}>
                      {c.grade}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Activities — fades in after courses finish */}
      {detail.activities.length > 0 && (
        <div style={{
          marginBottom: '2rem',
          opacity: 0.1,
          animation: `sectionFadeIn 0.6s ease ${cascadeEnd}s forwards`,
        }}>
          <h3 style={sectionTitleStyle}>Activities</h3>
          <ul style={listStyle}>
            {detail.activities.map((a, i) => <li key={i} style={listItemStyle}>{a}</li>)}
          </ul>
        </div>
      )}

      {/* Achievements — fades in slightly after activities */}
      {detail.achievements.length > 0 && (
        <div style={{
          marginBottom: '2rem',
          opacity: 0.1,
          animation: `sectionFadeIn 0.6s ease ${cascadeEnd + 0.15}s forwards`,
        }}>
          <h3 style={sectionTitleStyle}>Achievements</h3>
          <ul style={listStyle}>
            {detail.achievements.map((a, i) => <li key={i} style={listItemStyle}>{a}</li>)}
          </ul>
        </div>
      )}

      {/* Pitch Deck — integrated mini presentation viewer */}
      {detail.pitchDeck && (
        <div style={{ marginBottom: '2rem' }}>
          <PitchDeckViewer deck={detail.pitchDeck} animDelay={cascadeEnd + 0.25} />
        </div>
      )}

      {/* Reflection / Notes — fades in last */}
      {detail.reflection && (
        <div style={{
          marginBottom: '2rem',
          opacity: 0.1,
          animation: `sectionFadeIn 0.6s ease ${cascadeEnd + 0.4}s forwards`,
        }}>
          <h3 style={sectionTitleStyle}>Reflection</h3>
          {detail.reflection.split('\n\n').map((para, i) => (
            <p key={i} style={{
              fontFamily: 'NeueMontreal-Light, sans-serif',
              color: 'rgba(255,255,255,0.75)',
              fontSize: '0.9rem',
              lineHeight: '1.7',
              margin: i === 0 ? 0 : '1rem 0 0',
              fontStyle: 'italic',
            }}>
              {para}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Experience Detail ──────────────────────────────────────

const ExperienceContent = ({ detail }: { detail: ExperienceDetail }) => {
  // If multi-role, render each role as a separate section
  if (detail.roles && detail.roles.length > 0) {
    return <MultiRoleExperienceContent detail={detail} />;
  }
  return <SingleRoleExperienceContent detail={detail} />;
};

// ─── Multi-Role Experience (LinkedIn-style) ─────────────────

const MultiRoleExperienceContent = ({ detail }: { detail: ExperienceDetail }) => {
  // Track unlock state per role
  const [unlockedRoles, setUnlockedRoles] = useState<Set<number>>(new Set());
  const allUnlocked = detail.roles!.every((_, i) => unlockedRoles.has(i));

  const handleRoleUnlock = (roleIndex: number) => {
    setUnlockedRoles(prev => new Set([...prev, roleIndex]));
  };

  // Gather all skills/tech across all roles for the combined section
  const allSkills = [...new Set(detail.roles!.flatMap(r => r.skillsLearned))];
  const allTech = [...new Set(detail.roles!.flatMap(r => r.techStack))];
  const allReflections = detail.roles!.map(r => r.reflection).filter(Boolean);

  return (
    <div>
      {/* Header — company only */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        {detail.logo && (
          <img src={detail.logo} alt="" style={{ width: '50px', height: '50px', borderRadius: '10px', objectFit: 'contain' }} />
        )}
        <h2 style={{ fontFamily: 'NeueMontreal-Medium, sans-serif', fontSize: '1.5rem', color: 'white', margin: 0 }}>
          {detail.company}
        </h2>
      </div>

      {/* Roles — each with its own timeline */}
      {detail.roles!.map((role, roleIdx) => (
        <RoleTimelineSection
          key={roleIdx}
          role={role}
          roleIndex={roleIdx}
          isLast={roleIdx === detail.roles!.length - 1}
          onUnlock={() => handleRoleUnlock(roleIdx)}
        />
      ))}

      {/* Combined Reflection */}
      {allReflections.length > 0 && (
        <div style={{ marginBottom: '2rem', transition: 'opacity 0.5s ease', opacity: allUnlocked ? 1 : 0.7 }}>
          <h3 style={{
            ...sectionTitleStyle,
            color: allUnlocked ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.5)',
            transition: 'color 0.5s ease'
          }}>Reflection</h3>
          {allReflections.flatMap((r, ri) =>
            r.split('\n\n').map((para, pi) => (
              <p key={`${ri}-${pi}`} style={{
                fontFamily: 'NeueMontreal-Light, sans-serif',
                color: allUnlocked ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.45)',
                fontSize: '0.9rem',
                lineHeight: '1.7',
                margin: (ri === 0 && pi === 0) ? 0 : '1rem 0 0',
                transition: 'color 0.5s ease'
              }}>
                {para}
              </p>
            ))
          )}
        </div>
      )}

      {/* Combined Skills */}
      {allSkills.length > 0 && (
        <div style={{ marginBottom: '1.5rem', transition: 'opacity 0.5s ease', opacity: allUnlocked ? 1 : 0.7 }}>
          <h3 style={{
            ...sectionTitleStyle,
            color: allUnlocked ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.5)',
            transition: 'color 0.5s ease'
          }}>Skills Learned</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {allSkills.map((s, i) => {
              const tc = getTagColor(s);
              return (
                <span key={i} style={{
                  fontFamily: 'NeueMontreal-Light, sans-serif',
                  fontSize: '0.8rem',
                  color: allUnlocked ? tc.text : 'rgba(255, 255, 255, 0.65)',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '20px',
                  background: allUnlocked ? tc.bg : 'rgba(255, 255, 255, 0.08)',
                  border: `0.5px solid ${allUnlocked ? tc.border : 'rgba(255, 255, 255, 0.12)'}`,
                  transition: 'all 0.5s ease',
                  transitionDelay: allUnlocked ? `${i * 0.06}s` : '0s'
                }}>{s}</span>
              );
            })}
          </div>
        </div>
      )}

      {/* Combined Tech Stack */}
      {allTech.length > 0 && (
        <div style={{ transition: 'opacity 0.5s ease', opacity: allUnlocked ? 1 : 0.7 }}>
          <h3 style={{
            ...sectionTitleStyle,
            color: allUnlocked ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.5)',
            transition: 'color 0.5s ease'
          }}>Tech Stack</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {allTech.map((t, i) => {
              const tc = getTagColor(t);
              return (
                <span key={i} style={{
                  fontFamily: 'NeueMontreal-Light, sans-serif',
                  fontSize: '0.8rem',
                  color: allUnlocked ? tc.text : 'rgba(255, 255, 255, 0.65)',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '20px',
                  background: allUnlocked ? tc.bg : 'rgba(255, 255, 255, 0.08)',
                  border: `0.5px solid ${allUnlocked ? tc.border : 'rgba(255, 255, 255, 0.12)'}`,
                  transition: 'all 0.5s ease',
                  transitionDelay: allUnlocked ? `${i * 0.06}s` : '0s'
                }}>{t}</span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Role Timeline Section (used inside multi-role) ─────────

const RoleTimelineSection = ({ role, roleIndex, isLast, onUnlock }: {
  role: ExperienceRole;
  roleIndex: number;
  isLast: boolean;
  onUnlock: () => void;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const [unlocked, setUnlocked] = useState(false);
  const entryRefs = useRef<(HTMLDivElement | null)[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);

  const handleHover = (i: number) => {
    setHoveredIndex(i);
    if (i >= role.timeline.length - 1 && !unlocked) {
      setUnlocked(true);
      onUnlock();
    }
  };

  const getGlowHeight = () => {
    if (hoveredIndex < 0 || !trackRef.current) return '0%';
    const entry = entryRefs.current[hoveredIndex];
    if (!entry) return '0%';
    const trackRect = trackRef.current.getBoundingClientRect();
    const entryRect = entry.getBoundingClientRect();
    const dotCenter = entryRect.top - trackRect.top + 10;
    return `${dotCenter}px`;
  };

  return (
    <div style={{ marginBottom: isLast ? '2rem' : '2.5rem' }}>
      {/* Role header */}
      <div style={{ marginBottom: '1rem' }}>
        <p style={{
          fontFamily: 'NeueMontreal-Medium, sans-serif',
          color: 'rgba(255,255,255,0.9)',
          fontSize: '1.1rem',
          margin: 0
        }}>
          {role.role}
        </p>
        <p style={{
          fontFamily: 'NeueMontreal-Light, sans-serif',
          color: 'rgba(255,255,255,0.7)',
          fontSize: '0.85rem',
          margin: '0.15rem 0 0'
        }}>
          {[role.date, role.location].filter(Boolean).join(' · ')}
        </p>
      </div>

      {/* Timeline */}
      {role.timeline.length > 0 && (
        <div
          ref={trackRef}
          onMouseLeave={() => { if (!unlocked) setHoveredIndex(-1); }}
          style={{ position: 'relative', paddingLeft: '1.5rem' }}
        >
          {/* Static base line */}
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '2px',
            height: '100%',
            background: 'rgba(255,255,255,0.1)'
          }} />
          {/* Glow line */}
          <div style={{
            position: 'absolute',
            left: '-1px',
            top: 0,
            width: '4px',
            height: unlocked ? '100%' : (hoveredIndex >= 0 ? getGlowHeight() : '0px'),
            background: 'linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.5) 60%, rgba(255,255,255,0.8) 100%)',
            filter: 'blur(1px)',
            transition: 'height 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            borderRadius: '2px',
            opacity: (unlocked || hoveredIndex >= 0) ? 1 : 0
          }} />

          {role.timeline.map((entry, i) => {
            const isActive = unlocked || (hoveredIndex >= 0 && i <= hoveredIndex);
            const isDirectHover = unlocked || i === hoveredIndex;

            return (
              <div
                key={i}
                ref={(el) => { entryRefs.current[i] = el; }}
                onMouseEnter={() => handleHover(i)}
                style={{
                  marginBottom: '1.5rem',
                  position: 'relative',
                  cursor: 'default',
                  padding: '0.25rem 0'
                }}
              >
                <div style={{
                  position: 'absolute',
                  left: '-1.75rem',
                  top: '0.35rem',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: isActive ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.3)',
                  border: `2px solid ${isActive ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.15)'}`,
                  boxShadow: isActive
                    ? (isDirectHover
                      ? '0 0 10px rgba(255,255,255,0.7), 0 0 20px rgba(255,255,255,0.3)'
                      : '0 0 6px rgba(255,255,255,0.5), 0 0 12px rgba(255,255,255,0.15)')
                    : 'none',
                  transition: 'all 0.35s ease',
                  opacity: isActive ? 1 : 0.6
                }} />
                <p style={{
                  fontFamily: 'NeueMontreal-Medium, sans-serif',
                  color: isDirectHover ? 'rgb(255,255,255)' : (isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)'),
                  fontSize: '0.9rem',
                  margin: '0 0 0.25rem',
                  transition: 'color 0.3s ease'
                }}>
                  {entry.month}
                </p>
                <p style={{
                  fontFamily: 'NeueMontreal-Light, sans-serif',
                  color: isDirectHover ? 'rgba(255,255,255,0.95)' : (isActive ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.35)'),
                  fontSize: '0.85rem',
                  margin: 0,
                  lineHeight: '1.5',
                  transition: 'color 0.3s ease'
                }}>
                  {entry.description}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Single-Role Experience (original) ──────────────────────

const SingleRoleExperienceContent = ({ detail }: { detail: ExperienceDetail }) => {
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const [unlocked, setUnlocked] = useState(false);
  const entryRefs = useRef<(HTMLDivElement | null)[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);

  const handleHover = (i: number) => {
    setHoveredIndex(i);
    if (i >= detail.timeline.length - 1) {
      setUnlocked(true);
    }
  };

  const getGlowHeight = () => {
    if (hoveredIndex < 0 || !trackRef.current) return '0%';
    const entry = entryRefs.current[hoveredIndex];
    if (!entry) return '0%';
    const trackRect = trackRef.current.getBoundingClientRect();
    const entryRect = entry.getBoundingClientRect();
    const dotCenter = entryRect.top - trackRect.top + 10;
    return `${dotCenter}px`;
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        {detail.logo && (
          <img src={detail.logo} alt="" style={{ width: '50px', height: '50px', borderRadius: '10px', objectFit: 'contain' }} />
        )}
        <div>
          <h2 style={{ fontFamily: 'NeueMontreal-Medium, sans-serif', fontSize: '1.5rem', color: 'white', margin: 0 }}>
            {detail.company}
          </h2>
          <p style={{ fontFamily: 'NeueMontreal-Light, sans-serif', color: 'rgba(255,255,255,0.6)', margin: '0.25rem 0 0', fontSize: '0.95rem' }}>
            {detail.role}
          </p>
          {(detail.date || detail.location) && (
            <p style={{ fontFamily: 'NeueMontreal-Light, sans-serif', color: 'rgba(255,255,255,0.4)', margin: '0.15rem 0 0', fontSize: '0.85rem' }}>
              {[detail.date, detail.location].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      </div>

      {/* Timeline */}
      {detail.timeline.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={sectionTitleStyle}>Timeline</h3>
          <div
            ref={trackRef}
            className="timeline-track"
            onMouseLeave={() => { if (!unlocked) setHoveredIndex(-1); }}
            style={{ position: 'relative', paddingLeft: '1.5rem' }}
          >
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '2px',
              height: '100%',
              background: 'rgba(255,255,255,0.1)'
            }} />
            <div style={{
              position: 'absolute',
              left: '-1px',
              top: 0,
              width: '4px',
              height: unlocked ? '100%' : (hoveredIndex >= 0 ? getGlowHeight() : '0px'),
              background: 'linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.5) 60%, rgba(255,255,255,0.8) 100%)',
              filter: 'blur(1px)',
              transition: 'height 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              borderRadius: '2px',
              opacity: (unlocked || hoveredIndex >= 0) ? 1 : 0
            }} />

            {detail.timeline.map((entry, i) => {
              const isActive = unlocked || (hoveredIndex >= 0 && i <= hoveredIndex);
              const isDirectHover = unlocked || i === hoveredIndex;

              return (
                <div
                  key={i}
                  ref={(el) => { entryRefs.current[i] = el; }}
                  onMouseEnter={() => handleHover(i)}
                  style={{
                    marginBottom: '1.5rem',
                    position: 'relative',
                    cursor: 'default',
                    padding: '0.25rem 0'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    left: '-1.75rem',
                    top: '0.35rem',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: isActive ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.3)',
                    border: `2px solid ${isActive ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.15)'}`,
                    boxShadow: isActive
                      ? (isDirectHover
                        ? '0 0 10px rgba(255,255,255,0.7), 0 0 20px rgba(255,255,255,0.3)'
                        : '0 0 6px rgba(255,255,255,0.5), 0 0 12px rgba(255,255,255,0.15)')
                      : 'none',
                    transition: 'all 0.35s ease',
                    opacity: isActive ? 1 : 0.6
                  }} />
                  <p style={{
                    fontFamily: 'NeueMontreal-Medium, sans-serif',
                    color: isDirectHover ? 'rgb(255,255,255)' : (isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)'),
                    fontSize: '0.9rem',
                    margin: '0 0 0.25rem',
                    transition: 'color 0.3s ease'
                  }}>
                    {entry.month}
                  </p>
                  <p style={{
                    fontFamily: 'NeueMontreal-Light, sans-serif',
                    color: isDirectHover ? 'rgba(255,255,255,0.95)' : (isActive ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.35)'),
                    fontSize: '0.85rem',
                    margin: 0,
                    lineHeight: '1.5',
                    transition: 'color 0.3s ease'
                  }}>
                    {entry.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reflection */}
      {detail.reflection && (
        <div style={{ marginBottom: '2rem', transition: 'opacity 0.5s ease', opacity: unlocked ? 1 : 0.7 }}>
          <h3 style={{
            ...sectionTitleStyle,
            color: unlocked ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.5)',
            transition: 'color 0.5s ease'
          }}>Reflection</h3>
          {detail.reflection.split('\n\n').map((para, i) => (
            <p key={i} style={{
              fontFamily: 'NeueMontreal-Light, sans-serif',
              color: unlocked ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.45)',
              fontSize: '0.9rem',
              lineHeight: '1.7',
              margin: i === 0 ? 0 : '1rem 0 0',
              transition: 'color 0.5s ease'
            }}>
              {para}
            </p>
          ))}
        </div>
      )}

      {/* Skills + Tech */}
      {detail.skillsLearned.length > 0 && (
        <div style={{ marginBottom: '1.5rem', transition: 'opacity 0.5s ease', opacity: unlocked ? 1 : 0.7 }}>
          <h3 style={{
            ...sectionTitleStyle,
            color: unlocked ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.5)',
            transition: 'color 0.5s ease'
          }}>Skills Learned</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {detail.skillsLearned.map((s, i) => {
              const tc = getTagColor(s);
              return (
                <span key={i} style={{
                  fontFamily: 'NeueMontreal-Light, sans-serif',
                  fontSize: '0.8rem',
                  color: unlocked ? tc.text : 'rgba(255, 255, 255, 0.65)',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '20px',
                  background: unlocked ? tc.bg : 'rgba(255, 255, 255, 0.08)',
                  border: `0.5px solid ${unlocked ? tc.border : 'rgba(255, 255, 255, 0.12)'}`,
                  transition: 'all 0.5s ease',
                  transitionDelay: unlocked ? `${i * 0.06}s` : '0s'
                }}>{s}</span>
              );
            })}
          </div>
        </div>
      )}
      {detail.techStack.length > 0 && (
        <div style={{ transition: 'opacity 0.5s ease', opacity: unlocked ? 1 : 0.7 }}>
          <h3 style={{
            ...sectionTitleStyle,
            color: unlocked ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.5)',
            transition: 'color 0.5s ease'
          }}>Tech Stack</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {detail.techStack.map((t, i) => {
              const tc = getTagColor(t);
              return (
                <span key={i} style={{
                  fontFamily: 'NeueMontreal-Light, sans-serif',
                  fontSize: '0.8rem',
                  color: unlocked ? tc.text : 'rgba(255, 255, 255, 0.65)',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '20px',
                  background: unlocked ? tc.bg : 'rgba(255, 255, 255, 0.08)',
                  border: `0.5px solid ${unlocked ? tc.border : 'rgba(255, 255, 255, 0.12)'}`,
                  transition: 'all 0.5s ease',
                  transitionDelay: unlocked ? `${i * 0.06}s` : '0s'
                }}>{t}</span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Project Detail ─────────────────────────────────────────

const ProjectContent = ({ detail }: { detail: ProjectDetail }) => {
  const projRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = projRef.current;
    if (!container) return;

    // Find the closest scrollable ancestor (the panel or video-split-right div)
    let scrollParent: Element | null = container.parentElement;
    while (scrollParent) {
      const style = getComputedStyle(scrollParent);
      if (style.overflowY === 'auto' || style.overflowY === 'scroll') break;
      scrollParent = scrollParent.parentElement;
    }

    let observer: IntersectionObserver | null = null;
    const staggerTimers: ReturnType<typeof setTimeout>[] = [];

    const timer = setTimeout(() => {
      const elements = Array.from(container.querySelectorAll('.proj-scroll-item'));
      const scrollRect = scrollParent?.getBoundingClientRect();

      // Separate initially visible items from below-fold ones
      const initiallyVisible: Element[] = [];
      const belowFold: Element[] = [];
      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (scrollRect && rect.top < scrollRect.bottom - 40) {
          initiallyVisible.push(el);
        } else {
          belowFold.push(el);
        }
      });

      // Stagger-reveal items already in view
      initiallyVisible.forEach((el, i) => {
        staggerTimers.push(setTimeout(() => {
          el.classList.add('proj-scroll-revealed');
        }, i * 180));
      });

      // IntersectionObserver for items below the fold
      if (belowFold.length > 0) {
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                entry.target.classList.add('proj-scroll-revealed');
                observer?.unobserve(entry.target);
              }
            });
          },
          { root: scrollParent, threshold: 0.1, rootMargin: '0px 0px -20px 0px' }
        );
        belowFold.forEach(el => observer!.observe(el));
      }
    }, 400); // Wait for panel slide-in animation

    return () => {
      clearTimeout(timer);
      staggerTimers.forEach(t => clearTimeout(t));
      observer?.disconnect();
    };
  }, [detail.title]);

  return (
    <div ref={projRef}>
      {/* Keyframes for project cascade */}
      <style>{`
        .proj-scroll-item {
          opacity: 0.1;
          filter: brightness(0.3);
          transform: translateY(6px);
          transition: opacity 0.5s ease, filter 0.5s ease, transform 0.5s ease;
        }
        .proj-scroll-revealed {
          opacity: 1 !important;
          filter: brightness(1) !important;
          transform: translateY(0) !important;
        }
        @keyframes projPillColorIn {
          0% { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.08); color: rgba(255,255,255,0.25); }
          100% { background: var(--pill-bg); border-color: var(--pill-border); color: var(--pill-text); }
        }
      `}</style>

      {/* Header — skip when video is showing on the left */}
      {!detail.demoVideo && (
        <div style={{
          width: '100%',
          height: '120px',
          borderRadius: '12px',
          background: detail.liveUrl ? '#000' : detail.gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
          overflow: 'hidden'
        }}>
          {detail.liveUrl && detail.coverImage ? (
            <img
              src={detail.coverImage}
              alt={`${detail.title} logo`}
              style={{ width: '50px', height: '50px', opacity: 0.5, filter: 'brightness(0) invert(1)' }}
            />
          ) : detail.coverImage ? (
            <img
              src={detail.coverImage}
              alt={`${detail.title} preview`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <h2 style={{
              fontFamily: 'NeueMontreal-Medium, sans-serif',
              fontSize: '2rem',
              color: 'rgba(255,255,255,0.15)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase'
            }}>
              {detail.title}
            </h2>
          )}
        </div>
      )}

      <h2 style={{ fontFamily: 'NeueMontreal-Medium, sans-serif', fontSize: '1.5rem', color: 'white', margin: '0 0 1.5rem' }}>
        {detail.title}
      </h2>

      {/* Architecture */}
      {detail.architecture && (
        <div className="proj-scroll-item" style={{ marginBottom: '2rem' }}>
          <h3 style={sectionTitleStyle}>Architecture</h3>
          <p style={{ fontFamily: 'NeueMontreal-Light, sans-serif', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: '1.7', margin: 0 }}>
            {detail.architecture}
          </p>
        </div>
      )}

      {/* Technical Challenges */}
      {detail.technicalChallenges.length > 0 && (
        <div className="proj-scroll-item" style={{ marginBottom: '2rem' }}>
          <h3 style={sectionTitleStyle}>Technical Challenges</h3>
          <ol style={{ ...listStyle, paddingLeft: '1.25rem' }}>
            {detail.technicalChallenges.map((c, i) => (
              <li key={i} style={listItemStyle}>{c}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Lessons Learned */}
      {detail.lessonsLearned.length > 0 && (
        <div className="proj-scroll-item" style={{ marginBottom: '2rem' }}>
          <h3 style={sectionTitleStyle}>Lessons Learned</h3>
          <ul style={listStyle}>
            {detail.lessonsLearned.map((l, i) => (
              <li key={i} style={listItemStyle}>{l}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Tech Stack — pills light up with color */}
      {detail.techStack.length > 0 && (
        <div className="proj-scroll-item" style={{ marginBottom: '2rem' }}>
          <h3 style={sectionTitleStyle}>Tech Stack</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {detail.techStack.map((t, i) => {
              const tc = getTagColor(t);
              return (
                <span key={i} style={{
                  fontFamily: 'NeueMontreal-Light, sans-serif',
                  fontSize: '0.8rem',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '20px',
                  background: tc.bg,
                  border: `0.5px solid ${tc.border}`,
                  color: tc.text,
                }}>{t}</span>
              );
            })}
          </div>
        </div>
      )}

      {/* Repo Link */}
      {detail.repoUrl && (
        <div className="proj-scroll-item">
          <a
            href={detail.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: 'NeueMontreal-Medium, sans-serif',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.9rem',
              textDecoration: 'none',
              padding: '0.6rem 1.2rem',
              borderRadius: '8px',
              border: '0.5px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.05)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
          >
            View Repository →
          </a>
        </div>
      )}
    </div>
  );
};

// ─── Shared Styles ──────────────────────────────────────────

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: 'NeueMontreal-Medium, sans-serif',
  fontSize: '1rem',
  color: 'rgba(255, 255, 255, 0.5)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  margin: '0 0 1rem',
  fontWeight: 500
};

const pillCardStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.5rem 0.75rem',
  borderRadius: '8px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '0.5px solid rgba(255, 255, 255, 0.1)'
};

const tagStyle: React.CSSProperties = {
  fontFamily: 'NeueMontreal-Light, sans-serif',
  fontSize: '0.8rem',
  color: 'rgba(255, 255, 255, 0.65)',
  padding: '0.3rem 0.75rem',
  borderRadius: '20px',
  background: 'rgba(255, 255, 255, 0.08)',
  border: '0.5px solid rgba(255, 255, 255, 0.12)'
};

const listStyle: React.CSSProperties = {
  fontFamily: 'NeueMontreal-Light, sans-serif',
  color: 'rgba(255, 255, 255, 0.6)',
  fontSize: '0.9rem',
  lineHeight: '1.7',
  margin: 0,
  paddingLeft: '1rem'
};

const listItemStyle: React.CSSProperties = {
  marginBottom: '0.4rem'
};

export default DetailPanel;
