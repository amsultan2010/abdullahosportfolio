import { useState, useEffect, useRef, useCallback } from 'react';

const PHRASES = [
  'cloud infrastructure',
  'data science',
  'anything I can get my hands on',
  'maximizing shareholder value',
  'too much caffeine',
  'sheer willpower',
  'duct tape and dreams',
  'late nights and good music',
  'a mass amount of ambition',
  'React, Python, and prayers',
];

const TYPING_SPEED = 60;    // ms per character typing
const DELETING_SPEED = 35;  // ms per character deleting
const PAUSE_AFTER_TYPE = 2000; // ms to hold the full phrase
const PAUSE_AFTER_DELETE = 400; // ms before typing next phrase

const MainContent = () => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initial fade-in
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Blinking cursor
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  // Typewriter effect — starts after the initial fade-in
  const tick = useCallback(() => {
    const currentPhrase = PHRASES[phraseIndex];

    if (!isDeleting) {
      // Typing forward
      if (displayText.length < currentPhrase.length) {
        setDisplayText(currentPhrase.slice(0, displayText.length + 1));
        timeoutRef.current = setTimeout(tick, TYPING_SPEED);
      } else {
        // Finished typing — pause, then start deleting
        timeoutRef.current = setTimeout(() => {
          setIsDeleting(true);
          timeoutRef.current = setTimeout(tick, DELETING_SPEED);
        }, PAUSE_AFTER_TYPE);
      }
    } else {
      // Deleting
      if (displayText.length > 0) {
        setDisplayText(displayText.slice(0, -1));
        timeoutRef.current = setTimeout(tick, DELETING_SPEED);
      } else {
        // Finished deleting — move to next phrase
        setIsDeleting(false);
        setPhraseIndex((phraseIndex + 1) % PHRASES.length);
        timeoutRef.current = setTimeout(tick, PAUSE_AFTER_DELETE);
      }
    }
  }, [displayText, phraseIndex, isDeleting]);

  useEffect(() => {
    if (!hasAnimated) return;

    // Start typewriter after fade-in completes + a small extra delay
    const startDelay = setTimeout(() => {
      timeoutRef.current = setTimeout(tick, 300);
    }, 800);

    return () => {
      clearTimeout(startDelay);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [hasAnimated]);

  // Re-schedule on every state change
  useEffect(() => {
    if (!hasAnimated) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(tick, isDeleting ? DELETING_SPEED : TYPING_SPEED);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [displayText, phraseIndex, isDeleting, tick, hasAnimated]);

  return (
    <div
      ref={contentRef}
      className="main-content-container"
      style={{
        position: 'relative',
        marginTop: '180px',
        marginLeft: 'auto',
        marginRight: 'auto',
        textAlign: 'left',
        width: '90%',
        minWidth: '320px',
        maxWidth: '1200px',
        zIndex: 2,
        opacity: hasAnimated ? 1 : 0,
        transform: hasAnimated ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out'
      }}
    >
      <div className="main-content-text">
        <h1>
          Using{' '}
          <span
            className="typing-span"
            style={{
              fontFamily: 'NeueMontreal-MediumItalic, sans-serif',
              fontStyle: 'italic',
              fontWeight: '500',
            }}
          >
            {displayText}
            <span
              className="cursor"
              style={{
                opacity: showCursor ? 1 : 0,
                transition: 'opacity 0.1s',
              }}
            >
              |
            </span>
          </span>
        </h1>
        <h1>
          to build elegant and scalable solutions to<br />
          <span style={{
            fontFamily: 'NeueMontreal-MediumItalic, sans-serif',
            fontStyle: 'italic',
            fontWeight: '500'
          }}>
            real world problems
          </span>
        </h1>
      </div>

      {/* Responsive CSS */}
      <style>{`
        @font-face {
          font-family: 'NeueMontreal-MediumItalic';
          src: url('/NeueMontreal-MediumItalic.otf') format('opentype');
          font-weight: 500;
          font-style: italic;
        }

        .main-content-container {
          color: white;
        }

        .main-content-text h1 {
          font-family: 'NeueMontreal-Light', 'Arial', sans-serif !important;
          font-size: clamp(24px, 4vw, 36px) !important;
          line-height: 1.4 !important;
          font-weight: normal !important;
          font-style: normal !important;
          margin: 0 0 0.1rem 0 !important;
          padding: 0 !important;
        }

        .main-content-container .main-content-text h1 {
          font-size: clamp(24px, 4vw, 36px) !important;
          line-height: 1.4 !important;
        }

        .main-content-text h1:last-child {
          margin-bottom: 0;
        }

        .main-content-text span {
          color: rgba(255, 255, 255, 0.9);
        }

        .main-content-text .cursor {
          font-weight: 300;
          color: rgba(255, 255, 255, 0.6);
          margin-left: 1px;
          font-style: normal;
        }

        @media (max-width: 1200px) {
          .main-content-container {
            width: 95%;
            max-width: 900px;
          }
        }

        @media (max-width: 768px) {
          .main-content-container {
            width: calc(95% - 40px);
            padding: 0 20px;
            min-width: 320px;
            max-width: 600px;
            margin-top: 150px !important;
          }

          .main-content-text h1 {
            font-size: clamp(20px, 5vw, 32px);
          }
        }

        @media (max-width: 480px) {
          .main-content-container {
            width: calc(98% - 40px);
            padding: 0 20px;
            min-width: 300px;
            max-width: 400px;
            margin-top: 130px !important;
          }
        }

        @media (max-width: 400px) {
          .main-content-text h1 {
            font-size: clamp(16px, 7vw, 24px);
          }
        }

        @media (max-width: 350px) {
          .main-content-text h1 {
            font-size: clamp(14px, 8vw, 20px);
          }
        }
      `}</style>
    </div>
  );
};

export default MainContent;
