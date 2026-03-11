import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import Calendar from '../portfolio/Calendar';
import EmailCompose from '../portfolio/EmailCompose';
import Photos from '../portfolio/Photos';
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
    case 'calendar':
      return <Calendar windowMode />;
    case 'email':
      return <EmailCompose windowMode />;
    case 'photos':
      return <Photos windowMode />;
    default:
      return null;
  }
}

interface TerminalLine {
  type: 'prompt' | 'output' | 'error' | 'system';
  text: string;
  command?: string;
}

const COMMANDS: Record<string, { window: WindowId; desc: string }> = {
  'education':     { window: 'education',      desc: 'Academic background & coursework' },
  'experience':    { window: 'experience',      desc: 'Work experience & internships' },
  'projects':      { window: 'projects',        desc: 'Side projects & builds' },
  'mythoughts':    { window: 'blog',            desc: 'Blog posts & notes' },
  'deepresearch':  { window: 'deep-research',   desc: 'Case studies & deep dives' },
  'calendar':      { window: 'calendar',        desc: 'Book a meeting with me' },
};

const SMART_COMMANDS: Record<string, { window: WindowId; output: string }> = {
  'npm run experience':    { window: 'experience',    output: '> ronniel@1.0.0 experience\n> Loading professional history...' },
  'git log --education':   { window: 'education',     output: 'commit a1b2c3d (HEAD → main)\nFetching academic records...' },
  'brew install projects': { window: 'projects',      output: '==> Fetching ronniel/projects\n==> Pouring projects-1.0.0...' },
  'cat mythoughts.md':     { window: 'blog',          output: '# My Thoughts\nOpening blog posts...' },
  'cd deepresearch':       { window: 'deep-research', output: '~/deepresearch $\nLoading case studies...' },
  'open calendar.app':     { window: 'calendar',      output: 'Opening Calendar.app...' },
};

// ── Rotating words component (character-by-character typing) ──
function RotatingWords() {
  const words = [
    'deep learning', 'fullstack development',
    'systems engineering', 'quantitative finance',
    'product design', 'cloud infrastructure',
    'data science', 'too much caffeine',
    'sheer willpower', 'duct tape and dreams',
    'late nights and vibes', 'raw ambition',
    'Python and prayers', 'Stack Overflow wisdom',
    '47 open browser tabs', 'one more quick fix',
    'too many JIRA tickets', 'ChatGPT and hope',
    'zero sleep', 'rogue microservices',
    'Lambda functions', 'distributed sleep',
    'git commits and coffee', 'caffeine and chaos',
    'good intentions', 'pure stubbornness',
  ];

  const wordColors = [
    '#60a5fa', '#c084fc', '#4ade80', '#fbbf24', '#f472b6',
    '#22d3ee', '#fb923c', '#a78bfa', '#34d399', '#f87171',
    '#38bdf8', '#e879f9', '#86efac', '#fcd34d', '#fb7185',
    '#67e8f9', '#fdba74', '#c4b5fd', '#6ee7b7', '#fca5a5',
    '#7dd3fc', '#d946ef', '#4ade80', '#facc15', '#f472b6',
    '#2dd4bf',
  ];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [phase, setPhase] = useState<'delay' | 'typing' | 'showing' | 'erasing'>('delay');

  useEffect(() => {
    const word = words[currentIdx];

    if (phase === 'delay') {
      // Brief pause before typing starts (initial load)
      const timer = setTimeout(() => setPhase('typing'), 600);
      return () => clearTimeout(timer);
    }

    if (phase === 'typing') {
      if (displayText.length < word.length) {
        const timer = setTimeout(() => {
          setDisplayText(word.slice(0, displayText.length + 1));
        }, 45);
        return () => clearTimeout(timer);
      } else {
        // Word fully typed — hold it on screen
        const timer = setTimeout(() => setPhase('erasing'), 2200);
        return () => clearTimeout(timer);
      }
    }

    if (phase === 'erasing') {
      if (displayText.length > 0) {
        const timer = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 25);
        return () => clearTimeout(timer);
      } else {
        // Move to next word and start typing
        setCurrentIdx(prev => (prev + 1) % words.length);
        setPhase('typing');
      }
    }

    if (phase === 'showing') {
      setPhase('typing');
    }
  }, [displayText, phase, currentIdx]);

  const color = wordColors[currentIdx % wordColors.length];

  return (
    <span style={{ position: 'relative', display: 'inline' }}>
      <span style={{ color, fontWeight: 700, fontSize: '18px' }}>
        {displayText}
      </span>
      <span style={{
        display: 'inline-block', width: '2px', height: '1em',
        background: color, marginLeft: '1px',
        animation: 'blink 1s step-end infinite',
        verticalAlign: 'text-bottom',
      }} />
    </span>
  );
}

