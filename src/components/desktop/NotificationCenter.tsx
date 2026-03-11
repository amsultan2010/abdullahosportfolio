import { useState, useEffect, useRef, useCallback } from 'react';

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
  location: { city: string; region: string; country: string } | null;
}

/* ── Main Panel ────────────────────────────────────── */

export default function NotificationCenter({ open, onClose, location }: NotificationCenterProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  // Fetch weather
  useEffect(() => {
    if (!open) return;
    fetch('/api/weather')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && !d.error) setWeather(d); })
      .catch(() => {});
  }, [open]);

  // Fetch news
  useEffect(() => {
    if (!open) return;
    fetch('/api/news')
      .then(r => r.ok ? r.json() : [])
      .then(d => { if (Array.isArray(d)) setNews(d); })
      .catch(() => {});
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Delay to avoid closing from the same click that opens
    const t = setTimeout(() => document.addEventListener('mousedown', h), 50);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', h); };
  }, [open, onClose]);

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        top: '28px',
        right: '0px',
        width: '360px',
        height: 'calc(100vh - 28px)',
        zIndex: 9998,
        background: 'rgba(246, 246, 246, 0.78)',
        backdropFilter: 'saturate(180%) blur(40px)',
        WebkitBackdropFilter: 'saturate(180%) blur(40px)',
        borderLeft: '0.5px solid rgba(0,0,0,0.1)',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        opacity: open ? 1 : 0,
        transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease',
        overflowY: 'auto',
        overflowX: 'hidden',
        fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div style={{ padding: '16px 16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* ── Clock Widget ── */}
        <AnalogClock />

        {/* ── Weather Widget ── */}
        <WeatherWidget weather={weather} city={location?.city || 'Toronto'} />

        {/* ── News Widget ── */}
        <NewsWidget news={news} />

        {/* ── Flappy Bird ── */}
        <FlappyBirdWidget />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   ANALOG CLOCK — Old-school Apple style
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

    const size = 160;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = 68;

    ctx.clearRect(0, 0, size, size);

    // Clock face
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Shadow
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.shadowColor = 'rgba(0,0,0,0.12)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = 'transparent';
    ctx.fill();
    ctx.restore();

    // Hour markers
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 - 90) * (Math.PI / 180);
      const isMain = i % 3 === 0;
      const innerR = radius - (isMain ? 14 : 10);
      const outerR = radius - 4;
      ctx.beginPath();
      ctx.moveTo(cx + innerR * Math.cos(angle), cy + innerR * Math.sin(angle));
      ctx.lineTo(cx + outerR * Math.cos(angle), cy + outerR * Math.sin(angle));
      ctx.strokeStyle = 'rgba(0,0,0,0.7)';
      ctx.lineWidth = isMain ? 2.5 : 1;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Minute tick marks
    for (let i = 0; i < 60; i++) {
      if (i % 5 === 0) continue;
      const angle = (i * 6 - 90) * (Math.PI / 180);
      const innerR = radius - 6;
      const outerR = radius - 4;
      ctx.beginPath();
      ctx.moveTo(cx + innerR * Math.cos(angle), cy + innerR * Math.sin(angle));
      ctx.lineTo(cx + outerR * Math.cos(angle), cy + outerR * Math.sin(angle));
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    const hours = time.getHours() % 12;
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();

    // Hour hand
    const hAngle = ((hours + minutes / 60) * 30 - 90) * (Math.PI / 180);
    ctx.beginPath();
    ctx.moveTo(cx - 8 * Math.cos(hAngle), cy - 8 * Math.sin(hAngle));
    ctx.lineTo(cx + 38 * Math.cos(hAngle), cy + 38 * Math.sin(hAngle));
    ctx.strokeStyle = 'rgba(0,0,0,0.85)';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Minute hand
    const mAngle = ((minutes + seconds / 60) * 6 - 90) * (Math.PI / 180);
    ctx.beginPath();
    ctx.moveTo(cx - 8 * Math.cos(mAngle), cy - 8 * Math.sin(mAngle));
    ctx.lineTo(cx + 52 * Math.cos(mAngle), cy + 52 * Math.sin(mAngle));
    ctx.strokeStyle = 'rgba(0,0,0,0.85)';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Second hand — orange like classic Apple
    const sAngle = (seconds * 6 - 90) * (Math.PI / 180);
    ctx.beginPath();
    ctx.moveTo(cx - 14 * Math.cos(sAngle), cy - 14 * Math.sin(sAngle));
    ctx.lineTo(cx + 56 * Math.cos(sAngle), cy + 56 * Math.sin(sAngle));
    ctx.strokeStyle = '#FF9500';
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#FF9500';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();

  }, [time]);

  const timeStr = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const dayStr = time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div style={{
      background: 'rgba(255,255,255,0.75)',
      borderRadius: '16px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <canvas
        ref={canvasRef}
        style={{ width: '160px', height: '160px' }}
      />
      <div style={{
        marginTop: '12px',
        fontSize: '28px',
        fontWeight: 300,
        color: 'rgba(0,0,0,0.85)',
        letterSpacing: '-0.02em',
        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
      }}>
        {timeStr}
      </div>
      <div style={{
        fontSize: '13px',
        color: 'rgba(0,0,0,0.4)',
        marginTop: '2px',
      }}>
        {dayStr}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   WEATHER WIDGET
   ══════════════════════════════════════════════════════ */

function WeatherWidget({ weather, city }: { weather: WeatherData | null; city: string }) {
  if (!weather) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #4A90D9 0%, #74B9FF 100%)',
        borderRadius: '16px',
        padding: '20px',
        color: '#fff',
        minHeight: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ fontSize: '13px', opacity: 0.7 }}>Loading weather...</div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #4A90D9 0%, #74B9FF 100%)',
      borderRadius: '16px',
      padding: '18px 20px',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background icon */}
      <div style={{
        position: 'absolute',
        right: '-10px',
        top: '-10px',
        fontSize: '100px',
        opacity: 0.15,
        lineHeight: 1,
      }}>
        {weather.icon}
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 500, opacity: 0.8, marginBottom: '4px' }}>
              {city}
            </div>
            <div style={{
              fontSize: '48px',
              fontWeight: 200,
              lineHeight: 1,
              letterSpacing: '-0.04em',
              fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            }}>
              {weather.temp}°
            </div>
          </div>
          <div style={{ fontSize: '44px', marginTop: '4px' }}>
            {weather.icon}
          </div>
        </div>

        <div style={{
          fontSize: '13px',
          fontWeight: 500,
          marginTop: '8px',
          opacity: 0.9,
        }}>
          {weather.description}
        </div>

        <div style={{
          display: 'flex',
          gap: '16px',
          marginTop: '8px',
          fontSize: '12px',
          opacity: 0.7,
        }}>
          <span>H:{weather.high}° L:{weather.low}°</span>
          <span>Feels {weather.feelsLike}°</span>
          <span>💧 {weather.humidity}%</span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   NEWS WIDGET
   ══════════════════════════════════════════════════════ */

