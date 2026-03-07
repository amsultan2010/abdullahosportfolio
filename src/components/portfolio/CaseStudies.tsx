import { useState, useEffect, useRef } from 'react';
import { getTagColor, companyBrands } from './tagColors';
import type { ContentViewData } from './ContentViewer';
import { contentMap } from './contentData';

interface CaseStudiesProps {
  onContentClick?: (content: ContentViewData) => void;
}

// Accurate company logos from Simple Icons
const CarouselCompanyLogo = ({ company, size = 32 }: { company: string; size?: number }) => {
  const brand = companyBrands[company];
  if (!brand) return null;

  if (company === 'Netflix') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#E50914">
        <path d="m5.398 0 8.348 23.602c2.346.059 4.856.398 4.856.398L10.113 0H5.398zm8.489 0v9.172l4.715 13.33V0h-4.715zM5.398 1.5V24c1.873-.225 2.81-.312 4.715-.398V14.83L5.398 1.5z"/>
      </svg>
    );
  }

  if (company === 'Spotify') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#1DB954">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
      </svg>
    );
  }

  if (company === 'Uber') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
        <path d="M0 7.97v4.958c0 1.867 1.302 3.101 3 3.101.826 0 1.562-.316 2.094-.87v.736H6.27V7.97H5.082v4.888c0 1.257-.85 2.106-1.947 2.106-1.11 0-1.946-.827-1.946-2.106V7.971H0zm7.44 0v7.925h1.13v-.725c.521.532 1.257.86 2.06.86a3.006 3.006 0 0 0 3.034-3.01 3.01 3.01 0 0 0-3.033-3.024 2.86 2.86 0 0 0-2.049.861V7.971H7.439zm9.869 2.038c-1.687 0-2.965 1.37-2.965 3 0 1.72 1.334 3.01 3.066 3.01 1.053 0 1.913-.463 2.49-1.233l-.826-.611c-.43.577-.996.847-1.664.847-.973 0-1.753-.7-1.912-1.64h4.697v-.373c0-1.72-1.222-3-2.886-3zm6.295.068c-.634 0-1.098.294-1.381.758v-.713h-1.131v5.774h1.142V12.61c0-.894.544-1.47 1.291-1.47H24v-1.065h-.396zm-6.319.928c.85 0 1.564.588 1.756 1.47H15.52c.203-.882.916-1.47 1.765-1.47zm-6.732.012c1.086 0 1.98.883 1.98 2.004a1.993 1.993 0 0 1-1.98 2.001A1.989 1.989 0 0 1 8.56 13.02a1.99 1.99 0 0 1 1.992-2.004z"/>
      </svg>
    );
  }

  return null;
};

const CaseStudies = ({ onContentClick }: CaseStudiesProps) => {
  const [titleAnimated, setTitleAnimated] = useState(false);
  const [cardAnimated, setCardAnimated] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
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

  const caseStudies = [
    {
      slug: "netflix",
      company: "Netflix",
      title: "Scaling Personalization Through Microservices",
      summary: "How Netflix transitioned from a monolithic application to 700+ microservices on AWS to handle 260M+ subscribers. A deep dive into the architecture decisions, team structures, and engineering culture that made it possible.",
      tags: ["Architecture", "Microservices", "Cloud", "Scale"],
      readingTime: 12
    },
    {
      slug: "uber",
      company: "Uber",
      title: "From 2 APIs to 2,200 Microservices",
      summary: "How Uber scaled from a single city to 10,000+ cities while managing explosive growth. The evolution of their architecture from a monolith to a domain-oriented microservice ecosystem.",
      tags: ["Architecture", "Scale", "Distributed Systems"],
      readingTime: 14
    },
    {
      slug: "spotify",
      company: "Spotify",
      title: "Scaling Agile with Squads, Tribes, and Chapters",
      summary: "How Spotify invented a new organizational model to scale from 40 engineers to 3,000+. A look at the Squad framework that redefined how tech companies think about team autonomy and alignment.",
      tags: ["Organization", "Agile", "Culture"],
      readingTime: 13
    }
  ];

  const goTo = (index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 400);
  };

  const goNext = () => {
    goTo((currentIndex + 1) % caseStudies.length);
  };

  const goPrev = () => {
    goTo((currentIndex - 1 + caseStudies.length) % caseStudies.length);
  };

  const handleCardClick = () => {
    const cs = caseStudies[currentIndex];
    const data = contentMap[cs.slug];
    if (data && onContentClick) {
      onContentClick(data);
    }
  };

  const cs = caseStudies[currentIndex];
  const brand = companyBrands[cs.company];

  return (
    <div
      ref={sectionRef}
      id="case-studies"
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
        Case Studies
      </h2>

      {/* Carousel card */}
      <div
        className={`cs-carousel glass-cs-carousel ${cardAnimated ? 'animated' : ''}`}
        style={{ position: 'relative' }}
      >
        {/* Navigation arrows */}
        <button
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
          className="cs-nav-btn cs-nav-prev"
          aria-label="Previous case study"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          className="cs-nav-btn cs-nav-next"
          aria-label="Next case study"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Content area - click to open */}
        <div
          onClick={handleCardClick}
          style={{ cursor: 'pointer', padding: '2rem 3rem' }}
          className="cs-carousel-inner"
        >
          {/* Transition wrapper */}
          <div
            key={cs.slug}
            style={{
              animation: 'csFadeSlide 0.4s ease-out forwards'
            }}
          >
            {/* Company header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <CarouselCompanyLogo company={cs.company} size={cs.company === 'Uber' ? 56 : 36} />
              {/* Hide text label for Uber since its logo IS the wordmark */}
              {cs.company !== 'Uber' && (
                <span style={{
                  fontFamily: 'NeueMontreal-Medium, sans-serif',
                  fontSize: '0.95rem',
                  color: brand?.color || 'rgba(255, 255, 255, 0.4)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em'
                }}>
                  {cs.company}
                </span>
              )}
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
              {cs.title}
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
              {cs.summary}
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
                {cs.tags.map((tag, i) => {
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
                  {cs.readingTime} min read
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

        {/* Dot indicators */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          paddingBottom: '1.25rem'
        }}>
          {caseStudies.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); goTo(i); }}
              aria-label={`Go to case study ${i + 1}`}
              style={{
                width: i === currentIndex ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                border: 'none',
                background: i === currentIndex
                  ? (brand?.color || 'rgba(255, 255, 255, 0.6)')
                  : 'rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.3s ease'
              }}
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
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
        }
        .cs-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 5;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 0.5px solid rgba(255, 255, 255, 0.15);
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          padding: 0;
        }
        .cs-nav-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          border-color: rgba(255, 255, 255, 0.3);
        }
        .cs-nav-prev { left: 0.75rem; }
        .cs-nav-next { right: 0.75rem; }
        @keyframes csFadeSlide {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @media (max-width: 768px) {
          .cs-container { width: calc(95% - 40px) !important; min-width: 300px !important; padding: 0 20px !important; }
          .cs-carousel-inner { padding: 1.5rem 2.5rem !important; }
          .cs-nav-btn { width: 32px; height: 32px; }
          .cs-nav-prev { left: 0.4rem; }
          .cs-nav-next { right: 0.4rem; }
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
