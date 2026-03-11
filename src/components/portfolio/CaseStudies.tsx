import { useState, useEffect, useRef } from 'react';
import { getTagColor, companyBrands } from './tagColors';
import type { ContentViewData } from './ContentViewer';
import { contentMap } from './contentData';

interface CaseStudiesProps {
  onContentClick?: (content: ContentViewData) => void;
  windowMode?: boolean;
}

const researchPapers = [
  {
    slug: "investor-behavior-gap",
    company: "NDX",
    title: "Why Investors Underperform the Markets They Invest In",
    summary: "Financial markets produce strong long-term returns, yet the average investor consistently earns far less.",
    tags: ["Finance", "Behavioral Economics", "Markets", "Research"],
    readingTime: 14,
    coverGradient: ['#0a1628', '#1a2744', '#2a3a5c'],
    coverAccent: '#4a9eff',
  },
  {
    slug: "discipline-paradox",
    company: "IKIGAI",
    title: "The Discipline Paradox",
    summary: "Why do insanely talented people fail while mediocre disciplined people win?",
    tags: ["Psychology", "Behavioral Economics", "Research"],
    readingTime: 16,
    coverGradient: ['#1a0a0a', '#2a1515', '#3d2020'],
    coverAccent: '#e8554a',
  }
];

const CaseStudies = ({ onContentClick, windowMode }: CaseStudiesProps) => {
  const [titleAnimated, setTitleAnimated] = useState(!!windowMode);
  const [cardAnimated, setCardAnimated] = useState(!!windowMode);
  const [activeSection, setActiveSection] = useState('All');
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (windowMode) {
      setTitleAnimated(true);
      setCardAnimated(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target.classList.contains('cs-title')) setTitleAnimated(true);
            else if (entry.target.classList.contains('cs-grid')) setCardAnimated(true);
          }
        });
      },
      { threshold: 0, rootMargin: '0px' }
    );
    const title = sectionRef.current?.querySelector('.cs-title');
    const grid = sectionRef.current?.querySelector('.cs-grid');
    if (title) observer.observe(title);
    if (grid) observer.observe(grid);
    return () => observer.disconnect();
  }, [windowMode]);

  const handleCardClick = (slug: string) => {
    const data = contentMap[slug];
    if (data && onContentClick) onContentClick(data);
  };

  // Non-window (scroll) mode — simple card carousel (existing behavior fallback)
  if (!windowMode) {
    return <ScrollModeFallback
      sectionRef={sectionRef}
      titleAnimated={titleAnimated}
      cardAnimated={cardAnimated}
      onContentClick={onContentClick}
    />;
  }

  // ── Apple Books Window Mode (Translucent Light Pane) ──
  return (
    <div ref={sectionRef} style={{
      display: 'flex', width: '100%', height: '100%',
      fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
      background: 'transparent', color: 'rgba(0,0,0,0.85)',
    }}>
      {/* ── Left Sidebar — light frosted glass ── */}
      <div style={{
        width: '190px', minWidth: '190px',
        borderRight: '0.5px solid rgba(0,0,0,0.08)',
        background: 'rgba(255,255,255,0.38)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        padding: '14px 0', display: 'flex', flexDirection: 'column',
        fontSize: '13px',
      }}>
        {/* Apple Books section */}
        <div style={{ padding: '0 14px 10px', fontSize: '11px', fontWeight: 600, color: 'rgba(0,0,0,0.5)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
          Deep Research
        </div>

        <SidebarItem icon="🏠" label="Home" active={activeSection === 'Home'} onClick={() => setActiveSection('Home')} />
        <SidebarItem icon="📚" label="Book Store" active={activeSection === 'Store'} onClick={() => setActiveSection('Store')} />

        <div style={{ height: '16px' }} />
        <div style={{ padding: '0 14px 6px', fontSize: '11px', fontWeight: 600, color: 'rgba(0,0,0,0.5)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
          Library
        </div>

        <SidebarItem icon="📋" label="All" active={activeSection === 'All'} onClick={() => setActiveSection('All')} count={researchPapers.length} />
        <SidebarItem icon="📖" label="Want to Read" active={activeSection === 'WantToRead'} onClick={() => setActiveSection('WantToRead')} />
        <SidebarItem icon="✅" label="Finished" active={activeSection === 'Finished'} onClick={() => setActiveSection('Finished')} />
        <SidebarItem icon="📕" label="Books" active={activeSection === 'Books'} onClick={() => setActiveSection('Books')} />
        <SidebarItem icon="📄" label="PDFs" active={activeSection === 'PDFs'} onClick={() => setActiveSection('PDFs')} />

        <div style={{ flex: 1 }} />

        <div style={{ height: '16px' }} />
        <div style={{ padding: '0 14px 6px', fontSize: '11px', fontWeight: 600, color: 'rgba(0,0,0,0.5)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
          My Collections
        </div>

        <SidebarItem icon="+" label="New Collection" active={false} onClick={() => {}} subtle />
      </div>

      {/* ── Main Content: Book Grid ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', background: 'rgba(255,255,255,0.25)' }}>
        {/* Section title */}
        <h1 style={{
          fontSize: '28px', fontWeight: 700, color: 'rgba(0,0,0,0.8)', margin: '0 0 28px',
          fontFamily: "'SF Pro Display', -apple-system, sans-serif",
        }}>
          All
        </h1>

        {/* Book covers grid */}
        <div className="cs-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '28px 24px',
          opacity: cardAnimated ? 1 : 0,
          transform: cardAnimated ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
        }}>
          {researchPapers.map((paper) => (
            <BookCard
              key={paper.slug}
              paper={paper}
              onClick={() => handleCardClick(paper.slug)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Book Cover Card ──
function BookCard({ paper, onClick }: {
  paper: typeof researchPapers[0];
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'pointer' }}
    >
      {/* Book cover */}
      <div style={{
        width: '100%',
        aspectRatio: '3 / 4',
        borderRadius: '6px',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: hovered
          ? '0 12px 32px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.15)'
          : '0 4px 16px rgba(0,0,0,0.15), 0 1px 4px rgba(0,0,0,0.1)',
        transform: hovered ? 'scale(1.03)' : 'scale(1)',
        transition: 'all 0.25s ease',
        background: `linear-gradient(160deg, ${paper.coverGradient[0]}, ${paper.coverGradient[1]}, ${paper.coverGradient[2]})`,
      }}>
        {/* Spine edge */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px',
          background: 'rgba(0,0,0,0.3)',
        }} />

        {/* Content */}
        <div style={{
          position: 'absolute', inset: 0, padding: '24px 20px 20px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          {/* Top: company/logo area */}
          <div>
            {paper.company === 'NDX' ? (
              <img
                src="/NASDAQ_Logo.svg.png"
                alt="Nasdaq"
                height={18}
                style={{ filter: 'brightness(0) invert(1)', opacity: 0.7 }}
              />
            ) : (
              <img
                src="/ikigai.png"
                alt="Ikigai"
                height={30}
                style={{ opacity: 0.7 }}
              />
            )}
          </div>

          {/* Center: Title */}
          <div>
            <h3 style={{
              fontSize: '15px', fontWeight: 700, color: 'rgba(255,255,255,0.95)',
              lineHeight: 1.35, margin: '0 0 8px',
              fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            }}>
              {paper.title}
            </h3>
            <p style={{
              fontSize: '11px', color: 'rgba(255,255,255,0.5)',
              lineHeight: 1.4, margin: 0,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {paper.summary}
            </p>
          </div>

          {/* Bottom: accent line */}
          <div style={{
            height: '2px', width: '40px', borderRadius: '1px',
            background: paper.coverAccent, opacity: 0.6,
          }} />
        </div>

        {/* Subtle grain texture overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '3px 3px',
        }} />
      </div>

      {/* Badge area below cover */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 2px 0',
      }}>
        <span style={{
          fontSize: '11px', fontWeight: 600, color: '#007aff',
          padding: '2px 6px', borderRadius: '3px', background: 'rgba(0,122,255,0.1)',
        }}>
          NEW
        </span>
        <span style={{
          fontSize: '16px', color: 'rgba(0,0,0,0.25)', cursor: 'pointer',
          letterSpacing: '2px',
        }}>
          •••
        </span>
      </div>
    </div>
  );
}

// ── Sidebar Item ──
function SidebarItem({ icon, label, active, onClick, count, subtle }: {
  icon: string; label: string; active: boolean; onClick: () => void;
  count?: number; subtle?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '5px 14px', margin: '1px 8px', borderRadius: '6px', cursor: 'default',
        background: active ? 'rgba(59,130,246,0.12)' : 'transparent',
        color: subtle ? 'rgba(0,0,0,0.3)' : active ? '#007AFF' : 'rgba(0,0,0,0.7)',
        fontWeight: active ? 500 : 400, fontSize: '13px',
        transition: 'background 0.15s',
      }}
    >
      <span style={{ fontSize: '15px', width: '20px', textAlign: 'center' }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {count !== undefined && (
        <span style={{
          fontSize: '12px', color: active ? '#007AFF' : 'rgba(0,0,0,0.3)', fontWeight: 400,
        }}>
          {count}
        </span>
      )}
    </div>
  );
}

// ── Scroll mode fallback (non-window, homepage carousel) ──
function ScrollModeFallback({ sectionRef, titleAnimated, cardAnimated, onContentClick }: {
  sectionRef: React.RefObject<HTMLDivElement | null>;
  titleAnimated: boolean; cardAnimated: boolean;
  onContentClick?: (content: ContentViewData) => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const hasInteracted = useRef(false);
  const paper = researchPapers[activeIndex];

  const switchPaper = (indexOrUpdater: number | ((prev: number) => number)) => {
    hasInteracted.current = true;
    setActiveIndex(indexOrUpdater);
  };

  const handleCardClick = () => {
    const data = contentMap[paper.slug];
    if (data && onContentClick) onContentClick(data);
  };

  return (
    <div
      ref={sectionRef}
      id="deep-research"
      className="cs-container"
      style={{
        position: 'relative', marginTop: '80px', marginLeft: 'auto', marginRight: 'auto',
        zIndex: 10, width: '90%', maxWidth: '1200px', minWidth: '320px',
      }}
    >
      <h2 className="cs-title" style={{
        fontSize: '1.5rem', color: 'rgba(0, 0, 0, 0.65)',
        fontFamily: 'NeueMontreal-MediumItalic, sans-serif', fontStyle: 'italic',
        margin: '0 0 1rem 0', fontWeight: '500',
        opacity: titleAnimated ? 1 : 0, transform: titleAnimated ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
      }}>
        Deep Research
      </h2>

      <div className="cs-carousel-wrapper" style={{ position: 'relative' }}>
        <div
          className={`cs-carousel glass-cs-carousel ${cardAnimated ? 'animated' : ''}`}
        >
          <div onClick={handleCardClick} style={{ cursor: 'pointer', padding: '2rem 3rem' }} className="cs-carousel-inner">
            <div key={paper.slug} style={hasInteracted.current ? { animation: 'csFadeSlide 0.4s ease-out forwards' } : undefined}>
              <div style={{ marginBottom: '1rem', height: '28px', display: 'flex', alignItems: 'center' }}>
                {paper.company === 'IKIGAI'
                  ? <img src="/ikigai.png" alt="Ikigai" style={{ height: 40, width: 'auto', opacity: 0.85, marginLeft: '-2px' }} />
                  : <img src="/NASDAQ_Logo.svg.png" alt="Nasdaq" height={28} style={{ opacity: 0.85 }} />
                }
              </div>
              <h3 style={{
                fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', color: 'rgba(0, 0, 0, 0.8)',
                fontFamily: 'NeueMontreal-Medium, sans-serif', margin: '0.5rem 0 1rem', fontWeight: '500', lineHeight: '1.4',
              }}>{paper.title}</h3>
              <p style={{
                color: 'rgba(0, 0, 0, 0.5)', fontSize: '0.95rem',
                fontFamily: 'NeueMontreal-Light, sans-serif', lineHeight: '1.7', margin: '0 0 1.25rem',
              }}>{paper.summary}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {paper.tags.map((tag, i) => {
                    const tc = getTagColor(tag);
                    return (
                      <span key={i} className="cs-tag-pill" style={{
                        fontSize: '0.7rem', fontFamily: 'NeueMontreal-Light, sans-serif',
                        color: tc.text, padding: '0.2rem 0.5rem', borderRadius: '12px',
                        background: tc.bg, border: `0.5px solid ${tc.border}`,
                      }}>{tag}</span>
                    );
                  })}
                </div>
                <span style={{ fontSize: '0.85rem', fontFamily: 'NeueMontreal-Medium, sans-serif', color: 'rgba(0, 0, 0, 0.45)' }}>
                  Read &rarr;
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', paddingBottom: '1rem' }}>
            {researchPapers.map((_, i) => (
              <button key={i} onClick={(e) => { e.stopPropagation(); switchPaper(i); }} style={{
                width: activeIndex === i ? '20px' : '6px', height: '6px', borderRadius: '3px',
                background: activeIndex === i ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.15)',
                border: 'none', padding: 0, cursor: 'pointer', transition: 'all 0.3s ease',
              }} aria-label={`Go to paper ${i + 1}`} />
            ))}
          </div>
        </div>

        <button onClick={(e) => { e.stopPropagation(); switchPaper(p => p === 0 ? researchPapers.length - 1 : p - 1); }}
          className="cs-nav-btn cs-nav-prev" aria-label="Previous paper">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button onClick={(e) => { e.stopPropagation(); switchPaper(p => p === researchPapers.length - 1 ? 0 : p + 1); }}
          className="cs-nav-btn cs-nav-next" aria-label="Next paper">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </button>
      </div>

      <style>{`
        .glass-cs-carousel {
          position: relative; background: rgba(0, 0, 0, 0.04); border-radius: 16px;
          border: 0.5px solid rgba(0, 0, 0, 0.1); overflow: hidden; box-sizing: border-box;
          opacity: 0; transform: translateY(20px);
        }
        .glass-cs-carousel.animated { opacity: 1; transform: translateY(0); transition: opacity 0.8s ease-out, transform 0.8s ease-out; }
        .glass-cs-carousel h3, .glass-cs-carousel p, .glass-cs-carousel span { transition: color 0.3s ease !important; }
        .glass-cs-carousel:hover { box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1); transition: box-shadow 0.3s ease; background: rgba(0, 0, 0, 0.06); }
        .glass-cs-carousel:hover h3 { color: rgba(0, 0, 0, 0.95) !important; }
        .cs-tag-pill { transition: all 0.3s ease !important; }
        .glass-cs-carousel::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.06), transparent); }
        @keyframes csFadeSlide { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        .cs-nav-btn {
          position: absolute; top: 50%; transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.04); border: 0.5px solid rgba(0, 0, 0, 0.12);
          border-radius: 50%; width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: rgba(0, 0, 0, 0.4); transition: all 0.2s ease; z-index: 2;
        }
        .cs-nav-btn:hover { background: rgba(0, 0, 0, 0.08); color: rgba(0, 0, 0, 0.7); }
        .cs-nav-prev { left: -48px; }
        .cs-nav-next { right: -48px; }
        @media (max-width: 768px) {
          .cs-container { width: calc(95% - 40px) !important; min-width: 300px !important; padding: 0 20px !important; }
          .cs-carousel-inner { padding: 1.5rem 2.5rem !important; }
          .cs-nav-btn { width: 30px; height: 30px; }
          .cs-nav-prev { left: -40px; }
          .cs-nav-next { right: -40px; }
        }
        @media (max-width: 480px) {
          .cs-container { width: calc(98% - 40px) !important; min-width: 280px !important; padding: 0 20px !important; }
          .cs-carousel-inner { padding: 1.25rem 2rem !important; }
        }
      `}</style>
    </div>
  );
}

export default CaseStudies;
