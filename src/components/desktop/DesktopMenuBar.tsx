import { useDesktop } from './DesktopContext';
import { useState, useEffect } from 'react';

export default function DesktopMenuBar() {
  const { state } = useDesktop();
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
      setDate(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  const focusedTitle = state.focusedWindowId
    ? state.windows[state.focusedWindowId]?.title?.split(' — ')[0] || 'Finder'
    : 'Finder';

  const menuItemStyle = {
    color: 'rgba(255,255,255,0.55)',
    fontSize: '13px',
    cursor: 'default',
    padding: '0 1px',
    transition: 'color 0.15s ease',
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '28px',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 14px',
      background: 'rgba(10, 15, 26, 0.55)',
      backdropFilter: 'saturate(160%) blur(28px)',
      WebkitBackdropFilter: 'saturate(160%) blur(28px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
      fontSize: '13px',
      color: 'rgba(255, 255, 255, 0.85)',
      userSelect: 'none',
    }}>
      {/* Left side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* RG logo (Apple logo equivalent) */}
        <img
          src="/icons/rglogo.png"
          alt="RG"
          style={{
            height: '16px',
            width: 'auto',
            objectFit: 'contain',
            filter: 'brightness(0) invert(1)',
            opacity: 0.9,
          }}
        />
        {/* Focused app name */}
        <span style={{ fontWeight: 600, fontSize: '13px' }}>
          {focusedTitle}
        </span>
        {/* Menu items */}
        <span style={menuItemStyle}>File</span>
        <span style={menuItemStyle}>Edit</span>
        <span style={menuItemStyle}>View</span>
        <span style={menuItemStyle}>Window</span>
      </div>

      {/* Right side — system tray */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)' }}>
        {/* Battery icon */}
        <BatteryIcon />
        {/* WiFi icon */}
        <WifiIcon />
        {/* Speaker icon */}
        <SpeakerIcon />
        {/* Separator */}
        <span style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.85)', marginLeft: '4px' }}>
          Ronniel Gandhe
        </span>
        {/* Date + Time */}
        <span style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.75)', marginLeft: '2px' }}>
          {date}&ensp;{time}
        </span>
      </div>
    </div>
  );
}

// ── System Tray Icons (SVG, macOS-style) ──

function BatteryIcon() {
  return (
    <svg width="22" height="12" viewBox="0 0 22 12" fill="none" style={{ opacity: 0.75 }}>
      <rect x="0.5" y="1" width="18" height="10" rx="2" stroke="rgba(255,255,255,0.8)" strokeWidth="1" fill="none" />
      <rect x="19" y="3.5" width="2" height="5" rx="0.75" fill="rgba(255,255,255,0.5)" />
      <rect x="2" y="2.5" width="14" height="7" rx="1" fill="rgba(255,255,255,0.65)" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg width="16" height="14" viewBox="0 0 16 14" fill="none" style={{ opacity: 0.75 }}>
      <path d="M8 12.5a1 1 0 100-2 1 1 0 000 2z" fill="rgba(255,255,255,0.85)" />
      <path d="M5.17 9.17a4 4 0 015.66 0" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M2.93 6.93a7 7 0 0110.14 0" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M0.69 4.69a10 10 0 0114.62 0" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg width="16" height="14" viewBox="0 0 16 14" fill="none" style={{ opacity: 0.75 }}>
      <path d="M2 5h2l4-3v10l-4-3H2a1 1 0 01-1-1V6a1 1 0 011-1z" fill="rgba(255,255,255,0.75)" />
      <path d="M11 4.5a3.5 3.5 0 010 5" stroke="rgba(255,255,255,0.6)" strokeWidth="1.1" strokeLinecap="round" fill="none" />
      <path d="M13 2.5a6.5 6.5 0 010 9" stroke="rgba(255,255,255,0.4)" strokeWidth="1.1" strokeLinecap="round" fill="none" />
    </svg>
  );
}
