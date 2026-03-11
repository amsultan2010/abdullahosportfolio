import { useState, useEffect, useCallback } from 'react';
import { DesktopProvider, useDesktop } from './DesktopContext';
import MacBackground from './MacBackground';
import AppWindow from './AppWindow';
import BootScreen from './BootScreen';
import DesktopDock from './DesktopDock';
import DesktopMenuBar from './DesktopMenuBar';
import type { WindowId } from './types';

// Section content
import Education from '../portfolio/Education';
import Experience from '../portfolio/Experience';
import Projects from '../portfolio/Projects';
import CaseStudies from '../portfolio/CaseStudies';
import Blog from '../portfolio/Blog';
import DetailPanel from '../portfolio/DetailPanel';
import ContentViewer from '../portfolio/ContentViewer';
import type { DetailContent } from '../portfolio/DetailPanel';
import type { ContentViewData } from '../portfolio/ContentViewer';

function WindowContent({ id }: { id: WindowId }) {
  const { dispatch } = useDesktop();

  const handleCardClick = (detail: DetailContent) => {
    dispatch({ type: 'OPEN_DETAIL', detail });
  };

  const handleContentClick = (content: ContentViewData) => {
    dispatch({ type: 'OPEN_CONTENT', content });
  };

  switch (id) {
    case 'terminal':
      return <TerminalContent />;
    case 'education':
      return <Education onCardClick={handleCardClick} windowMode />;
    case 'experience':
      return <Experience onCardClick={handleCardClick} windowMode />;
    case 'projects':
      return <Projects onCardClick={handleCardClick} windowMode />;
    case 'deep-research':
      return <CaseStudies onContentClick={handleContentClick} windowMode />;
    case 'blog':
      return <Blog onContentClick={handleContentClick} windowMode />;
    default:
      return null;
  }
}

function TerminalContent() {
  const [typed, setTyped] = useState('');
  const hint = 'Click the dock below to explore ↓';

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < hint.length) {
        setTyped(hint.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 35);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      padding: '20px',
      fontFamily: "'SF Mono', 'JetBrains Mono', 'Menlo', monospace",
      fontSize: '14px',
      color: '#e6e9ef',
      lineHeight: 1.7,
    }}>
      <div style={{ fontWeight: 'bold', fontSize: '16px', color: 'white', marginBottom: '12px' }}>
        Ronniel Gandhe — Software Engineer
      </div>
      <div style={{ marginBottom: '3px' }}>
        <span style={{ color: '#ff79c6' }}>Location:</span> Waterloo, ON
      </div>
      <div style={{ marginBottom: '3px' }}>
        <span style={{ color: '#f1fa8c' }}>Email:</span> ronnielgandhe@gmail.com
      </div>
      <div style={{ marginBottom: '16px' }}>
        <span style={{ color: '#8be9fd' }}>GitHub:</span> github.com/ronnielgandhe
      </div>
      <div style={{ color: 'rgba(255,255,255,0.65)', marginTop: '20px', fontStyle: 'italic' }}>
        I build systems that think, design that feels, and code that connects ideas to impact.
      </div>
      <div style={{ marginTop: '28px' }}>
        <span style={{ color: '#10b981', fontWeight: 600 }}>ronnielgandhe.com root % </span>
        <span style={{ color: 'rgba(255,255,255,0.5)' }}>
          {typed}
        </span>
        <span style={{
          display: 'inline-block',
          width: '8px',
          height: '16px',
          background: '#10b981',
          marginLeft: '2px',
          verticalAlign: 'text-bottom',
          animation: 'blink 1s step-end infinite',
        }} />
      </div>
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function Desktop() {
  const { state, dispatch } = useDesktop();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Open terminal on boot complete
  useEffect(() => {
    if (state.bootComplete && !isMobile && Object.keys(state.windows).length === 0) {
      dispatch({ type: 'OPEN_WINDOW', id: 'terminal' });
    }
  }, [state.bootComplete, isMobile]);

  // Desktop click — deselect all windows
  const handleDesktopClick = useCallback((e: React.MouseEvent) => {
    // Only if clicking the desktop surface itself
    if (e.target === e.currentTarget) {
      dispatch({ type: 'DESELECT_ALL' });
    }
  }, [dispatch]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+W to close focused window
      if ((e.metaKey || e.ctrlKey) && e.key === 'w' && state.focusedWindowId) {
        e.preventDefault();
        dispatch({ type: 'CLOSE_WINDOW', id: state.focusedWindowId });
      }
      // Cmd+M to minimize focused window
      if ((e.metaKey || e.ctrlKey) && e.key === 'm' && state.focusedWindowId) {
        e.preventDefault();
        dispatch({ type: 'MINIMIZE_WINDOW', id: state.focusedWindowId });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.focusedWindowId, dispatch]);

  // Mobile fallback — lazy import the old SPA
  if (isMobile) {
    return <MobileFallback />;
  }

  const openWindows = Object.values(state.windows).filter(w => w.isOpen);

  return (
    <div
      onClick={handleDesktopClick}
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        background: '#0b1220',
        cursor: 'default',
      }}
    >
      <MacBackground />
      <BootScreen />

      {state.bootComplete && (
        <>
          <DesktopMenuBar />

          {/* Windows */}
          {openWindows.map(win => {
            if (win.id === 'detail' && state.activeDetail) {
              return (
                <AppWindow key={win.id} windowState={win}>
                  <DetailPanel
                    detail={state.activeDetail}
                    onClose={() => dispatch({ type: 'CLOSE_DETAIL' })}
                    windowMode
                  />
                </AppWindow>
              );
            }
            if (win.id === 'content' && state.activeContent) {
              return (
                <AppWindow key={win.id} windowState={win}>
                  <ContentViewer
                    content={state.activeContent}
                    onClose={() => dispatch({ type: 'CLOSE_CONTENT' })}
                    windowMode
                  />
                </AppWindow>
              );
            }
            return (
              <AppWindow key={win.id} windowState={win}>
                <WindowContent id={win.id} />
              </AppWindow>
            );
          })}

          <DesktopDock />
        </>
      )}

      <style>{`
        :root {
          color-scheme: dark;
          color: rgba(255, 255, 255, 0.87);
          font-synthesis: none;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        /* Custom scrollbar for windows */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.12);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}

function MobileFallback() {
  const [MobileShell, setMobileShell] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    import('./MobileShell').then(mod => setMobileShell(() => mod.default));
  }, []);

  if (!MobileShell) return <div style={{ background: '#0b1220', width: '100vw', height: '100vh' }} />;
  return <MobileShell />;
}

export default function DesktopShell() {
  return (
    <DesktopProvider>
      <Desktop />
    </DesktopProvider>
  );
}
