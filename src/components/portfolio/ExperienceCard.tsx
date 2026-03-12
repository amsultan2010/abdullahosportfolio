import { useState, useEffect, useRef } from 'react';

interface CardRole {
  role: string;
  date?: string;
  location?: string;
  description?: string;
}

interface ExperienceData {
  id: number;
  company: string;
  role: string;
  date?: string;
  location: string;
  description: string;
  logo?: string;
  logo2?: string;
  logoSize?: number;
  logoRound?: boolean;
  roles?: CardRole[];
}

interface ExperienceCardProps {
  experience: ExperienceData;
  clickable?: boolean;
  link?: string | null;
  onDetailClick?: () => void;
  darkMode?: boolean;
}

const ExperienceCard = ({ experience, clickable = false, link = null, onDetailClick, darkMode = false }: ExperienceCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [litIndex, setLitIndex] = useState(-1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleClick = () => {
    if (onDetailClick) {
      onDetailClick();
    } else if (clickable && link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  // Sequential light-up on hover for multi-role cards
  useEffect(() => {
    if (!experience.roles || experience.roles.length === 0) return;

    if (isHovered) {
      let current = -1;
      intervalRef.current = setInterval(() => {
        current++;
        if (current >= experience.roles!.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return;
        }
        setLitIndex(current);
      }, 180);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setLitIndex(-1);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovered, experience.roles]);

  return (
    <div
      className={darkMode ? 'dark-experience-card' : 'glass-experience-card'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
        minHeight: '100px',
        width: '100%',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        flexWrap: 'wrap',
        cursor: (clickable || onDetailClick) ? 'pointer' : 'default'
      }}
      onClick={handleClick}
    >

      {/* Company Icon(s) */}
      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
        <div className="company-icon" style={{
          flexShrink: 0,
          width: `${experience.logoSize || 50}px`,
          height: `${experience.logoSize || 50}px`,
          borderRadius: experience.logoRound ? '50%' : '10px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: `${experience.logoSize || 50}px`
        }}>
          {experience.logo ? (
            <img
              src={experience.logo}
              alt={`${experience.company} logo`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: experience.logoRound ? 'cover' : 'contain'
              }}
            />
          ) : (
            <span style={{
              color: darkMode ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)',
              fontSize: '1.5rem',
              fontFamily: 'NeueMontreal-Light, sans-serif',
              fontWeight: '300'
            }}>
              {experience.company.charAt(0)}
            </span>
          )}
        </div>
        {experience.logo2 && (
          <div className="company-icon" style={{
            flexShrink: 0,
            width: `${experience.logoSize || 50}px`,
            height: `${experience.logoSize || 50}px`,
            borderRadius: experience.logoRound ? '50%' : '10px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: `${experience.logoSize || 50}px`
          }}>
            <img
              src={experience.logo2}
              alt="Second logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="content" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        minWidth: '0',
        maxWidth: '100%',
        overflowWrap: 'break-word',
        wordBreak: 'break-word'
      }}>
        {/* Company Name */}
        <h3 style={{
          fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
          color: darkMode ? 'rgba(255, 255, 255, 0.95)' : '#1d1d1f',
          fontFamily: '-apple-system, BlinkMacSystemFont, NeueMontreal-Medium, sans-serif',
          fontStyle: 'normal',
          margin: 0,
          fontWeight: '600',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          wordBreak: 'break-word',
          userSelect: 'none',
          WebkitUserSelect: 'none'
        }}>
          {experience.company}
        </h3>

        {experience.roles && experience.roles.length > 0 ? (
          /* LinkedIn-style multi-role timeline with hover light-up */
          <div style={{ position: 'relative', paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
            {/* Base vertical line */}
            <div style={{
              position: 'absolute',
              left: '4px',
              top: '8px',
              bottom: '8px',
              width: '2px',
              background: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'
            }} />
            {/* Glow vertical line — grows as roles light up */}
            <div style={{
              position: 'absolute',
              left: '3px',
              top: '8px',
              width: '4px',
              height: litIndex >= experience.roles.length - 1 ? 'calc(100% - 16px)' : litIndex >= 0 ? `${((litIndex + 1) / experience.roles.length) * 100}%` : '0%',
              background: darkMode
                ? 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.25) 100%)'
                : 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.25) 100%)',
              filter: 'blur(1.5px)',
              borderRadius: '2px',
              transition: 'height 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
              opacity: litIndex >= 0 ? 1 : 0,
              pointerEvents: 'none'
            }} />
            {experience.roles.map((r, i) => {
              const isLit = i <= litIndex;
              return (
                <div key={i} style={{ position: 'relative', marginBottom: i < experience.roles!.length - 1 ? '1rem' : '0' }}>
                  {/* Dot */}
                  <div style={{
                    position: 'absolute',
                    left: '-1.25rem',
                    top: '6px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: darkMode
                      ? (isLit ? 'rgba(255, 255, 255, 0.7)' : (i === 0 ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.25)'))
                      : (isLit ? 'rgba(0, 0, 0, 0.7)' : (i === 0 ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.25)')),
                    border: `2px solid ${darkMode
                      ? (isLit ? 'rgba(255, 255, 255, 0.5)' : (i === 0 ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.15)'))
                      : (isLit ? 'rgba(0, 0, 0, 0.5)' : (i === 0 ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.15)'))}`,
                    boxShadow: darkMode
                      ? (isLit ? '0 0 8px rgba(255,255,255,0.2)' : (i === 0 ? '0 0 6px rgba(255,255,255,0.15)' : 'none'))
                      : (isLit ? '0 0 8px rgba(0,0,0,0.2)' : (i === 0 ? '0 0 6px rgba(0,0,0,0.15)' : 'none')),
                    transition: 'all 0.35s ease'
                  }} />
                  <p style={{
                    fontSize: 'clamp(0.95rem, 2.3vw, 1.1rem)',
                    color: darkMode ? 'rgba(255, 255, 255, 0.9)' : '#1d1d1f',
                    fontFamily: '-apple-system, BlinkMacSystemFont, NeueMontreal-Light, sans-serif',
                    margin: 0,
                    fontWeight: '500',
                    lineHeight: '1.4',
                    userSelect: 'none',
                    WebkitUserSelect: 'none'
                  }}>
                    {r.role}
                  </p>
                  <p style={{
                    fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)',
                    color: darkMode ? 'rgba(255, 255, 255, 0.7)' : '#86868b',
                    fontFamily: '-apple-system, BlinkMacSystemFont, NeueMontreal-Light, sans-serif',
                    margin: '0.1rem 0 0',
                    fontWeight: '400',
                    userSelect: 'none',
                    WebkitUserSelect: 'none'
                  }}>
                    {[r.date, r.location].filter(Boolean).join(' · ')}
                  </p>
                  {r.description && (
                    <p style={{
                      fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                      color: darkMode ? 'rgba(255, 255, 255, 0.85)' : '#424245',
                      fontFamily: '-apple-system, BlinkMacSystemFont, NeueMontreal-Light, sans-serif',
                      margin: '0.4rem 0 0',
                      fontWeight: '400',
                      lineHeight: '1.5',
                      userSelect: 'none',
                      WebkitUserSelect: 'none'
                    }}>
                      {r.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Single-role layout (original) */
          <>
            <p style={{
              fontSize: 'clamp(0.95rem, 2.3vw, 1.15rem)',
              color: darkMode ? 'rgba(255, 255, 255, 0.92)' : '#424245',
              fontFamily: '-apple-system, BlinkMacSystemFont, NeueMontreal-Light, sans-serif',
              margin: 0,
              fontWeight: '500',
              lineHeight: '1.4',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
              letterSpacing: '0.005em',
              userSelect: 'none',
              WebkitUserSelect: 'none'
            }}>
              {experience.role}
            </p>
            {experience.date && (
              <p style={{
                fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                color: darkMode ? 'rgba(255, 255, 255, 0.7)' : '#86868b',
                fontFamily: '-apple-system, BlinkMacSystemFont, NeueMontreal-Light, sans-serif',
                margin: '0.15rem 0 0',
                fontWeight: '400',
                userSelect: 'none',
                WebkitUserSelect: 'none'
              }}>
                {experience.date}
              </p>
            )}

            {/* Location */}
            <p style={{
              fontSize: 'clamp(0.9rem, 2.2vw, 1rem)',
              color: darkMode ? 'rgba(255, 255, 255, 0.7)' : '#86868b',
              fontFamily: '-apple-system, BlinkMacSystemFont, NeueMontreal-Light, sans-serif',
              margin: 0,
              fontWeight: '400',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
              userSelect: 'none',
              WebkitUserSelect: 'none'
            }}>
              {experience.location}
            </p>

            {/* Description */}
            <p style={{
              fontSize: 'clamp(0.95rem, 2.3vw, 1.1rem)',
              color: darkMode ? 'rgba(255, 255, 255, 0.88)' : '#424245',
              fontFamily: '-apple-system, BlinkMacSystemFont, NeueMontreal-Light, sans-serif',
              lineHeight: '1.6',
              margin: 0,
              marginTop: '0.75rem',
              fontWeight: '400',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
              hyphens: 'auto',
              letterSpacing: '0.01em',
              userSelect: 'none',
              WebkitUserSelect: 'none'
            }}>
              {experience.description}
            </p>
          </>
        )}
      </div>

      {/* Responsive CSS */}
      <style>{`
        @font-face {
          font-family: 'NeueMontreal-Light';
          src: url('/NeueMontreal-Light.otf') format('opentype');
          font-weight: 300;
          font-style: normal;
        }

        @font-face {
          font-family: 'NeueMontreal-Medium';
          src: url('/NeueMontreal-Medium.otf') format('opentype');
          font-weight: 500;
          font-style: normal;
        }

        .glass-experience-card {
          position: relative;
          background: rgba(255, 255, 255, 0.82);
          border-radius: 12px;
          border: 0.5px solid rgba(0, 0, 0, 0.06);
          padding: 1.5rem;
          overflow: hidden;
          transition: all 0.3s ease;
          cursor: pointer;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
        }

        .glass-experience-card:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.06);
          transform: translateY(-1px);
          background: rgba(255, 255, 255, 0.9);
        }

        .glass-experience-card h3,
        .glass-experience-card p,
        .glass-experience-card span {
          transition: color 0.3s ease !important;
        }

        .glass-experience-card:hover h3 {
          color: rgba(0, 0, 0, 0.95) !important;
        }

        .glass-experience-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.08), transparent);
        }

        .glass-experience-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 1px;
          height: 100%;
          background: linear-gradient(180deg, rgba(0, 0, 0, 0.06), transparent, rgba(0, 0, 0, 0.03));
        }

        /* Dark mode card variant */
        .dark-experience-card {
          position: relative;
          background: rgba(255, 255, 255, 0.07);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 1.5rem;
          overflow: hidden;
          transition: all 0.3s ease;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .dark-experience-card:hover {
          background: rgba(255, 255, 255, 0.11);
          border-color: rgba(255, 255, 255, 0.14);
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .dark-experience-card:hover h3 {
          color: rgba(255, 255, 255, 1) !important;
        }

        .dark-experience-card h3,
        .dark-experience-card p,
        .dark-experience-card span {
          transition: color 0.3s ease !important;
        }

        .dark-experience-card::before {
          display: none;
        }

        .dark-experience-card * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-touch-callout: none !important;
          -webkit-tap-highlight-color: transparent !important;
          outline: none !important;
        }

        .dark-experience-card *::selection {
          background: transparent !important;
        }

        .dark-experience-card h3, .dark-experience-card p {
          pointer-events: none !important;
        }

        .glass-experience-card * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-touch-callout: none !important;
          -webkit-tap-highlight-color: transparent !important;
          outline: none !important;
        }

        .glass-experience-card *::selection {
          background: transparent !important;
        }

        .glass-experience-card h3, .glass-experience-card p {
          pointer-events: none !important;
        }

        @media (max-width: 768px) {
          .glass-experience-card,
          .dark-experience-card {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 1rem !important;
            padding: 1.5rem 1rem !important;
            min-height: 180px !important;
            width: 100% !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
          }

          .company-icon {
            align-self: flex-start !important;
          }

          .content {
            text-align: left !important;
            flex: 1 !important;
            width: 100% !important;
            max-width: 100% !important;
            overflow-wrap: break-word !important;
            word-break: break-word !important;
          }
        }

        @media (max-width: 480px) {
          .glass-experience-card,
          .dark-experience-card {
            padding: 1rem 0.5rem !important;
            gap: 1rem !important;
            min-height: 200px !important;
            width: 100% !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
          }

          .content {
            width: 100% !important;
            max-width: 100% !important;
            overflow-wrap: break-word !important;
            word-break: break-word !important;
          }

          h3 {
            font-size: 1.1rem !important;
            width: 100% !important;
            overflow-wrap: break-word !important;
          }

          p {
            font-size: 0.9rem !important;
            width: 100% !important;
            overflow-wrap: break-word !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ExperienceCard;
