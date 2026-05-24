import { useState, useEffect, useRef } from 'react';

/* ── Types ─────────────────────────────────────────── */

interface WeatherData {
  temp: number;
  feelsLike: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  high: number;
  low: number;
}

interface NewsItem {
  title: string;
  source: string;
  url: string;
  pubDate: string;
}

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
  location: { city: string; region: string; country: string; lat?: number; lon?: number } | null;
}

/* ── Main — Floating Widgets (no panel, no background) ── */

export default function NotificationCenter({ open, onClose, location }: NotificationCenterProps) {
  const [weather] = useState<WeatherData | null>({
    temp: 26,
    feelsLike: 26,
    description: 'Static Riyadh placeholder',
    icon: '☀️',
    humidity: 20,
    windSpeed: 8,
    high: 30,
    low: 20,
  });
  const [news] = useState<NewsItem[]>([
    {
      title: 'AbdullahOS placeholder shell is ready',
      source: 'Portfolio',
      url: '#',
      pubDate: 'Static',
    },
    {
      title: 'Project shells are local-only for Stage 1',
      source: 'Portfolio',
      url: '#',
      pubDate: 'Static',
    },
  ]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const t = setTimeout(() => document.addEventListener('mousedown', h), 50);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', h); };
  }, [open, onClose]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: '50%',
        right: '16px',
        width: '320px',
        maxHeight: 'calc(100vh - 80px)',
        zIndex: 9998,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        pointerEvents: open ? 'auto' : 'none',
        opacity: open ? 1 : 0,
        transform: open ? 'translateY(-50%)' : 'translateY(calc(-50% - 8px))',
        transition: 'opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        overflowY: 'auto',
        overflowX: 'hidden',
        fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
        scrollbarWidth: 'none',
      }}
    >
      {/* ── Analog Clock ── */}
      <AnalogClock />

      {/* ── Weather ── */}
      <WeatherText weather={weather} city={location?.city || 'Riyadh'} />

      {/* ── News ── */}
      <NewsList news={news} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   ANALOG CLOCK — Floating, no card background
   ══════════════════════════════════════════════════════ */

function AnalogClock() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 140;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = 60;

    ctx.clearRect(0, 0, size, size);

    // Clock face
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Hour markers
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 - 90) * (Math.PI / 180);
      const isMain = i % 3 === 0;
      const innerR = radius - (isMain ? 12 : 8);
      const outerR = radius - 3;
      ctx.beginPath();
      ctx.moveTo(cx + innerR * Math.cos(angle), cy + innerR * Math.sin(angle));
      ctx.lineTo(cx + outerR * Math.cos(angle), cy + outerR * Math.sin(angle));
      ctx.strokeStyle = 'rgba(0,0,0,0.7)';
      ctx.lineWidth = isMain ? 2.2 : 0.8;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Minute ticks
    for (let i = 0; i < 60; i++) {
      if (i % 5 === 0) continue;
      const angle = (i * 6 - 90) * (Math.PI / 180);
      const innerR = radius - 5;
      const outerR = radius - 3;
      ctx.beginPath();
      ctx.moveTo(cx + innerR * Math.cos(angle), cy + innerR * Math.sin(angle));
      ctx.lineTo(cx + outerR * Math.cos(angle), cy + outerR * Math.sin(angle));
      ctx.strokeStyle = 'rgba(0,0,0,0.12)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    const hours = time.getHours() % 12;
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();

    // Hour hand
    const hAngle = ((hours + minutes / 60) * 30 - 90) * (Math.PI / 180);
    ctx.beginPath();
    ctx.moveTo(cx - 7 * Math.cos(hAngle), cy - 7 * Math.sin(hAngle));
    ctx.lineTo(cx + 32 * Math.cos(hAngle), cy + 32 * Math.sin(hAngle));
    ctx.strokeStyle = 'rgba(0,0,0,0.85)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Minute hand
    const mAngle = ((minutes + seconds / 60) * 6 - 90) * (Math.PI / 180);
    ctx.beginPath();
    ctx.moveTo(cx - 7 * Math.cos(mAngle), cy - 7 * Math.sin(mAngle));
    ctx.lineTo(cx + 46 * Math.cos(mAngle), cy + 46 * Math.sin(mAngle));
    ctx.strokeStyle = 'rgba(0,0,0,0.85)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Second hand — orange
    const sAngle = (seconds * 6 - 90) * (Math.PI / 180);
    ctx.beginPath();
    ctx.moveTo(cx - 12 * Math.cos(sAngle), cy - 12 * Math.sin(sAngle));
    ctx.lineTo(cx + 50 * Math.cos(sAngle), cy + 50 * Math.sin(sAngle));
    ctx.strokeStyle = '#FF9500';
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#FF9500';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
  }, [time]);

  const timeStr = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const dayStr = time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '4px 0',
    }}>
      <canvas
        ref={canvasRef}
        style={{ width: '140px', height: '140px' }}
      />
      <div style={{
        marginTop: '10px',
        fontSize: '26px',
        fontWeight: 300,
        color: '#fff',
        letterSpacing: '-0.02em',
        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
        textShadow: '0 1px 8px rgba(0,0,0,0.3)',
      }}>
        {timeStr}
      </div>
      <div style={{
        fontSize: '13px',
        color: 'rgba(255,255,255,0.85)',
        marginTop: '2px',
        textShadow: '0 1px 4px rgba(0,0,0,0.25)',
      }}>
        {dayStr}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   WEATHER ICON — Apple SF Symbols-style SVG
   ══════════════════════════════════════════════════════ */

