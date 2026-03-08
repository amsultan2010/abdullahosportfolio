import { useEffect, useRef } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import { getTagColor, companyBrands } from './tagColors';

export interface ContentViewData {
  type: 'blog' | 'case-study' | 'deep-research';
  slug: string;
  title: string;
  company?: string;
  publishedAt: string;
  tags: string[];
  readingTime: number;
  summary: string;
  markdown: string;
}

interface ContentViewerProps {
  content: ContentViewData;
  onClose: () => void;
}

// Company logo SVGs
const CompanyLogo = ({ company }: { company: string }) => {
  const brand = companyBrands[company];
  if (!brand) return null;

  if (company === 'Netflix') {
    return (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="#E50914">
        <path d="m5.398 0 8.348 23.602c2.346.059 4.856.398 4.856.398L10.113 0H5.398zm8.489 0v9.172l4.715 13.33V0h-4.715zM5.398 1.5V24c1.873-.225 2.81-.312 4.715-.398V14.83L5.398 1.5z"/>
      </svg>
    );
  }

  if (company === 'Spotify') {
    return (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="#1DB954">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
      </svg>
    );
  }

  if (company === 'Uber') {
    return (
      <svg width="56" height="36" viewBox="0 0 24 24" fill="white">
        <path d="M0 7.97v4.958c0 1.867 1.302 3.101 3 3.101.826 0 1.562-.316 2.094-.87v.736H6.27V7.97H5.082v4.888c0 1.257-.85 2.106-1.947 2.106-1.11 0-1.946-.827-1.946-2.106V7.971H0zm7.44 0v7.925h1.13v-.725c.521.532 1.257.86 2.06.86a3.006 3.006 0 0 0 3.034-3.01 3.01 3.01 0 0 0-3.033-3.024 2.86 2.86 0 0 0-2.049.861V7.971H7.439zm9.869 2.038c-1.687 0-2.965 1.37-2.965 3 0 1.72 1.334 3.01 3.066 3.01 1.053 0 1.913-.463 2.49-1.233l-.826-.611c-.43.577-.996.847-1.664.847-.973 0-1.753-.7-1.912-1.64h4.697v-.373c0-1.72-1.222-3-2.886-3zm6.295.068c-.634 0-1.098.294-1.381.758v-.713h-1.131v5.774h1.142V12.61c0-.894.544-1.47 1.291-1.47H24v-1.065h-.396zm-6.319.928c.85 0 1.564.588 1.756 1.47H15.52c.203-.882.916-1.47 1.765-1.47zm-6.732.012c1.086 0 1.98.883 1.98 2.004a1.993 1.993 0 0 1-1.98 2.001A1.989 1.989 0 0 1 8.56 13.02a1.99 1.99 0 0 1 1.992-2.004z"/>
      </svg>
    );
  }

  if (company === 'NDX') {
    return (
      <img
        src="/NASDAQ_Logo.svg.png"
        alt="Nasdaq"
        height={40}
        style={{ filter: 'brightness(0) invert(1)', opacity: 0.9 }}
      />
    );
  }

  if (company === 'IKIGAI') {
    return (
      <img
        src="/ikigai.jpg"
        alt="Ikigai"
        height={48}
        style={{ borderRadius: '6px', opacity: 0.9 }}
      />
    );
  }

  return null;
};

