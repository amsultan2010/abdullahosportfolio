import { useDesktop } from './DesktopContext';
import { useState, useEffect, useRef } from 'react';


/* ── Types ─────────────────────────────────────────── */

interface SpotifyData {
  isPlaying: boolean;
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  progressMs: number;
  durationMs: number;
  trackUrl: string;
  fetchedAt: number;
}

interface LocationData {
  city: string;
  region: string;
  country: string;
  lat?: number;
  lon?: number;
}

/* ── Main Component ────────────────────────────────── */

export default function DesktopMenuBar() {
  const { state, dispatch } = useDesktop();
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [spotify, setSpotify] = useState<SpotifyData | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // Clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
      setDate(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  // Geolocation via IP
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(d => setLocation({ city: d.city, region: d.region_code || d.region, country: d.country_name, lat: d.latitude, lon: d.longitude }))
      .catch(() => setLocation({ city: 'Toronto', region: 'ON', country: 'Canada', lat: 43.65, lon: -79.38 }));
  }, []);

  // Spotify polling
  useEffect(() => {
    const poll = () => {
      fetch('/api/spotify')
        .then(r => r.json())
        .then(d => {
          if (d.title) {
            setSpotify({ ...d, fetchedAt: Date.now() });
          } else {
            setSpotify(null);
          }
        })
        .catch(() => {});
    };
    poll();
    const id = setInterval(poll, 15_000);
    return () => clearInterval(id);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) setActiveMenu(null);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const toggle = (id: string) => { setActiveMenu(p => p === id ? null : id); };
  const hover = (id: string) => { if (activeMenu !== null) setActiveMenu(id); };
  const close = () => setActiveMenu(null);

  const hasFocused = !!state.focusedWindowId;

  return (
    <div ref={barRef} style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: '28px', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px',
      background: 'rgba(30, 30, 30, 0.55)',
      backdropFilter: 'saturate(160%) blur(28px)', WebkitBackdropFilter: 'saturate(160%) blur(28px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
      fontSize: '13px', color: '#fff', userSelect: 'none',
    }}>
      {/* ── Left: Logo + Menus ── */}
      <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        {/* Apple-menu-style RG logo dropdown */}
        <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
          <div
            onMouseDown={() => toggle('apple')}
            onMouseEnter={() => hover('apple')}
            style={{
              ...barItem, padding: '0 8px 0 2px', borderRadius: '4px',
              background: activeMenu === 'apple' ? 'rgba(255,255,255,0.15)' : 'transparent',
            }}
          >
            <img src="/icons/rglogo.png" alt="RG" style={{ height: '16px', filter: 'brightness(0) invert(1)', opacity: 1 }} />
          </div>
          {activeMenu === 'apple' && (
            <div style={{ ...panelStyle, left: 0, minWidth: '240px' }}>
              <DropItem label="About Ronniel Gandhe" onClick={() => { dispatch({ type: 'OPEN_WINDOW', id: 'terminal' }); close(); }} />
              <DropDivider />
              <DropItem label="System Settings..." disabled />
              <DropItem label="App Store..." disabled />
              <DropDivider />
              <DropItem label="Recent Items" disabled />
              <DropDivider />
              <DropItem label="Force Quit..." shortcut="⌥⌘⎋" onClick={() => {
                Object.keys(state.windows).forEach(id => dispatch({ type: 'CLOSE_WINDOW', id: id as any }));
                close();
              }} />
              <DropDivider />
              <DropItem label="Sleep" disabled />
              <DropItem label="Restart..." disabled />
              <DropItem label="Shut Down..." disabled />
              <DropDivider />
              <DropItem label="Lock Screen" shortcut="⌃⌘Q" onClick={() => { dispatch({ type: 'LOCK_SCREEN' }); close(); }} />
              <DropItem label="Log Out Ronniel Gandhe..." shortcut="⇧⌘Q" onClick={() => { window.location.reload(); }} />
            </div>
          )}
        </div>

        <div style={{ ...barItem, fontWeight: 600, padding: '0 14px 0 0' }}>Ronniel Gandhe</div>

        <div
          onMouseDown={() => {
            const termWin = state.windows.terminal;
            if (termWin?.isFullscreen) {
              dispatch({ type: 'TOGGLE_FULLSCREEN', id: 'terminal' });
              setTimeout(() => dispatch({ type: 'OPEN_WINDOW', id: 'education' }), 150);
            } else {
              dispatch({ type: 'OPEN_WINDOW', id: 'education' });
            }
            close();
          }}
          onMouseEnter={() => hover('_edu')}
          style={{ ...barItem, padding: '0 10px' }}
        >Education</div>

        <div
          onMouseDown={() => {
            const termWin = state.windows.terminal;
            if (termWin?.isFullscreen) {
              dispatch({ type: 'TOGGLE_FULLSCREEN', id: 'terminal' });
              setTimeout(() => dispatch({ type: 'OPEN_WINDOW', id: 'experience' }), 150);
            } else {
              dispatch({ type: 'OPEN_WINDOW', id: 'experience' });
            }
            close();
          }}
          onMouseEnter={() => hover('_exp')}
          style={{ ...barItem, padding: '0 10px' }}
        >Experience</div>

        <div
          onMouseDown={() => window.open('/Ronniel_Gandhe_Resume.pdf', '_blank')}
          onMouseEnter={() => hover('_resume')}
          style={{ ...barItem, padding: '0 10px' }}
        >Resume</div>

        <BarDropdown label="Window" id="window" active={activeMenu} toggle={toggle} hover={hover}>
          <DropItem label="Minimize" shortcut="⌘M" disabled={!hasFocused}
            onClick={() => { if (state.focusedWindowId) dispatch({ type: 'MINIMIZE_WINDOW', id: state.focusedWindowId }); close(); }} />
          <DropItem label="Zoom" disabled={!hasFocused}
            onClick={() => { if (state.focusedWindowId) dispatch({ type: 'TOGGLE_FULLSCREEN', id: state.focusedWindowId }); close(); }} />
          <DropDivider />
          <DropItem label="Close Window" shortcut="⌘W" disabled={!hasFocused}
            onClick={() => { if (state.focusedWindowId) dispatch({ type: 'CLOSE_WINDOW', id: state.focusedWindowId }); close(); }} />
          <DropDivider />
          <DropItem label="Bring All to Front" onClick={close} />
        </BarDropdown>
      </div>

      {/* ── Right: System Tray ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', height: '100%' }}>
        <BatteryIcon />

        <TrayDropdown id="wifi" active={activeMenu} toggle={toggle} icon={<WifiIcon />} align="right">
          <WifiPanel location={location} onOpenSettings={() => { dispatch({ type: 'OPEN_WINDOW', id: 'wifi-settings' }); close(); }} />
        </TrayDropdown>

        <TrayDropdown id="sound" active={activeMenu} toggle={toggle} icon={<SpeakerIcon />} align="right">
          <SoundPanel spotify={spotify} />
        </TrayDropdown>

        <span
          style={{
            fontSize: '12.5px',
            color: '#fff',
            fontWeight: 450,
            marginLeft: '6px',
            padding: '2px 8px',
            borderRadius: '4px',
            cursor: 'default',
          }}
        >
          {date}&ensp;{time}
        </span>
      </div>
    </div>
  );
}

/* ── Shared styles ─────────────────────────────────── */

const barItem: React.CSSProperties = {
  display: 'flex', alignItems: 'center', height: '100%',
  padding: '0 10px', cursor: 'default', fontSize: '13px',
};

const panelStyle: React.CSSProperties = {
  position: 'absolute', top: '28px', minWidth: '220px', padding: '4px 0',
  background: 'rgba(244, 244, 244, 0.72)',
  backdropFilter: 'saturate(200%) blur(50px)', WebkitBackdropFilter: 'saturate(200%) blur(50px)',
  borderRadius: '10px', border: '0.5px solid rgba(0,0,0,0.12)',
  boxShadow: '0 12px 48px rgba(0,0,0,0.2), 0 0 0 0.5px rgba(0,0,0,0.06), inset 0 0.5px 0 rgba(255,255,255,0.6)',
  zIndex: 10000,
  color: 'rgba(0,0,0,0.85)',
};

/* ── Menu bar dropdown wrapper ─────────────────────── */

function BarDropdown({ label, id, active, toggle, hover, children }: {
  label: string; id: string; active: string | null;
  toggle: (id: string) => void; hover: (id: string) => void;
  children: React.ReactNode;
}) {
  const open = active === id;
  return (
    <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
      <div
        onMouseDown={() => toggle(id)}
        onMouseEnter={() => hover(id)}
        style={{
          ...barItem, borderRadius: '4px',
          background: open ? 'rgba(255,255,255,0.15)' : 'transparent',
        }}
      >{label}</div>
      {open && <div style={{ ...panelStyle, left: 0 }}>{children}</div>}
    </div>
  );
}

/* ── System tray icon dropdown ─────────────────────── */

function TrayDropdown({ id, active, toggle, icon, children, align }: {
  id: string; active: string | null;
  toggle: (id: string) => void;
  icon: React.ReactNode; children: React.ReactNode; align?: 'left' | 'right';
}) {
  const open = active === id;
  return (
    <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
      <div
        onClick={() => toggle(id)}
        style={{
          padding: '3px 6px', borderRadius: '4px', cursor: 'default',
          background: open ? 'rgba(255,255,255,0.15)' : 'transparent',
          display: 'flex', alignItems: 'center',
        }}
      >{icon}</div>
      {open && <div style={{ ...panelStyle, ...(align === 'right' ? { right: 0 } : { left: 0 }) }}>{children}</div>}
    </div>
  );
}

/* ── Dropdown menu items ───────────────────────────── */

function DropItem({ label, shortcut, onClick, disabled }: {
  label: string; shortcut?: string; onClick?: () => void; disabled?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const active = hovered && !disabled;
  return (
    <div
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '4px 12px', margin: '0 4px', borderRadius: '4px',
        fontSize: '13px', cursor: disabled ? 'default' : 'pointer',
        color: disabled ? 'rgba(0,0,0,0.25)' : active ? '#fff' : 'rgba(0,0,0,0.85)',
        background: active ? 'rgba(59,130,246,0.85)' : 'transparent',
      }}
    >
      <span>{label}</span>
      {shortcut && (
        <span style={{
          color: disabled ? 'rgba(0,0,0,0.12)' : active ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.35)',
          fontSize: '12px', marginLeft: '24px',
        }}>{shortcut}</span>
      )}
    </div>
  );
}