function WeatherIcon({ description }: { description: string }) {
  const d = description.toLowerCase();
  const s: React.CSSProperties = { filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.2))' };

  if (d.includes('clear')) return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={s}>
      <circle cx="14" cy="14" r="5.5" stroke="#FFD60A" strokeWidth="1.8" fill="none" />
      <line x1="14" y1="2" x2="14" y2="5.5" stroke="#FFD60A" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="14" y1="22.5" x2="14" y2="26" stroke="#FFD60A" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1="14" x2="5.5" y2="14" stroke="#FFD60A" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="22.5" y1="14" x2="26" y2="14" stroke="#FFD60A" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="5.5" y1="5.5" x2="8" y2="8" stroke="#FFD60A" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="20" x2="22.5" y2="22.5" stroke="#FFD60A" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="22.5" y1="5.5" x2="20" y2="8" stroke="#FFD60A" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="20" x2="5.5" y2="22.5" stroke="#FFD60A" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );

  if (d.includes('partly') || d.includes('mainly')) return (
    <svg width="32" height="26" viewBox="0 0 32 26" fill="none" style={s}>
      <circle cx="22" cy="8" r="4.5" stroke="#FFD60A" strokeWidth="1.5" fill="none" />
      <line x1="22" y1="0.5" x2="22" y2="2.5" stroke="#FFD60A" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="28.5" y1="8" x2="30" y2="8" stroke="#FFD60A" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="26.6" y1="3.4" x2="27.8" y2="2.2" stroke="#FFD60A" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="27.8" y1="13.8" x2="26.6" y2="12.6" stroke="#FFD60A" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M8 22c-3.3 0-6-2.2-6-5s2.7-5 6-5c.4-3.3 3.4-6 7-6 3.9 0 7 2.9 7 6.5 0 .2 0 .3 0 .5 2.3.5 4 2.4 4 4.5 0 2.5-2.2 4.5-5 4.5H8z" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" fill="none" />
    </svg>
  );

  if (d.includes('overcast') || d.includes('cloud')) return (
    <svg width="30" height="22" viewBox="0 0 30 22" fill="none" style={s}>
      <path d="M7 19c-3.3 0-6-2.2-6-5s2.7-5 6-5c.4-3.3 3.4-6 7-6 3.9 0 7 2.9 7 6.5 0 .2 0 .3 0 .5 2.3.5 4 2.4 4 4.5 0 2.5-2.2 4.5-5 4.5H7z" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" fill="none" />
    </svg>
  );

  if (d.includes('rain') || d.includes('shower') || d.includes('drizzle')) return (
    <svg width="30" height="28" viewBox="0 0 30 28" fill="none" style={s}>
      <path d="M7 16c-3.3 0-6-2.2-6-5s2.7-5 6-5c.4-3.3 3.4-6 7-6 3.9 0 7 2.9 7 6.5 0 .2 0 .3 0 .5 2.3.5 4 2.4 4 4.5 0 2.5-2.2 4.5-5 4.5H7z" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" fill="none" />
      <line x1="10" y1="20" x2="8" y2="25" stroke="#64D2FF" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="15" y1="20" x2="13" y2="25" stroke="#64D2FF" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="20" y1="20" x2="18" y2="25" stroke="#64D2FF" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );

  if (d.includes('snow') || d.includes('ice') || d.includes('freezing')) return (
    <svg width="30" height="28" viewBox="0 0 30 28" fill="none" style={s}>
      <path d="M7 16c-3.3 0-6-2.2-6-5s2.7-5 6-5c.4-3.3 3.4-6 7-6 3.9 0 7 2.9 7 6.5 0 .2 0 .3 0 .5 2.3.5 4 2.4 4 4.5 0 2.5-2.2 4.5-5 4.5H7z" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" fill="none" />
      <circle cx="10" cy="22" r="1.2" fill="#BFF0FF" />
      <circle cx="15" cy="24" r="1.2" fill="#BFF0FF" />
      <circle cx="20" cy="21.5" r="1.2" fill="#BFF0FF" />
    </svg>
  );

  if (d.includes('thunder')) return (
    <svg width="30" height="28" viewBox="0 0 30 28" fill="none" style={s}>
      <path d="M7 16c-3.3 0-6-2.2-6-5s2.7-5 6-5c.4-3.3 3.4-6 7-6 3.9 0 7 2.9 7 6.5 0 .2 0 .3 0 .5 2.3.5 4 2.4 4 4.5 0 2.5-2.2 4.5-5 4.5H7z" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" fill="none" />
      <path d="M16 18l-3 5h4l-3 5" stroke="#FFD60A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );

  if (d.includes('fog')) return (
    <svg width="30" height="20" viewBox="0 0 30 20" fill="none" style={s}>
      <line x1="3" y1="5" x2="27" y2="5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="5" y1="10" x2="25" y2="10" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="3" y1="15" x2="27" y2="15" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );

  return (
    <svg width="30" height="22" viewBox="0 0 30 22" fill="none" style={s}>
      <path d="M7 19c-3.3 0-6-2.2-6-5s2.7-5 6-5c.4-3.3 3.4-6 7-6 3.9 0 7 2.9 7 6.5 0 .2 0 .3 0 .5 2.3.5 4 2.4 4 4.5 0 2.5-2.2 4.5-5 4.5H7z" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   WEATHER — Apple-style floating, no background
   ══════════════════════════════════════════════════════ */

function WeatherText({ weather, city }: { weather: WeatherData | null; city: string }) {
  if (!weather) {
    return (
      <div style={{
        textAlign: 'center',
        fontSize: '12px',
        color: 'rgba(255,255,255,0.6)',
        padding: '4px 0',
        textShadow: '0 1px 4px rgba(0,0,0,0.2)',
      }}>
        Loading weather...
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '0 0 4px',
    }}>
      <div style={{
        fontSize: '14px',
        fontWeight: 500,
        color: 'rgba(255,255,255,0.9)',
        textShadow: '0 1px 6px rgba(0,0,0,0.3)',
        marginBottom: '4px',
        fontFamily: "'SF Pro Text', -apple-system, sans-serif",
      }}>
        {city}
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <WeatherIcon description={weather.description} />
        <span style={{
          fontSize: '52px',
          fontWeight: 200,
          color: '#fff',
          lineHeight: 1,
          letterSpacing: '-0.04em',
          fontFamily: "'SF Pro Display', -apple-system, sans-serif",
          textShadow: '0 2px 16px rgba(0,0,0,0.3)',
        }}>
          {weather.temp}°
        </span>
      </div>

      <div style={{
        fontSize: '15px',
        fontWeight: 500,
        color: 'rgba(255,255,255,0.9)',
        marginTop: '6px',
        textShadow: '0 1px 6px rgba(0,0,0,0.3)',
        fontFamily: "'SF Pro Text', -apple-system, sans-serif",
      }}>
        {weather.description}
      </div>

      <div style={{
        display: 'flex',
        gap: '6px',
        marginTop: '3px',
        fontSize: '13px',
        color: 'rgba(255,255,255,0.7)',
        textShadow: '0 1px 4px rgba(0,0,0,0.2)',
        fontFamily: "'SF Pro Text', -apple-system, sans-serif",
      }}>
        <span>H:{weather.high}°</span>
        <span style={{ color: 'rgba(255,255,255,0.35)' }}>|</span>
        <span>L:{weather.low}°</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   NEWS — Floating list, no card background
   ══════════════════════════════════════════════════════ */

function NewsList({ news }: { news: NewsItem[] }) {
  if (news.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        fontSize: '12px',
        color: 'rgba(255,255,255,0.6)',
        padding: '8px 0',
        textShadow: '0 1px 4px rgba(0,0,0,0.2)',
      }}>
        Loading news...
      </div>
    );
  }

  const timeAgo = (dateStr: string) => {
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const hours = Math.floor(diff / 3600000);
      if (hours < 1) return 'Just now';
      if (hours < 24) return `${hours}h ago`;
      return `${Math.floor(hours / 24)}d ago`;
    } catch { return ''; }
  };

  const sourceColorMap: Record<string, string> = {
    'CBC': '#e03131',
    'CBC News': '#e03131',
    'BBC': '#da77f2',
    'BBC News': '#da77f2',
    'CTV': '#51cf66',
    'CTV News': '#51cf66',
    'CP24': '#ff922b',
    'Global News': '#4dabf7',
    'Reuters': '#ff922b',
    'investingLive': '#51cf66',
    'The Globe and Mail': '#ffd43b',
    'Toronto Star': '#4dabf7',
    'National Post': '#4dabf7',
  };

  const getSourceColor = (source: string) => {
    if (sourceColorMap[source]) return sourceColorMap[source];
    const lower = source.toLowerCase();
    for (const [key, color] of Object.entries(sourceColorMap)) {
      if (lower.includes(key.toLowerCase())) return color;
    }
    return '#74c0fc';
  };

  return (
    <div style={{ padding: '0' }}>
      <div style={{
        fontSize: '11px',
        fontWeight: 600,
        color: 'rgba(255,255,255,0.85)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        marginBottom: '8px',
        padding: '0 4px',
        textShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }}>
        Top Stories
      </div>

      {news.slice(0, 5).map((item, i) => (
        <a
          key={i}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            padding: '8px 6px',
            textDecoration: 'none',
            color: 'inherit',
            borderTop: i > 0 ? '0.5px solid rgba(255,255,255,0.1)' : 'none',
            borderRadius: '6px',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{
            fontSize: '10.5px',
            fontWeight: 600,
            marginBottom: '3px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            textShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }}>
            <span style={{ color: getSourceColor(item.source) }}>{item.source}</span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 400 }}>{timeAgo(item.pubDate)}</span>
          </div>
          <div style={{
            fontSize: '13px',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.92)',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textShadow: '0 1px 4px rgba(0,0,0,0.3)',
          }}>
            {item.title}
          </div>
        </a>
      ))}
    </div>
  );
}
