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
  windowMode?: boolean;
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
        src="/ikigai.png"
        alt="Ikigai"
        height={90}
        style={{ opacity: 0.9 }}
      />
    );
  }

  return null;
};

const ContentViewer = ({ content, onClose, windowMode }: ContentViewerProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const markdownRef = useRef<HTMLDivElement>(null);
  const brand = content.company ? companyBrands[content.company] : null;
  const isDeepResearch = content.type === 'deep-research';


  // Escape key + body scroll lock (skip in windowMode — AppWindow handles this)
  useEffect(() => {
    if (windowMode) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose, windowMode]);

  // Scroll to top on mount
  useEffect(() => {
    panelRef.current?.scrollTo(0, 0);
  }, [content.slug]);

  // Scroll-based light-up for markdown body elements
  useEffect(() => {
    const container = markdownRef.current;
    const scrollRoot = panelRef.current;
    if (!container || !scrollRoot) return;

    let observer: IntersectionObserver | null = null;
    const staggerTimers: ReturnType<typeof setTimeout>[] = [];

    const timer = setTimeout(() => {
      const elements = Array.from(container.querySelectorAll('p, h2, h3, blockquote, ul, ol, pre, table, hr, div.callout'));
      elements.forEach(el => el.classList.add('cv-scroll-reveal'));

      const scrollRect = scrollRoot.getBoundingClientRect();

      // Separate initially visible from below-fold
      const initiallyVisible: Element[] = [];
      const belowFold: Element[] = [];
      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < scrollRect.bottom - 40) {
          initiallyVisible.push(el);
        } else {
          belowFold.push(el);
        }
      });

      // Stagger-reveal items already in view
      initiallyVisible.forEach((el, i) => {
        staggerTimers.push(setTimeout(() => {
          el.classList.add('cv-scroll-revealed');
        }, i * 120));
      });

      // IntersectionObserver for items below the fold
      if (belowFold.length > 0) {
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                entry.target.classList.add('cv-scroll-revealed');
                observer?.unobserve(entry.target);
              }
            });
          },
          { root: scrollRoot, threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
        );
        belowFold.forEach(el => observer!.observe(el));
      }
    }, 1500); // Wait for cascade animation to finish

    return () => {
      clearTimeout(timer);
      staggerTimers.forEach(t => clearTimeout(t));
      observer?.disconnect();
    };
  }, [content.slug]);

  // In windowMode, render inline without backdrop/fixed overlay
  if (windowMode) {
    return (
      <div
        ref={panelRef}
        style={{ overflowY: 'auto', height: '100%' }}
        className="content-viewer-panel"
      >
        <div style={{ padding: '0 1rem', maxWidth: content.type === 'deep-research' ? '120ch' : '90ch', margin: '0 auto' }}>
          <div style={{
            background: 'rgba(20, 20, 20, 0.5)',
            border: '0.5px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}>
            <div className="cv-terminal-content" style={{ padding: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
              <header style={{ marginBottom: '2rem' }}>
                {isDeepResearch && content.company && (
                  <div className="cv-cascade-item cv-cascade-0" style={{ marginBottom: '1.75rem' }}>
                    <CompanyLogo company={content.company} />
                  </div>
                )}
                {!isDeepResearch && content.company && brand && (
                  <div className="cv-cascade-item cv-cascade-0" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <CompanyLogo company={content.company} />
                    {content.company !== 'Uber' && (
                      <span style={{ fontFamily: 'NeueMontreal-Medium, sans-serif', fontSize: '1rem', color: brand.color, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                        {content.company}
                      </span>
                    )}
                  </div>
                )}
                <h1 className="cv-cascade-item cv-cascade-1" style={{ fontFamily: 'NeueMontreal-Medium, sans-serif', fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', color: 'white', margin: '0 0 0.75rem', fontWeight: 500, lineHeight: '1.3' }}>
                  {content.title}
                </h1>
                <div className="cv-cascade-item cv-cascade-2" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', fontFamily: 'NeueMontreal-Light, sans-serif' }}>
                    {new Date(content.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <div className="cv-cascade-item cv-cascade-3" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  {content.tags.map((tag, i) => {
                    const tc = getTagColor(tag);
                    return (
                      <span key={i} style={{ fontSize: '0.7rem', fontFamily: 'NeueMontreal-Light, sans-serif', color: tc.text, padding: '0.2rem 0.55rem', borderRadius: '12px', background: tc.bg, border: `0.5px solid ${tc.border}` }}>
                        #{tag}
                      </span>
                    );
                  })}
                </div>
                <p className="cv-cascade-item cv-cascade-4" style={{ fontFamily: 'NeueMontreal-Light, sans-serif', fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.85)', lineHeight: '1.7', margin: 0, paddingBottom: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  {content.summary}
                </p>
              </header>
              <div ref={markdownRef} className="cv-cascade-item cv-cascade-5">
                <MarkdownRenderer content={content.markdown} />
              </div>
            </div>
          </div>
        </div>
        <style>{`
          @keyframes cvCascadeIn {
            0% { opacity: 0.05; transform: translateY(8px); filter: brightness(0.3); }
            100% { opacity: 1; transform: translateY(0); filter: brightness(1); }
          }
          .cv-cascade-item { opacity: 0.05; filter: brightness(0.3); animation: cvCascadeIn 0.6s ease forwards; }
          .cv-cascade-0 { animation-delay: 0.15s; }
          .cv-cascade-1 { animation-delay: 0.3s; }
          .cv-cascade-2 { animation-delay: 0.45s; }
          .cv-cascade-3 { animation-delay: 0.55s; }
          .cv-cascade-4 { animation-delay: 0.65s; }
          .cv-cascade-5 { animation-delay: 0.8s; }
          .cv-scroll-reveal { opacity: 0.3; filter: brightness(0.5); transform: translateY(4px); transition: opacity 0.6s ease, filter 0.6s ease, transform 0.6s ease; }
          .cv-scroll-revealed { opacity: 1 !important; filter: brightness(1) !important; transform: translateY(0) !important; }
        `}</style>
      </div>
    );
  }

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
          maxWidth: content.type === 'deep-research' ? '120ch' : '90ch',
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
            {/* Content */}
            <div
              className="cv-terminal-content"
              style={{ padding: 'clamp(2rem, 3vw, 3.5rem)' }}
            >
              {/* Header */}
              <header style={{ marginBottom: '2.5rem' }}>
                {/* Logo for deep research */}
                {isDeepResearch && content.company && (
                  <div className="cv-cascade-item cv-cascade-0" style={{
                    marginBottom: '1.75rem',
                  }}>
                    <CompanyLogo company={content.company} />
                  </div>
                )}
                {/* Company branding for case studies */}
                {!isDeepResearch && content.company && brand && (
                  <div className="cv-cascade-item cv-cascade-0" style={{
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
                <h1 className="cv-cascade-item cv-cascade-1" style={{
                  fontFamily: 'NeueMontreal-Medium, sans-serif',
                  fontSize: 'clamp(1.4rem, 3.5vw, 2rem)',
                  color: 'white',
                  margin: '0 0 1rem',
                  fontWeight: 500,
                  lineHeight: '1.3',
                }}>
                  {content.title}
                </h1>

                {/* Meta info */}
                <div className="cv-cascade-item cv-cascade-2" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  marginBottom: '1.25rem',
                }}>
                  <span style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', fontFamily: 'NeueMontreal-Light, sans-serif' }}>
                    {new Date(content.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>

                {/* Tags */}
                <div className="cv-cascade-item cv-cascade-3" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {content.tags.map((tag, i) => {
                    const tc = getTagColor(tag);
                    return (
                      <span key={i} style={{
                        fontSize: '0.7rem',
                        fontFamily: 'NeueMontreal-Light, sans-serif',
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
                <p className="cv-cascade-item cv-cascade-4" style={{
                  fontFamily: 'NeueMontreal-Light, sans-serif',
                  fontSize: '1rem',
                  color: 'rgba(255, 255, 255, 0.85)',
                  lineHeight: '1.7',
                  margin: 0,
                  paddingBottom: '1.5rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
                }}>
                  {content.summary}
                </p>
              </header>

              {/* Markdown Body */}
              <div ref={markdownRef} className="cv-cascade-item cv-cascade-5">
                <MarkdownRenderer content={content.markdown} />
              </div>
            </div>
          </div>
        </div>
      </div>

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
        @keyframes cvCascadeIn {
          0% { opacity: 0.05; transform: translateY(8px); filter: brightness(0.3); }
          100% { opacity: 1; transform: translateY(0); filter: brightness(1); }
        }
        .cv-cascade-item {
          opacity: 0.05;
          filter: brightness(0.3);
          animation: cvCascadeIn 0.6s ease forwards;
        }
        .cv-cascade-0 { animation-delay: 0.15s; }
        .cv-cascade-1 { animation-delay: 0.3s; }
        .cv-cascade-2 { animation-delay: 0.45s; }
        .cv-cascade-3 { animation-delay: 0.55s; }
        .cv-cascade-4 { animation-delay: 0.65s; }
        .cv-cascade-5 { animation-delay: 0.8s; }
        .cv-scroll-reveal {
          opacity: 0.3;
          filter: brightness(0.5);
          transform: translateY(4px);
          transition: opacity 0.6s ease, filter 0.6s ease, transform 0.6s ease;
        }
        .cv-scroll-revealed {
          opacity: 1 !important;
          filter: brightness(1) !important;
          transform: translateY(0) !important;
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