function DropDivider() {
  return <div style={{ height: '1px', background: 'rgba(0,0,0,0.1)', margin: '4px 0' }} />;
}

/* ── WiFi Panel ────────────────────────────────────── */

function WifiPanel({ location, onOpenSettings }: { location: LocationData | null; onOpenSettings: () => void }) {
  return (
    <div style={{ padding: '4px 0', minWidth: '280px' }}>
      {/* Wi-Fi header with blue toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px 10px' }}>
        <span style={{ fontWeight: 700, fontSize: '13px', color: 'rgba(0,0,0,0.85)' }}>Wi-Fi</span>
        <div style={{ width: '38px', height: '22px', borderRadius: '11px', background: '#007aff', position: 'relative', cursor: 'default' }}>
          <div style={{
            width: '18px', height: '18px', borderRadius: '50%', background: 'white',
            position: 'absolute', top: '2px', right: '2px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }} />
        </div>
      </div>

      <DropDivider />

      {/* Known Network - Connected */}
      <div style={{ padding: '8px 14px 4px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(0,0,0,0.4)', letterSpacing: '0.02em' }}>Known Network</span>
      </div>

      <div style={{ padding: '4px 14px 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Blue wifi icon */}
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%', background: '#007aff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="14" height="12" viewBox="0 0 16 14" fill="none">
              <path d="M8 12.5a1 1 0 100-2 1 1 0 000 2z" fill="white" />
              <path d="M5.17 9.17a4 4 0 015.66 0" stroke="white" strokeWidth="1.3" strokeLinecap="round" fill="none" />
              <path d="M2.93 6.93a7 7 0 0110.14 0" stroke="white" strokeWidth="1.3" strokeLinecap="round" fill="none" />
            </svg>
          </div>
          <span style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(0,0,0,0.85)', flex: 1 }}>Ronniel's Network</span>
          {/* Lock icon */}
          <svg width="12" height="14" viewBox="0 0 12 16" fill="none" style={{ opacity: 0.35, flexShrink: 0 }}>
            <rect x="1" y="7" width="10" height="8" rx="2" fill="rgba(0,0,0,0.65)" />
            <path d="M3 7V5a3 3 0 016 0v2" stroke="rgba(0,0,0,0.65)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
        </div>
      </div>

      {location && (
        <div style={{ padding: '2px 14px 6px', paddingLeft: '52px' }}>
          <span style={{ fontSize: '11px', color: 'rgba(0,0,0,0.35)' }}>
            Connected from {location.city}, {location.region}
          </span>
        </div>
      )}

      <DropDivider />

      {/* Known Networks - Places visited */}
      <div style={{ padding: '8px 14px 4px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(0,0,0,0.4)', letterSpacing: '0.02em' }}>Known Networks</span>
      </div>

      {[
        { name: 'New York City', flag: '🗽' },
        { name: 'Palo Alto', flag: '🌉' },
        { name: 'Dubai', flag: '🇦🇪' },
        { name: 'Mumbai, India', flag: '🇮🇳' },
        { name: 'United Kingdom', flag: '🇬🇧' },
      ].map((place) => (
        <div key={place.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '3px 14px' }}>
          <span style={{ fontSize: '14px', width: '20px', textAlign: 'center' }}>{place.flag}</span>
          <span style={{ fontSize: '12.5px', color: 'rgba(0,0,0,0.55)', flex: 1 }}>{place.name}</span>
          <svg width="12" height="10" viewBox="0 0 16 14" fill="none" style={{ opacity: 0.25, flexShrink: 0 }}>
            <path d="M8 12.5a1 1 0 100-2 1 1 0 000 2z" fill="rgba(0,0,0,0.5)" />
            <path d="M5.17 9.17a4 4 0 015.66 0" stroke="rgba(0,0,0,0.4)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <path d="M2.93 6.93a7 7 0 0110.14 0" stroke="rgba(0,0,0,0.3)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          </svg>
        </div>
      ))}

      <div style={{ padding: '4px 0' }} />

      <DropDivider />

      {/* Other Networks */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '6px 14px', cursor: 'default',
      }}>
        <span style={{ fontSize: '13px', color: 'rgba(0,0,0,0.85)' }}>Other Networks</span>
        <svg width="8" height="12" viewBox="0 0 8 14" fill="none" style={{ opacity: 0.3 }}>
          <path d="M1 1l6 6-6 6" stroke="rgba(0,0,0,0.65)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <DropDivider />

      {/* Wi-Fi Settings */}
      <DropItem label="Wi-Fi Settings..." onClick={onOpenSettings} />
    </div>
  );
}

