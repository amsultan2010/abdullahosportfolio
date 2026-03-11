import { useState, useRef, useCallback } from 'react';
import { useDesktop } from './DesktopContext';
import type { WindowId } from './types';
import { BsGithub } from 'react-icons/bs';
import { HiAcademicCap } from 'react-icons/hi2';
import { BsBriefcaseFill } from 'react-icons/bs';

interface DockItem {
  id: WindowId | 'github' | 'email' | 'spotify';
  label: string;
  icon: React.ReactNode;
  isExternal?: boolean;
  href?: string;
}

const BASE_SIZE = 50;
const MAX_SIZE = 72;
const MAGNIFY_RANGE = 150; // px range of magnification

export default function DesktopDock() {
  const { state, dispatch } = useDesktop();
  const [mouseX, setMouseX] = useState<number | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  const windowItems: DockItem[] = [
    { id: 'terminal', label: 'Terminal', icon: <DockImage src="/terminal.png" alt="Terminal" /> },
    { id: 'education', label: 'Education', icon: <AppIcon gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" iconEl={<HiAcademicCap size={24} color="white" />} /> },
    { id: 'experience', label: 'Experience', icon: <AppIcon gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" iconEl={<BsBriefcaseFill size={22} color="white" />} /> },
    { id: 'projects', label: 'Projects', icon: <DockImage src="/vscode.png" alt="VS Code" /> },
    { id: 'deep-research', label: 'Deep Research', icon: <BooksIcon /> },
    { id: 'blog', label: 'My Thoughts', icon: <DockImage src="/notes.png" alt="Notes" /> },
  ];

  const externalItems: DockItem[] = [
    { id: 'github', label: 'GitHub', icon: <AppIcon gradient="linear-gradient(135deg, #2d2d2d 0%, #434343 100%)" iconEl={<BsGithub size={24} color="white" />} />, isExternal: true, href: 'https://github.com/ronnielgandhe' },
    { id: 'email', label: 'Email Me', icon: <AppIcon gradient="linear-gradient(135deg, #34d399 0%, #059669 100%)" iconEl={<span style={{ fontSize: '22px', lineHeight: 1 }}>✉</span>} />, isExternal: true, href: 'mailto:ronnielgandhe@gmail.com' },
    { id: 'spotify', label: 'Dev Playlist', icon: <DockImage src="/spotify.png" alt="Spotify" />, isExternal: true, href: 'https://open.spotify.com/playlist/2uud5zGJZf3U98FlTnQip8' },
  ];

  const allItems = [...windowItems, { id: 'divider' as any, label: '', icon: null }, ...externalItems];

  const handleClick = (item: DockItem) => {
    if (item.isExternal && item.href) {
      if (item.href.startsWith('mailto:')) {
        window.location.href = item.href;
      } else {
        window.open(item.href, '_blank');
      }
      return;
    }
    const id = item.id as WindowId;
    const win = state.windows[id];
    if (win?.isMinimized) {
      dispatch({ type: 'RESTORE_WINDOW', id });
    } else if (win?.isOpen) {
      dispatch({ type: 'FOCUS_WINDOW', id });
    } else {
      dispatch({ type: 'OPEN_WINDOW', id });
    }
  };

  const isOpen = (id: string) => {
    const win = state.windows[id as WindowId];
    return win?.isOpen && !win.isMinimized;
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dockRef.current) return;
    const rect = dockRef.current.getBoundingClientRect();
    setMouseX(e.clientX - rect.left);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouseX(null);
  }, []);

  // Calculate icon scale based on distance from mouse
  const getScale = (index: number): number => {
    if (mouseX === null) return 1;
    // Calculate center X of each icon slot
    const iconCenters: number[] = [];
    let x = 12; // padding
    for (let i = 0; i < allItems.length; i++) {
      if (allItems[i].id === 'divider') {
        x += 9 + 8; // divider width + margin
      } else {
        x += BASE_SIZE / 2;
        iconCenters.push(x);
        x += BASE_SIZE / 2 + 4; // gap
      }
    }

    const center = iconCenters[index];
    if (center === undefined) return 1;
    const dist = Math.abs(mouseX - center);
    if (dist > MAGNIFY_RANGE) return 1;

    const scale = 1 + (MAX_SIZE / BASE_SIZE - 1) * Math.cos((dist / MAGNIFY_RANGE) * (Math.PI / 2));
    return scale;
  };

  let iconIndex = 0;

  return (
    <div style={{
      position: 'fixed',
      bottom: '6px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9998,
      display: 'flex',
      alignItems: 'flex-end',
    }}>
      <div
        ref={dockRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '4px',
          padding: '6px 12px',
          borderRadius: '18px',
          background: 'rgba(30, 35, 50, 0.55)',
          backdropFilter: 'saturate(150%) blur(28px)',
          WebkitBackdropFilter: 'saturate(150%) blur(28px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(255,255,255,0.05) inset',
        }}
      >
        {allItems.map((item, i) => {
          if (item.id === 'divider') {
            return (
              <div key="divider" style={{
                width: '1px',
                height: '44px',
                background: 'rgba(255,255,255,0.15)',
                margin: '0 4px',
                alignSelf: 'center',
              }} />
            );
          }
          const currentIndex = iconIndex++;
          const scale = getScale(currentIndex);
          return (
            <DockButton
              key={item.id}
              item={item}
              scale={scale}
              isOpen={!item.isExternal && isOpen(item.id)}
              onClick={() => handleClick(item)}
            />
          );
        })}
      </div>
    </div>
  );
}

