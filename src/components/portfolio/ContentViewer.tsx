import { useEffect, useRef } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import { getTagColor, companyBrands } from './tagColors';

export interface ContentViewData {
  type: 'blog' | 'case-study';
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
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
        <path d="M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.596 2.344.058 4.85.398 4.854.398-2.8-7.924-5.923-16.747-8.487-24h-4.715zm8.489 0v9.63L18.6 22.951c.043.000 4.02-.148 4.02-.148-.006-.68.012-22.566 0-22.803h-8.733zm-8.487 0v22.912l4.659-.394V0H5.4z" fill="#E50914"/>
      </svg>
    );
  }

  if (company === 'Spotify') {
    return (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381C8.64 5.801 15.6 6.001 20.1 8.82c.6.3.78 1.02.48 1.56-.301.42-1.02.599-1.499.3z" fill="#1DB954"/>
      </svg>
    );
  }

  if (company === 'Uber') {
    return (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
        <path d="M0 7.97v4.958c0 1.867 1.302 3.101 3 3.101.876 0 1.64-.4 2.022-.98v.871h1.557V7.97H5.022v4.96c0 1.098-.722 1.812-1.7 1.812-.977 0-1.7-.714-1.7-1.812V7.97H0zm7.831 0v7.96h1.556v-.872c.382.58 1.147.98 2.023.98 1.697 0 3-1.234 3-3.1 0-1.867-1.303-3.101-3-3.101-.876 0-1.64.4-2.023.98V7.97H7.831zm5.262 4.959c0 1.098-.723 1.812-1.7 1.812-.978 0-1.7-.714-1.7-1.812 0-1.099.722-1.813 1.7-1.813.977 0 1.7.714 1.7 1.813zm2.255-1.858v2.929c0 1.615 1.009 1.964 2.171 1.964.376 0 .641-.048.917-.142V14.52c-.177.063-.394.095-.563.095-.62 0-.968-.236-.968-.838v-2.708h1.53V9.856h-1.53V8.104h-1.557v1.752h-.917v1.214h.917zm5.352-1.323c-1.655 0-2.752 1.234-2.752 3.1 0 1.978 1.168 3.102 2.873 3.102.877 0 1.666-.332 2.27-.907l-.7-.97c-.432.384-.913.59-1.47.59-.777 0-1.35-.438-1.447-1.27h3.82c.02-.176.03-.377.03-.544 0-1.867-1.009-3.101-2.624-3.101zm-1.2 2.554c.094-.784.573-1.29 1.2-1.29.676 0 1.104.506 1.128 1.29h-2.328z" fill="white"/>
      </svg>
    );
  }

  return null;
};

const ContentViewer = ({ content, onClose }: ContentViewerProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const brand = content.company ? companyBrands[content.company] : null;

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
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 300,
          animation: 'cvFadeIn 0.3s ease-out forwards'
        }}
      />

      {/* Content Panel */}
      <div
        ref={panelRef}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          overflowY: 'auto',
          zIndex: 301,
          background: 'rgba(18, 18, 18, 0.98)',
          animation: 'cvSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}
        className="content-viewer-panel"
      >
        {/* Back Button - sticky */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          padding: '1.25rem 2rem',
          background: 'linear-gradient(to bottom, rgba(18, 18, 18, 0.98) 60%, transparent)',
          display: 'flex',
          alignItems: 'center'
        }}>
          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '0.5px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              color: 'rgba(255, 255, 255, 0.7)',
              fontFamily: 'NeueMontreal-Medium, sans-serif',
              fontSize: '0.85rem',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>
        </div>

        {/* Article Content */}
        <article style={{
          maxWidth: '720px',
          margin: '0 auto',
          padding: '0 2rem 4rem'
        }} className="content-viewer-article">
          {/* Header */}
          <header style={{ marginBottom: '2.5rem' }}>
            {/* Company branding for case studies */}
            {content.company && brand && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.25rem'
              }}>
                <CompanyLogo company={content.company} />
                <span style={{
                  fontFamily: 'NeueMontreal-Medium, sans-serif',
                  fontSize: '1rem',
                  color: brand.color,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em'
                }}>
                  {content.company}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 style={{
              fontFamily: 'NeueMontreal-Medium, sans-serif',
              fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
              color: 'white',
              margin: '0 0 1rem',
              fontWeight: 500,
              lineHeight: '1.3'
            }}>
              {content.title}
            </h1>

            {/* Meta info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
              marginBottom: '1.25rem'
            }}>
              <span style={{
                fontFamily: 'NeueMontreal-Light, sans-serif',
                fontSize: '0.85rem',
                color: 'rgba(255, 255, 255, 0.4)'
              }}>
                {new Date(content.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <span style={{
                fontFamily: 'NeueMontreal-Light, sans-serif',
                fontSize: '0.85rem',
                color: 'rgba(255, 255, 255, 0.4)'
              }}>
                {content.readingTime} min read
              </span>
            </div>

            {/* Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {content.tags.map((tag, i) => {
                const tc = getTagColor(tag);
                return (
                  <span key={i} style={{
                    fontSize: '0.75rem',
                    fontFamily: 'NeueMontreal-Light, sans-serif',
                    color: tc.text,
                    padding: '0.25rem 0.6rem',
                    borderRadius: '12px',
                    background: tc.bg,
                    border: `0.5px solid ${tc.border}`
                  }}>
                    {tag}
                  </span>
                );
              })}
            </div>

            {/* Summary */}
            <p style={{
              fontFamily: 'NeueMontreal-Light, sans-serif',
              fontSize: '1.05rem',
              color: 'rgba(255, 255, 255, 0.55)',
              lineHeight: '1.7',
              margin: '1.5rem 0 0',
              fontStyle: 'italic',
              paddingBottom: '1.5rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              {content.summary}
            </p>
          </header>

          {/* Markdown Body */}
          <MarkdownRenderer content={content.markdown} />
        </article>
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
          .content-viewer-article {
            padding: 0 1.25rem 3rem !important;
          }
        }
      `}</style>
    </>
  );
};

export default ContentViewer;
