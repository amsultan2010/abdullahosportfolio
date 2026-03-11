import { useState, useEffect } from 'react';
import { useDesktop } from './DesktopContext';

export default function BootScreen() {
  const { state, dispatch } = useDesktop();
  const [phase, setPhase] = useState<'logo' | 'progress' | 'fade' | 'done'>('logo');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Logo hold with fade-in
    const t1 = setTimeout(() => setPhase('progress'), 1400);

    // Smooth progress fill (ease-out acceleration)
    const t2 = setTimeout(() => {
      let p = 0;
      const interval = setInterval(() => {
        // Ease-out: fast start, slow finish
        const speed = Math.max(0.5, 3 * (1 - p / 100));
        p = Math.min(100, p + speed);
        setProgress(p);
        if (p >= 100) clearInterval(interval);
      }, 30);
      return () => clearInterval(interval);
    }, 1400);

    // Fade out
    const t3 = setTimeout(() => setPhase('fade'), 3800);
    // Done
    const t4 = setTimeout(() => {
      setPhase('done');
      dispatch({ type: 'SET_BOOT_COMPLETE' });
    }, 4500);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [dispatch]);

  if (phase === 'done' || state.bootComplete) return null;

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
      transition: 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
      pointerEvents: 'all',
    }}>
      {/* RG Logo — fade + scale in */}
      <img
        src="/icons/rglogo.png"
        alt="RG"
        style={{
          width: '72px',
          height: '72px',
          objectFit: 'contain',
          opacity: phase === 'logo' ? 1 : phase === 'progress' ? 1 : 0,
          transform: phase === 'logo' ? 'scale(1)' : 'scale(1)',
          transition: 'opacity 0.8s ease, transform 0.8s ease',
          filter: 'brightness(0) invert(1)',
          animation: phase === 'logo' ? 'logoFadeIn 0.8s ease-out' : undefined,
        }}
      />

      {/* Progress bar */}
      {(phase === 'progress' || phase === 'fade') && (
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
        @keyframes logoFadeIn {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes progressFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
