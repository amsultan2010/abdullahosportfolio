import { useState, useEffect } from 'react';
import { useDesktop } from './DesktopContext';
import AbdullahAsciiLogo from './AbdullahAsciiLogo';

type Phase = 'loading' | 'fade' | 'done';

export default function BootScreen() {
  const { state, dispatch } = useDesktop();
  const [phase, setPhase] = useState<Phase>('loading');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (state.bootComplete) {
      setPhase('done');
      return;
    }

    // Timeline:
    // 0.0s — logo fades in + progress bar starts filling
    // ~2.5s — Progress bar reaches 100%
    // 2.6s — Fade out to desktop
    // 3.4s — Done

    const timers: ReturnType<typeof setTimeout>[] = [];

    // Progress bar fill
    let p = 0;
    const interval = setInterval(() => {
      const speed = Math.max(0.6, 3.5 * (1 - p / 100));
      p = Math.min(100, p + speed);
      setProgress(p);
      if (p >= 100) clearInterval(interval);
    }, 25);

    timers.push(setTimeout(() => setPhase('fade'), 2600));
    timers.push(setTimeout(() => {
      setPhase('done');
      dispatch({ type: 'SET_BOOT_COMPLETE' });
    }, 3400));

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, [dispatch, state.bootComplete]);

  if (phase === 'done') return null;

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
      <div style={{ width: 84, height: 84, animation: 'bootFadeIn 0.8s ease-out' }}>
        <AbdullahAsciiLogo width={84} height={84} color="#fff" opacity={0.95} />
      </div>

      {/* Progress bar */}
      <div style={{
        marginTop: '28px',
        width: '200px',
        height: '4px',
        borderRadius: '2px',
        background: 'rgba(255, 255, 255, 0.12)',
        overflow: 'hidden',
        animation: 'bootFadeIn 0.8s ease-out',
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

      <style>{`
        @keyframes bootFadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
