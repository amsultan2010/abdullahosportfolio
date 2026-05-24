import { useState, useEffect } from 'react';

const NameHeader = () => {
  const fullName = "Abdullah Sultan";
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Wait for splash screen to fade out, then fade in the name
    const timer = setTimeout(() => setIsVisible(true), 3600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      position: 'absolute',
      top: '60px',
      left: '35px',
      zIndex: 100,
      fontFamily: 'MenoBanner-Condensed, sans-serif',
      fontSize: '1.8rem',
      fontWeight: 'normal',
      color: 'white',
      fontStyle: 'italic',
      margin: 0,
      padding: 0,
      display: 'flex',
      alignItems: 'center',
      minHeight: '2.2rem',
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 0.8s ease-out'
    }}>
      <span style={{ whiteSpace: 'pre' }}>{fullName}</span>

      <style>{`
        @font-face {
          font-family: 'MenoBanner-Condensed';
          src: url('/meno-banner-condensed-italic.otf') format('opentype');
          font-weight: normal;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default NameHeader;