function DockButton({ item, scale, isOpen, onClick }: {
  item: DockItem;
  scale: number;
  isOpen: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const size = BASE_SIZE * scale;
  const translateY = -(size - BASE_SIZE) / 2;

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Tooltip */}
      {hovered && (
        <div style={{
          position: 'absolute',
          bottom: `${size + 14}px`,
          padding: '5px 12px',
          borderRadius: '8px',
          background: 'rgba(30, 30, 30, 0.9)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: 'white',
          fontSize: '12px',
          fontWeight: 500,
          fontFamily: "'SF Pro Text', -apple-system, sans-serif",
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 10,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}>
          {item.label}
        </div>
      )}

      <button
        onClick={onClick}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: `${12 * scale}px`,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `translateY(${translateY}px)`,
          transition: scale === 1 ? 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
          padding: 0,
          position: 'relative',
        }}
      >
        <div style={{
          width: '100%',
          height: '100%',
          transform: `scale(${scale})`,
          transformOrigin: 'bottom center',
          transition: scale === 1 ? 'transform 0.2s cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
        }}>
          {item.icon}
        </div>
      </button>

      {/* Open indicator dot */}
      {isOpen && (
        <div style={{
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.85)',
          marginTop: `${2 + translateY}px`,
          boxShadow: '0 0 4px rgba(255,255,255,0.4)',
        }} />
      )}
    </div>
  );
}

// ── Icon Components ────────────────────────────────────────────

function DockImage({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      style={{
        width: `${BASE_SIZE - 6}px`,
        height: `${BASE_SIZE - 6}px`,
        borderRadius: '11px',
        objectFit: 'cover',
        pointerEvents: 'none',
      }}
    />
  );
}

function AppIcon({ gradient, iconEl }: { gradient: string; iconEl: React.ReactNode }) {
  return (
    <div style={{
      width: `${BASE_SIZE - 6}px`,
      height: `${BASE_SIZE - 6}px`,
      borderRadius: '11px',
      background: gradient,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.35), 0 0 0 0.5px rgba(255,255,255,0.1) inset',
    }}>
      {iconEl}
    </div>
  );
}

function BooksIcon() {
  const s = BASE_SIZE - 6;
  return (
    <div style={{
      width: `${s}px`,
      height: `${s}px`,
      borderRadius: '11px',
      background: 'linear-gradient(180deg, #f5a623 0%, #e88b10 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.35), 0 0 0 0.5px rgba(255,255,255,0.1) inset',
    }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5V4.5A2.5 2.5 0 016.5 2z" stroke="white" strokeWidth="1.8" fill="rgba(255,255,255,0.15)" />
        <line x1="8" y1="7" x2="16" y2="7" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
        <line x1="8" y1="10" x2="14" y2="10" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        <line x1="8" y1="13" x2="12" y2="13" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      </svg>
    </div>
  );
}
