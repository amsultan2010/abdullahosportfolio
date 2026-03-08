import { useState, useEffect, useRef } from 'react';
import { getTagColor, companyBrands } from './tagColors';
import type { ContentViewData } from './ContentViewer';
import { contentMap } from './contentData';

interface CaseStudiesProps {
  onContentClick?: (content: ContentViewData) => void;
}

// Nasdaq logo, inverted white for dark backgrounds
const NasdaqLogo = ({ height = 28 }: { height?: number }) => {
  return (
    <img
      src="/NASDAQ_Logo.svg.png"
      alt="Nasdaq"
      height={height}
      style={{ filter: 'brightness(0) invert(1)', opacity: 0.85 }}
    />
  );
};

// Ikigai logo
const IkigaiLogo = ({ height = 28 }: { height?: number }) => {
  return (
    <img
      src="/ikigai.png"
      alt="Ikigai"
      style={{ height: height, width: 'auto', opacity: 0.85, marginLeft: '-2px' }}
    />
  );
};

const CaseStudies = ({ onContentClick }: CaseStudiesProps) => {
  const [titleAnimated, setTitleAnimated] = useState(false);
  const [cardAnimated, setCardAnimated] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target.classList.contains('cs-title')) {
              setTitleAnimated(true);
            } else if (entry.target.classList.contains('cs-carousel')) {
              setCardAnimated(true);
            }
          }
        });
      },
      { threshold: 0, rootMargin: '0px' }
    );

    const title = sectionRef.current?.querySelector('.cs-title');
    const carousel = sectionRef.current?.querySelector('.cs-carousel');
    if (title) observer.observe(title);
    if (carousel) observer.observe(carousel);

    return () => observer.disconnect();
  }, []);

  const researchPapers = [
    {
      slug: "investor-behavior-gap",
      company: "NDX",
      title: "Why Investors Underperform the Markets They Invest In",
      summary: "Financial markets produce strong long-term returns, yet the average investor consistently earns far less. This paper investigates why this gap exists, and why it is driven by behavior, not poor asset selection.",
      tags: ["Finance", "Behavioral Economics", "Markets", "Research"],
      readingTime: 14
    },
    {
      slug: "discipline-paradox",
      company: "IKIGAI",
      title: "The Discipline Paradox",
      summary: "Why do insanely talented people fail while mediocre disciplined people win? The answer lies not in ability, but in the neurochemistry of consistency and the mathematics of showing up.",
      tags: ["Psychology", "Behavioral Economics", "Research"],
      readingTime: 16
    }
  ];

  const handleCardClick = () => {
    const paper = researchPapers[activeIndex];
    const data = contentMap[paper.slug];
    if (data && onContentClick) {
      onContentClick(data);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === 0 ? researchPapers.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === researchPapers.length - 1 ? 0 : prev + 1));
  };

  const paper = researchPapers[activeIndex];

  const LogoComponent = paper.company === 'IKIGAI' ? <IkigaiLogo height={40} /> : <NasdaqLogo height={28} />;

  return (
    <div
      ref={sectionRef}
      id="deep-research"
      className="cs-container"
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
      <h2
        className="cs-title"
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
        }}
      >
        Deep Research
      </h2>

      {/* Research card with carousel */}
      <div
        className={`cs-carousel glass-cs-carousel ${cardAnimated ? 'animated' : ''}`}
        style={{ position: 'relative' }}
      >
        {/* Content area - click to open */}
        <div
          onClick={handleCardClick}
          style={{ cursor: 'pointer', padding: '2rem 3rem' }}
          className="cs-carousel-inner"
        >
          <div
            key={paper.slug}
            style={{
              animation: 'csFadeSlide 0.4s ease-out forwards'
            }}
          >
            {/* Logo */}
            <div style={{
              marginBottom: '1rem',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              overflow: 'visible'
            }}>
              {LogoComponent}
            </div>

            {/* Title */}
            <h3 style={{
              fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
              color: 'rgba(255, 255, 255, 0.85)',
              fontFamily: 'NeueMontreal-Medium, sans-serif',
              margin: '0.5rem 0 1rem',
              fontWeight: '500',
              lineHeight: '1.4'
            }}>
              {paper.title}
            </h3>

            {/* Summary */}
            <p style={{
              color: 'rgba(255, 255, 255, 0.55)',
              fontSize: '0.95rem',
              fontFamily: 'NeueMontreal-Light, sans-serif',
              lineHeight: '1.7',
              margin: '0 0 1.25rem',
              maxWidth: '800px'
            }}>
              {paper.summary}
            </p>

            {/* Tags + meta row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {paper.tags.map((tag, i) => {
                  const tc = getTagColor(tag);
                  return (
                    <span key={i} style={{
                      fontSize: '0.7rem',
                      fontFamily: 'NeueMontreal-Light, sans-serif',
                      color: tc.text,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '12px',
                      background: tc.bg,
                      border: `0.5px solid ${tc.border}`
                    }}>
                      {tag}
                    </span>
                  );
                })}
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem'
              }}>
                <span style={{
                  fontSize: '0.8rem',
                  fontFamily: 'NeueMontreal-Light, sans-serif',
                  color: 'rgba(255, 255, 255, 0.35)'
                }}>
                  {paper.readingTime} min read
                </span>
                <span style={{
                  fontSize: '0.85rem',
                  fontFamily: 'NeueMontreal-Medium, sans-serif',
                  color: 'rgba(255, 255, 255, 0.5)'
                }}>
                  Read &rarr;
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={handlePrev}
          className="cs-nav-btn cs-nav-prev"
          aria-label="Previous paper"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          onClick={handleNext}
          className="cs-nav-btn cs-nav-next"
          aria-label="Next paper"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </button>

        {/* Dot indicators */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          paddingBottom: '1rem'
        }}>
          {researchPapers.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }}
              style={{
                width: activeIndex === i ? '20px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: activeIndex === i ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              aria-label={`Go to paper ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <style>{`
        .glass-cs-carousel {
          position: relative;
          background: rgba(128, 128, 128, 0.12);
          border-radius: 20px;
          border: 0.5px solid rgba(255, 255, 255, 0.2);
          overflow: hidden;
          box-sizing: border-box;
          opacity: 0;
          transform: translateY(20px);
        }
        .glass-cs-carousel.animated {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }
        .glass-cs-carousel::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(79, 195, 247, 0.4), transparent);
        }
        @keyframes csFadeSlide {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .cs-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.06);
          border: 0.5px solid rgba(255, 255, 255, 0.15);
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.5);
          transition: all 0.2s ease;
          z-index: 2;
        }
        .cs-nav-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          color: white;
        }
        .cs-nav-prev { left: 12px; }
        .cs-nav-next { right: 12px; }
        @media (max-width: 768px) {
          .cs-container { width: calc(95% - 40px) !important; min-width: 300px !important; padding: 0 20px !important; }
          .cs-carousel-inner { padding: 1.5rem 2.5rem !important; }
          .cs-nav-btn { width: 30px; height: 30px; }
          .cs-nav-prev { left: 6px; }
          .cs-nav-next { right: 6px; }
        }
        @media (max-width: 480px) {
          .cs-container { width: calc(98% - 40px) !important; min-width: 280px !important; padding: 0 20px !important; }
          .cs-carousel-inner { padding: 1.25rem 2rem !important; }
        }
      `}</style>
    </div>
  );
};

export default CaseStudies;