/* ── Sound / Spotify Panel ─────────────────────────── */

function SoundPanel({ spotify }: { spotify: SpotifyData | null }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!spotify?.isPlaying) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [spotify?.isPlaying, spotify?.fetchedAt]);

  const fmt = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const elapsed = spotify?.isPlaying ? Math.max(0, now - (spotify.fetchedAt || now)) : 0;
  const displayProgress = spotify ? Math.min(spotify.progressMs + elapsed, spotify.durationMs) : 0;
  const pct = spotify ? (displayProgress / spotify.durationMs) * 100 : 0;

  return (
    <div style={{ padding: '8px 0', minWidth: '290px' }}>
      <div style={{ padding: '0 14px 6px', fontSize: '11px', color: 'rgba(0,0,0,0.4)', fontWeight: 600, letterSpacing: '0.05em' }}>
        NOW PLAYING
      </div>

      {spotify ? (
        <>
          <a
            href={spotify.trackUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', gap: '12px', padding: '6px 14px 12px', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}
          >
            <img src={spotify.albumArt} alt="" style={{
              width: '52px', height: '52px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0,
            }} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                fontSize: '13px', fontWeight: 600, color: 'rgba(0,0,0,0.85)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {spotify.title}
              </div>
              <div style={{
                fontSize: '12px', color: 'rgba(0,0,0,0.5)', marginTop: '2px',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {spotify.artist}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(0,0,0,0.35)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#1DB954">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
                <span>Spotify</span>
              </div>
            </div>
          </a>

          <div style={{ padding: '0 14px 6px' }}>
            <div style={{ height: '3px', borderRadius: '2px', background: 'rgba(0,0,0,0.1)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: 'rgba(0,0,0,0.45)', borderRadius: '2px', transition: 'width 1s linear' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'rgba(0,0,0,0.35)', marginTop: '4px' }}>
              <span>{fmt(displayProgress)}</span>
              <span>{fmt(spotify.durationMs)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', padding: '4px 14px 4px', alignItems: 'center' }}>
            <CtrlBtn>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="rgba(0,0,0,0.55)">
                <path d="M3.5 3h1.5v10H3.5V3zM13 8L6.5 13V3L13 8z" />
              </svg>
            </CtrlBtn>
            <CtrlBtn size={34}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="rgba(0,0,0,0.75)">
                {spotify.isPlaying
                  ? <path d="M4.5 2.5h2.5v11H4.5v-11zm4.5 0h2.5v11H9v-11z" />
                  : <path d="M4.5 2L13 8l-8.5 6V2z" />
                }
              </svg>
            </CtrlBtn>
            <CtrlBtn>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="rgba(0,0,0,0.55)">
                <path d="M11 3h1.5v10H11V3zM3 8l6.5-5v10L3 8z" />
              </svg>
            </CtrlBtn>
          </div>
        </>
      ) : (
        <div style={{ padding: '16px 14px', textAlign: 'center' }}>
          <div style={{ fontSize: '20px', marginBottom: '6px', opacity: 0.4 }}>♪</div>
          <div style={{ fontSize: '13px', color: 'rgba(0,0,0,0.35)' }}>Not Playing</div>
        </div>
      )}

      <DropDivider />

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px' }}>
        <svg width="12" height="10" viewBox="0 0 16 14" fill="none" style={{ opacity: 0.45, flexShrink: 0 }}>
          <path d="M2 5h2l4-3v10l-4-3H2a1 1 0 01-1-1V6a1 1 0 011-1z" fill="rgba(0,0,0,0.55)" />
        </svg>
        <div style={{ flex: 1, height: '3px', borderRadius: '2px', background: 'rgba(0,0,0,0.1)', position: 'relative' }}>
          <div style={{ height: '100%', width: '70%', background: 'rgba(0,0,0,0.35)', borderRadius: '2px' }} />
          <div style={{
            position: 'absolute', top: '-4px', left: '70%', transform: 'translateX(-50%)',
            width: '10px', height: '10px', borderRadius: '50%', background: 'white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }} />
        </div>
        <svg width="14" height="10" viewBox="0 0 16 14" fill="none" style={{ opacity: 0.45, flexShrink: 0 }}>
          <path d="M2 5h2l4-3v10l-4-3H2a1 1 0 01-1-1V6a1 1 0 011-1z" fill="rgba(0,0,0,0.55)" />
          <path d="M11 4.5a3.5 3.5 0 010 5" stroke="rgba(0,0,0,0.4)" strokeWidth="1.1" strokeLinecap="round" fill="none" />
          <path d="M13 2.5a6.5 6.5 0 010 9" stroke="rgba(0,0,0,0.25)" strokeWidth="1.1" strokeLinecap="round" fill="none" />
        </svg>
      </div>
    </div>
  );
}

function CtrlBtn({ children, size = 26 }: { children: React.ReactNode; size?: number }) {
  const [h, setH] = useState(false);
  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        width: `${size}px`, height: `${size}px`, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: h ? 'rgba(0,0,0,0.06)' : 'transparent',
        cursor: 'default', transition: 'background 0.15s',
      }}
    >{children}</div>
  );
}

/* ── Dark WiFi icon for light panels ─────────────── */

function WifiIconDark() {
  return (
    <svg width="14" height="12" viewBox="0 0 16 14" fill="none" style={{ opacity: 0.6 }}>
      <path d="M8 12.5a1 1 0 100-2 1 1 0 000 2z" fill="rgba(0,0,0,0.65)" />
      <path d="M5.17 9.17a4 4 0 015.66 0" stroke="rgba(0,0,0,0.55)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M2.93 6.93a7 7 0 0110.14 0" stroke="rgba(0,0,0,0.4)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M0.69 4.69a10 10 0 0114.62 0" stroke="rgba(0,0,0,0.25)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/* ── System Tray Icons ─────────────────────────────── */

function BatteryIcon() {
  return (
    <svg width="22" height="12" viewBox="0 0 22 12" fill="none">
      <rect x="0.5" y="1" width="18" height="10" rx="2" stroke="rgba(255,255,255,0.95)" strokeWidth="1" fill="none" />
      <rect x="19" y="3.5" width="2" height="5" rx="0.75" fill="rgba(255,255,255,0.6)" />
      <rect x="2" y="2.5" width="14" height="7" rx="1" fill="rgba(255,255,255,0.9)" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
      <path d="M8 12.5a1 1 0 100-2 1 1 0 000 2z" fill="rgba(255,255,255,1)" />
      <path d="M5.17 9.17a4 4 0 015.66 0" stroke="rgba(255,255,255,0.95)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M2.93 6.93a7 7 0 0110.14 0" stroke="rgba(255,255,255,0.9)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M0.69 4.69a10 10 0 0114.62 0" stroke="rgba(255,255,255,0.75)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
      <path d="M2 5h2l4-3v10l-4-3H2a1 1 0 01-1-1V6a1 1 0 011-1z" fill="rgba(255,255,255,0.95)" />
      <path d="M11 4.5a3.5 3.5 0 010 5" stroke="rgba(255,255,255,0.8)" strokeWidth="1.1" strokeLinecap="round" fill="none" />
      <path d="M13 2.5a6.5 6.5 0 010 9" stroke="rgba(255,255,255,0.6)" strokeWidth="1.1" strokeLinecap="round" fill="none" />
    </svg>
  );
}