// ── Stock Ticker component ──
function StockTickers() {
  const [tickers, setTickers] = useState<{ symbol: string; price: number; change: number; pct: number }[]>([]);

  useEffect(() => {
    // Base prices for simulation
    const bases: { symbol: string; base: number }[] = [
      { symbol: 'SPY', base: 590.32 },
      { symbol: 'QQQ', base: 512.18 },
      { symbol: 'BTC', base: 87245 },
      { symbol: 'AAPL', base: 228.54 },
      { symbol: 'NVDA', base: 118.72 },
      { symbol: 'TSLA', base: 272.64 },
    ];

    // Initialize with random offsets
    const initial = bases.map(b => {
      const change = (Math.random() - 0.45) * b.base * 0.015;
      return { symbol: b.symbol, price: b.base + change, change, pct: (change / b.base) * 100 };
    });
    setTickers(initial);

    // Simulate small live movements
    const id = setInterval(() => {
      setTickers(prev => prev.map((t, i) => {
        const tick = (Math.random() - 0.5) * bases[i].base * 0.0003;
        const newPrice = t.price + tick;
        const totalChange = newPrice - bases[i].base;
        return { ...t, price: newPrice, change: totalChange, pct: (totalChange / bases[i].base) * 100 };
      }));
    }, 2000);

    return () => clearInterval(id);
  }, []);

  if (tickers.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '4px' }}>
        MARKETS
      </div>
      {tickers.map(t => {
        const isUp = t.change >= 0;
        const color = isUp ? '#4ade80' : '#f87171';
        const arrow = isUp ? '▲' : '▼';
        const fmt = t.symbol === 'BTC'
          ? t.price.toLocaleString('en-US', { maximumFractionDigits: 0 })
          : t.price.toFixed(2);
        return (
          <div key={t.symbol} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '3px 0',
            borderBottom: '0.5px solid rgba(255,255,255,0.04)',
          }}>
            <span style={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: '11px',
              fontWeight: 600,
              fontFamily: "'SF Mono', monospace",
              width: '40px',
            }}>{t.symbol}</span>
            <span style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: '11.5px',
              color: '#fff',
              fontWeight: 500,
              flex: 1,
              textAlign: 'right',
              marginRight: '8px',
            }}>{fmt}</span>
            <span style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: '10.5px',
              color,
              fontWeight: 500,
              minWidth: '55px',
              textAlign: 'right',
            }}>
              {arrow} {Math.abs(t.pct).toFixed(2)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── World Clock (rotating groups of 3 cities) ──
function WorldClock() {
  const [time, setTime] = useState(new Date());
  const [groupIdx, setGroupIdx] = useState(0);
  const [fading, setFading] = useState(false);

  const allCities = [
    { label: 'LDN', tz: 'Europe/London' },
    { label: 'SF', tz: 'America/Los_Angeles' },
    { label: 'TOR', tz: 'America/Toronto' },
    { label: 'TYO', tz: 'Asia/Tokyo' },
    { label: 'SYD', tz: 'Australia/Sydney' },
    { label: 'PAR', tz: 'Europe/Paris' },
    { label: 'NYC', tz: 'America/New_York' },
    { label: 'DXB', tz: 'Asia/Dubai' },
    { label: 'SIN', tz: 'Asia/Singapore' },
  ];

  // Groups of 3
  const groups: typeof allCities[] = [];
  for (let i = 0; i < allCities.length; i += 3) {
    groups.push(allCities.slice(i, i + 3));
  }

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setGroupIdx(prev => (prev + 1) % groups.length);
        setFading(false);
      }, 300);
    }, 6000);
    return () => clearInterval(id);
  }, [groups.length]);

  const font = "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif";
  const currentGroup = groups[groupIdx];

  return (
    <div style={{ fontFamily: font, transition: 'opacity 0.3s ease', opacity: fading ? 0 : 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {currentGroup.map(city => {
          const t = time.toLocaleTimeString('en-US', {
            timeZone: city.tz, hour: 'numeric', minute: '2-digit', hour12: true,
          });
          const hrs = parseInt(time.toLocaleTimeString('en-US', { timeZone: city.tz, hour: '2-digit', hour12: false }));
          const isNight = hrs >= 20 || hrs < 6;
          return (
            <div key={city.label} style={{ textAlign: 'center', minWidth: '70px' }}>
              <div style={{ color: '#fff', fontSize: '10px', fontWeight: 500, marginBottom: '4px' }}>
                {isNight ? '🌙' : '☀️'} {city.label}
              </div>
              <div style={{ fontSize: '15px', fontWeight: 300, color: '#fff', letterSpacing: '-0.3px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                {t}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Scramble Text Hook ──
function useScrambleText(target: string, trigger: number) {
  const [display, setDisplay] = useState('');
  const prevTarget = useRef('');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789&#$%';

  useEffect(() => {
    if (!target) { setDisplay(''); return; }
    // Skip scramble if this is the very first text (just show it)
    if (!prevTarget.current) {
      prevTarget.current = target;
      setDisplay(target);
      return;
    }
    prevTarget.current = target;

    const len = Math.max(display.length, target.length);
    const resolveOrder: number[] = [];
    for (let i = 0; i < len; i++) resolveOrder.push(i);
    for (let i = resolveOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [resolveOrder[i], resolveOrder[j]] = [resolveOrder[j], resolveOrder[i]];
    }

    let step = 0;
    const totalSteps = len + 8;
    const id = setInterval(() => {
      step++;
      const result: string[] = [];
      for (let i = 0; i < target.length; i++) {
        const resolveAt = resolveOrder.indexOf(i);
        if (step > resolveAt + 6) {
          result.push(target[i]);
        } else if (target[i] === ' ') {
          result.push(' ');
        } else {
          result.push(chars[Math.floor(Math.random() * chars.length)]);
        }
      }
      setDisplay(result.join(''));
      if (step >= totalSteps + 4) clearInterval(id);
    }, 35);
    return () => clearInterval(id);
  }, [target, trigger]);

  return display || target;
}

// ── Stock Ticker with Scramble Text + Connected Line ──
interface StockData {
  symbol: string; name: string; price: number; change: number; pct: number; history: number[];
}

function CyclingStock() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [drawProgress, setDrawProgress] = useState(0);
  const [phase, setPhase] = useState<'draw' | 'hold' | 'transition'>('draw');
  // Connected line: buffer of all drawn points (normalized 0-1)
  const [lineBuffer, setLineBuffer] = useState<{ y: number; isUp: boolean }[]>([]);
  const bufferMax = 100;

  const generateFallback = (): StockData[] => {
    const bases = [
      { symbol: 'SPY', name: 'S&P 500', base: 590.32 },
      { symbol: 'QQQ', name: 'Nasdaq', base: 512.18 },
      { symbol: 'BTC', name: 'Bitcoin', base: 87245 },
      { symbol: 'AAPL', name: 'Apple', base: 228.54 },
      { symbol: 'NVDA', name: 'NVIDIA', base: 118.72 },
      { symbol: 'TSLA', name: 'Tesla', base: 272.64 },
    ];
    return bases.map(b => {
      const history: number[] = [b.base];
      for (let i = 1; i < 80; i++) {
        history.push(history[i - 1] + (Math.random() - 0.48) * b.base * 0.002);
      }
      const price = history[history.length - 1];
      return { symbol: b.symbol, name: b.name, price, change: price - b.base, pct: ((price - b.base) / b.base) * 100, history };
    });
  };

  useEffect(() => {
    fetch('/api/stocks')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((data: StockData[]) => {
        if (Array.isArray(data) && data.length > 0) setStocks(data);
        else setStocks(generateFallback());
      })
      .catch(() => setStocks(generateFallback()));
  }, []);

  const stock = stocks[activeIdx] || null;
  const tickerFull = stock ? `${stock.symbol} ${stock.name}` : '';
  const isUp = stock ? stock.change >= 0 : true;
  const fmtPrice = stock
    ? (stock.symbol === 'BTC' ? stock.price.toLocaleString('en-US', { maximumFractionDigits: 0 }) : stock.price.toFixed(2))
    : '';
  const pctStr = stock ? `${isUp ? '▲' : '▼'} ${Math.abs(stock.pct).toFixed(2)}%` : '';
  const priceAndPct = `${fmtPrice}  ${pctStr}`;

  const scrambledText = useScrambleText(tickerFull, activeIdx);
  const scrambledPrice = useScrambleText(fmtPrice, activeIdx);
  const scrambledPct = useScrambleText(pctStr, activeIdx);

  // Normalize history to 0-1
  const normalize = (hist: number[]) => {
    const mn = Math.min(...hist), mx = Math.max(...hist), r = mx - mn || 1;
    return hist.map(v => (v - mn) / r);
  };

  // Draw phase — glowing dot traces the line slowly
  useEffect(() => {
    if (phase !== 'draw' || !stock) return;
    if (drawProgress >= 1) {
      setPhase('hold');
      return;
    }
    const norm = normalize(stock.history);
    const isUp = stock.change >= 0;
    const id = requestAnimationFrame(() => {
      const newProg = Math.min(drawProgress + 0.007, 1);
      setDrawProgress(newProg);
      // Add point to connected buffer
      const ptIdx = Math.floor(newProg * (norm.length - 1));
      const lastBufferY = lineBuffer.length > 0 ? lineBuffer[lineBuffer.length - 1].y : norm[0];
      // Smoothly bridge from last buffer point to current stock's normalized value
      const targetY = norm[ptIdx];
      const blendedY = lineBuffer.length < 5
        ? lastBufferY + (targetY - lastBufferY) * (lineBuffer.length / 5) // smooth bridge over first 5 pts
        : targetY;
      setLineBuffer(prev => {
        const next = [...prev, { y: blendedY, isUp }];
        return next.length > bufferMax ? next.slice(next.length - bufferMax) : next;
      });
    });
    return () => cancelAnimationFrame(id);
  }, [phase, drawProgress, stock]);

  // Hold phase
  useEffect(() => {
    if (phase !== 'hold') return;
    const id = setTimeout(() => setPhase('transition'), 2000);
    return () => clearTimeout(id);
  }, [phase]);

  // Transition phase — scramble text, then advance
  useEffect(() => {
    if (phase !== 'transition') return;
    const id = setTimeout(() => {
      setActiveIdx(prev => (prev + 1) % (stocks.length || 1));
      setDrawProgress(0);
      setPhase('draw');
    }, 600);
    return () => clearTimeout(id);
  }, [phase, stocks.length]);

  if (!stock) return <div style={{ height: '140px' }} />;
  const color = isUp ? '#4ade80' : '#f87171';

  // Render connected sparkline from buffer
  const w = 220, h = 110;
  const bufLen = lineBuffer.length;
  const latestColor = bufLen > 0 && lineBuffer[bufLen - 1].isUp ? '#4ade80' : '#f87171';

  const pts = lineBuffer.map((p, i) => ({
    x: (i / (bufferMax - 1)) * w,
    y: h - 4 - p.y * (h - 8),
  }));

  const linePath = pts.length > 1
    ? pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
    : '';
  const dot = pts.length > 0 ? pts[pts.length - 1] : { x: 0, y: h / 2 };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
        <div style={{ fontFamily: "'SF Mono', monospace", minHeight: '18px' }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>
            {scrambledText}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '3px' }}>
          {stocks.map((_, i) => (
            <div key={i} style={{
              width: '3px', height: '3px', borderRadius: '50%',
              background: i === activeIdx ? '#fff' : 'rgba(255,255,255,0.12)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span style={{ fontSize: '22px', fontWeight: 600, color: '#fff', fontFamily: "'SF Pro Display', -apple-system, sans-serif", fontVariantNumeric: 'tabular-nums' }}>
          {scrambledPrice}
        </span>
        <span style={{ color, fontSize: '12px', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
          {scrambledPct}
        </span>
      </div>
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block', marginTop: '4px' }}>
        <defs>
          <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={latestColor} stopOpacity="0.12" />
            <stop offset="100%" stopColor={latestColor} stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {linePath && (
          <>
            <path d={linePath + ` L${dot.x.toFixed(1)},${h} L${pts[0].x.toFixed(1)},${h} Z`} fill="url(#spark-grad)" />
            <path d={linePath} fill="none" stroke={latestColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={dot.x} cy={dot.y} r="4" fill={latestColor} filter="url(#glow)">
              <animate attributeName="r" values="3;5;3" dur="1.2s" repeatCount="indefinite" />
            </circle>
          </>
        )}
      </svg>
    </div>
  );
}

// ── Compact inline clocks (for Big Type ticker bar) ──
function CompactClocks() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(id); }, []);
  const cities = [
    { name: 'NY', tz: 'America/New_York' },
    { name: 'LDN', tz: 'Europe/London' },
    { name: 'TYO', tz: 'Asia/Tokyo' },
    { name: 'SYD', tz: 'Australia/Sydney' },
  ];
  return (
    <span style={{ display: 'inline-flex', gap: '12px' }}>
      {cities.map(c => {
        const t = time.toLocaleTimeString('en-US', { timeZone: c.tz, hour: '2-digit', minute: '2-digit', hour12: true }).replace(' ', '');
        return <span key={c.name}><span style={{ color: 'rgba(255,255,255,0.3)' }}>{c.name}</span> <span style={{ color: 'rgba(255,255,255,0.6)' }}>{t}</span></span>;
      })}
    </span>
  );
}

// ── Compact inline tickers (for Big Type ticker bar) ──
function CompactTickers() {
  const [tickers, setTickers] = useState<{ symbol: string; pct: number }[]>([]);
  useEffect(() => {
    const bases = [{ symbol: 'SPY', base: 590 }, { symbol: 'BTC', base: 87245 }, { symbol: 'AAPL', base: 228 }, { symbol: 'NVDA', base: 118 }];
    const init = bases.map(b => ({ symbol: b.symbol, pct: (Math.random() - 0.45) * 1.5 }));
    setTickers(init);
    const id = setInterval(() => setTickers(prev => prev.map(t => ({ ...t, pct: t.pct + (Math.random() - 0.5) * 0.05 }))), 2000);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{ display: 'inline-flex', gap: '10px' }}>
      {tickers.map(t => (
        <span key={t.symbol}>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>{t.symbol}</span>{' '}
          <span style={{ color: t.pct >= 0 ? '#4ade80' : '#f87171' }}>{t.pct >= 0 ? '▲' : '▼'}{Math.abs(t.pct).toFixed(2)}%</span>
        </span>
      ))}
    </span>
  );
}

function TerminalContent() {
  const { dispatch } = useDesktop();
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [introDone, setIntroDone] = useState(false);
  const [showRotating, setShowRotating] = useState(false);
  const [showLinks, setShowLinks] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Stagger-in elements (text is static, only rotating words animate)
  useEffect(() => {
    setShowRotating(true);
    setTimeout(() => setShowLinks(true), 400);
    setTimeout(() => setShowCommands(true), 700);
    setTimeout(() => setIntroDone(true), 1000);
  }, []);

  useEffect(() => {
    if (introDone) inputRef.current?.focus();
  }, [introDone]);

  // Only auto-scroll on command history updates, not during intro typing
  useEffect(() => {
    if (history.length > 0) {
      scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
    }
  }, [history]);

  const prompt = 'ronniel@MacBookPro ~ % ';

  const runCommand = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    const newLines: TerminalLine[] = [
      { type: 'prompt', text: prompt + raw, command: raw },
    ];

    if (!cmd) {
      // empty
    } else if (cmd === 'help') {
      newLines.push({ type: 'system', text: '\nAvailable commands:\n' });
      Object.entries(COMMANDS).forEach(([name, { desc }]) => {
        newLines.push({ type: 'output', text: `  \x1b[cmd]${name}\x1b[/cmd]${' '.repeat(Math.max(1, 15 - name.length))}${desc}` });
      });
      newLines.push({ type: 'output', text: '' });
      newLines.push({ type: 'output', text: '  \x1b[cmd]help\x1b[/cmd]           Show this list again' });
      newLines.push({ type: 'output', text: '  \x1b[cmd]clear\x1b[/cmd]          Clear terminal' });
      newLines.push({ type: 'output', text: '' });
    } else if (cmd === 'clear') {
      setHistory([]);
      setInput('');
      return;
    } else if (SMART_COMMANDS[cmd]) {
      // Check smart commands FIRST (before cd/open handlers that would partially match)
      const { window: win, output } = SMART_COMMANDS[cmd];
      newLines.push({ type: 'system', text: output });
      dispatch({ type: 'OPEN_WINDOW', id: win });
    } else if (COMMANDS[cmd]) {
      const { window, desc } = COMMANDS[cmd];
      newLines.push({ type: 'system', text: `Opening ${desc.toLowerCase()}...` });
      dispatch({ type: 'OPEN_WINDOW', id: window });
    } else if (cmd.startsWith('cd ')) {
      const target = cmd.replace('cd ', '').replace(/[\/~]/g, '').trim();
      if (COMMANDS[target]) {
        const { window, desc } = COMMANDS[target];
        newLines.push({ type: 'system', text: `Opening ${desc.toLowerCase()}...` });
        dispatch({ type: 'OPEN_WINDOW', id: window });
      } else {
        newLines.push({ type: 'error', text: `cd: no such directory: ${target}` });
        newLines.push({ type: 'output', text: 'Type "help" to see available commands.' });
      }
    } else if (cmd.startsWith('open ')) {
      const target = cmd.replace('open ', '').trim();
      if (COMMANDS[target]) {
        const { window, desc } = COMMANDS[target];
        newLines.push({ type: 'system', text: `Opening ${desc.toLowerCase()}...` });
        dispatch({ type: 'OPEN_WINDOW', id: window });
      } else {
        newLines.push({ type: 'error', text: `open: "${target}" not found` });
        newLines.push({ type: 'output', text: 'Type "help" to see available commands.' });
      }
    } else if (cmd === 'ls') {
      Object.keys(COMMANDS).forEach(name => {
        newLines.push({ type: 'output', text: `  📁 ${name}/` });
      });
    } else if (cmd === 'whoami') {
      newLines.push({ type: 'output', text: 'ronniel' });
    } else if (cmd === 'pwd') {
      newLines.push({ type: 'output', text: '/Users/ronniel/portfolio' });
    } else if (cmd.startsWith('echo ')) {
      newLines.push({ type: 'output', text: raw.replace(/^echo\s+/i, '').replace(/^["']|["']$/g, '') });
    } else {
      newLines.push({ type: 'error', text: `zsh: command not found: ${cmd.split(' ')[0]}` });
      newLines.push({ type: 'output', text: 'Type "help" to see available commands.' });
    }

    setHistory(prev => [...prev, ...newLines]);
    setCmdHistory(prev => [raw, ...prev]);
    setHistoryIdx(-1);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      runCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const newIdx = Math.min(historyIdx + 1, cmdHistory.length - 1);
        setHistoryIdx(newIdx);
        setInput(cmdHistory[newIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx > 0) {
        setHistoryIdx(historyIdx - 1);
        setInput(cmdHistory[historyIdx - 1]);
      } else {
        setHistoryIdx(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (input.trim()) {
        const partial = input.trim().toLowerCase();
        const prefix = partial.startsWith('cd ') ? partial.replace('cd ', '') : partial.startsWith('open ') ? partial.replace('open ', '') : partial;
        const match = Object.keys(COMMANDS).find(c => c.startsWith(prefix));
        if (match) {
          if (partial.startsWith('cd ')) setInput('cd ' + match);
          else if (partial.startsWith('open ')) setInput('open ' + match);
          else setInput(match);
        }
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setHistory([]);
    }
  };

  const renderColoredLine = (text: string) => {
    const parts = text.split(/\x1b\[cmd\]|\x1b\[\/cmd\]/);
    return parts.map((part, idx) => (
      idx % 2 === 1
        ? <span key={idx} style={{ color: '#60a5fa', fontWeight: 700 }}>{part}</span>
        : <span key={idx} style={{ color: 'rgba(255,255,255,0.55)' }}>{part}</span>
    ));
  };

  const getLineColor = (line: TerminalLine) => {
    switch (line.type) {
      case 'prompt': return '#4ade80';
      case 'error': return '#f87171';
      case 'system': return '#22d3ee';
      default: return 'rgba(255,255,255,0.75)';
    }
  };

  const cmdColors: Record<string, string> = {
    education: '#60a5fa', experience: '#c084fc', projects: '#4ade80',
    mythoughts: '#fbbf24', deepresearch: '#f472b6', calendar: '#22d3ee',
    help: '#94a3b8', clear: '#94a3b8',
  };

  const commandLinks = [
    { cmd: 'education', emoji: '🎓', label: 'Education', color: '#60a5fa' },
    { cmd: 'experience', emoji: '💼', label: 'Experience', color: '#c084fc' },
    { cmd: 'projects', emoji: '⚡', label: 'Projects', color: '#4ade80' },
    { cmd: 'mythoughts', emoji: '✍️', label: 'My Thoughts', color: '#fbbf24' },
    { cmd: 'deepresearch', emoji: '🔬', label: 'Deep Research', color: '#f472b6' },
    { cmd: 'calendar', emoji: '📅', label: 'Book a Meeting', color: '#22d3ee' },
  ];

  const smartCommandLinks = [
    { cmd: 'npm run experience', color: '#c084fc' },
    { cmd: 'git log --education', color: '#60a5fa' },
    { cmd: 'brew install projects', color: '#4ade80' },
    { cmd: 'cat mythoughts.md', color: '#fbbf24' },
    { cmd: 'cd deepresearch', color: '#f472b6' },
    { cmd: 'open calendar.app', color: '#22d3ee' },
  ];

  // ============= DESIGN MODE =============
  // Change to preview: 'bento' | 'bigtype' | 'dashboard' | 'split'
  const DESIGN_MODE = 'split';

  // Shared terminal prompt + history renderer
  const renderTerminal = (compact?: boolean, mono?: boolean) => (
    <div style={{ fontFamily: mono !== false ? "'SF Mono', 'JetBrains Mono', 'Menlo', monospace" : 'inherit', fontSize: compact ? '11.5px' : '12.5px', lineHeight: 1.5 }}>
      {history.map((line, i) => (
        <div key={i} style={{ color: getLineColor(line), whiteSpace: 'pre-wrap' }}>
          {line.type === 'prompt' ? (
            <><span style={{ color: '#4ade80', fontWeight: 700 }}>{prompt}</span><span style={{ color: '#fff', fontWeight: 500 }}>{line.command}</span></>
          ) : line.text.includes('\x1b[cmd]') ? renderColoredLine(line.text) : line.text}
        </div>
      ))}
      {introDone && (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ color: '#4ade80', fontWeight: 700, whiteSpace: 'pre', fontFamily: "'SF Mono', monospace", fontSize: compact ? '11.5px' : '12.5px' }}>{prompt}</span>
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
            spellCheck={false} autoComplete="off"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: "'SF Mono', monospace", fontSize: compact ? '11.5px' : '12.5px', color: '#fff', padding: 0, margin: 0, caretColor: '#4ade80' }} />
        </div>
      )}
      {!introDone && <span style={{ display: 'inline-block', width: '8px', height: '14px', background: '#4ade80', animation: 'blink 1s step-end infinite' }} />}
    </div>
  );

  // Shared command grid renderer
  const renderCommandGrid = (cols?: number, small?: boolean) => (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols || 2}, 1fr)`, gap: small ? '4px' : '4px' }}>
      {commandLinks.map((item) => (
        <div key={item.cmd} onClick={(e) => { e.stopPropagation(); runCommand(item.cmd); }}
          style={{
            display: 'flex', alignItems: 'center', gap: small ? '6px' : '8px',
            padding: small ? '5px 8px' : '6px 10px', borderRadius: '8px', cursor: 'pointer',
            background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)',
            transition: 'all 0.2s ease', fontSize: small ? '11px' : '12px',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = item.color + '40'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
        >
          <span style={{ fontSize: small ? '12px' : '14px' }}>{item.emoji}</span>
          <span style={{ color: item.color, fontWeight: 600 }}>{item.label}</span>
        </div>
      ))}
    </div>
  );

  // ═══════════════ BENTO GRID ═══════════════
  if (DESIGN_MODE === 'bento') {
    return (
      <div ref={scrollRef} onClick={() => inputRef.current?.focus()} style={{
        display: 'grid',
        gridTemplateColumns: '1fr 240px',
        gridTemplateRows: 'auto 1fr auto',
        height: '100%',
        fontFamily: "'SF Mono', 'JetBrains Mono', 'Menlo', monospace",
        fontSize: '12.5px', color: '#e0e0e0', lineHeight: 1.6,
        cursor: 'text', overflow: 'hidden',
      }}>
        {/* Hero tile — top left */}
        <div style={{ gridRow: '1', padding: '24px 24px 16px', overflowY: 'auto' }}>
          <div style={{ fontWeight: 700, fontSize: '22px', color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.2 }}>Ronniel Gandhe</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px', marginBottom: '14px' }}>Software Engineer</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', lineHeight: 1.5, marginBottom: '16px' }}>
            Using <RotatingWords /> to create<br />elegant and scalable solutions<br />to real world problems.
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '11.5px', flexWrap: 'wrap' }}>
            <span style={{ color: '#fff' }}>📍 Waterloo, ON</span>
            <a href="mailto:ronnielgandhe@gmail.com" style={{ color: '#fbbf24', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>✉️ Email</a>
            <a href="https://github.com/ronnielgandhe" target="_blank" rel="noopener" style={{ color: '#22d3ee', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>🐙 GitHub</a>
          </div>
        </div>

        {/* Right column — clock + stocks stacked */}
        <div style={{ gridRow: '1 / 3', borderLeft: '1px solid rgba(255,255,255,0.04)', padding: '20px 16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <WorldClock />
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.04)' }} />
          <StockTickers />
        </div>

        {/* Command tiles — middle left */}
        <div style={{ padding: '0 24px 16px' }}>
          <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', marginBottom: '8px' }}>EXPLORE</div>
          {renderCommandGrid(3, true)}
        </div>

        {/* Terminal prompt strip — full bottom */}
        <div style={{ gridColumn: '1 / -1', borderTop: '1px solid rgba(255,255,255,0.04)', padding: '8px 24px', overflowY: 'auto', maxHeight: '120px' }}>
          {renderTerminal(true)}
        </div>

        <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }`}</style>
      </div>
    );
  }

  // ═══════════════ BIG TYPE HERO ═══════════════
  if (DESIGN_MODE === 'bigtype') {
    return (
      <div ref={scrollRef} onClick={() => inputRef.current?.focus()} style={{
        display: 'flex', flexDirection: 'column', height: '100%', cursor: 'text', overflow: 'hidden',
      }}>
        {/* Hero area — centered, fills most space */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '24px 32px 0', minHeight: 0 }}>
          <div style={{ fontFamily: "'SF Pro Display', -apple-system, sans-serif", fontSize: '52px', fontWeight: 800, letterSpacing: '0.12em', color: '#fff', lineHeight: 1, textTransform: 'uppercase' }}>Ronniel</div>
          <div style={{ fontFamily: "'SF Pro Display', -apple-system, sans-serif", fontSize: '52px', fontWeight: 800, letterSpacing: '0.12em', color: '#fff', lineHeight: 1, textTransform: 'uppercase', marginBottom: '12px' }}>Gandhe</div>
          <div style={{ fontFamily: "'SF Pro Text', -apple-system, sans-serif", fontSize: '14px', color: 'rgba(255,255,255,0.4)', fontWeight: 400, marginBottom: '4px' }}>Software Engineer</div>
          <div style={{ fontFamily: "'SF Mono', monospace", fontSize: '13px', marginBottom: '20px' }}>
            <RotatingWords />
          </div>
          <div style={{ width: '40px', height: '1px', background: 'rgba(255,255,255,0.12)', marginBottom: '20px' }} />

          {/* Info row */}
          <div style={{ display: 'flex', gap: '20px', fontSize: '12px', fontFamily: "'SF Mono', monospace", marginBottom: '24px' }}>
            <span style={{ color: '#fff' }}>📍 Waterloo, ON</span>
            <a href="mailto:ronnielgandhe@gmail.com" style={{ color: '#fbbf24', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>✉️ Email</a>
            <a href="https://github.com/ronnielgandhe" target="_blank" rel="noopener" style={{ color: '#22d3ee', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>🐙 GitHub</a>
          </div>

          {/* Command pills — horizontal */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '520px' }}>
            {commandLinks.map(item => (
              <div key={item.cmd} onClick={(e) => { e.stopPropagation(); runCommand(item.cmd); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer',
                  background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)', transition: 'all 0.2s', fontSize: '12px',
                  fontFamily: "'SF Mono', monospace",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = item.color + '50'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              >
                <span style={{ fontSize: '13px' }}>{item.emoji}</span>
                <span style={{ color: item.color, fontWeight: 600 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Data ticker bar */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '20px', padding: '10px 24px',
          borderTop: '1px solid rgba(255,255,255,0.04)', fontFamily: "'SF Mono', monospace", fontSize: '11px',
          color: 'rgba(255,255,255,0.35)', flexWrap: 'wrap',
        }}>
          <CompactClocks />
          <span style={{ color: 'rgba(255,255,255,0.08)' }}>│</span>
          <CompactTickers />
        </div>

        {/* Terminal prompt */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.04)', padding: '8px 24px', maxHeight: '100px', overflowY: 'auto',
          fontFamily: "'SF Mono', monospace",
        }}>
          {renderTerminal(true)}
        </div>

        <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }`}</style>
      </div>
    );
  }

  // ═══════════════ DASHBOARD CARDS ═══════════════
  if (DESIGN_MODE === 'dashboard') {
    return (
      <div ref={scrollRef} onClick={() => inputRef.current?.focus()} style={{
        display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center',
        padding: '0', cursor: 'text', overflow: 'hidden',
      }}>
        {/* Top hero section */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 32px', width: '100%', minHeight: 0, overflowY: 'auto' }}>
          <img src="/icons/rglogo.png" alt="RG" style={{ width: '44px', opacity: 0.7, filter: 'brightness(0) invert(1)', marginBottom: '12px' }} />
          <div style={{ fontFamily: "'SF Pro Display', -apple-system, sans-serif", fontSize: '26px', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>Ronniel Gandhe</div>
          <div style={{ fontFamily: "'SF Pro Text', -apple-system, sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>Software Engineer · <RotatingWords /></div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '11.5px', fontFamily: "'SF Mono', monospace", marginBottom: '20px' }}>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>📍 Waterloo</span>
            <a href="mailto:ronnielgandhe@gmail.com" style={{ color: '#fbbf24', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>✉️ Email</a>
            <a href="https://github.com/ronnielgandhe" target="_blank" rel="noopener" style={{ color: '#22d3ee', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>🐙 GitHub</a>
          </div>

          {/* Glass cards row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%', maxWidth: '520px', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '0.5px solid rgba(255,255,255,0.06)', padding: '14px 16px' }}>
              <WorldClock />
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '0.5px solid rgba(255,255,255,0.06)', padding: '14px 16px' }}>
              <StockTickers />
            </div>
          </div>

          {/* Explore cards */}
          <div style={{ width: '100%', maxWidth: '520px' }}>
            <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', marginBottom: '8px' }}>EXPLORE</div>
            {renderCommandGrid(3, true)}
          </div>
        </div>

        {/* Terminal prompt */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.04)', padding: '8px 24px', width: '100%',
          maxHeight: '100px', overflowY: 'auto', fontFamily: "'SF Mono', monospace",
        }}>
          {renderTerminal(true)}
        </div>

        <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }`}</style>
      </div>
    );
  }

  // ═══════════════ SPLIT PANELS (default) ═══════════════
  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Left — hero + links */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '24px 24px 8px 28px', borderRight: '1px solid rgba(255,255,255,0.04)',
        minWidth: 0,
      }}>
        {/* Static hero text — only RotatingWords animates */}
        <div style={{ fontFamily: "'SF Mono', 'JetBrains Mono', monospace", fontSize: '13px', lineHeight: 1.6, color: '#e0e0e0' }}>
          <div style={{ fontFamily: "'SF Pro Display', -apple-system, sans-serif", fontWeight: 800, fontSize: '30px', color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.1, marginBottom: '2px' }}>
            Ronniel Gandhe
          </div>
          <div style={{ fontSize: '13px', color: '#fff', fontWeight: 400, marginBottom: '14px' }}>
            Software Engineer
          </div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', lineHeight: 1.6, whiteSpace: 'nowrap', overflow: 'hidden' }}>
            Using {showRotating && <RotatingWords />}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', lineHeight: 1.6 }}>
            to create elegant and scalable
          </div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', lineHeight: 1.6 }}>
            solutions to real world problems.
          </div>
        </div>

        {/* Quick links — stagger in */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '18px',
          opacity: showLinks ? 1 : 0, transform: showLinks ? 'translateY(0)' : 'translateY(8px)',
          transition: 'all 0.5s ease-out', fontFamily: "'SF Mono', monospace", fontSize: '13px',
        }}>
          <span style={{ color: '#fff' }}>📍 Waterloo, ON</span>
          <a href="mailto:ronnielgandhe@gmail.com" style={{ color: '#fbbf24', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>
            ✉️ ronnielgandhe@gmail.com
          </a>
          <a href="https://github.com/ronnielgandhe" target="_blank" rel="noopener" style={{ color: '#22d3ee', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>
            🐙 github.com/ronnielgandhe
          </a>
        </div>

        {/* Clock — pushed to bottom of left panel */}
        <div style={{ marginTop: 'auto' }}>
          <WorldClock />
        </div>
      </div>

      {/* Right — widgets stacked */}
      <div ref={scrollRef} onClick={() => inputRef.current?.focus()} style={{
        flex: 1, display: 'flex', flexDirection: 'column', cursor: 'text',
        fontFamily: "'SF Mono', monospace", overflowX: 'hidden', overflowY: 'hidden',
      }}>
        {/* Date — top right corner */}
        <div style={{ padding: '8px 14px 0', textAlign: 'right', color: '#fff', fontSize: '11px', fontWeight: 400, fontFamily: "'SF Pro Display', -apple-system, sans-serif" }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
        {/* Stock ticker with chart */}
        <div style={{ padding: '8px 14px 8px' }}>
          <CyclingStock />
        </div>
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.04)', margin: '0 14px' }} />

        {/* Smart commands */}
        <div style={{ padding: '8px 14px' }}>
          <div style={{ color: '#fff', fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', marginBottom: '4px' }}>EXPLORE</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {smartCommandLinks.map(item => (
              <div
                key={item.cmd}
                onClick={(e) => { e.stopPropagation(); runCommand(item.cmd); }}
                style={{
                  padding: '3px 6px', borderRadius: '4px', cursor: 'pointer',
                  fontSize: '11.5px', transition: 'all 0.15s',
                  color: item.color, opacity: 0.5,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.opacity = '1'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.opacity = '0.5'; }}
              >
                <span style={{ color: '#4ade80', marginRight: '4px' }}>$</span>{item.cmd}
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.04)', margin: '0 14px' }} />

        {/* Terminal prompt */}
        <div style={{ padding: '6px 14px', flex: 1, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          {renderTerminal(true)}
        </div>
      </div>

      <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }`}</style>
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

  // Mobile — show boot animation, then mobile layout
  if (isMobile) {
    return (
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#0b1220' }}>
        <MacBackground />
        <BootScreen />
        {state.bootComplete && <MobileLayout />}
      </div>
    );
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
      <BootScreen key={state.bootComplete ? 'booted' : 'booting'} />

      {state.bootComplete && (
        <>
          <DesktopMenuBar />

          {/* Windows */}
          {openWindows.map(win => {
            const darkWindows: string[] = ['education', 'experience', 'detail', 'terminal', 'email', 'photos', 'content', 'projects'];
            const isDark = darkWindows.includes(win.id);
            const titleBarBgMap: Record<string, string> = {
              projects: '#252526',
              blog: '#f0f0f0',
            };
            const titleBarBg = titleBarBgMap[win.id];
            if (win.id === 'detail' && state.activeDetail) {
              return (
                <AppWindow key={win.id} windowState={win} darkMode={isDark} titleBarBg={titleBarBg}>
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
                <AppWindow key={win.id} windowState={win} darkMode={isDark} titleBarBg={titleBarBg}>
                  <ContentViewer
                    content={state.activeContent}
                    onClose={() => dispatch({ type: 'CLOSE_CONTENT' })}
                    windowMode
                  />
                </AppWindow>
              );
            }
            return (
              <AppWindow key={win.id} windowState={win} darkMode={isDark} titleBarBg={titleBarBg}>
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

function MobileLayout() {
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [introDone, setIntroDone] = useState(false);
  const [introText, setIntroText] = useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const mobileCommands: Record<string, { desc: string; href?: string; action?: string }> = {
    'github':    { desc: 'View my GitHub profile', href: 'https://github.com/ronnielgandhe' },
    'email':     { desc: 'Send me an email', href: 'mailto:ronnielgandhe@gmail.com' },
    'calendar':  { desc: 'Book a meeting with me', href: 'https://calendly.com/ronnielgandhe' },
    'spotify':   { desc: 'Listen to my dev playlist', href: 'https://open.spotify.com/playlist/2uud5zGJZf3U98FlTnQip8' },
    'linkedin':  { desc: 'Connect on LinkedIn', href: 'https://linkedin.com/in/ronnielgandhe' },
  };

  useEffect(() => {
    const lines = [
      'Ronniel Gandhe — Software Engineer',
      '',
      'Location: Waterloo, ON',
      'Email: ronnielgandhe@gmail.com',
      'GitHub: github.com/ronnielgandhe',
      '',
      '"I build systems that think, design that feels,',
      ' and code that connects ideas to impact."',
      '',
      '—————————————————————————————————————',
      '',
      'Available commands:',
      '',
      '  github       View my GitHub profile',
      '  email        Send me an email',
      '  calendar     Book a meeting with me',
      '  spotify      Listen to my dev playlist',
      '',
      '  help         Show this list again',
      '  clear        Clear terminal',
      '',
      'Type a command and press Enter to explore.',
      '—————————————————————————————————————',
    ];
    const full = lines.join('\n');
    let i = 0;
    const speed = 6;
    const interval = setInterval(() => {
      if (i < full.length) {
        setIntroText(full.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setIntroDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (introDone) inputRef.current?.focus();
  }, [introDone]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [history, introText]);

  const prompt = 'ronniel ~ % ';

  const runCommand = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    const newLines: TerminalLine[] = [
      { type: 'prompt', text: prompt + raw, command: raw },
    ];

    if (!cmd) {
      // empty
    } else if (cmd === 'help') {
      newLines.push({ type: 'system', text: '\nAvailable commands:\n' });
      Object.entries(mobileCommands).forEach(([name, { desc }]) => {
        newLines.push({ type: 'output', text: `  \x1b[cmd]${name}\x1b[/cmd]${' '.repeat(Math.max(1, 13 - name.length))}${desc}` });
      });
      newLines.push({ type: 'output', text: '' });
      newLines.push({ type: 'output', text: '  \x1b[cmd]help\x1b[/cmd]         Show this list again' });
      newLines.push({ type: 'output', text: '  \x1b[cmd]clear\x1b[/cmd]        Clear terminal' });
    } else if (cmd === 'clear') {
      setHistory([]);
      setInput('');
      return;
    } else if (mobileCommands[cmd]) {
      const { desc, href } = mobileCommands[cmd];
      newLines.push({ type: 'system', text: `Opening ${desc.toLowerCase()}...` });
      if (href) {
        setTimeout(() => {
          if (href.startsWith('mailto:')) {
            window.location.href = href;
          } else {
            window.open(href, '_blank');
          }
        }, 300);
      }
    } else if (cmd === 'whoami') {
      newLines.push({ type: 'output', text: 'ronniel' });
    } else if (cmd === 'pwd') {
      newLines.push({ type: 'output', text: '/Users/ronniel/portfolio' });
    } else if (cmd === 'ls') {
      Object.keys(mobileCommands).forEach(name => {
        newLines.push({ type: 'output', text: `  📁 ${name}/` });
      });
    } else if (cmd.startsWith('echo ')) {
      newLines.push({ type: 'output', text: raw.replace(/^echo\s+/i, '').replace(/^["']|["']$/g, '') });
    } else {
      newLines.push({ type: 'error', text: `zsh: command not found: ${cmd.split(' ')[0]}` });
      newLines.push({ type: 'output', text: 'Type "help" to see available commands.' });
    }

    setHistory(prev => [...prev, ...newLines]);
    setCmdHistory(prev => [raw, ...prev]);
    setHistoryIdx(-1);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      runCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const newIdx = Math.min(historyIdx + 1, cmdHistory.length - 1);
        setHistoryIdx(newIdx);
        setInput(cmdHistory[newIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx > 0) {
        const newIdx = historyIdx - 1;
        setHistoryIdx(newIdx);
        setInput(cmdHistory[newIdx]);
      } else {
        setHistoryIdx(-1);
        setInput('');
      }
    }
  };

  const renderColoredLine = (text: string) => {
    const parts = text.split(/\x1b\[cmd\]|\x1b\[\/cmd\]/);
    return parts.map((part, idx) => (
      idx % 2 === 1
        ? <span key={idx} style={{ color: '#60a5fa', fontWeight: 700 }}>{part}</span>
        : <span key={idx} style={{ color: 'rgba(255,255,255,0.55)' }}>{part}</span>
    ));
  };

  const getLineColor = (line: TerminalLine) => {
    switch (line.type) {
      case 'prompt': return '#4ade80';
      case 'error': return '#f87171';
      case 'system': return '#22d3ee';
      default: return 'rgba(255,255,255,0.75)';
    }
  };

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      animation: 'mobileFadeIn 0.8s ease-out',
    }}>
      {/* Mobile menu bar */}
      <div style={{
        height: '44px',
        minHeight: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '0.5px solid rgba(255,255,255,0.1)',
        fontFamily: "'SF Pro Text', -apple-system, sans-serif",
      }}>
        <span style={{
          color: 'rgba(255,255,255,0.95)',
          fontSize: '14px',
          fontWeight: 600,
          letterSpacing: '0.02em',
        }}>
          Terminal — ronniel
        </span>
      </div>

      {/* Terminal body */}
      <div
        ref={scrollRef}
        onClick={() => inputRef.current?.focus()}
        style={{
          flex: 1,
          padding: '16px 16px',
          fontFamily: "'SF Mono', 'Menlo', monospace",
          fontSize: '12px',
          color: '#e0e0e0',
          lineHeight: 1.65,
          overflowY: 'auto',
          cursor: 'text',
          background: 'rgba(15, 15, 20, 0.72)',
        }}
      >
        {/* Intro text */}
        <pre style={{
          margin: 0,
          fontFamily: 'inherit',
          fontSize: 'inherit',
          lineHeight: 'inherit',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          color: 'rgba(255,255,255,0.7)',
        }}>
          {introText.split('\n').map((line, i) => {
            if (i === 0) return <div key={i} style={{ fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>{line}</div>;
            if (line.startsWith('Location:')) return <div key={i}><span style={{ color: '#ff6b9d', fontWeight: 600 }}>Location: </span><span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>{line.replace('Location: ', '')}</span></div>;
            if (line.startsWith('Email:')) return <div key={i}><span style={{ color: '#fbbf24', fontWeight: 600 }}>Email: </span><span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>{line.replace('Email: ', '')}</span></div>;
            if (line.startsWith('GitHub:')) return <div key={i}><span style={{ color: '#22d3ee', fontWeight: 600 }}>GitHub: </span><span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>{line.replace('GitHub: ', '')}</span></div>;
            if (line.startsWith('"')) return <div key={i} style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.45)' }}>{line}</div>;
            if (line.startsWith('Available commands:')) return <div key={i} style={{ color: '#4ade80', fontWeight: 700 }}>{line}</div>;
            if (line.startsWith('Type a command')) return <div key={i} style={{ color: 'rgba(255,255,255,0.5)' }}>{line}</div>;
            if (line.match(/^\s{2}\w/)) {
              const parts = line.match(/^(\s{2})(\S+)(\s+)(.+)$/);
              if (parts) {
                return <div key={i}>{parts[1]}<span style={{ color: '#60a5fa', fontWeight: 700 }}>{parts[2]}</span>{parts[3]}<span style={{ color: 'rgba(255,255,255,0.55)' }}>{parts[4]}</span></div>;
              }
            }
            if (line.startsWith('——')) return <div key={i} style={{ color: 'rgba(255,255,255,0.15)' }}>{line}</div>;
            return <div key={i}>{line}</div>;
          })}
        </pre>

        {/* Command history */}
        {history.map((line, i) => (
          <div key={i} style={{ color: getLineColor(line), whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {line.type === 'prompt' ? (
              <>
                <span style={{ color: '#4ade80', fontWeight: 700 }}>{prompt}</span>
                <span style={{ color: '#fff', fontWeight: 500 }}>{line.command}</span>
              </>
            ) : line.text.includes('\x1b[cmd]') ? (
              renderColoredLine(line.text)
            ) : (
              line.text
            )}
          </div>
        ))}

        {/* Active prompt */}
        {introDone && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#4ade80', fontWeight: 700, whiteSpace: 'pre' }}>{prompt}</span>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                font: 'inherit',
                color: '#fff',
                padding: 0,
                margin: 0,
                caretColor: '#4ade80',
                fontSize: '12px',
              }}
            />
          </div>
        )}

        {/* Blinking cursor during intro */}
        {!introDone && (
          <span style={{
            display: 'inline-block',
            width: '8px',
            height: '14px',
            background: '#4ade80',
            verticalAlign: 'text-bottom',
            animation: 'blink 1s step-end infinite',
          }} />
        )}
      </div>

      {/* Quick action bar at bottom */}
      <div style={{
        display: 'flex',
        gap: '6px',
        padding: '8px 12px',
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '0.5px solid rgba(255,255,255,0.1)',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}>
        {Object.entries(mobileCommands).map(([cmd]) => (
          <button
            key={cmd}
            onClick={() => runCommand(cmd)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '0.5px solid rgba(255,255,255,0.15)',
              color: '#60a5fa',
              fontSize: '11px',
              fontWeight: 600,
              fontFamily: "'SF Mono', monospace",
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {cmd}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes mobileFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function DesktopShell() {
  return (
    <DesktopProvider>
      <Desktop />
    </DesktopProvider>
  );
}
