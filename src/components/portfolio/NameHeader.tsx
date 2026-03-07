import { useState, useEffect, useRef } from 'react';

const NameHeader = () => {
  const fullName = "Ronniel Gandhe";
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [isTypingDone, setIsTypingDone] = useState(false);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    // Wait for splash screen to fade out (NameFlash hides at 3500ms)
    const startDelay = setTimeout(() => {
      let currentIndex = 0;
      const typingInterval = setInterval(() => {
        if (currentIndex < fullName.length) {
          setDisplayedText(fullName.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          setTimeout(() => {
            setIsTypingDone(true);
          }, 2500);
        }
      }, 110);

      return () => clearInterval(typingInterval);
    }, 3600);

    return () => clearTimeout(startDelay);
  }, []);

  // Cursor blink effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(blinkInterval);
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
      minHeight: '2.2rem'
    }}>
      <span style={{ whiteSpace: 'pre' }}>{displayedText}</span>
      <span
        style={{
          display: 'inline-block',
          width: '2px',
          height: '1.6em',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          marginLeft: '3px',
          opacity: isTypingDone ? 0 : (showCursor ? 1 : 0),
          transition: isTypingDone ? 'opacity 0.8s ease' : 'none',
          verticalAlign: 'middle'
        }}
      />

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
