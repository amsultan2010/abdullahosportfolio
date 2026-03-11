import { useState, useEffect } from 'react';
import { useDesktop } from './DesktopContext';

type Phase = 'apple' | 'glitch' | 'spinner' | 'morph' | 'progress' | 'fade' | 'done';

export default function BootScreen() {
  const { state, dispatch } = useDesktop();
  const [phase, setPhase] = useState<Phase>('apple');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (state.bootComplete) {
      setPhase('done');
      return;
    }

    // Phase timeline:
    // 0.0s - Apple logo fades in
    // 1.2s - Glitch effect starts
    // 2.4s - macOS spinner
    // 3.6s - Morph to RG logo
    // 4.6s - Progress bar
    // 6.2s - Fade out begins
    // 7.0s - Done

    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => setPhase('glitch'), 1200));
    timers.push(setTimeout(() => setPhase('spinner'), 2400));
    timers.push(setTimeout(() => setPhase('morph'), 3600));
    timers.push(setTimeout(() => setPhase('progress'), 4600));

    // Progress bar fill
    timers.push(setTimeout(() => {
      let p = 0;
      const interval = setInterval(() => {
        const speed = Math.max(0.8, 4 * (1 - p / 100));
        p = Math.min(100, p + speed);
        setProgress(p);
        if (p >= 100) clearInterval(interval);
      }, 25);
      timers.push(setTimeout(() => clearInterval(interval), 2000));
    }, 4600));

    timers.push(setTimeout(() => setPhase('fade'), 6200));
    timers.push(setTimeout(() => {
      setPhase('done');
      dispatch({ type: 'SET_BOOT_COMPLETE' });
    }, 7000));

    return () => timers.forEach(clearTimeout);
  }, [dispatch, state.bootComplete]);

  if (phase === 'done') return null;

  const showApple = phase === 'apple' || phase === 'glitch';
  const showSpinner = phase === 'spinner';
  const showRG = phase === 'morph' || phase === 'progress' || phase === 'fade';
  const showProgress = phase === 'progress' || phase === 'fade';
  const isGlitching = phase === 'glitch';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 10000,
      background: '#000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: phase === 'fade' ? 0 : 1,
      transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
      pointerEvents: 'all',
    }}>
      {/* Apple Logo */}
      {showApple && (
        <div style={{
          position: 'relative',
          width: '80px',
          height: '80px',
        }}>
          {/* Main Apple logo */}
          <AppleLogo style={{
            opacity: isGlitching ? 0.7 : 1,
            animation: phase === 'apple'
              ? 'bootFadeIn 0.8s ease-out'
              : 'glitchShake 0.15s infinite',
          }} />

          {/* Glitch: Red channel offset */}
          {isGlitching && (
            <AppleLogo style={{
              position: 'absolute',
              inset: 0,
              filter: 'hue-rotate(-60deg) brightness(2)',
              opacity: 0.4,
              animation: 'glitchR 0.2s infinite',
              mixBlendMode: 'screen',
            }} />
          )}

          {/* Glitch: Blue channel offset */}
          {isGlitching && (
            <AppleLogo style={{
              position: 'absolute',
              inset: 0,
              filter: 'hue-rotate(180deg) brightness(2)',
              opacity: 0.3,
              animation: 'glitchB 0.25s infinite',
              mixBlendMode: 'screen',
            }} />
          )}
        </div>
      )}

      {/* Glitch scan lines */}
      {isGlitching && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
          animation: 'scanLines 0.5s infinite linear',
          pointerEvents: 'none',
        }} />
      )}

      {/* Glitch horizontal tear */}
      {isGlitching && (
        <div style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: '3px',
          background: 'rgba(255,255,255,0.15)',
          animation: 'glitchTear 0.3s infinite',
          pointerEvents: 'none',
        }} />
      )}

      {/* macOS Spinner */}
      {showSpinner && (
        <div style={{
          width: '40px',
          height: '40px',
          animation: 'spinnerFadeIn 0.4s ease-out, spinnerRotate 1s linear infinite',
        }}>
          <SpinnerSVG />
        </div>
      )}

      {/* RG Logo (morphed from spinner) */}
      {showRG && (
        <img
          src="/icons/rglogo.png"
          alt="RG"
          style={{
            width: '72px',
            height: '72px',
            objectFit: 'contain',
            filter: 'brightness(0) invert(1)',
            animation: 'morphIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      )}

      {/* Progress bar */}
      {showProgress && (
        <div style={{
          marginTop: '28px',
          width: '200px',
          height: '4px',
          borderRadius: '2px',
          background: 'rgba(255, 255, 255, 0.12)',
          overflow: 'hidden',
          animation: 'progressFadeIn 0.4s ease-out',
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'rgba(255, 255, 255, 0.75)',
            borderRadius: '2px',
            transition: 'width 0.08s linear',
            boxShadow: '0 0 8px rgba(255,255,255,0.3)',
          }} />
        </div>
      )}

      <style>{`
        @keyframes bootFadeIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes glitchShake {
          0% { transform: translate(0, 0); }
          20% { transform: translate(-3px, 1px); }
          40% { transform: translate(2px, -2px); }
          60% { transform: translate(-1px, 3px); }
          80% { transform: translate(3px, -1px); }
          100% { transform: translate(0, 0); }
        }

        @keyframes glitchR {
          0% { transform: translate(0, 0); clip-path: inset(0 0 80% 0); }
          20% { transform: translate(4px, -2px); clip-path: inset(20% 0 60% 0); }
          40% { transform: translate(-3px, 1px); clip-path: inset(40% 0 30% 0); }
          60% { transform: translate(2px, 3px); clip-path: inset(10% 0 70% 0); }
          80% { transform: translate(-4px, -1px); clip-path: inset(60% 0 10% 0); }
          100% { transform: translate(0, 0); clip-path: inset(0 0 80% 0); }
        }

        @keyframes glitchB {
          0% { transform: translate(0, 0); clip-path: inset(70% 0 0 0); }
          25% { transform: translate(-3px, 2px); clip-path: inset(30% 0 40% 0); }
          50% { transform: translate(4px, -1px); clip-path: inset(50% 0 20% 0); }
          75% { transform: translate(-2px, -3px); clip-path: inset(15% 0 55% 0); }
          100% { transform: translate(0, 0); clip-path: inset(70% 0 0 0); }
        }

        @keyframes scanLines {
          from { transform: translateY(0); }
          to { transform: translateY(4px); }
        }

        @keyframes glitchTear {
          0% { top: 20%; opacity: 0; }
          10% { opacity: 1; }
          30% { top: 55%; }
          50% { opacity: 0; top: 35%; }
          70% { opacity: 1; top: 70%; }
          90% { opacity: 0; }
          100% { top: 20%; opacity: 0; }
        }

        @keyframes spinnerFadeIn {
          from { opacity: 0; transform: scale(0.5) rotate(0deg); }
          to { opacity: 1; transform: scale(1) rotate(90deg); }
        }

        @keyframes spinnerRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes morphIn {
          from { opacity: 0; transform: scale(0.4) rotate(180deg); filter: brightness(0) invert(1) blur(8px); }
          50% { opacity: 0.7; transform: scale(1.1) rotate(10deg); filter: brightness(0) invert(1) blur(2px); }
          to { opacity: 1; transform: scale(1) rotate(0deg); filter: brightness(0) invert(1) blur(0px); }
        }

        @keyframes progressFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ── Apple Logo SVG ── */
function AppleLogo({ style }: { style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 814 1000"
      fill="white"
      style={{ width: '100%', height: '100%', ...style }}
    >
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57.8-155.5-127.4c-58.3-81.3-105.7-207.5-105.7-329.1 0-193.5 125.9-296.1 249.9-296.1 65.9 0 120.9 43.2 162.5 43.2 39.7 0 101.5-45.8 176.9-45.8 28.5 0 130.9 2.6 198.3 99.2zm-234-182.6c31.2-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 103.3-30.4 135.5-71.3z" />
    </svg>
  );
}

/* ── macOS-style Spinner ── */
function SpinnerSVG() {
  const spokes = 12;
  return (
    <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%' }}>
      {Array.from({ length: spokes }).map((_, i) => {
        const angle = (i * 360) / spokes;
        const opacity = 0.15 + (i / spokes) * 0.85;
        return (
          <line
            key={i}
            x1="20" y1="8" x2="20" y2="14"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            opacity={opacity}
            transform={`rotate(${angle} 20 20)`}
          />
        );
      })}
    </svg>
  );
}