const ContentViewer = ({ content, onClose }: ContentViewerProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const brand = content.company ? companyBrands[content.company] : null;
  const isDeepResearch = content.type === 'deep-research';

  const titleBarLabel = content.type === 'deep-research'
    ? `${content.slug}.research — deep research`
    : content.type === 'case-study'
    ? `${content.slug}.case — ${content.company}`
    : `${content.slug} — blog post`;

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

  // Scroll to top on mount
  useEffect(() => {
    panelRef.current?.scrollTo(0, 0);
  }, [content.slug]);

  return (
    <>
      {/* Backdrop — blurred so WebGL silk shows through */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          zIndex: 300,
          animation: 'cvFadeIn 0.3s ease-out forwards'
        }}
      />

      {/* Scrollable container */}
      <div
        ref={panelRef}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          overflowY: 'auto',
          zIndex: 301,
          animation: 'cvSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}
        className="content-viewer-panel"
      >
        {/* Back button */}
        <div style={{
          padding: '1.25rem 2rem',
          display: 'flex',
          alignItems: 'center'
        }}>
          <button
            onClick={onClose}
            className="cv-back-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'none',
              border: 'none',
              padding: '0.4rem 0',
              cursor: 'pointer',
              color: 'rgba(255, 255, 255, 0.45)',
              fontFamily: 'NeueMontreal-Light, sans-serif',
              fontSize: '0.85rem',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.45)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>
        </div>

        {/* Glass Pane Terminal Window */}
        <div style={{
          maxWidth: '90ch',
          margin: '0 auto 4rem',
          padding: '0 2rem',
        }}>
          <div style={{
            background: 'rgba(20, 20, 20, 0.75)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '0.5px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), inset 0 0 0 0.5px rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            overflow: 'hidden',
          }}>
            {/* Terminal Title Bar */}
            <div style={{
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0 16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              userSelect: 'none',
            }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F57' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FEBC2E' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28C840' }} />
              <span style={{
                flex: 1,
                textAlign: 'center',
                fontFamily: "'SF Mono', 'JetBrains Mono', 'Menlo', monospace",
                fontSize: '0.75rem',
                color: 'rgba(255, 255, 255, 0.5)',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
                {titleBarLabel}
              </span>
            </div>

            {/* Terminal Content */}
            <div
              className={isDeepResearch ? 'deep-research-content' : ''}
              style={{ padding: 'clamp(1.5rem, 3vw, 3rem)' }}
            >
              {/* Header */}
              <header style={{ marginBottom: '2.5rem' }}>
                {/* Logo for deep research */}
                {isDeepResearch && content.company && (
                  <div style={{
                    marginBottom: '1.75rem',
                  }}>
                    <CompanyLogo company={content.company} />
                  </div>
                )}
                {/* Company branding for case studies */}
                {!isDeepResearch && content.company && brand && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '1.25rem'
                  }}>
                    <CompanyLogo company={content.company} />
                    {content.company !== 'Uber' && (
                      <span style={{
                        fontFamily: 'NeueMontreal-Medium, sans-serif',
                        fontSize: '1rem',
                        color: brand.color,
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em'
                      }}>
                        {content.company}
                      </span>
                    )}
                  </div>
                )}

                {/* Title */}
                <h1 style={{
                  fontFamily: "'SF Mono', 'JetBrains Mono', 'Menlo', monospace",
                  fontSize: 'clamp(1.4rem, 3.5vw, 2rem)',
                  color: 'white',
                  margin: '0 0 1rem',
                  fontWeight: 600,
                  lineHeight: '1.3',
                  letterSpacing: '-0.02em',
                }}>
                  {content.title}
                </h1>

                {/* Meta info */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  marginBottom: '1.25rem',
                  fontFamily: "'SF Mono', 'JetBrains Mono', 'Menlo', monospace",
                }}>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.4)' }}>
                    <span style={{ color: 'rgb(74, 222, 128)' }}>$</span>{' '}
                    published {new Date(content.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.3)' }}>•</span>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.4)' }}>
                    {content.readingTime} min read
                  </span>
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {content.tags.map((tag, i) => {
                    const tc = getTagColor(tag);
                    return (
                      <span key={i} style={{
                        fontSize: '0.7rem',
                        fontFamily: "'SF Mono', 'JetBrains Mono', 'Menlo', monospace",
                        color: tc.text,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '12px',
                        background: tc.bg,
                        border: `0.5px solid ${tc.border}`
                      }}>
                        #{tag}
                      </span>
                    );
                  })}
                </div>

                {/* Summary */}
                <p style={{
                  fontFamily: 'NeueMontreal-Light, sans-serif',
                  fontSize: '1rem',
                  color: 'rgba(255, 255, 255, 0.5)',
                  lineHeight: '1.7',
                  margin: 0,
                  paddingBottom: '1.5rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
                }}>
                  {content.summary}
                </p>
              </header>

              {/* Markdown Body */}
              <MarkdownRenderer content={content.markdown} />
            </div>
          </div>
        </div>
      </div>

      {/* White lightning cascade overlay for deep research */}
      {isDeepResearch && (
        <div className="lightning-cascade" style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 302,
          pointerEvents: 'none',
          animation: 'lightningCascade 1.6s ease-out forwards',
        }}>
          {/* White glow wash */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 15%, rgba(255, 255, 255, 0.02) 35%, transparent 55%)',
            animation: 'lightningWipe 1.2s ease-out forwards',
          }} />
          {/* Central white beam */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, transparent 10%, rgba(255, 255, 255, 0.5) 30%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0.5) 70%, transparent 90%)',
            animation: 'lightningBeamSweep 1.2s ease-out forwards',
            boxShadow: '0 0 30px rgba(255, 255, 255, 0.3), 0 0 60px rgba(255, 255, 255, 0.1)',
          }} />
        </div>
      )}

      {/* Styles */}
      <style>{`
        @keyframes cvFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes cvSlideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes lightningCascade {
          0% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes lightningWipe {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes lightningBeamSweep {
          0% { top: -4px; opacity: 1; }
          90% { top: 100%; opacity: 0.6; }
          100% { top: 100%; opacity: 0; }
        }
        .deep-research-content {
          filter: brightness(0.35);
          animation: contentIlluminate 1.4s ease-out 0.15s forwards;
        }
        @keyframes contentIlluminate {
          0% { filter: brightness(0.35); }
          60% { filter: brightness(0.85); }
          100% { filter: brightness(1); }
        }
        .content-viewer-panel::-webkit-scrollbar {
          width: 6px;
        }
        .content-viewer-panel::-webkit-scrollbar-track {
          background: transparent;
        }
        .content-viewer-panel::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.15);
          border-radius: 3px;
        }
        @media (max-width: 768px) {
          .content-viewer-panel > div:last-of-type {
            padding: 0 1rem !important;
          }
        }
      `}</style>
    </>
  );
};

export default ContentViewer;
