import { useState, useEffect, useRef } from 'react';
import { getTagColor, companyBrands } from './tagColors';
import type { ContentViewData } from './ContentViewer';
import { contentMap } from './contentData';

interface CaseStudiesProps {
  onContentClick?: (content: ContentViewData) => void;
}

// Company logo SVGs for cards
const CardCompanyLogo = ({ company }: { company: string }) => {
  const brand = companyBrands[company];
  if (!brand) return null;

  if (company === 'Netflix') {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.596 2.344.058 4.85.398 4.854.398-2.8-7.924-5.923-16.747-8.487-24h-4.715zm8.489 0v9.63L18.6 22.951c.043.000 4.02-.148 4.02-.148-.006-.68.012-22.566 0-22.803h-8.733zm-8.487 0v22.912l4.659-.394V0H5.4z" fill="#E50914"/>
      </svg>
    );
  }

  if (company === 'Spotify') {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381C8.64 5.801 15.6 6.001 20.1 8.82c.6.3.78 1.02.48 1.56-.301.42-1.02.599-1.499.3z" fill="#1DB954"/>
      </svg>
    );
  }

  if (company === 'Uber') {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M0 7.97v4.958c0 1.867 1.302 3.101 3 3.101.876 0 1.64-.4 2.022-.98v.871h1.557V7.97H5.022v4.96c0 1.098-.722 1.812-1.7 1.812-.977 0-1.7-.714-1.7-1.812V7.97H0zm7.831 0v7.96h1.556v-.872c.382.58 1.147.98 2.023.98 1.697 0 3-1.234 3-3.1 0-1.867-1.303-3.101-3-3.101-.876 0-1.64.4-2.023.98V7.97H7.831zm5.262 4.959c0 1.098-.723 1.812-1.7 1.812-.978 0-1.7-.714-1.7-1.812 0-1.099.722-1.813 1.7-1.813.977 0 1.7.714 1.7 1.813zm2.255-1.858v2.929c0 1.615 1.009 1.964 2.171 1.964.376 0 .641-.048.917-.142V14.52c-.177.063-.394.095-.563.095-.62 0-.968-.236-.968-.838v-2.708h1.53V9.856h-1.53V8.104h-1.557v1.752h-.917v1.214h.917zm5.352-1.323c-1.655 0-2.752 1.234-2.752 3.1 0 1.978 1.168 3.102 2.873 3.102.877 0 1.666-.332 2.27-.907l-.7-.97c-.432.384-.913.59-1.47.59-.777 0-1.35-.438-1.447-1.27h3.82c.02-.176.03-.377.03-.544 0-1.867-1.009-3.101-2.624-3.101zm-1.2 2.554c.094-.784.573-1.29 1.2-1.29.676 0 1.104.506 1.128 1.29h-2.328z" fill="white"/>
      </svg>
    );
  }

  return null;
};

const CaseStudies = ({ onContentClick }: CaseStudiesProps) => {
  const [titleAnimated, setTitleAnimated] = useState(false);
  const [animatedCards, setAnimatedCards] = useState(new Set<string>());
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target.classList.contains('cs-title')) {
              setTitleAnimated(true);
            } else {
              const id = (entry.target as HTMLElement).dataset.csId;
              if (id) setAnimatedCards(prev => new Set([...prev, id]));
            }
          }
        });
      },
      { threshold: 0, rootMargin: '0px' }
    );

    const title = sectionRef.current?.querySelector('.cs-title');
    const cards = sectionRef.current?.querySelectorAll('.cs-card');
    if (title) observer.observe(title);
    if (cards) cards.forEach(c => observer.observe(c));

    return () => observer.disconnect();
  }, [animatedCards]);

  const caseStudies = [
    {
      slug: "netflix",
      company: "Netflix",
      title: "Scaling Personalization Through Microservices",
      summary: "How Netflix transitioned from a monolithic application to 700+ microservices on AWS to handle 260M+ subscribers.",
      tags: ["Architecture", "Microservices", "Cloud", "Scale"],
      readingTime: 12
    },
    {
      slug: "uber",
      company: "Uber",
      title: "From 2 APIs to 2,200 Microservices",
      summary: "How Uber scaled from a single city to 10,000+ cities while managing explosive growth.",
      tags: ["Architecture", "Scale", "Distributed Systems"],
      readingTime: 14
    },
    {
      slug: "spotify",
      company: "Spotify",
      title: "Scaling Agile with Squads, Tribes, and Chapters",
      summary: "How Spotify invented a new organizational model to scale from 40 engineers to 3,000+.",
      tags: ["Organization", "Agile", "Culture"],
      readingTime: 13
    }
  ];

  const handleCardClick = (slug: string) => {
    const data = contentMap[slug];
    if (data && onContentClick) {
      onContentClick(data);
    }
  };

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

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        width: '100%'
      }}>
        {caseStudies.map((cs) => {
          const isAnimated = animatedCards.has(cs.slug);
          const brand = companyBrands[cs.company];
          return (
            <div
              key={cs.slug}
              data-cs-id={cs.slug}
              className={`cs-card glass-cs-card ${isAnimated ? 'animated' : ''}`}
              onClick={() => handleCardClick(cs.slug)}
              style={{ cursor: 'pointer' }}
            >
              {/* Company header with logo and brand color */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                <CardCompanyLogo company={cs.company} />
                <span style={{
                  fontFamily: 'NeueMontreal-Medium, sans-serif',
                  fontSize: '0.85rem',
                  color: brand?.color || 'rgba(255, 255, 255, 0.4)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}>
                  {cs.company}
                </span>
              </div>

              <h3 style={{
                fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                color: 'rgba(255, 255, 255, 0.8)',
                fontFamily: 'NeueMontreal-Medium, sans-serif',
                margin: '0.5rem 0 0.75rem',
                fontWeight: '500',
                lineHeight: '1.4'
              }}>
                {cs.title}
              </h3>

              <p style={{
                color: 'rgba(255, 255, 255, 0.55)',
                fontSize: '0.9rem',
                fontFamily: 'NeueMontreal-Light, sans-serif',
                lineHeight: '1.5',
                margin: '0 0 1rem',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {cs.summary}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
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
                justifyContent: 'space-between',
                alignItems: 'center'
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
                  Read →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .glass-cs-card {
          position: relative;
          background: rgba(128, 128, 128, 0.12);
          border-radius: 20px;
          border: 0.5px solid rgba(255, 255, 255, 0.2);
          padding: 1.5rem;
          overflow: hidden;
          box-sizing: border-box;
          transition: all 0.3s ease;
          opacity: 0;
          transform: translateY(20px);
        }
        .glass-cs-card.animated {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }
        .glass-cs-card:hover {
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.4);
          transform: translateZ(10px) scale(1.02);
          transition: all 0.3s ease;
        }
        .glass-cs-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
        }
        @media (max-width: 768px) {
          .cs-container { width: calc(95% - 40px) !important; min-width: 300px !important; padding: 0 20px !important; }
        }
        @media (max-width: 480px) {
          .cs-container { width: calc(98% - 40px) !important; min-width: 280px !important; padding: 0 20px !important; }
        }
      `}</style>
    </div>
  );
};

export default CaseStudies;
