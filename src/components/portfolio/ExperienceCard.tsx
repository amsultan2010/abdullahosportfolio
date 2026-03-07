interface ExperienceData {
  id: number;
  company: string;
  role: string;
  location: string;
  description: string;
  logo?: string;
  logo2?: string;
  logoSize?: number;
  logoRound?: boolean;
}

interface ExperienceCardProps {
  experience: ExperienceData;
  clickable?: boolean;
  link?: string | null;
  onDetailClick?: () => void;
}

const ExperienceCard = ({ experience, clickable = false, link = null, onDetailClick }: ExperienceCardProps) => {
  const handleClick = () => {
    if (onDetailClick) {
      onDetailClick();
    } else if (clickable && link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className="glass-experience-card"
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
              color: 'rgba(255, 255, 255, 0.6)',
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
        {/* Company and Role */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          width: '100%'
        }}>
          <h3 style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
            color: 'rgba(255, 255, 255, 0.75)',
            fontFamily: 'NeueMontreal-Medium, sans-serif',
            fontStyle: 'normal',
            margin: 0,
            fontWeight: '500',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            userSelect: 'none',
            WebkitUserSelect: 'none'
          }}>
            {experience.company}
          </h3>
          <p style={{
            fontSize: 'clamp(0.95rem, 2.3vw, 1.15rem)',
            color: 'rgba(255, 255, 255, 0.9)',
            fontFamily: 'NeueMontreal-Light, sans-serif',
            margin: 0,
            fontWeight: '300',
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
        </div>

        {/* Location */}
        <p style={{
          fontSize: 'clamp(0.9rem, 2.2vw, 1rem)',
          color: 'rgba(255, 255, 255, 0.6)',
          fontFamily: 'NeueMontreal-Light, sans-serif',
          margin: 0,
          fontWeight: '300',
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
          color: 'rgba(255, 255, 255, 0.85)',
          fontFamily: 'NeueMontreal-Light, sans-serif',
          lineHeight: '1.6',
          margin: 0,
          marginTop: '0.75rem',
          fontWeight: '300',
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
          background: rgba(128, 128, 128, 0.12);
          border-radius: 20px;
          border: 0.5px solid rgba(255, 255, 255, 0.2);
          padding: 1.5rem;
          overflow: hidden;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .glass-experience-card:hover {
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.4);
          transform: translateZ(10px) scale(1.02);
        }

        .glass-experience-card h3,
        .glass-experience-card p,
        .glass-experience-card span {
          transition: color 0.3s ease !important;
        }

        .glass-experience-card:hover h3,
        .glass-experience-card:hover p,
        .glass-experience-card:hover span {
          color: rgb(255, 255, 255) !important;
        }

        .glass-experience-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
        }

        .glass-experience-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 1px;
          height: 100%;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.3), transparent, rgba(255, 255, 255, 0.1));
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
          .glass-experience-card {
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
          .glass-experience-card {
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
