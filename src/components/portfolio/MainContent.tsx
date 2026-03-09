import { useState, useEffect, useRef } from 'react';

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
  'vibes-based architecture',
  'ctrl+c ctrl+v from Stack Overflow',
  'approximately 47 browser tabs',
  'one more "quick fix" at 2am',
  'a mass amount of JIRA tickets',
  'whatever ChatGPT recommends',
  'zero sleep and questionable decisions',
  'microservices nobody asked for',
  'a mass amount of Lambda functions',
  'distributed systems and distributed sleep',
  'a mass amount of git commits',
];

const TYPING_SPEED = 65;
const DELETING_SPEED = 30;
const PAUSE_AFTER_TYPE = 2000;
const PAUSE_AFTER_DELETE = 400;

const MainContent = () => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  // All typewriter state lives in refs to avoid re-render timing issues
  const phraseIdx = useRef(0);
  const charIdx = useRef(0);
  const deleting = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initial fade-in
  useEffect(() => {
    const timer = setTimeout(() => setHasAnimated(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Blinking cursor
  useEffect(() => {
    const id = setInterval(() => setShowCursor(p => !p), 530);
    return () => clearInterval(id);
  }, []);

  // Single typewriter loop driven entirely by refs
  useEffect(() => {
    if (!hasAnimated) return;

    function step() {
      const phrase = PHRASES[phraseIdx.current];

      if (!deleting.current) {
        // Typing forward
        charIdx.current++;
        setDisplayText(phrase.slice(0, charIdx.current));

        if (charIdx.current >= phrase.length) {
          // Done typing — pause then start deleting
          timerRef.current = setTimeout(() => {
            deleting.current = true;
            step();
          }, PAUSE_AFTER_TYPE);
        } else {
          timerRef.current = setTimeout(step, TYPING_SPEED);
        }
      } else {
        // Deleting
        charIdx.current--;
        setDisplayText(phrase.slice(0, charIdx.current));

        if (charIdx.current <= 0) {
          // Done deleting — move to next phrase
          deleting.current = false;
          phraseIdx.current = (phraseIdx.current + 1) % PHRASES.length;
          timerRef.current = setTimeout(step, PAUSE_AFTER_DELETE);
        } else {
          timerRef.current = setTimeout(step, DELETING_SPEED);
        }
      }
    }

    // Kick off after fade-in settles
    timerRef.current = setTimeout(step, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [hasAnimated]);

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
            style={{
              fontFamily: 'NeueMontreal-MediumItalic, sans-serif',
              fontStyle: 'italic',
              fontWeight: '500',
            }}
          >
            {displayText}
            <span
              style={{
                opacity: showCursor ? 1 : 0,
                transition: 'opacity 0.1s',
                fontWeight: 300,
                color: 'rgba(255, 255, 255, 0.6)',
                marginLeft: '1px',
                fontStyle: 'normal',
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

          .main-content-text h1:first-child {
            min-height: 2.8em; /* Reserve 2 lines to prevent layout shift from typing animation */
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