function NewsWidget({ news }: { news: NewsItem[] }) {
  if (news.length === 0) {
    return (
      <div style={{
        background: 'rgba(255,255,255,0.75)',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#FF3B30',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <span style={{ fontSize: '16px' }}>📰</span>
          Top Stories
        </div>
        <div style={{ fontSize: '13px', color: 'rgba(0,0,0,0.35)', textAlign: 'center', padding: '12px 0' }}>
          Loading news...
        </div>
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

  return (
    <div style={{
      background: 'rgba(255,255,255,0.75)',
      borderRadius: '16px',
      padding: '16px 0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <div style={{
        fontSize: '14px',
        fontWeight: 600,
        color: '#FF3B30',
        marginBottom: '10px',
        padding: '0 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        <span style={{ fontSize: '16px' }}>📰</span>
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
            padding: '8px 18px',
            textDecoration: 'none',
            color: 'inherit',
            borderTop: i > 0 ? '0.5px solid rgba(0,0,0,0.06)' : 'none',
            transition: 'background 0.1s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{
            fontSize: '11px',
            color: 'rgba(0,0,0,0.35)',
            fontWeight: 500,
            marginBottom: '3px',
            display: 'flex',
            justifyContent: 'space-between',
          }}>
            <span>{item.source}</span>
            <span>{timeAgo(item.pubDate)}</span>
          </div>
          <div style={{
            fontSize: '13px',
            fontWeight: 500,
            color: 'rgba(0,0,0,0.8)',
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {item.title}
          </div>
        </a>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   FLAPPY BIRD — Apple Edition
   ══════════════════════════════════════════════════════ */

function FlappyBirdWidget() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<{
    bird: { y: number; vy: number; rotation: number };
    pipes: { x: number; gapY: number }[];
    score: number;
    bestScore: number;
    state: 'idle' | 'playing' | 'dead';
    frame: number;
    animId: number;
  }>({
    bird: { y: 120, vy: 0, rotation: 0 },
    pipes: [],
    score: 0,
    bestScore: 0,
    state: 'idle',
    frame: 0,
    animId: 0,
  });
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'dead'>('idle');

  const W = 328;
  const H = 200;
  const BIRD_SIZE = 16;
  const GRAVITY = 0.35;
  const FLAP = -5.2;
  const PIPE_W = 38;
  const GAP = 62;
  const PIPE_SPEED = 1.8;

  const resetGame = useCallback(() => {
    const g = gameRef.current;
    g.bird = { y: H / 2 - 10, vy: 0, rotation: 0 };
    g.pipes = [];
    g.score = 0;
    g.frame = 0;
    g.state = 'playing';
    setScore(0);
    setGameState('playing');
  }, []);

  const flap = useCallback(() => {
    const g = gameRef.current;
    if (g.state === 'idle') {
      resetGame();
      g.bird.vy = FLAP;
      return;
    }
    if (g.state === 'dead') {
      resetGame();
      return;
    }
    if (g.state === 'playing') {
      g.bird.vy = FLAP;
    }
  }, [resetGame]);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const drawFrame = () => {
      const g = gameRef.current;
      ctx.clearRect(0, 0, W, H);

      // Background — soft gradient like Apple's style
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, '#E8F4FD');
      bgGrad.addColorStop(0.6, '#D4ECFA');
      bgGrad.addColorStop(1, '#C5E1A5');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Ground
      ctx.fillStyle = '#8BC34A';
      ctx.fillRect(0, H - 16, W, 16);
      ctx.fillStyle = '#7CB342';
      ctx.fillRect(0, H - 16, W, 3);

      if (g.state === 'playing') {
        g.frame++;

        // Bird physics
        g.bird.vy += GRAVITY;
        g.bird.y += g.bird.vy;
        g.bird.rotation = Math.min(Math.max(g.bird.vy * 3, -25), 70);

        // Spawn pipes
        if (g.frame % 90 === 0) {
          const gapY = 40 + Math.random() * (H - GAP - 56);
          g.pipes.push({ x: W + 10, gapY });
        }

        // Move pipes
        for (const p of g.pipes) {
          p.x -= PIPE_SPEED;
        }

        // Score
        for (const p of g.pipes) {
          if (Math.abs(p.x + PIPE_W / 2 - 50) < PIPE_SPEED) {
            g.score++;
            setScore(g.score);
          }
        }

        // Remove off-screen pipes
        g.pipes = g.pipes.filter(p => p.x > -PIPE_W - 10);

        // Collision
        const bx = 50;
        const by = g.bird.y;
        const br = BIRD_SIZE / 2 - 2;

        if (by - br < 0 || by + br > H - 16) {
          g.state = 'dead';
          if (g.score > g.bestScore) {
            g.bestScore = g.score;
            setBestScore(g.score);
          }
          setGameState('dead');
        }

        for (const p of g.pipes) {
          if (bx + br > p.x && bx - br < p.x + PIPE_W) {
            if (by - br < p.gapY || by + br > p.gapY + GAP) {
              g.state = 'dead';
              if (g.score > g.bestScore) {
                g.bestScore = g.score;
                setBestScore(g.score);
              }
              setGameState('dead');
            }
          }
        }
      }

      // Draw pipes — Apple-style frosted rounded
      for (const p of g.pipes) {
        // Top pipe
        const topH = p.gapY;
        const pipeGrad = ctx.createLinearGradient(p.x, 0, p.x + PIPE_W, 0);
        pipeGrad.addColorStop(0, '#7C8B9A');
        pipeGrad.addColorStop(0.3, '#96A5B4');
        pipeGrad.addColorStop(0.7, '#96A5B4');
        pipeGrad.addColorStop(1, '#7C8B9A');

        // Top pipe body
        ctx.beginPath();
        ctx.roundRect(p.x, -4, PIPE_W, topH + 4, [0, 0, 6, 6]);
        ctx.fillStyle = pipeGrad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.08)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Top pipe cap
        ctx.beginPath();
        ctx.roundRect(p.x - 3, topH - 10, PIPE_W + 6, 10, [3, 3, 3, 3]);
        ctx.fillStyle = '#8A99A8';
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.stroke();

        // Bottom pipe body
        const bottomY = p.gapY + GAP;
        ctx.beginPath();
        ctx.roundRect(p.x, bottomY, PIPE_W, H - bottomY + 4, [6, 6, 0, 0]);
        ctx.fillStyle = pipeGrad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.08)';
        ctx.stroke();

        // Bottom pipe cap
        ctx.beginPath();
        ctx.roundRect(p.x - 3, bottomY, PIPE_W + 6, 10, [3, 3, 3, 3]);
        ctx.fillStyle = '#8A99A8';
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.stroke();
      }

      // Draw bird — Apple logo-inspired rounded shape
      const bx = 50;
      const by = g.state === 'idle'
        ? H / 2 - 10 + Math.sin(Date.now() / 300) * 6
        : gameRef.current.bird.y;

      ctx.save();
      ctx.translate(bx, by);
      const rot = g.state === 'playing' || g.state === 'dead' ? g.bird.rotation : 0;
      ctx.rotate((rot * Math.PI) / 180);

      // Body — SF-inspired rounded rectangle bird
      ctx.beginPath();
      ctx.roundRect(-BIRD_SIZE / 2, -BIRD_SIZE / 2 + 1, BIRD_SIZE, BIRD_SIZE - 2, [BIRD_SIZE / 3]);
      const birdGrad = ctx.createLinearGradient(0, -BIRD_SIZE / 2, 0, BIRD_SIZE / 2);
      birdGrad.addColorStop(0, '#FF9500');
      birdGrad.addColorStop(1, '#FF6B00');
      ctx.fillStyle = birdGrad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.12)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Eye
      ctx.beginPath();
      ctx.arc(3, -2, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(3.5, -2, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = '#1d1d1f';
      ctx.fill();

      // Beak
      ctx.beginPath();
      ctx.moveTo(BIRD_SIZE / 2, -1);
      ctx.lineTo(BIRD_SIZE / 2 + 5, 1.5);
      ctx.lineTo(BIRD_SIZE / 2, 4);
      ctx.closePath();
      ctx.fillStyle = '#FFCC02';
      ctx.fill();

      // Wing
      ctx.beginPath();
      const wingY = g.state === 'playing' ? (g.bird.vy < 0 ? -4 : 2) : Math.sin(Date.now() / 150) * 2;
      ctx.ellipse(-2, wingY, 5, 3.5, -0.3, 0, Math.PI * 2);
      ctx.fillStyle = '#E8850A';
      ctx.fill();

      ctx.restore();

      // Score display during play
      if (g.state === 'playing') {
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = "bold 28px 'SF Pro Display', -apple-system, sans-serif";
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = 6;
        ctx.fillText(String(g.score), W / 2, 36);
        ctx.shadowBlur = 0;
      }

      // Idle overlay
      if (g.state === 'idle') {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.font = "600 15px 'SF Pro Text', -apple-system, sans-serif";
        ctx.textAlign = 'center';
        ctx.fillText('Tap to Play', W / 2, H / 2 + 36);
        ctx.font = "400 11px 'SF Pro Text', -apple-system, sans-serif";
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillText('Flappy Bird · Apple Edition', W / 2, H / 2 + 52);
      }

      // Death overlay
      if (g.state === 'dead') {
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.font = "700 22px 'SF Pro Display', -apple-system, sans-serif";
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', W / 2, H / 2 - 18);

        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.font = "500 14px 'SF Pro Text', -apple-system, sans-serif";
        ctx.fillText(`Score: ${g.score}`, W / 2, H / 2 + 6);

        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.font = "400 12px 'SF Pro Text', -apple-system, sans-serif";
        ctx.fillText(`Best: ${g.bestScore}`, W / 2, H / 2 + 24);

        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.font = "400 11px 'SF Pro Text', -apple-system, sans-serif";
        ctx.fillText('Tap to retry', W / 2, H / 2 + 46);
      }

      g.animId = requestAnimationFrame(drawFrame);
    };

    const id = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(gameRef.current.animId || id);
  }, []);

  return (
    <div style={{
      background: 'rgba(255,255,255,0.75)',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <div style={{
        padding: '10px 16px 8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{
          fontSize: '13px',
          fontWeight: 600,
          color: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <span style={{ fontSize: '14px' }}>🐦</span>
          Flappy Bird
        </div>
        <div style={{ fontSize: '11px', color: 'rgba(0,0,0,0.35)' }}>
          Best: {bestScore}
        </div>
      </div>
      <canvas
        ref={canvasRef}
        onClick={flap}
        style={{
          width: `${W}px`,
          height: `${H}px`,
          display: 'block',
          cursor: 'pointer',
          borderRadius: '0 0 16px 16px',
        }}
      />
    </div>
  );
}
