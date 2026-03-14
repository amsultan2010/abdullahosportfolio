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
import WifiSettings from '../portfolio/WifiSettings';
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
    case 'wifi-settings':
      return <WifiSettings />;
    case 'stocks':
      return <StocksApp />;
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
    const totalSteps = len + 12;
    const id = setInterval(() => {
      step++;
      const result: string[] = [];
      for (let i = 0; i < target.length; i++) {
        const resolveAt = resolveOrder.indexOf(i);
        if (step > resolveAt + 8) {
          result.push(target[i]);
        } else if (target[i] === ' ') {
          result.push(' ');
        } else {
          result.push(chars[Math.floor(Math.random() * chars.length)]);
        }
      }
      setDisplay(result.join(''));
      if (step >= totalSteps + 6) clearInterval(id);
    }, 50);
    return () => clearInterval(id);
  }, [target, trigger]);

  return display || target;
}

// ── Quick Start Tiles ──
const QUICK_NAV = [
  { label: 'experience', cmd: 'npm run experience', color: '#c084fc', icon: '💼' },
  { label: 'education', cmd: 'git log --education', color: '#60a5fa', icon: '🎓' },
  { label: 'projects', cmd: 'brew install projects', color: '#4ade80', icon: '🔨' },
  { label: 'notes', cmd: 'cat mythoughts.md', color: '#fbbf24', icon: '📝' },
  { label: 'research', cmd: 'cd deepresearch', color: '#f472b6', icon: '📚' },
  { label: 'calendar', cmd: 'open calendar.app', color: '#22d3ee', icon: '📅' },
];

function QuickStartTiles({ runCommand }: { runCommand: (cmd: string) => void }) {
  return (
    <div style={{ marginTop: '20px', fontFamily: "'SF Mono', monospace" }}>
      <div style={{ color: '#fff', fontSize: '11px', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '8px' }}>
        QUICK START
      </div>
      <div className="qs-pills" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
        {QUICK_NAV.map(n => (
          <div
            key={n.label}
            className="qs-pill"
            onClick={(e) => { e.stopPropagation(); runCommand(n.cmd); }}
            style={{
              padding: '10px 8px 8px', borderRadius: '10px', cursor: 'pointer', textAlign: 'center',
              border: `1px solid ${n.color}33`, background: `${n.color}0a`,
              fontSize: '12px', color: n.color, ['--gc' as any]: n.color,
            }}
          >
            <div style={{ fontSize: '18px', marginBottom: '3px' }}>{n.icon}</div>
            <div style={{ fontWeight: 500 }}>{n.label}</div>
          </div>
        ))}
      </div>
      <style>{`
        .qs-pill { opacity:0.75; transition:opacity .2s,background .2s,border-color .2s,box-shadow .2s; }
        .qs-pills:hover .qs-pill { opacity:0.3; }
        .qs-pills:hover .qs-pill:hover { opacity:1; box-shadow:0 0 12px var(--gc,#fff)22; }
      `}</style>
    </div>
  );
}

// ── Explore Commands (constantly lit, highlight on hover) ──
function ExploreCommands({ smartCommandLinks, runCommand }: {
  smartCommandLinks: { cmd: string; color: string }[];
  runCommand: (cmd: string) => void;
}) {
  return (
    <div style={{ padding: '8px 14px' }}>
      <div style={{ color: '#fff', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', marginBottom: '4px' }}>EXPLORE</div>
      <div className="explore-list" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {smartCommandLinks.map((item) => (
          <div
            key={item.cmd}
            className="explore-cmd"
            onClick={(e) => { e.stopPropagation(); runCommand(item.cmd); }}
            style={{
              padding: '3px 6px', borderRadius: '4px', cursor: 'pointer',
              fontSize: '12.5px',
              color: item.color,
              ['--glow-color' as any]: item.color,
            }}
          >
            <span style={{ color: '#4ade80', marginRight: '4px' }}>$</span>{item.cmd}
          </div>
        ))}
      </div>
      <style>{`
        .explore-cmd {
          opacity: 0.85;
          text-shadow: 0 0 4px var(--glow-color, #fff);
          transition: opacity 0.2s, text-shadow 0.2s, background 0.2s;
        }
        .explore-list:hover .explore-cmd {
          opacity: 0.35;
          text-shadow: none;
        }
        .explore-list:hover .explore-cmd:hover {
          opacity: 1;
          text-shadow: 0 0 8px var(--glow-color, #fff);
          background: rgba(255,255,255,0.06);
        }
      `}</style>
    </div>
  );
}

// ── Stock Ticker Tape with Continuous Line ──
interface StockData {
  symbol: string; name: string; price: number; change: number; pct: number; history: number[];
}

// Shared sector definitions — used across heatmap, sparklines, and detail views
const SECTORS: { name: string; symbols: string[]; color?: string }[] = [
  { name: 'Tech', symbols: ['AAPL', 'MSFT', 'GOOG', 'META', 'NVDA', 'AMD', 'AVGO', 'CRM', 'ORCL', 'ADBE', 'INTC'] },
  { name: 'Consumer', symbols: ['AMZN', 'TSLA', 'NFLX', 'DIS', 'NKE', 'SBUX', 'MCD', 'UBER', 'SHOP'] },
  { name: 'Finance', symbols: ['JPM', 'V', 'MA', 'GS'] },
  { name: 'Health', symbols: ['JNJ', 'PFE', 'LLY', 'UNH'] },
  { name: 'Crypto', symbols: ['BTC', 'ETH', 'COIN', 'MSTR'] },
  { name: 'Cloud', symbols: ['SNOW', 'NET', 'CRWD', 'DDOG', 'PLTR'] },
  { name: 'Energy', symbols: ['XOM', 'BA', 'CAT'] },
];

// Shared stock data fetcher — avoids multiple API calls
function useStockData() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  useEffect(() => {
    const generateFallback = (): StockData[] => {
      const bases = [
        { symbol: 'NVDA', name: 'NVIDIA', base: 118.72 },
        { symbol: 'TSLA', name: 'Tesla', base: 272.64 },
        { symbol: 'PLTR', name: 'Palantir', base: 78.50 },
        { symbol: 'AMD', name: 'AMD', base: 156.30 },
        { symbol: 'META', name: 'Meta', base: 585.20 },
        { symbol: 'COIN', name: 'Coinbase', base: 215.40 },
        { symbol: 'BTC', name: 'Bitcoin', base: 87245 },
        { symbol: 'SNAP', name: 'Snap', base: 11.20 },
        { symbol: 'NFLX', name: 'Netflix', base: 892.50 },
        { symbol: 'CRWD', name: 'CrowdStrike', base: 342.10 },
        { symbol: 'AAPL', name: 'Apple', base: 228.54 },
        { symbol: 'SPY', name: 'S&P 500', base: 590.32 },
      ];
      return bases.map((b, idx) => {
        const drift = (idx % 3 === 0 ? 0.52 : idx % 3 === 1 ? 0.44 : 0.48);
        const vol = idx < 6 ? 0.005 : 0.002;
        const history: number[] = [b.base];
        for (let i = 1; i < 80; i++) {
          history.push(history[i - 1] + (Math.random() - drift) * b.base * vol);
        }
        const price = history[history.length - 1];
        return { symbol: b.symbol, name: b.name, price, change: price - b.base, pct: ((price - b.base) / b.base) * 100, history };
      }).sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));
    };
    const interleaveMovers = (data: StockData[]): StockData[] => {
      const gainers = data.filter(s => s.pct > 0).sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));
      const losers = data.filter(s => s.pct <= 0).sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));
      const result: StockData[] = [];
      let gi = 0, li = 0;
      while (gi < gainers.length || li < losers.length) {
        if (gi < gainers.length) result.push(gainers[gi++]);
        if (li < losers.length) result.push(losers[li++]);
      }
      return result;
    };
    fetch('/api/stocks')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((data: StockData[]) => {
        if (Array.isArray(data) && data.length > 0) setStocks(interleaveMovers(data));
        else setStocks(interleaveMovers(generateFallback()));
      })
      .catch(() => setStocks(interleaveMovers(generateFallback())));
  }, []);
  return stocks;
}

function CyclingStock({ stocks: externalStocks, startOffset = 0, compact = false, instanceId = 0, onCurrentStock }: {
  stocks?: StockData[]; startOffset?: number; compact?: boolean; instanceId?: number; onCurrentStock?: (stock: StockData) => void;
} = {}) {
  const ownStocks = useStockData();
  const stocks = externalStocks && externalStocks.length > 0 ? externalStocks : ownStocks;
  const containerRef = useRef<HTMLDivElement>(null);
  const totalInstances = compact ? 4 : 1;

  const h = compact ? 70 : 120;
  const NUM_POINTS = 100; // number of chart points to draw
  const DRAW_DURATION = compact ? 3000 : 3500; // ms to draw/erase
  const HOLD_DURATION = compact ? 20000 : 30000; // ms to hold on screen

  // Phases: 'drawing' → 'holding' → 'erasing' → 'switching' → 'drawing'
  const [phase, setPhase] = useState<'drawing' | 'holding' | 'erasing' | 'switching'>('drawing');
  const [drawProgress, setDrawProgress] = useState(0); // 0 to 1
  const [cycleCount, setCycleCount] = useState(0);
  const [displayIdx, setDisplayIdx] = useState(startOffset);
  const rafRef = useRef<number>(0);
  const SWITCH_PAUSE = 1200; // ms to show new ticker before drawing

  const getStockIdx = (cycle: number) => {
    if (stocks.length === 0) return 0;
    return (startOffset + cycle * totalInstances) % stocks.length;
  };

  // Main animation loop
  useEffect(() => {
    if (!stocks.length) return;
    let startTime = performance.now();
    let currentPhase: 'drawing' | 'holding' | 'erasing' | 'switching' = 'drawing';
    let cycle = 0;

    // Set initial stock
    setDisplayIdx(getStockIdx(cycle));

    const loop = (now: number) => {
      const elapsed = now - startTime;

      if (currentPhase === 'drawing') {
        const p = Math.min(elapsed / DRAW_DURATION, 1);
        const eased = 1 - Math.pow(1 - p, 2);
        setDrawProgress(eased);
        if (p >= 1) {
          currentPhase = 'holding';
          setPhase('holding');
          startTime = now;
          setDrawProgress(1);
        }
      } else if (currentPhase === 'holding') {
        if (elapsed >= HOLD_DURATION) {
          currentPhase = 'erasing';
          setPhase('erasing');
          startTime = now;
        }
      } else if (currentPhase === 'erasing') {
        const p = Math.min(elapsed / DRAW_DURATION, 1);
        const eased = 1 - (1 - Math.pow(p, 2));
        setDrawProgress(1 - eased);
        if (p >= 1) {
          // Erase done — switch ticker text, pause before drawing
          cycle++;
          const nextIdx = getStockIdx(cycle);
          setCycleCount(cycle);
          setDisplayIdx(nextIdx);
          setDrawProgress(0);
          currentPhase = 'switching';
          setPhase('switching');
          startTime = now;
        }
      } else if (currentPhase === 'switching') {
        // Pause with new ticker shown, empty chart
        if (elapsed >= SWITCH_PAUSE) {
          currentPhase = 'drawing';
          setPhase('drawing');
          startTime = now;
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    setPhase('drawing');
    setDrawProgress(0);
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [stocks]);

  // Notify parent of current stock
  useEffect(() => {
    if (onCurrentStock && stocks[displayIdx]) onCurrentStock(stocks[displayIdx]);
  }, [displayIdx, stocks]);

  const stock = stocks[displayIdx] || null;
  const tickerFull = stock ? `${stock.symbol} ${stock.name}` : '';
  const isUp = stock ? stock.change >= 0 : true;
  const fmtPrice = stock
    ? (stock.symbol === 'BTC' ? stock.price.toLocaleString('en-US', { maximumFractionDigits: 0 }) : stock.price.toFixed(2))
    : '';
  const pctStr = stock ? `${isUp ? '▲' : '▼'} ${Math.abs(stock.pct).toFixed(2)}%` : '';
  const scrambledText = useScrambleText(tickerFull, displayIdx);
  const scrambledPrice = useScrambleText(fmtPrice, displayIdx);
  const scrambledPct = useScrambleText(pctStr, displayIdx);
  const color = isUp ? '#4ade80' : '#f87171';

  if (!stock) return <div style={{ height: compact ? '90px' : '140px' }} />;

  // Build full chart points from stock history
  const w = containerRef.current?.clientWidth || 220;
  const hist = stock.history;
  const mn = Math.min(...hist), mx = Math.max(...hist), rng = mx - mn || 1;
  const totalPts = Math.min(hist.length, NUM_POINTS);

  const allPts: { x: number; y: number }[] = [];
  for (let i = 0; i < totalPts; i++) {
    const histIdx = Math.floor((i / (totalPts - 1)) * (hist.length - 1));
    const norm = (hist[histIdx] - mn) / rng;
    allPts.push({
      x: (i / (totalPts - 1)) * w,
      y: h - 4 - norm * (h - 8),
    });
  }

  // Slice points based on drawProgress (how much of the chart is visible)
  const visibleCount = Math.max(2, Math.round(drawProgress * totalPts));
  const visPts = phase === 'erasing'
    ? allPts.slice(0, visibleCount) // erase from right: shrink visible from end
    : allPts.slice(0, visibleCount); // draw from left: grow visible from start

  const linePath = visPts.length > 1
    ? visPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
    : '';
  const lastPt = visPts[visPts.length - 1] || { x: 0, y: h / 2 };
  const firstPt = visPts[0] || { x: 0, y: h / 2 };
  const gradId = `spark-grad-${instanceId}`;
  const glowId = `glow-${instanceId}`;

  return (
    <div>
      <div style={{ fontFamily: "'SF Mono', monospace", minHeight: compact ? '14px' : '18px', marginBottom: '2px' }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: compact ? '11px' : '13px' }}>
          {scrambledText}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: compact ? '6px' : '8px' }}>
        <span style={{ fontSize: compact ? '16px' : '22px', fontWeight: 600, color: '#fff', fontFamily: "'SF Pro Display', -apple-system, sans-serif", fontVariantNumeric: 'tabular-nums' }}>
          {scrambledPrice}
        </span>
        <span style={{ color, fontSize: compact ? '10px' : '12px', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
          {scrambledPct}
        </span>
      </div>
      <div ref={containerRef} style={{ marginTop: compact ? '2px' : '4px', overflow: 'visible' }}>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" overflow="visible" style={{ display: 'block', width: '100%', height: `${h}px` }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.12" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {linePath && (
          <>
            <path d={linePath + ` L${lastPt.x.toFixed(1)},${h} L${firstPt.x.toFixed(1)},${h} Z`} fill={`url(#${gradId})`} />
            <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={lastPt.x} cy={lastPt.y} r={compact ? 3 : 5} fill={color} filter={`url(#${glowId})`}>
              <animate attributeName="r" values={compact ? '2;4;2' : '4;6;4'} dur="1.2s" repeatCount="indefinite" />
            </circle>
          </>
        )}
      </svg>
      </div>
    </div>
  );
}

// 2x2 Stock Grid for fullscreen Bloomberg view
function StockGrid({ onStockClick }: { onStockClick?: (symbol: string, name: string) => void } = {}) {
  const stocks = useStockData();
  const currentStocks = useRef<(StockData | null)[]>([null, null, null, null]);
  const [hovered, setHovered] = useState<number | null>(null);

  const handleCurrentStock = (cellIdx: number, stock: StockData) => {
    currentStocks.current[cellIdx] = stock;
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      {[0, 1, 2, 3].map(i => (
        <div key={i}
          onClick={(e) => {
            e.stopPropagation();
            const s = currentStocks.current[i];
            if (s && onStockClick) onStockClick(s.symbol, s.name);
          }}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
          style={{
            padding: '8px 10px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            borderRight: i % 2 === 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            cursor: onStockClick ? 'pointer' : 'default',
            background: hovered === i ? 'rgba(255,255,255,0.04)' : 'transparent',
            transition: 'background 0.15s',
          }}>
          <CyclingStock stocks={stocks} startOffset={i} compact instanceId={i} onCurrentStock={(s) => handleCurrentStock(i, s)} />
        </div>
      ))}
    </div>
  );
}

// Inline news feed for fullscreen Bloomberg view
interface NewsItem { title: string; source: string; url: string; pubDate: string; }

function BloombergNewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  useEffect(() => {
    fetch('/api/news')
      .then(r => r.ok ? r.json() : [])
      .then(d => { if (Array.isArray(d)) setNews(d); })
      .catch(() => {});
  }, []);

  const timeAgo = (dateStr: string) => {
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const hours = Math.floor(diff / 3600000);
      if (hours < 1) return 'Now';
      if (hours < 24) return `${hours}h`;
      return `${Math.floor(hours / 24)}d`;
    } catch { return ''; }
  };

  const sourceColors: Record<string, string> = {
    'CBC': '#e03131', 'CBC News': '#e03131', 'BBC': '#da77f2', 'BBC News': '#da77f2',
    'CTV': '#51cf66', 'CTV News': '#51cf66', 'CP24': '#ff922b', 'Global News': '#4dabf7',
    'Reuters': '#ff922b', 'The Globe and Mail': '#ffd43b', 'Toronto Star': '#4dabf7',
  };
  const getColor = (s: string) => {
    if (sourceColors[s]) return sourceColors[s];
    for (const [k, c] of Object.entries(sourceColors)) { if (s.toLowerCase().includes(k.toLowerCase())) return c; }
    return '#74c0fc';
  };

  if (!news.length) return (
    <div style={{ padding: '8px 10px', color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontFamily: "'SF Mono', monospace" }}>
      Loading feed...
    </div>
  );

  return (
    <div style={{ padding: '0 10px' }}>
      <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', marginBottom: '6px', fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>
        TOP STORIES
      </div>
      {news.slice(0, 3).map((item, i) => (
        <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" style={{
          display: 'block', padding: '5px 4px', textDecoration: 'none', color: 'inherit',
          borderTop: i > 0 ? '0.5px solid rgba(255,255,255,0.06)' : 'none',
          transition: 'background 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
            <span style={{ color: getColor(item.source), fontSize: '10px', fontWeight: 600, fontFamily: "'SF Mono', monospace" }}>{item.source}</span>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontFamily: "'SF Mono', monospace" }}>{timeAgo(item.pubDate)}</span>
          </div>
          <div style={{
            fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.8)', lineHeight: 1.35,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
          }}>
            {item.title}
          </div>
        </a>
      ))}
    </div>
  );
}

// ── Widget 1: GitHub Contribution Heatmap ──
function GitHubHeatmap() {
  const [weeks, setWeeks] = useState<number[][]>([]);
  const [total, setTotal] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  useEffect(() => {
    fetch('/api/github-contributions')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.weeks) {
          setWeeks(d.weeks);
          setTotal(d.totalContributions);
          if (d.lastUpdated) setLastUpdated(d.lastUpdated);
        }
      })
      .catch(() => {});
  }, []);

  const getColor = (count: number) => {
    if (count === 0) return 'rgba(255,255,255,0.04)';
    if (count <= 1) return '#0e4429';
    if (count <= 3) return '#006d32';
    if (count <= 5) return '#26a641';
    return '#39d353';
  };

  if (!weeks.length) return null;
  const cellSize = 5;
  const gap = 1.5;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: '#fff', letterSpacing: '0.1em', fontFamily: "'SF Mono', monospace" }}>
          GITHUB
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '8px', color: 'rgba(255,255,255,0.85)', fontFamily: "'SF Mono', monospace" }}>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'livePulse 2s ease-in-out infinite' }} />
          LIVE
        </div>
      </div>
      <div style={{ overflowX: 'auto', overflowY: 'hidden', flex: 1, display: 'flex', alignItems: 'center' }}>
        <svg width={weeks.length * (cellSize + gap)} height={7 * (cellSize + gap)} style={{ display: 'block' }}>
          {weeks.map((week, wi) =>
            week.map((count, di) => (
              <rect
                key={`${wi}-${di}`}
                x={wi * (cellSize + gap)}
                y={di * (cellSize + gap)}
                width={cellSize}
                height={cellSize}
                rx={1}
                fill={getColor(count)}
              />
            ))
          )}
        </svg>
      </div>
      <div style={{ marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '9px', fontFamily: "'SF Mono', monospace" }}>
        <span style={{ color: '#fff' }}>{total} contributions</span>
        {lastUpdated && (
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>
            Last updated {new Date(lastUpdated + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Widget 2: Spotify Now Playing ──
function SpotifyWidget() {
  const [track, setTrack] = useState<{ isPlaying: boolean; title: string; artist: string; album: string; albumArt: string; progressMs: number; durationMs: number } | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetch('/api/spotify')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) { setTrack(d); setProgress(d.progressMs || 0); } })
      .catch(() => {});
  }, []);

  // Animate progress bar
  useEffect(() => {
    if (!track?.isPlaying) return;
    const id = setInterval(() => setProgress(p => Math.min(p + 1000, track.durationMs)), 1000);
    return () => clearInterval(id);
  }, [track]);

  const fmtTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  };

  if (!track) return (
    <div style={{ padding: '8px 10px' }}>
      <div style={{ fontSize: '10px', fontWeight: 700, color: '#fff', letterSpacing: '0.1em', marginBottom: '6px', fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>
        NOW PLAYING
      </div>
      <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', fontFamily: "'SF Mono', monospace" }}>Not connected</div>
    </div>
  );

  const pct = track.durationMs > 0 ? (progress / track.durationMs) * 100 : 0;

  return (
    <div style={{ padding: '8px 10px' }}>
      <div style={{ fontSize: '10px', fontWeight: 700, color: '#fff', letterSpacing: '0.1em', marginBottom: '6px', fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>
        {track.isPlaying ? 'NOW PLAYING' : 'RECENTLY PLAYED'}
      </div>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        {track.albumArt && (
          <img src={track.albumArt} alt="" style={{ width: 40, height: 40, borderRadius: 4, flexShrink: 0 }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>
            {track.title}
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {track.artist}
          </div>
          <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: '#1db954', borderRadius: 2, transition: 'width 1s linear' }} />
            </div>
            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontFamily: "'SF Mono', monospace", flexShrink: 0 }}>
              {fmtTime(progress)}/{fmtTime(track.durationMs)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Widget 3: Market Sector Heatmap ──
function SectorHeatmap() {
  const stocks = useStockData();
  if (!stocks.length) return null;

  const sectorData = SECTORS.map(sec => {
    const matched = stocks.filter(s => sec.symbols.includes(s.symbol));
    const avgPct = matched.length > 0 ? matched.reduce((a, s) => a + s.pct, 0) / matched.length : 0;
    return { ...sec, pct: avgPct, count: matched.length };
  });

  const maxAbs = Math.max(...sectorData.map(s => Math.abs(s.pct)), 1);

  const getHeatColor = (pct: number) => {
    const intensity = Math.min(Math.abs(pct) / maxAbs, 1);
    if (pct >= 0) {
      const r = Math.round(20 - intensity * 10);
      const g = Math.round(60 + intensity * 140);
      const b = Math.round(30 + intensity * 20);
      return `rgb(${r},${g},${b})`;
    } else {
      const r = Math.round(60 + intensity * 180);
      const g = Math.round(30 - intensity * 15);
      const b = Math.round(30 - intensity * 10);
      return `rgb(${r},${g},${b})`;
    }
  };

  return (
    <div style={{ padding: '8px 10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em', fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>
          SECTOR PERFORMANCE
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '8px', color: 'rgba(255,255,255,0.85)', fontFamily: "'SF Mono', monospace" }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'livePulse 2s ease-in-out infinite' }} />
          LIVE · {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
        {sectorData.map(sec => (
          <div key={sec.name} style={{
            flex: `${sec.count} 0 0`,
            minWidth: '48px',
            background: getHeatColor(sec.pct),
            borderRadius: 4,
            padding: '6px 6px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.5)', fontFamily: "'SF Mono', monospace" }}>
              {sec.name}
            </div>
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.9)', fontFamily: "'SF Mono', monospace" }}>
              {sec.pct >= 0 ? '+' : ''}{sec.pct.toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Now Playing (Spotify) ──
function NowPlaying() {
  const [track, setTrack] = useState<{ isPlaying: boolean; title: string; artist: string; album: string; albumArt: string; progressMs: number; durationMs: number } | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchTrack = () => {
      fetch('/api/spotify')
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d) { setTrack(d); setProgress(d.progressMs || 0); } })
        .catch(() => {});
    };
    fetchTrack();
    const id = setInterval(fetchTrack, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!track?.isPlaying) return;
    const id = setInterval(() => setProgress(p => Math.min(p + 1000, track.durationMs)), 1000);
    return () => clearInterval(id);
  }, [track]);

  const fmtTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  };

  if (!track) return null;

  const pct = track.durationMs > 0 ? (progress / track.durationMs) * 100 : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ color: '#fff', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '8px', fontFamily: "'SF Mono', monospace" }}>
        {track.isPlaying ? '♫ NOW PLAYING' : '♫ RECENTLY PLAYED'}
      </div>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1 }}>
        {track.albumArt && (
          <img src={track.albumArt} alt="" style={{ width: 48, height: 48, borderRadius: 6, flexShrink: 0 }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>
            {track.title}
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: "'SF Mono', monospace" }}>
            {track.artist}
          </div>
          <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 1, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: '#1DB954', borderRadius: 1, transition: 'width 1s linear' }} />
            </div>
            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontFamily: "'SF Mono', monospace", flexShrink: 0 }}>
              {fmtTime(progress)} / {fmtTime(track.durationMs)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sector Treemap (finviz style) ──
function SectorTreemap() {
  const stocks = useStockData();
  if (!stocks.length) return null;

  // Build flat list of individual stocks with sector info
  const items = SECTORS.flatMap(sec =>
    sec.symbols.map(sym => {
      const stock = stocks.find(s => s.symbol === sym);
      return stock ? { symbol: stock.symbol, name: stock.name, pct: stock.pct, sector: sec.name, weight: Math.max(Math.abs(stock.pct), 0.3) } : null;
    }).filter(Boolean) as { symbol: string; name: string; pct: number; sector: string; weight: number }[]
  );

  const totalWeight = items.reduce((a, b) => a + b.weight, 0);
  const maxAbs = Math.max(...items.map(i => Math.abs(i.pct)), 1);

  const getColor = (pct: number) => {
    const intensity = Math.min(Math.abs(pct) / maxAbs, 1);
    if (pct >= 0) return `rgba(34, ${Math.round(120 + intensity * 77)}, ${Math.round(50 + intensity * 30)}, ${0.6 + intensity * 0.4})`;
    return `rgba(${Math.round(180 + intensity * 68)}, ${Math.round(40 - intensity * 20)}, ${Math.round(40 - intensity * 15)}, ${0.6 + intensity * 0.4})`;
  };

  // Simple treemap: arrange in rows
  const W = 100; // percentage width
  const rows: { items: typeof items; y: number; h: number }[] = [];
  let remaining = [...items].sort((a, b) => b.weight - a.weight);
  let yPos = 0;

  while (remaining.length > 0) {
    const rowItems: typeof items = [];
    let rowWeight = 0;
    const targetRowWeight = totalWeight / 4; // ~4 rows
    while (remaining.length > 0 && (rowWeight < targetRowWeight || rowItems.length === 0)) {
      rowItems.push(remaining.shift()!);
      rowWeight += rowItems[rowItems.length - 1].weight;
    }
    const rowH = (rowWeight / totalWeight) * 100;
    rows.push({ items: rowItems, y: yPos, h: rowH });
    yPos += rowH;
  }

  return (
    <div style={{ padding: '8px 10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em', fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>
          MARKET TREEMAP
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '8px', color: 'rgba(255,255,255,0.85)', fontFamily: "'SF Mono', monospace" }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'livePulse 2s ease-in-out infinite' }} />
          LIVE
        </div>
      </div>
      <div style={{ position: 'relative', width: '100%', height: '120px', borderRadius: 4, overflow: 'hidden' }}>
        {rows.map((row, ri) => {
          const rowWeight = row.items.reduce((a, b) => a + b.weight, 0);
          let xPos = 0;
          return row.items.map((item, ii) => {
            const w = (item.weight / rowWeight) * W;
            const x = xPos;
            xPos += w;
            return (
              <div key={item.symbol} style={{
                position: 'absolute',
                left: `${x}%`, top: `${row.y}%`,
                width: `${w}%`, height: `${row.h}%`,
                background: getColor(item.pct),
                border: '0.5px solid rgba(0,0,0,0.3)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', cursor: 'default',
              }}>
                <div style={{ fontSize: w > 12 ? '8px' : '6px', fontWeight: 700, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.6)', fontFamily: "'SF Mono', monospace", lineHeight: 1.2 }}>
                  {item.symbol}
                </div>
                {w > 8 && (
                  <div style={{ fontSize: '7px', fontWeight: 600, color: 'rgba(255,255,255,0.9)', fontFamily: "'SF Mono', monospace" }}>
                    {item.pct >= 0 ? '+' : ''}{item.pct.toFixed(1)}%
                  </div>
                )}
              </div>
            );
          });
        })}
      </div>
    </div>
  );
}

// ── Sector Bubbles ──
function SectorBubbles() {
  const stocks = useStockData();
  if (!stocks.length) return null;

  const sectorData = SECTORS.map(sec => {
    const matched = stocks.filter(s => sec.symbols.includes(s.symbol));
    const avgPct = matched.length > 0 ? matched.reduce((a, s) => a + s.pct, 0) / matched.length : 0;
    return { name: sec.name, pct: avgPct, count: matched.length };
  });

  const maxAbs = Math.max(...sectorData.map(s => Math.abs(s.pct)), 1);
  const W = 320, H = 90;

  // Position bubbles in a packed layout
  const bubbles = sectorData.map((sec, i) => {
    const r = 12 + (sec.count / 11) * 20;
    const angle = (i / sectorData.length) * Math.PI * 2 - Math.PI / 2;
    const spread = 0.6;
    return {
      ...sec,
      r,
      cx: W / 2 + Math.cos(angle) * (W * spread * 0.35),
      cy: H / 2 + Math.sin(angle) * (H * spread * 0.35),
    };
  });

  const getColor = (pct: number) => {
    const intensity = Math.min(Math.abs(pct) / maxAbs, 1);
    if (pct >= 0) return `rgba(34, ${Math.round(140 + intensity * 57)}, ${Math.round(60 + intensity * 20)}, ${0.7 + intensity * 0.3})`;
    return `rgba(${Math.round(200 + intensity * 48)}, ${Math.round(50 - intensity * 25)}, ${Math.round(50 - intensity * 20)}, ${0.7 + intensity * 0.3})`;
  };

  return (
    <div style={{ padding: '8px 10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em', fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>
          SECTOR BUBBLES
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '8px', color: 'rgba(255,255,255,0.85)', fontFamily: "'SF Mono', monospace" }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'livePulse 2s ease-in-out infinite' }} />
          LIVE
        </div>
      </div>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        {bubbles.map(b => (
          <g key={b.name}>
            <circle cx={b.cx} cy={b.cy} r={b.r} fill={getColor(b.pct)} stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
            <text x={b.cx} y={b.cy - 3} textAnchor="middle" fill="#fff" fontSize="7" fontWeight="700" fontFamily="'SF Mono', monospace" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
              {b.name}
            </text>
            <text x={b.cx} y={b.cy + 7} textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="7" fontWeight="600" fontFamily="'SF Mono', monospace">
              {b.pct >= 0 ? '+' : ''}{b.pct.toFixed(1)}%
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ── Market Clock (fills empty grid slot next to Energy) ──
function MarketClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // NYSE hours: 9:30 AM - 4:00 PM ET, Mon-Fri
  const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const day = et.getDay(); // 0=Sun, 6=Sat
  const hrs = et.getHours();
  const mins = et.getMinutes();
  const secs = et.getSeconds();
  const totalMins = hrs * 60 + mins;
  const openMin = 9 * 60 + 30; // 9:30 AM
  const closeMin = 16 * 60;     // 4:00 PM
  const isWeekday = day >= 1 && day <= 5;
  const isOpen = isWeekday && totalMins >= openMin && totalMins < closeMin;

  // Calculate countdown
  let targetLabel = '';
  let countdown = '';
  if (isOpen) {
    // Market is open — count down to close
    targetLabel = 'MARKET CLOSES IN';
    const remaining = (closeMin - totalMins) * 60 - secs;
    const h = Math.floor(remaining / 3600);
    const m = Math.floor((remaining % 3600) / 60);
    const s = remaining % 60;
    countdown = `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  } else {
    // Market is closed — count down to next open
    targetLabel = 'MARKET OPENS IN';
    let nextOpen = new Date(et);
    if (isWeekday && totalMins < openMin) {
      // Today before open
      nextOpen.setHours(9, 30, 0, 0);
    } else {
      // After close or weekend — find next weekday
      nextOpen.setDate(nextOpen.getDate() + 1);
      while (nextOpen.getDay() === 0 || nextOpen.getDay() === 6) {
        nextOpen.setDate(nextOpen.getDate() + 1);
      }
      nextOpen.setHours(9, 30, 0, 0);
    }
    const diff = Math.max(0, Math.floor((nextOpen.getTime() - et.getTime()) / 1000));
    const dh = Math.floor(diff / 3600);
    const dm = Math.floor((diff % 3600) / 60);
    const ds = diff % 60;
    if (dh >= 24) {
      const dd = Math.floor(dh / 24);
      const rh = dh % 24;
      countdown = `${dd}d ${rh}h ${dm.toString().padStart(2, '0')}m`;
    } else {
      countdown = `${dh}:${dm.toString().padStart(2, '0')}:${ds.toString().padStart(2, '0')}`;
    }
  }

  return (
    <div style={{
      padding: '6px 8px',
      background: 'rgba(255,255,255,0.04)', borderRadius: 5, border: '0.5px solid rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: isOpen ? '#4ade80' : '#f87171', display: 'inline-block', animation: 'livePulse 2s ease-in-out infinite' }} />
        <span style={{ fontSize: '9px', fontWeight: 700, color: isOpen ? '#4ade80' : '#f87171', fontFamily: "'SF Mono', monospace", letterSpacing: '0.05em' }}>
          {isOpen ? 'MARKET OPEN' : 'MARKET CLOSED'}
        </span>
      </div>
      <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.1em', fontFamily: "'SF Mono', monospace", marginBottom: '4px' }}>
        {targetLabel}
      </div>
      <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff', fontFamily: "'SF Mono', monospace", fontVariantNumeric: 'tabular-nums', letterSpacing: '0.5px' }}>
        {countdown}
      </div>
      <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', fontFamily: "'SF Mono', monospace", marginTop: '4px' }}>
        NYSE · {et.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/New_York' })} ET
      </div>
    </div>
  );
}

// ── Mountain Climber Interactive ──
// Side-view mountain in the triangular whitespace of the left panel.
// Fixed 200x300 viewBox so proportions stay consistent regardless of container size.
const CLIMB_START = 0.08; // man starts near the bottom of the mountain, around email level
function MountainClimber() {
  const [progress, setProgress] = useState(CLIMB_START);
  const [celebrating, setCelebrating] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [hintVisible, setHintVisible] = useState(true);
  const [typedChars, setTypedChars] = useState(0);
  const keysDown = useRef<Set<string>>(new Set());
  const rafRef = useRef<number>();
  const fullMessage = 'YOU\nJUST\nNEED TO\nKEEP ON\nPUSHING';

  // Fixed coordinate system — 240x400 ensures consistent proportions
  const W = 240;
  const H = 400;

  // Ridge points — gentle rolling hill with subtle S-curves
  const ridgePts: [number, number][] = [
    [8, H],        // flush with bottom edge
    [18, 378],
    [30, 358],
    [42, 342],     // gentle start
    [54, 330],
    [66, 320],
    [76, 314],     // slight plateau
    [86, 310],
    [96, 304],
    [106, 294],    // picks up again
    [116, 280],
    [126, 264],
    [134, 250],    // mid-slope
    [142, 238],
    [150, 224],
    [158, 208],
    [166, 190],    // steeper push
    [174, 170],
    [182, 148],
    [188, 130],    // approaching summit
    [194, 114],
    [200, 100],
    [206, 88],
    [212, 78],     // summit
  ];

  // Smooth ridge path with quadratic bezier curves
  const ridgePath = (() => {
    const pts = ridgePts;
    let d = `M ${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const midX = (pts[i][0] + pts[i + 1][0]) / 2;
      const midY = (pts[i][1] + pts[i + 1][1]) / 2;
      d += ` Q ${pts[i][0]},${pts[i][1]} ${midX},${midY}`;
    }
    const last = pts[pts.length - 1];
    d += ` L ${last[0]},${last[1]}`;
    return d;
  })();

  // Terrain fill: ridge → right edge → bottom → close
  const terrainPath = `${ridgePath} L ${W},${ridgePts[ridgePts.length - 1][1]} L ${W},${H} L ${ridgePts[0][0]},${H} Z`;

  // Get position along the climb path
  const getPositionOnRidge = useCallback((t: number) => {
    const pts = ridgePts;
    let totalLen = 0;
    for (let i = 1; i < pts.length; i++) {
      const dx = pts[i][0] - pts[i-1][0]; const dy = pts[i][1] - pts[i-1][1];
      totalLen += Math.sqrt(dx*dx + dy*dy);
    }
    const targetLen = t * totalLen;
    let traveled = 0;
    for (let i = 1; i < pts.length; i++) {
      const dx = pts[i][0] - pts[i-1][0]; const dy = pts[i][1] - pts[i-1][1];
      const segLen = Math.sqrt(dx*dx + dy*dy);
      if (traveled + segLen >= targetLen) {
        const frac = segLen > 0 ? (targetLen - traveled) / segLen : 0;
        return {
          x: pts[i-1][0] + dx * frac,
          y: pts[i-1][1] + dy * frac,
          // Slope angle for tilting figure
          angle: Math.atan2(-dy, dx),
        };
      }
      traveled += segLen;
    }
    const last = pts[pts.length - 1];
    return { x: last[0], y: last[1], angle: -Math.PI / 4 };
  }, []);

  // Keyboard
  useEffect(() => {
    if (celebrating) return;
    const down = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { keysDown.current.add(e.key); setHintVisible(false); }
    };
    const up = (e: KeyboardEvent) => { keysDown.current.delete(e.key); };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [celebrating]);

  // Animation loop
  useEffect(() => {
    if (celebrating) return;
    let lastTime = 0;
    const speed = 0.1;
    const tick = (time: number) => {
      if (lastTime) {
        const dt = (time - lastTime) / 1000;
        if (keysDown.current.size > 0) {
          setProgress(prev => {
            const next = Math.min(prev + speed * dt, 1);
            if (next >= 1) { setCelebrating(true); setTimeout(() => setShowMessage(true), 800); }
            return next;
          });
        } else {
          setProgress(prev => Math.max(prev - speed * 0.08 * dt, CLIMB_START));
        }
      }
      lastTime = time;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [celebrating]);

  // Typewriter effect for "JUST KEEP PUSHING"
  useEffect(() => {
    if (!showMessage) return;
    setTypedChars(0);
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setTypedChars(i);
      if (i >= fullMessage.length) clearInterval(timer);
    }, 80);
    return () => clearInterval(timer);
  }, [showMessage]);

  const pos = getPositionOnRidge(progress);
  const sphereR = 6;
  const summit = ridgePts[ridgePts.length - 1];

  const particles = celebrating ? Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    const r = 20 + Math.random() * 15;
    return { x: pos.x + Math.cos(a) * r, y: pos.y + Math.sin(a) * r, delay: i * 0.05, color: ['#fbbf24', '#fff', '#4ade80', '#f472b6'][i % 4] };
  }) : [];

  return (
    <div
      style={{
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: '65%',
        height: '75%',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMaxYMax meet">
        <defs>
          <radialGradient id="sphereGlow">
            <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.2)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          <linearGradient id="mtnFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.015)" />
          </linearGradient>
          <filter id="sphereBlur"><feGaussianBlur stdDeviation="4" /></filter>
          <filter id="celebGlow"><feGaussianBlur stdDeviation="3" /></filter>
          <clipPath id="mtnClip">
            <path d={terrainPath} />
          </clipPath>
        </defs>

        {/* Mountain body fill */}
        <path d={terrainPath} fill="url(#mtnFill)" />

        {/* Subtle terrain texture lines */}
        <line x1="60" y1="340" x2="160" y2="340" stroke="rgba(255,255,255,0.025)" strokeWidth="0.5" />
        <line x1="80" y1="290" x2="180" y2="290" stroke="rgba(255,255,255,0.025)" strokeWidth="0.5" />
        <line x1="110" y1="230" x2="200" y2="230" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
        <line x1="140" y1="170" x2="220" y2="170" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
        <line x1="170" y1="110" x2="230" y2="110" stroke="rgba(255,255,255,0.015)" strokeWidth="0.5" />

        {/* Mountain ridge line */}
        <path d={ridgePath} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Flag at summit — red until reached, then green */}
        <g transform={`translate(${summit[0]}, ${summit[1]})`}>
          <line x1="0" y1="0" x2="0" y2="-16" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
          <polygon points="0,-16 10,-12.5 0,-9" fill={celebrating ? '#4ade80' : '#ef4444'} stroke={celebrating ? '#22c55e' : '#dc2626'} strokeWidth="0.5" opacity={0.85} />
        </g>

        {/* Glowing sphere — ON TOP of the ridge */}
        {!celebrating && (
          <>
            <circle cx={pos.x + 6} cy={pos.y - sphereR - 6} r={sphereR + 8} fill="url(#sphereGlow)" filter="url(#sphereBlur)" opacity={0.6} />
            <circle cx={pos.x + 6} cy={pos.y - sphereR - 6} r={sphereR} fill="rgba(255,255,255,0.95)" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8">
              <animate attributeName="r" values={`${sphereR};${sphereR + 1};${sphereR}`} dur="2s" repeatCount="indefinite" />
            </circle>
          </>
        )}

        {/* Stick figure */}
        {(() => {
          const step = Math.sin(progress * Math.PI * 20);
          const isMoving = keysDown.current.size > 0;
          const legSpread = isMoving ? step * 4 : 0;
          // Position figure ON the ridge (feet on the surface)
          const fx = pos.x;
          const fy = pos.y;

          if (celebrating) {
            // Standing upright to the RIGHT of the flag — feet ON the ridge
            const sx = summit[0] + 14;
            const sy = summit[1] - 10; // offset up so feet (at +10) land on ridge
            return (
              <g transform={`translate(${sx}, ${sy})`} opacity="0.9">
                {/* Legs — standing */}
                <line x1="-2" y1="0" x2="-3" y2="10" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="2" y1="0" x2="3" y2="10" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
                {/* Body — upright */}
                <line x1="0" y1="0" x2="0" y2="-12" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
                {/* Head */}
                <circle cx="0" cy="-15" r="2.5" fill="none" stroke="#fff" strokeWidth="1" />
                {/* Arms — raised in victory */}
                <line x1="0" y1="-9" x2="-7" y2="-16" stroke="#fff" strokeWidth="1" strokeLinecap="round" />
                <line x1="0" y1="-9" x2="7" y2="-16" stroke="#fff" strokeWidth="1" strokeLinecap="round" />
              </g>
            );
          }

          return (
            <g transform={`translate(${fx - 14}, ${fy - 8})`} opacity="0.8">
              {/* Legs — stepping animation, feet touch the ridge surface */}
              <line x1="0" y1="0" x2={3 + legSpread} y2="8" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="0" y1="0" x2={3 - legSpread} y2="8" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
              {/* Body — leaning forward to push */}
              <line x1="0" y1="0" x2="8" y2="-10" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
              {/* Head */}
              <circle cx="9.5" cy="-12.5" r="2.5" fill="none" stroke="#fff" strokeWidth="1" />
              {/* Arms — reaching forward to push the ball */}
              <line x1="5" y1="-6" x2="13" y2="-7" stroke="#fff" strokeWidth="1" strokeLinecap="round" />
              <line x1="5" y1="-7" x2="13" y2="-5" stroke="#fff" strokeWidth="1" strokeLinecap="round" />
            </g>
          );
        })()}

        {/* Celebration particles */}
        {particles.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill={p.color} opacity={showMessage ? 0 : 1} filter="url(#celebGlow)">
            <animate attributeName="r" from="0" to="4" dur="0.6s" begin={`${p.delay}s`} fill="freeze" />
            <animate attributeName="opacity" from="1" to="0" dur="1.2s" begin={`${p.delay + 0.3}s`} fill="freeze" />
          </circle>
        ))}

        {/* "YOU JUST NEED TO KEEP ON PUSHING" — text fills mountain shape, clipped to terrain */}
        {showMessage && (() => {
          // Text fills the mountain shape — each word sized to fit its horizontal band
          const words = ['YOU', 'JUST', 'NEED TO', 'KEEP ON', 'PUSHING'];
          const bandCount = words.length;
          const topY = 78;   // summit Y
          const botY = H;    // base Y
          const bandH = (botY - topY) / bandCount;

          // Helper: find the ridge X at a given Y (left edge of mountain at that height)
          const getRidgeXAtY = (y: number) => {
            for (let i = 1; i < ridgePts.length; i++) {
              const [x0, y0] = ridgePts[i - 1];
              const [x1, y1] = ridgePts[i];
              if ((y0 <= y && y <= y1) || (y1 <= y && y <= y0)) {
                const t = y0 === y1 ? 0 : (y - y0) / (y1 - y0);
                return x0 + t * (x1 - x0);
              }
            }
            return ridgePts[0][0];
          };

          return (
            <g clipPath="url(#mtnClip)">
              {words.map((word, wi) => {
                const charsBeforeThisWord = words.slice(0, wi).reduce((s, w) => s + w.length + 1, 0);
                const charsAvailable = Math.max(0, typedChars - charsBeforeThisWord);
                const visiblePart = word.slice(0, charsAvailable);
                if (charsAvailable <= 0) return null;
                const bandMidY = topY + (wi + 0.55) * bandH;
                const fontSize = bandH * 0.78;
                // Left edge of mountain at this Y
                const leftX = getRidgeXAtY(bandMidY) + 4;
                const rightX = W - 2;
                const availWidth = rightX - leftX;
                return (
                  <text
                    key={wi}
                    x={leftX}
                    y={bandMidY + fontSize * 0.32}
                    textAnchor="start"
                    textLength={availWidth}
                    lengthAdjust="spacingAndGlyphs"
                    style={{
                      fontSize: `${fontSize}px`,
                      fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                      fontWeight: 900,
                      fontStyle: 'italic',
                      fill: 'rgba(255,255,255,0.15)',
                    }}
                  >
                    {visiblePart}
                  </text>
                );
              })}
            </g>
          );
        })()}
      </svg>

      {/* Hint — glowing text in bottom right */}
      {hintVisible && !celebrating && (
        <div style={{
          position: 'absolute', bottom: '8px', right: '8px',
          fontSize: '10px', fontFamily: "'SF Mono', monospace",
          color: 'rgba(255,255,255,0.5)',
          animation: 'cornerPulse 2.5s ease-in-out infinite',
          pointerEvents: 'none', textAlign: 'right',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
            hold
            <span style={{ border: '1px solid rgba(255,255,255,0.4)', borderRadius: 3, padding: '1px 5px', fontSize: '9px', background: 'rgba(255,255,255,0.06)' }}>↑</span>
            or
            <span style={{ border: '1px solid rgba(255,255,255,0.4)', borderRadius: 3, padding: '1px 5px', fontSize: '9px', background: 'rgba(255,255,255,0.06)' }}>→</span>
            to push
          </span>
        </div>
      )}

      {/* Reset button — appears after celebration */}
      {celebrating && (
        <div
          onClick={() => {
            setCelebrating(false);
            setShowMessage(false);
            setTypedChars(0);
            setProgress(CLIMB_START);
            setHintVisible(true);
          }}
          style={{
            position: 'absolute', bottom: '8px', right: '8px',
            cursor: 'pointer', pointerEvents: 'auto',
            width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.05)',
            color: 'rgba(255,255,255,0.4)', fontSize: '11px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
          title="Reset climb"
        >
          ↻
        </div>
      )}
    </div>
  );
}

// ── Sector Sparklines ──
function AnimatedSparkline({ history, color, delay, sparkW, sparkH, animReady, idx }: {
  history: number[]; color: string; delay: number; sparkW: number; sparkH: number; animReady: boolean; idx: number;
}) {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>();

  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = max - min || 1;

  useEffect(() => {
    if (!animReady || history.length === 0) return;

    const timeout = setTimeout(() => {
      let frame = 0;
      const totalPoints = history.length;
      const framesPerPoint = Math.max(1, Math.round(72 / totalPoints));
      let subFrame = 0;

      const loop = () => {
        subFrame++;
        if (subFrame >= framesPerPoint) {
          subFrame = 0;
          frame++;
          setProgress(frame);
        }
        if (frame < totalPoints) {
          rafRef.current = requestAnimationFrame(loop);
        }
      };
      rafRef.current = requestAnimationFrame(loop);
    }, delay * 1000);

    return () => {
      clearTimeout(timeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [animReady]);

  const visCount = Math.min(progress, history.length);
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < visCount; i++) {
    pts.push({
      x: (i / (history.length - 1)) * sparkW,
      y: sparkH - ((history[i] - min) / range) * (sparkH - 4) - 2,
    });
  }

  const linePath = pts.length > 1
    ? pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
    : '';
  const lastPt = pts[pts.length - 1];
  const firstPt = pts[0];
  const gradId = `sector-grad-${idx}`;
  const glowId = `sector-glow-${idx}`;

  return (
    <svg width="100%" height={sparkH} viewBox={`0 0 ${sparkW} ${sparkH}`} preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.12" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {linePath && firstPt && lastPt && (
        <>
          <path d={linePath + ` L${lastPt.x.toFixed(1)},${sparkH} L${firstPt.x.toFixed(1)},${sparkH} Z`} fill={`url(#${gradId})`} />
          <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={lastPt.x} cy={lastPt.y} r={3} fill={color} filter={`url(#${glowId})`}>
            <animate attributeName="r" values="2;4;2" dur="1.2s" repeatCount="indefinite" />
          </circle>
        </>
      )}
    </svg>
  );
}

function SectorSparklines({ onSectorClick }: { onSectorClick?: (name: string) => void } = {}) {
  const stocks = useStockData();
  const [animReady, setAnimReady] = useState(false);

  useEffect(() => {
    if (stocks.length > 0) {
      const t = setTimeout(() => setAnimReady(true), 100);
      return () => clearTimeout(t);
    }
  }, [stocks.length]);

  if (!stocks.length) return null;

  const sectorData = SECTORS.map(sec => {
    const matched = stocks.filter(s => sec.symbols.includes(s.symbol));
    const avgPct = matched.length > 0 ? matched.reduce((a, s) => a + s.pct, 0) / matched.length : 0;
    const maxLen = Math.max(...matched.map(s => s.history.length), 0);
    const avgHistory: number[] = [];
    for (let i = 0; i < maxLen; i++) {
      // Normalize each stock to % change from its start price so BTC doesn't dominate
      const pctChanges = matched.map(s => {
        if (s.history[i] == null || !s.history[0]) return null;
        return ((s.history[i] - s.history[0]) / s.history[0]) * 100;
      }).filter((v): v is number => v != null);
      avgHistory.push(pctChanges.length > 0 ? pctChanges.reduce((a, b) => a + b, 0) / pctChanges.length : 0);
    }
    return { name: sec.name, pct: avgPct, history: avgHistory, count: matched.length };
  });

  const sparkW = 200, sparkH = 40;

  return (
    <div style={{ padding: '10px 12px' }}>
      <style>{`
        @keyframes sparkFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: '#fff', letterSpacing: '0.1em', fontFamily: "'SF Mono', monospace" }}>
          SECTOR PERFORMANCE
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '8px', color: 'rgba(255,255,255,0.85)', fontFamily: "'SF Mono', monospace" }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'livePulse 2s ease-in-out infinite' }} />
          LIVE · {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
        {sectorData.map((sec, idx) => {
          const color = sec.pct >= 0 ? '#4ade80' : '#f87171';
          const delay = idx * 0.12;
          return (
            <div key={sec.name}
              onClick={(e) => { e.stopPropagation(); onSectorClick?.(sec.name); }}
              style={{
              padding: '6px 8px',
              background: 'rgba(255,255,255,0.04)', borderRadius: 5, border: '0.5px solid rgba(255,255,255,0.06)',
              opacity: animReady ? 1 : 0, animation: animReady ? `sparkFadeIn 0.4s ${delay}s ease-out both` : 'none',
              cursor: onSectorClick ? 'pointer' : 'default',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (onSectorClick) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={e => { if (onSectorClick) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                <span style={{ fontSize: '9px', fontWeight: 700, color: '#fff', fontFamily: "'SF Mono', monospace" }}>{sec.name}</span>
                <span style={{ fontSize: '10px', fontWeight: 700, color, fontFamily: "'SF Mono', monospace" }}>
                  {sec.pct >= 0 ? '+' : ''}{sec.pct.toFixed(2)}%
                </span>
              </div>
              <AnimatedSparkline
                history={sec.history}
                color={color}
                delay={delay}
                sparkW={sparkW}
                sparkH={sparkH}
                animReady={animReady}
                idx={idx}
              />
            </div>
          );
        })}
        {/* Market Clock — fills the empty 8th grid slot */}
        <MarketClock />
      </div>
    </div>
  );
}

// ── Drill-Down Components ──

function BloombergBackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer',
        fontSize: '10px', fontWeight: 700, fontFamily: "'SF Mono', monospace",
        letterSpacing: '0.05em', padding: '4px 0', display: 'flex', alignItems: 'center', gap: '4px',
      }}
      onMouseEnter={e => (e.currentTarget.style.color = '#60a5fa')}
      onMouseLeave={e => (e.currentTarget.style.color = '#3b82f6')}
    >
      ← BACK TO DASHBOARD
    </button>
  );
}

// ── Middle Panel: Site Guide + Tech Stack + Stats + Certs ──

const SITE_GUIDE = [
  { label: 'Experience', desc: 'Work history & internships', cmd: 'npm run experience', icon: '💼' },
  { label: 'Education', desc: 'Academic background & coursework', cmd: 'git log --education', icon: '🎓' },
  { label: 'Projects', desc: 'Side projects & builds', cmd: 'brew install projects', icon: '🔨' },
  { label: 'Notes', desc: 'Blog posts & thoughts', cmd: 'cat mythoughts.md', icon: '📝' },
  { label: 'Research', desc: 'Case studies & deep dives', cmd: 'cd deepresearch', icon: '📚' },
  { label: 'Calendar', desc: 'Book a meeting with me', cmd: 'open calendar.app', icon: '📅' },
];

// Category color themes — one gradient color per category
const CATEGORY_THEME: Record<string, { color: string; rgb: string }> = {
  Languages:  { color: '#5B9BD5', rgb: '91,155,213' },
  Frameworks: { color: '#4ECB71', rgb: '78,203,113' },
  Tools:      { color: '#FF9F43', rgb: '255,159,67' },
};
const TECH_STACK = [
  { category: 'Languages', items: ['TypeScript', 'Python', 'Java', 'C++', 'SQL', 'Go'] },
  { category: 'Frameworks', items: ['React', 'Next.js', 'Node.js', 'Astro', 'FastAPI', 'Spring'] },
  { category: 'Tools', items: ['AWS', 'Docker', 'PostgreSQL', 'Redis', 'Git', 'Linux'] },
];

const GOOGLE_COLORS = ['#4285F4', '#EA4335', '#FBBC04', '#34A853', '#4285F4', '#EA4335', '#FBBC04', '#34A853', '#4285F4', '#EA4335', '#FBBC04', '#34A853'];
// Wharton: "Wharton" in blue, " Online" in white
const WHARTON_COLORS = ['#4A7EC1','#4A7EC1','#4A7EC1','#4A7EC1','#4A7EC1','#4A7EC1','#4A7EC1','#fff','#fff','#fff','#fff','#fff','#fff','#fff'];
// Amazon: 3 yellow, 3 white, space white, "Web" all yellow, space white, "Ser" white, "vic" yellow, "es" white
const AMAZON_COLORS = ['#FF9900','#FF9900','#FF9900','#fff','#fff','#fff','#fff','#FF9900','#FF9900','#FF9900','#fff','#fff','#fff','#fff','#FF9900','#FF9900','#FF9900','#fff','#fff'];

function BrandText({ text, colors }: { text: string; colors: string[] }) {
  return <>{text.split('').map((ch, i) => <span key={i} style={{ color: colors[i % colors.length] }}>{ch}</span>)}</>;
}

const CERTIFICATIONS = [
  { name: 'Machine Learning for Trading Specialization', issuer: 'Google Cloud', status: '', issuerColors: GOOGLE_COLORS },
  { name: 'Finance & Quantitative Modeling for Analysts', issuer: 'Wharton Online', status: '', issuerColors: WHARTON_COLORS },
  { name: 'AWS Cloud Practitioner', issuer: 'Amazon Web Services', status: 'In Progress', issuerColors: AMAZON_COLORS },
];

const sectionLabel: React.CSSProperties = {
  color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: 700,
  letterSpacing: '0.1em', marginBottom: '8px', fontFamily: "'SF Mono', monospace",
};

// ── Chronograph Clock ──
function ChronographClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours() % 12;
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const r = 78; // main dial radius

  // Angles (12 o'clock = -90deg)
  const secAngle = (seconds / 60) * 360 - 90;
  const minAngle = (minutes / 60) * 360 + (seconds / 60) * 6 - 90;
  const hrAngle = (hours / 12) * 360 + (minutes / 60) * 30 - 90;

  const hand = (angle: number, len: number, w: number, color: string) => {
    const rad = (angle * Math.PI) / 180;
    return (
      <line
        x1={cx} y1={cy}
        x2={cx + Math.cos(rad) * len}
        y2={cy + Math.sin(rad) * len}
        stroke={color} strokeWidth={w} strokeLinecap="round"
      />
    );
  };

  // Sub-dial: running seconds (small circle at bottom)
  const subR = 18;
  const subCx = cx;
  const subCy = cy + 32;
  const subSecAngle = (seconds / 60) * 360 - 90;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Outer ring */}
        <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />

        {/* Hour markers */}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = ((i / 12) * 360 - 90) * Math.PI / 180;
          const isMain = i % 3 === 0;
          const inner = isMain ? r - 12 : r - 8;
          const outer = r - 2;
          return (
            <line
              key={i}
              x1={cx + Math.cos(angle) * inner} y1={cy + Math.sin(angle) * inner}
              x2={cx + Math.cos(angle) * outer} y2={cy + Math.sin(angle) * outer}
              stroke={isMain ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)'}
              strokeWidth={isMain ? 1.5 : 0.8}
              strokeLinecap="round"
            />
          );
        })}

        {/* Minute tick marks */}
        {Array.from({ length: 60 }, (_, i) => {
          if (i % 5 === 0) return null;
          const angle = ((i / 60) * 360 - 90) * Math.PI / 180;
          return (
            <line
              key={`m${i}`}
              x1={cx + Math.cos(angle) * (r - 4)} y1={cy + Math.sin(angle) * (r - 4)}
              x2={cx + Math.cos(angle) * (r - 2)} y2={cy + Math.sin(angle) * (r - 2)}
              stroke="rgba(255,255,255,0.08)" strokeWidth="0.5"
            />
          );
        })}

        {/* Sub-dial ring (running seconds) */}
        <circle cx={subCx} cy={subCy} r={subR} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
        {/* Sub-dial ticks */}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = ((i / 12) * 360 - 90) * Math.PI / 180;
          return (
            <line
              key={`s${i}`}
              x1={subCx + Math.cos(angle) * (subR - 3)} y1={subCy + Math.sin(angle) * (subR - 3)}
              x2={subCx + Math.cos(angle) * (subR - 1)} y2={subCy + Math.sin(angle) * (subR - 1)}
              stroke="rgba(255,255,255,0.15)" strokeWidth="0.4"
            />
          );
        })}
        {/* Sub-dial hand */}
        {(() => {
          const rad = (subSecAngle * Math.PI) / 180;
          return (
            <line
              x1={subCx} y1={subCy}
              x2={subCx + Math.cos(rad) * (subR - 4)}
              y2={subCy + Math.sin(rad) * (subR - 4)}
              stroke="rgba(255,255,255,0.5)" strokeWidth="0.6" strokeLinecap="round"
            />
          );
        })()}

        {/* Hour hand */}
        {hand(hrAngle, 40, 2.2, 'rgba(255,255,255,0.75)')}
        {/* Minute hand */}
        {hand(minAngle, 58, 1.5, 'rgba(255,255,255,0.6)')}
        {/* Second hand */}
        {hand(secAngle, 65, 0.6, 'rgba(255,255,255,0.35)')}
        {/* Second hand tail */}
        {(() => {
          const rad = ((secAngle + 180) * Math.PI) / 180;
          return (
            <line
              x1={cx} y1={cy}
              x2={cx + Math.cos(rad) * 14}
              y2={cy + Math.sin(rad) * 14}
              stroke="rgba(255,255,255,0.35)" strokeWidth="0.6" strokeLinecap="round"
            />
          );
        })()}

        {/* Center dot */}
        <circle cx={cx} cy={cy} r="2.5" fill="rgba(255,255,255,0.5)" />
        <circle cx={cx} cy={cy} r="1" fill="#1a1a2e" />

        {/* Brand text */}
        <text x={cx} y={cy - 20} textAnchor="middle" style={{ fontSize: '6px', fill: 'rgba(255,255,255,0.2)', fontFamily: "'SF Mono', monospace", letterSpacing: '0.15em', fontWeight: 500 }}>
          GANDHE
        </text>
      </svg>

      {/* Digital readout below */}
      <div style={{
        fontFamily: "'SF Mono', monospace",
        fontSize: '11px',
        color: 'rgba(255,255,255,0.3)',
        letterSpacing: '0.1em',
      }}>
        {String(time.getHours()).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
    </div>
  );
}

function __removedDinoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<{
    dino: { y: number; vy: number; jumping: boolean; ducking: boolean; width: number; height: number };
    obstacles: { x: number; width: number; height: number; type: 'cactus' | 'bird'; y: number }[];
    score: number;
    highScore: number;
    speed: number;
    frame: number;
    gameOver: boolean;
    started: boolean;
    groundY: number;
    raf: number;
  } | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);

  const CANVAS_W = 400;
  const CANVAS_H = 100;
  const GROUND_Y = 80;
  const DINO_W = 20;
  const DINO_H = 22;
  const GRAVITY = 0.6;
  const JUMP_FORCE = -10;

  const initGame = () => {
    const g = {
      dino: { y: GROUND_Y - DINO_H, vy: 0, jumping: false, ducking: false, width: DINO_W, height: DINO_H },
      obstacles: [] as any[],
      score: 0,
      highScore: gameRef.current?.highScore || 0,
      speed: 3,
      frame: 0,
      gameOver: false,
      started: true,
      groundY: GROUND_Y,
      raf: 0,
    };
    gameRef.current = g;
    setGameOver(false);
    setStarted(true);
    setScore(0);
  };

  const drawDino = (ctx: CanvasRenderingContext2D, g: NonNullable<typeof gameRef.current>) => {
    const d = g.dino;
    ctx.fillStyle = '#e0e0e0';
    // Simple dino shape
    const legFrame = Math.floor(g.frame / 5) % 2;
    // Body
    ctx.fillRect(d.y < GROUND_Y - DINO_H - 2 ? 12 : 10, d.y, d.width, d.ducking ? d.height * 0.6 : d.height);
    // Head
    ctx.fillRect(22, d.y - 6, 10, 8);
    // Eye
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(27, d.y - 4, 3, 3);
    ctx.fillStyle = '#e0e0e0';
    // Legs
    if (!d.jumping) {
      if (legFrame === 0) {
        ctx.fillRect(12, d.y + d.height, 4, 5);
        ctx.fillRect(22, d.y + d.height, 4, 3);
      } else {
        ctx.fillRect(12, d.y + d.height, 4, 3);
        ctx.fillRect(22, d.y + d.height, 4, 5);
      }
    } else {
      ctx.fillRect(12, d.y + d.height, 4, 4);
      ctx.fillRect(22, d.y + d.height, 4, 4);
    }
    // Tail
    ctx.fillRect(6, d.y + 2, 6, 3);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw initial state
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(CANVAS_W, GROUND_Y);
    ctx.stroke();

    // Static dino
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(10, GROUND_Y - DINO_H, DINO_W, DINO_H);
    ctx.fillRect(22, GROUND_Y - DINO_H - 6, 10, 8);
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(27, GROUND_Y - DINO_H - 4, 3, 3);
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(12, GROUND_Y, 4, 4);
    ctx.fillRect(22, GROUND_Y, 4, 4);
    ctx.fillRect(6, GROUND_Y - DINO_H + 2, 6, 3);

    // "Press Space" text
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = "10px 'SF Mono', monospace";
    ctx.textAlign = 'center';
    ctx.fillText('Press SPACE to start', CANVAS_W / 2, GROUND_Y + 16);
  }, []);

  useEffect(() => {
    if (!started || gameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const g = gameRef.current;
    if (!g) return;

    let raf: number;
    const loop = () => {
      g.frame++;
      const d = g.dino;

      // Physics
      if (d.jumping) {
        d.vy += GRAVITY;
        d.y += d.vy;
        if (d.y >= GROUND_Y - d.height) {
          d.y = GROUND_Y - d.height;
          d.vy = 0;
          d.jumping = false;
        }
      }

      // Spawn obstacles
      const lastObs = g.obstacles[g.obstacles.length - 1];
      const minGap = 120 / g.speed * 3;
      if (!lastObs || lastObs.x < CANVAS_W - minGap) {
        if (Math.random() < 0.02) {
          const isBird = g.score > 5 && Math.random() < 0.25;
          g.obstacles.push({
            x: CANVAS_W + 10,
            width: isBird ? 16 : (8 + Math.random() * 12),
            height: isBird ? 12 : (15 + Math.random() * 15),
            type: isBird ? 'bird' : 'cactus',
            y: isBird ? GROUND_Y - 30 - Math.random() * 15 : GROUND_Y,
          });
        }
      }

      // Move obstacles
      g.obstacles.forEach(o => { o.x -= g.speed; });
      g.obstacles = g.obstacles.filter(o => o.x > -30);

      // Score
      g.score += 0.05;
      g.speed = 3 + Math.floor(g.score / 10) * 0.5;
      setScore(Math.floor(g.score));

      // Collision
      for (const o of g.obstacles) {
        const ox = o.x;
        const oy = o.type === 'cactus' ? o.y - o.height : o.y;
        const ow = o.width;
        const oh = o.height;
        const dx = 10, dy = d.y, dw = d.width + 10, dh = d.ducking ? d.height * 0.6 : d.height;
        if (dx + dw > ox + 2 && dx < ox + ow - 2 && dy + dh > oy + 2 && dy < oy + oh - 2) {
          g.gameOver = true;
          if (g.score > g.highScore) {
            g.highScore = Math.floor(g.score);
            setHighScore(Math.floor(g.score));
          }
          setGameOver(true);
          return;
        }
      }

      // Draw
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      // Ground
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(CANVAS_W, GROUND_Y);
      ctx.stroke();

      // Ground texture (small dashes)
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      for (let i = 0; i < 30; i++) {
        const gx = ((i * 17 + g.frame * g.speed * 0.5) % (CANVAS_W + 20)) - 10;
        ctx.fillRect(gx, GROUND_Y + 2 + (i % 3), 3 + (i % 2), 1);
      }

      // Dino
      drawDino(ctx, g);

      // Obstacles
      for (const o of g.obstacles) {
        if (o.type === 'cactus') {
          ctx.fillStyle = '#4ade80';
          ctx.fillRect(o.x, o.y - o.height, o.width, o.height);
          // Cactus arms
          if (o.width > 12) {
            ctx.fillRect(o.x - 4, o.y - o.height * 0.6, 5, 3);
            ctx.fillRect(o.x + o.width - 1, o.y - o.height * 0.4, 5, 3);
          }
        } else {
          // Bird
          ctx.fillStyle = 'rgba(255,255,255,0.7)';
          ctx.fillRect(o.x, o.y, o.width, 4);
          // Wings
          const wingY = g.frame % 10 < 5 ? -5 : 3;
          ctx.fillRect(o.x + 4, o.y + wingY, 8, 3);
        }
      }

      // Score display
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = "10px 'SF Mono', monospace";
      ctx.textAlign = 'right';
      ctx.fillText(String(Math.floor(g.score)).padStart(5, '0'), CANVAS_W - 4, 12);
      if (g.highScore > 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillText('HI ' + String(g.highScore).padStart(5, '0'), CANVAS_W - 60, 12);
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [started, gameOver]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        const g = gameRef.current;
        if (!g || !g.started) {
          initGame();
          return;
        }
        if (g.gameOver) {
          initGame();
          return;
        }
        if (!g.dino.jumping) {
          g.dino.jumping = true;
          g.dino.vy = JUMP_FORCE;
        }
      }
      if (e.code === 'ArrowDown') {
        e.preventDefault();
        const g = gameRef.current;
        if (g && g.started && !g.gameOver) {
          g.dino.ducking = true;
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown') {
        const g = gameRef.current;
        if (g) g.dino.ducking = false;
      }
    };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        const g = gameRef.current;
        if (!g || !g.started) {
          initGame();
          return;
        }
        if (g.gameOver) {
          initGame();
          return;
        }
        if (!g.dino.jumping) {
          g.dino.jumping = true;
          g.dino.vy = JUMP_FORCE;
        }
      }}
      style={{
        background: 'rgba(255,255,255,0.03)',
        borderRadius: 6,
        padding: '6px',
        border: '0.5px solid rgba(255,255,255,0.06)',
        cursor: 'pointer',
      }}
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        style={{ display: 'block', width: '100%', height: 'auto', imageRendering: 'pixelated' }}
      />
      {gameOver && (
        <div style={{ textAlign: 'center', marginTop: '4px' }}>
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontFamily: "'SF Mono', monospace" }}>
            GAME OVER — click or press SPACE to restart
          </span>
        </div>
      )}
    </div>
  );
}

// ── Standalone Stocks App ──
function StocksApp() {
  const [drillDown, setDrillDown] = useState<{ type: 'stock'; symbol: string; name: string } | { type: 'sector'; name: string } | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && drillDown) { setDrillDown(null); e.preventDefault(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drillDown]);

  return (
    <div className="bloomberg-scroll" style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden', fontFamily: "'SF Mono', monospace", background: '#1c1c1e' }}>
      {/* My Watchlist title */}
      <div style={{ padding: '14px 14px 0' }}>
        <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff', fontFamily: "'SF Pro Display', -apple-system, sans-serif", letterSpacing: '-0.01em' }}>
          My Watchlist
        </div>
      </div>

      <div>
        {drillDown ? (
          drillDown.type === 'stock' ? (
            <StockDetailView
              symbol={drillDown.symbol}
              name={drillDown.name}
              onBack={() => setDrillDown(null)}
              onSectorClick={(name) => setDrillDown({ type: 'sector', name })}
            />
          ) : (
            <SectorDetailView
              sectorName={drillDown.name}
              onBack={() => setDrillDown(null)}
              onStockClick={(symbol, name) => setDrillDown({ type: 'stock', symbol, name })}
            />
          )
        ) : (
          <>
            {/* LIVE + Date header */}
            <div style={{ padding: '12px 14px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', animation: 'livePulse 2s ease-in-out infinite' }} />
                <span style={{ color: '#fff', fontSize: '12px', fontWeight: 600, fontFamily: "'SF Pro Display', -apple-system, sans-serif", letterSpacing: '0.02em' }}>LIVE</span>
              </div>
              <div style={{ color: '#fff', fontSize: '12px', fontWeight: 600, fontFamily: "'SF Pro Display', -apple-system, sans-serif" }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
            {/* 2x2 Stock Grid */}
            <StockGrid onStockClick={(symbol, name) => setDrillDown({ type: 'stock', symbol, name })} />
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 14px' }} />
            {/* Sector Sparklines */}
            <SectorSparklines onSectorClick={(name) => setDrillDown({ type: 'sector', name })} />
            {/* News Tape */}
            <ScrollingNewsTape />
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 14px' }} />
            {/* Economic Calendar */}
            <EconomicCalendar />
          </>
        )}
      </div>
      <style>{`@keyframes livePulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
.bloomberg-scroll::-webkit-scrollbar { display: none; }
.bloomberg-scroll { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
}

function MiddlePanel({ runCommand }: { runCommand: (cmd: string) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '28px 20px 14px 20px' }}>
      {/* Tech Stack */}
      <div style={{ marginTop: '16px' }}>
        <div style={sectionLabel}>TECH STACK</div>
        {TECH_STACK.map(cat => (
          <div key={cat.category} style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', fontFamily: "'SF Mono', monospace", marginBottom: '4px', textTransform: 'uppercase' as const }}>{cat.category}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {cat.items.map((item, i) => {
                const theme = CATEGORY_THEME[cat.category] || { color: '#fff', rgb: '255,255,255' };
                const opacity = 0.18 - (i * 0.02);
                return (
                  <span key={item} style={{
                    fontSize: '10px', padding: '2px 8px', borderRadius: 4,
                    background: `rgba(${theme.rgb},${Math.max(opacity, 0.06)})`,
                    border: `0.5px solid rgba(${theme.rgb},0.25)`,
                    color: theme.color, fontFamily: "'SF Mono', monospace",
                  }}>{item}</span>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Certifications */}
      <div style={{ marginTop: '16px' }}>
        <div style={sectionLabel}>CERTIFICATIONS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {CERTIFICATIONS.map(cert => (
            <div key={cert.name} style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', color: '#fff', fontFamily: "'SF Mono', monospace", fontWeight: 600 }}>{cert.name}</span>
              <span style={{ fontSize: '10px', fontFamily: "'SF Mono', monospace", fontWeight: 600 }}>· <BrandText text={cert.issuer} colors={cert.issuerColors} /></span>
              {cert.status && (
                <span style={{ fontSize: '9px', color: '#fbbf24', fontFamily: "'SF Mono', monospace", fontWeight: 600, padding: '1px 6px', borderRadius: 3, background: 'rgba(251,191,36,0.1)', border: '0.5px solid rgba(251,191,36,0.2)' }}>{cert.status}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* GitHub Heatmap */}
      <div style={{ marginTop: '16px' }}>
        <GitHubHeatmap />
      </div>
    </div>
  );
}

function StockDetailView({ symbol, name, onBack, onSectorClick }: { symbol: string; name: string; onBack: () => void; onSectorClick: (name: string) => void }) {
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const stocks = useStockData();
  const currentStock = stocks.find(s => s.symbol === symbol);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/stock-detail?symbol=${symbol}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { setDetail(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [symbol]);

  // Find which sector this stock belongs to
  const sector = SECTORS.find(s => s.symbols.includes(symbol));
  const sectorStocks = sector ? stocks.filter(s => sector.symbols.includes(s.symbol)) : [];

  const price = currentStock?.price ?? 0;
  const pct = currentStock?.pct ?? 0;
  const change = currentStock?.change ?? 0;
  const isUp = change >= 0;
  const color = isUp ? '#4ade80' : '#f87171';

  // Build chart from 1-day history (same as main Bloomberg screen) — fallback to detail API if unavailable
  const chartData = (currentStock?.history?.length ?? 0) > 0 ? currentStock!.history : (detail?.chart?.closes || []);
  const chartH = 160, chartW = 500;
  const mn = Math.min(...chartData), mx = Math.max(...chartData), rng = mx - mn || 1;
  const pts = chartData.map((v: number, i: number) => `${(i / (chartData.length - 1)) * chartW},${chartH - ((v - mn) / rng) * (chartH - 8) - 4}`).join(' ');
  const fillPts = pts + ` ${chartW},${chartH} 0,${chartH}`;

  const statItems = detail ? [
    { label: 'Open', value: detail.open },
    { label: 'Prev Close', value: detail.prevClose },
    { label: 'Day High', value: detail.dayHigh },
    { label: 'Day Low', value: detail.dayLow },
    { label: '52W High', value: detail.fiftyTwoWeekHigh },
    { label: '52W Low', value: detail.fiftyTwoWeekLow },
    { label: 'Market Cap', value: detail.marketCap },
    { label: 'Volume', value: detail.volume },
    { label: '5D High', value: detail.fiveDayHigh },
    { label: '5D Low', value: detail.fiveDayLow },
    { label: 'P/E', value: detail.pe },
    { label: 'Exchange', value: detail.exchange },
  ].filter(s => s.value && s.value !== '—') : [];

  return (
    <div style={{ padding: '10px 12px' }}>
      <BloombergBackButton onClick={onBack} />

      {/* Header: Symbol + Price */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '8px', marginBottom: '12px' }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff', fontFamily: "'SF Mono', monospace" }}>
            {symbol} <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{detail?.name || name}</span>
          </div>
          {detail?.exchange && (
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', fontFamily: "'SF Mono', monospace", marginTop: '2px' }}>
              {detail.exchange} · {detail.currency}
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff', fontFamily: "'SF Mono', monospace" }}>
            {symbol === 'BTC' ? price.toLocaleString('en-US', { maximumFractionDigits: 0 }) : price.toFixed(2)}
          </div>
          <div style={{ fontSize: '12px', fontWeight: 700, color, fontFamily: "'SF Mono', monospace" }}>
            {isUp ? '▲' : '▼'} {Math.abs(change).toFixed(2)} ({isUp ? '+' : ''}{pct.toFixed(2)}%)
          </div>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '8px', marginBottom: '12px', border: '0.5px solid rgba(255,255,255,0.06)' }}>
          <svg width="100%" height={chartH} viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
            <defs>
              <linearGradient id="detail-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                <stop offset="100%" stopColor={color} stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <polygon points={fillPts} fill="url(#detail-fill)" />
            <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
            <circle cx={chartW} cy={chartH - ((chartData[chartData.length - 1] - mn) / rng) * (chartH - 8) - 4} r="3" fill={color}>
              <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
            </circle>
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: 'rgba(255,255,255,0.3)', fontFamily: "'SF Mono', monospace", marginTop: '4px' }}>
            <span>{detail?.chart?.closes?.length > 0 ? '5D' : '1D'}</span>
            <span>LIVE</span>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {loading ? (
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontFamily: "'SF Mono', monospace", textAlign: 'center', padding: '20px' }}>
          Loading fundamentals...
        </div>
      ) : statItems.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(255,255,255,0.04)', borderRadius: 6, overflow: 'hidden', marginBottom: '12px', border: '0.5px solid rgba(255,255,255,0.06)' }}>
          {statItems.map(s => (
            <div key={s.label} style={{ padding: '5px 8px', background: 'rgba(10,12,18,0.9)' }}>
              <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', fontFamily: "'SF Mono', monospace", fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontSize: '11px', color: '#fff', fontFamily: "'SF Mono', monospace", fontWeight: 600 }}>{s.value}</div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Sector Context */}
      {sector && (
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '8px 10px', marginBottom: '12px', border: '0.5px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', fontFamily: "'SF Mono', monospace", letterSpacing: '0.05em' }}>
              SECTOR: {sector.name.toUpperCase()}
            </span>
            <button onClick={() => onSectorClick(sector.name)} style={{
              background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer',
              fontSize: '9px', fontWeight: 700, fontFamily: "'SF Mono', monospace",
            }}>
              VIEW ALL →
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {sectorStocks.map(s => (
              <span key={s.symbol} style={{
                fontSize: '9px', fontFamily: "'SF Mono', monospace", fontWeight: 600,
                padding: '2px 6px', borderRadius: 3,
                background: s.symbol === symbol ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
                color: s.symbol === symbol ? '#3b82f6' : (s.pct >= 0 ? '#4ade80' : '#f87171'),
                border: s.symbol === symbol ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(255,255,255,0.06)',
              }}>
                {s.symbol} {s.pct >= 0 ? '+' : ''}{s.pct.toFixed(1)}%
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Related News */}
      {detail?.news?.length > 0 && (
        <div style={{ marginTop: '4px' }}>
          <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', fontFamily: "'SF Mono', monospace", letterSpacing: '0.05em', marginBottom: '6px' }}>
            RELATED NEWS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(255,255,255,0.04)', borderRadius: 6, overflow: 'hidden', border: '0.5px solid rgba(255,255,255,0.06)' }}>
            {detail.news.map((n: any, i: number) => (
              <a key={i} href={n.url} target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'block', padding: '6px 8px', background: 'rgba(10,12,18,0.9)',
                  textDecoration: 'none', transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(10,12,18,0.9)')}
                onClick={e => e.stopPropagation()}
              >
                <div style={{ fontSize: '10px', color: '#fff', fontFamily: "'SF Mono', monospace", fontWeight: 500, lineHeight: 1.3 }}>
                  {n.title}
                </div>
                <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.35)', fontFamily: "'SF Mono', monospace", marginTop: '2px' }}>
                  {n.source} · {n.pubDate ? new Date(n.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SectorDetailView({ sectorName, onBack, onStockClick }: { sectorName: string; onBack: () => void; onStockClick: (symbol: string, name: string) => void }) {
  const stocks = useStockData();
  const sector = SECTORS.find(s => s.name === sectorName);
  const [news, setNews] = useState<{ title: string; source: string; url: string; pubDate: string }[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    if (!sectorName) return;
    setNewsLoading(true);
    fetch(`/api/sector-news?sector=${encodeURIComponent(sectorName)}`)
      .then(r => r.ok ? r.json() : [])
      .then(d => { if (Array.isArray(d)) setNews(d); })
      .catch(() => {})
      .finally(() => setNewsLoading(false));
  }, [sectorName]);

  if (!sector) return null;

  const matched = stocks.filter(s => sector.symbols.includes(s.symbol));
  const sorted = [...matched].sort((a, b) => b.pct - a.pct);
  const avgPct = matched.length > 0 ? matched.reduce((a, s) => a + s.pct, 0) / matched.length : 0;
  const winners = matched.filter(s => s.pct > 0).length;
  const losers = matched.filter(s => s.pct < 0).length;
  const flat = matched.filter(s => s.pct === 0).length;
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const isUp = avgPct >= 0;
  const color = isUp ? '#4ade80' : '#f87171';

  // Spread & volatility
  const allPcts = matched.map(s => s.pct);
  const spread = allPcts.length > 1 ? Math.max(...allPcts) - Math.min(...allPcts) : 0;
  const variance = allPcts.length > 1 ? allPcts.reduce((a, p) => a + (p - avgPct) ** 2, 0) / allPcts.length : 0;
  const volatility = Math.sqrt(variance);

  // Build sector average sparkline
  const maxLen = Math.max(...matched.map(s => s.history.length), 0);
  const avgHistory: number[] = [];
  for (let i = 0; i < maxLen; i++) {
    const pctChanges = matched.map(s => {
      if (s.history[i] == null || !s.history[0]) return null;
      return ((s.history[i] - s.history[0]) / s.history[0]) * 100;
    }).filter((v): v is number => v != null);
    avgHistory.push(pctChanges.length > 0 ? pctChanges.reduce((a, b) => a + b, 0) / pctChanges.length : 0);
  }

  const sparkH = 120, sparkW = 500;
  const mn = Math.min(...avgHistory), mx = Math.max(...avgHistory), rng = mx - mn || 1;
  const pts = avgHistory.map((v, i) => `${(i / (avgHistory.length - 1)) * sparkW},${sparkH - ((v - mn) / rng) * (sparkH - 8) - 4}`).join(' ');
  const fillPts = pts + ` ${sparkW},${sparkH} 0,${sparkH}`;

  // Mini sparkline builder for individual stocks
  const miniSparkline = (history: number[], w: number, h: number, c: string) => {
    if (history.length < 2) return null;
    const mnH = Math.min(...history), mxH = Math.max(...history), rngH = mxH - mnH || 1;
    const p = history.map((v, i) => `${(i / (history.length - 1)) * w},${h - ((v - mnH) / rngH) * (h - 2) - 1}`).join(' ');
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
        <polyline points={p} fill="none" stroke={c} strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    );
  };

  // Performance bar distribution
  const maxAbsPct = Math.max(...allPcts.map(Math.abs), 0.01);

  // Source colors for news
  const sourceColors: Record<string, string> = {
    'Reuters': '#ff922b', 'CNBC': '#2563eb', 'Bloomberg': '#ff6b35',
    'WSJ': '#c4a000', 'BBC': '#da77f2', 'AP': '#f87171',
    'CNN': '#cc0000', 'The Guardian': '#1a73e8', 'Yahoo': '#7c3aed',
    'MarketWatch': '#22c55e', 'Barron': '#60a5fa', 'Forbes': '#e11d48',
  };
  const getNewsColor = (s: string) => {
    for (const [k, c] of Object.entries(sourceColors)) { if (s.toLowerCase().includes(k.toLowerCase())) return c; }
    return '#74c0fc';
  };

  return (
    <div style={{ padding: '10px 12px' }}>
      <BloombergBackButton onClick={onBack} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '8px', marginBottom: '12px' }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff', fontFamily: "'SF Mono', monospace" }}>
            {sectorName} Sector
          </div>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontFamily: "'SF Mono', monospace", marginTop: '2px' }}>
            {matched.length} stocks tracked · {winners} up · {losers} down{flat > 0 ? ` · ${flat} flat` : ''}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '18px', fontWeight: 800, color, fontFamily: "'SF Mono', monospace" }}>
            {isUp ? '+' : ''}{avgPct.toFixed(2)}%
          </div>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontFamily: "'SF Mono', monospace" }}>
            sector avg
          </div>
        </div>
      </div>

      {/* Sector Avg Chart — larger */}
      {avgHistory.length > 1 && (
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '8px', marginBottom: '10px', border: '0.5px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '8px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', fontFamily: "'SF Mono', monospace", letterSpacing: '0.05em' }}>SECTOR AVG PERFORMANCE</span>
            <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', fontFamily: "'SF Mono', monospace" }}>intraday</span>
          </div>
          <svg width="100%" height={sparkH} viewBox={`0 0 ${sparkW} ${sparkH}`} preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
            <defs>
              <linearGradient id={`sector-fill-${sectorName}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                <stop offset="100%" stopColor={color} stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <polygon points={fillPts} fill={`url(#sector-fill-${sectorName})`} />
            <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
            {mn < 0 && mx > 0 && (
              <line x1="0" y1={sparkH - ((0 - mn) / rng) * (sparkH - 8) - 4} x2={sparkW} y2={sparkH - ((0 - mn) / rng) * (sparkH - 8) - 4} stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" strokeDasharray="4 2" />
            )}
          </svg>
        </div>
      )}

      {/* Stats Grid — 2 rows */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '4px', marginBottom: '10px' }}>
        {[
          { label: 'Winners', value: String(winners), color: '#4ade80' },
          { label: 'Losers', value: String(losers), color: '#f87171' },
          { label: 'Best', value: best ? `${best.symbol} ${best.pct >= 0 ? '+' : ''}${best.pct.toFixed(1)}%` : '—', color: '#4ade80' },
          { label: 'Worst', value: worst ? `${worst.symbol} ${worst.pct.toFixed(1)}%` : '—', color: '#f87171' },
          { label: 'Spread', value: spread.toFixed(2) + '%', color: '#60a5fa' },
          { label: 'Volatility', value: volatility.toFixed(2) + '%', color: '#c084fc' },
          { label: 'Sector Avg', value: `${isUp ? '+' : ''}${avgPct.toFixed(2)}%`, color },
          { label: 'Breadth', value: matched.length > 0 ? `${((winners / matched.length) * 100).toFixed(0)}% up` : '—', color: winners >= losers ? '#4ade80' : '#f87171' },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 5, padding: '5px 6px', border: '0.5px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.4)', fontFamily: "'SF Mono', monospace", fontWeight: 600, letterSpacing: '0.03em' }}>{s.label.toUpperCase()}</div>
            <div style={{ fontSize: '9px', color: s.color, fontFamily: "'SF Mono', monospace", fontWeight: 700, marginTop: '1px' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Performance Distribution Bar */}
      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '8px', marginBottom: '10px', border: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: '8px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', fontFamily: "'SF Mono', monospace", letterSpacing: '0.05em', marginBottom: '6px' }}>PERFORMANCE DISTRIBUTION</div>
        {sorted.map(s => {
          const sUp = s.pct >= 0;
          const sColor = sUp ? '#4ade80' : '#f87171';
          const barWidth = Math.abs(s.pct) / maxAbsPct * 50;
          return (
            <div key={s.symbol} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px', cursor: 'pointer', padding: '1px 2px', borderRadius: 3, transition: 'background 0.15s' }}
              onClick={() => onStockClick(s.symbol, s.name)}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ fontSize: '8px', fontWeight: 700, color: '#fff', fontFamily: "'SF Mono', monospace", width: '38px', flexShrink: 0 }}>{s.symbol}</span>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', height: '12px', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '0.5px', background: 'rgba(255,255,255,0.1)' }} />
                {sUp ? (
                  <div style={{ marginLeft: '50%', width: `${barWidth}%`, height: '8px', background: sColor, borderRadius: '0 2px 2px 0', opacity: 0.7, transition: 'width 0.3s' }} />
                ) : (
                  <div style={{ marginLeft: `${50 - barWidth}%`, width: `${barWidth}%`, height: '8px', background: sColor, borderRadius: '2px 0 0 2px', opacity: 0.7, transition: 'width 0.3s' }} />
                )}
              </div>
              <span style={{ fontSize: '8px', color: sColor, fontFamily: "'SF Mono', monospace", fontWeight: 700, width: '48px', textAlign: 'right', flexShrink: 0 }}>
                {sUp ? '+' : ''}{s.pct.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Stock Table with Mini Charts */}
      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 6, overflow: 'hidden', border: '0.5px solid rgba(255,255,255,0.06)', marginBottom: '10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 70px 60px 58px', padding: '5px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
          <span style={{ fontSize: '7px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', fontFamily: "'SF Mono', monospace" }}>SYMBOL</span>
          <span style={{ fontSize: '7px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', fontFamily: "'SF Mono', monospace" }}>CHART</span>
          <span style={{ fontSize: '7px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', fontFamily: "'SF Mono', monospace", textAlign: 'right' }}>PRICE</span>
          <span style={{ fontSize: '7px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', fontFamily: "'SF Mono', monospace", textAlign: 'right' }}>CHG%</span>
          <span style={{ fontSize: '7px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', fontFamily: "'SF Mono', monospace", textAlign: 'right' }}>RANGE</span>
        </div>
        {sorted.map(s => {
          const sUp = s.pct >= 0;
          const sColor = sUp ? '#4ade80' : '#f87171';
          const hi = s.history.length ? Math.max(...s.history) : s.price;
          const lo = s.history.length ? Math.min(...s.history) : s.price;
          const rangeStr = s.symbol === 'BTC'
            ? `${(lo/1000).toFixed(0)}k-${(hi/1000).toFixed(0)}k`
            : `${lo.toFixed(0)}-${hi.toFixed(0)}`;
          return (
            <div key={s.symbol}
              onClick={() => onStockClick(s.symbol, s.name)}
              style={{
                display: 'grid', gridTemplateColumns: '50px 1fr 70px 60px 58px', padding: '4px 8px',
                borderBottom: '0.5px solid rgba(255,255,255,0.04)', cursor: 'pointer',
                transition: 'background 0.15s', alignItems: 'center',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div>
                <span style={{ fontSize: '9px', fontWeight: 700, color: '#fff', fontFamily: "'SF Mono', monospace" }}>{s.symbol}</span>
                <div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.3)', fontFamily: "'SF Mono', monospace", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '48px' }}>{s.name.split(' ')[0]}</div>
              </div>
              <div style={{ padding: '2px 4px' }}>
                {miniSparkline(s.history, 80, 20, sColor)}
              </div>
              <span style={{ fontSize: '9px', color: '#fff', fontFamily: "'SF Mono', monospace", textAlign: 'right', fontWeight: 600 }}>
                {s.symbol === 'BTC' ? s.price.toLocaleString('en-US', { maximumFractionDigits: 0 }) : s.price.toFixed(2)}
              </span>
              <span style={{ fontSize: '9px', color: sColor, fontFamily: "'SF Mono', monospace", textAlign: 'right', fontWeight: 700 }}>
                {sUp ? '+' : ''}{s.pct.toFixed(2)}%
              </span>
              <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.35)', fontFamily: "'SF Mono', monospace", textAlign: 'right' }}>
                {rangeStr}
              </span>
            </div>
          );
        })}
      </div>

      {/* Sector News */}
      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '8px', border: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: '8px', fontWeight: 700, color: '#ff6b35', fontFamily: "'SF Mono', monospace", letterSpacing: '0.08em', marginBottom: '6px' }}>
          {sectorName.toUpperCase()} SECTOR NEWS
        </div>
        {newsLoading ? (
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontFamily: "'SF Mono', monospace", padding: '8px 0' }}>Loading news…</div>
        ) : news.length === 0 ? (
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontFamily: "'SF Mono', monospace", padding: '8px 0' }}>No recent news available</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {news.map((n, i) => (
              <a
                key={i}
                href={n.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block', textDecoration: 'none', padding: '5px 6px', borderRadius: 4,
                  transition: 'background 0.15s', background: 'rgba(10,12,18,0.9)',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(10,12,18,0.9)')}
                onClick={e => e.stopPropagation()}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ fontSize: '8px', fontWeight: 700, color: getNewsColor(n.source), fontFamily: "'SF Mono', monospace", flexShrink: 0, marginTop: '1px', minWidth: '50px' }}>
                    {n.source.toUpperCase().slice(0, 10)}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '9px', color: '#fff', fontFamily: "'SF Mono', monospace", fontWeight: 500, lineHeight: 1.3 }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.3)', fontFamily: "'SF Mono', monospace", marginTop: '1px' }}>
                      {n.pubDate ? new Date(n.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Bloomberg Option 1: Scrolling News Tape ──
function ScrollingNewsTape() {
  const [news, setNews] = useState<{ title: string; source: string; url: string }[]>([]);
  useEffect(() => {
    fetch('/api/market-news')
      .then(r => r.ok ? r.json() : [])
      .then(d => { if (Array.isArray(d)) setNews(d); })
      .catch(() => {});
  }, []);

  if (!news.length) return null;

  const sourceColors: Record<string, string> = {
    'Reuters': '#ff922b', 'CNBC': '#2563eb', 'Bloomberg': '#ff6b35',
    'WSJ': '#c4a000', 'BBC': '#da77f2', 'CBC': '#e03131',
    'AP': '#f87171', 'CNN': '#cc0000', 'The Guardian': '#1a73e8',
  };
  const getColor = (s: string) => {
    for (const [k, c] of Object.entries(sourceColors)) { if (s.toLowerCase().includes(k.toLowerCase())) return c; }
    return '#74c0fc';
  };

  const tape = [...news, ...news]; // duplicate for seamless loop
  const tapeContent = tape.map((item, i) => (
    <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', paddingRight: '32px', textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
      onMouseEnter={e => { (e.currentTarget.querySelector('[data-title]') as HTMLElement).style.textDecoration = 'underline'; }}
      onMouseLeave={e => { (e.currentTarget.querySelector('[data-title]') as HTMLElement).style.textDecoration = 'none'; }}
    >
      <span style={{ color: getColor(item.source), fontSize: '10px', fontWeight: 700, fontFamily: "'SF Mono', monospace" }}>
        {item.source.toUpperCase()}
      </span>
      <span data-title style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px', fontFamily: "'SF Mono', monospace" }}>
        {item.title}
      </span>
      <span style={{ color: 'rgba(255,255,255,0.2)' }}>│</span>
    </a>
  ));

  return (
    <div style={{ padding: '6px 0', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', position: 'relative' }}>
      <style>{`
        @keyframes tickerScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '9px', fontWeight: 700, color: '#ff6b35', letterSpacing: '0.1em', fontFamily: "'SF Mono', monospace", padding: '0 10px', flexShrink: 0 }}>
          NEWS
        </span>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ display: 'inline-flex', animation: 'tickerScroll 80s linear infinite', willChange: 'transform' }}>
            {tapeContent}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Bloomberg Option 2: Live News Feed ──
function LiveNewsFeed() {
  const [news, setNews] = useState<{ title: string; source: string; url: string; pubDate: string }[]>([]);
  useEffect(() => {
    fetch('/api/news')
      .then(r => r.ok ? r.json() : [])
      .then(d => { if (Array.isArray(d)) setNews(d); })
      .catch(() => {});
  }, []);

  const timeAgo = (dateStr: string) => {
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'Now';
      if (mins < 60) return `${mins}m`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h`;
      return `${Math.floor(hrs / 24)}d`;
    } catch { return ''; }
  };

  const sourceColors: Record<string, string> = {
    'Reuters': '#ff922b', 'CNBC': '#2563eb', 'Bloomberg': '#ff6b35',
    'WSJ': '#c4a000', 'BBC': '#da77f2', 'CBC': '#e03131',
    'AP': '#f87171', 'CNN': '#cc0000',
  };
  const getColor = (s: string) => {
    for (const [k, c] of Object.entries(sourceColors)) { if (s.toLowerCase().includes(k.toLowerCase())) return c; }
    return '#74c0fc';
  };

  if (!news.length) return (
    <div style={{ padding: '8px 12px', color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontFamily: "'SF Mono', monospace" }}>
      Loading feed...
    </div>
  );

  return (
    <div style={{ padding: '8px 12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: '#fff', letterSpacing: '0.1em', fontFamily: "'SF Mono', monospace" }}>
          MARKET NEWS
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '8px', color: 'rgba(255,255,255,0.85)', fontFamily: "'SF Mono', monospace" }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ff6b35', display: 'inline-block', animation: 'livePulse 2s ease-in-out infinite' }} />
          LIVE
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {news.slice(0, 5).map((item, i) => (
          <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{
            display: 'block', padding: '5px 6px', textDecoration: 'none', color: 'inherit',
            borderRadius: 4, transition: 'background 0.15s', borderLeft: `2px solid ${getColor(item.source)}22`,
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderLeftColor = getColor(item.source); }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeftColor = `${getColor(item.source)}22`; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
              <span style={{ color: getColor(item.source), fontSize: '9px', fontWeight: 700, fontFamily: "'SF Mono', monospace", letterSpacing: '0.05em' }}>
                {item.source.toUpperCase()}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '9px', fontFamily: "'SF Mono', monospace" }}>
                {timeAgo(item.pubDate)}
              </span>
            </div>
            <div style={{
              fontSize: '11px', fontWeight: 500, color: 'rgba(255,255,255,0.75)', lineHeight: 1.35,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              fontFamily: "'SF Mono', monospace",
            }}>
              {item.title}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

// ── Bloomberg Option 3: Market Stats Bar ──
function MarketStatsBar() {
  const stocks = useStockData();
  const [indicators, setIndicators] = useState<{ label: string; value: string; change: number }[]>([]);

  useEffect(() => {
    // Generate realistic market indicators
    const gen = (label: string, base: number, vol: number, decimals: number, suffix = '') => {
      const change = (Math.random() - 0.48) * vol;
      return { label, value: (base + change).toFixed(decimals) + suffix, change: (change / base) * 100 };
    };
    setIndicators([
      gen('VIX', 18.5, 3, 1),
      gen('10Y', 4.32, 0.15, 2, '%'),
      gen('DXY', 104.2, 1.5, 1),
      gen('GOLD', 2340, 40, 0),
      gen('OIL', 78.5, 3, 1),
    ]);
  }, []);

  if (!indicators.length) return null;

  return (
    <div style={{ padding: '6px 12px', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {indicators.map(ind => {
          const isUp = ind.change >= 0;
          const color = ind.label === 'VIX' ? (isUp ? '#f87171' : '#4ade80') : (isUp ? '#4ade80' : '#f87171');
          return (
            <div key={ind.label} style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: '0.08em', fontFamily: "'SF Mono', monospace", marginBottom: '2px' }}>
                {ind.label}
              </div>
              <div style={{ fontSize: '11px', color: '#fff', fontWeight: 600, fontFamily: "'SF Mono', monospace", fontVariantNumeric: 'tabular-nums' }}>
                {ind.value}
              </div>
              <div style={{ fontSize: '8px', color, fontWeight: 600, fontFamily: "'SF Mono', monospace" }}>
                {isUp ? '▲' : '▼'} {Math.abs(ind.change).toFixed(2)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Bloomberg Option 4: Economic Calendar ──
function EconomicCalendar() {
  const events = [
    { type: 'fed', label: 'FOMC Rate Decision', date: '2026-03-19', icon: '🏛️', importance: 'high' },
    { type: 'earnings', label: 'NVDA Earnings', date: '2026-03-26', icon: '📊', importance: 'high' },
    { type: 'earnings', label: 'AAPL Earnings', date: '2026-04-01', icon: '📊', importance: 'high' },
    { type: 'data', label: 'Non-Farm Payrolls', date: '2026-04-04', icon: '📈', importance: 'medium' },
    { type: 'data', label: 'CPI Release', date: '2026-04-10', icon: '📉', importance: 'medium' },
  ];

  const importanceColor: Record<string, string> = { high: '#f87171', medium: '#fbbf24', low: '#4ade80' };

  const getCountdown = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    if (diff < 0) return 'Passed';
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `in ${days}d`;
  };

  return (
    <div style={{ padding: '8px 12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: '#fff', letterSpacing: '0.1em', fontFamily: "'SF Mono', monospace" }}>
          UPCOMING
        </div>
        <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.5)', fontFamily: "'SF Mono', monospace" }}>
          {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {events.map((evt, i) => {
          const countdown = getCountdown(evt.date);
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '4px 6px', borderRadius: 4,
              background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: importanceColor[evt.importance], flexShrink: 0 }} />
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', fontFamily: "'SF Mono', monospace", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {evt.label}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontFamily: "'SF Mono', monospace" }}>
                  {new Date(evt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span style={{ fontSize: '9px', fontWeight: 600, color: countdown === 'Today' ? '#f87171' : countdown === 'Tomorrow' ? '#fbbf24' : 'rgba(255,255,255,0.6)', fontFamily: "'SF Mono', monospace", minWidth: '40px', textAlign: 'right' }}>
                  {countdown}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Widget 4: System Vitals Sparklines ──
function SystemVitals() {
  const [data, setData] = useState<{ cpu: number[]; mem: number[]; net: number[] }>({ cpu: [], mem: [], net: [] });
  const maxPoints = 40;

  useEffect(() => {
    // Seed with initial data
    const seed = (base: number, variance: number) =>
      Array.from({ length: maxPoints }, () => base + (Math.random() - 0.5) * variance);
    setData({ cpu: seed(35, 30), mem: seed(62, 10), net: seed(45, 40) });

    const id = setInterval(() => {
      setData(prev => ({
        cpu: [...prev.cpu.slice(1), Math.max(5, Math.min(95, prev.cpu[prev.cpu.length - 1] + (Math.random() - 0.48) * 15))],
        mem: [...prev.mem.slice(1), Math.max(40, Math.min(85, prev.mem[prev.mem.length - 1] + (Math.random() - 0.5) * 3))],
        net: [...prev.net.slice(1), Math.max(0, Math.min(100, prev.net[prev.net.length - 1] + (Math.random() - 0.5) * 25))],
      }));
    }, 800);
    return () => clearInterval(id);
  }, []);

  const Sparkline = ({ values, color, label, suffix }: { values: number[]; color: string; label: string; suffix: string }) => {
    if (!values.length) return null;
    const w = 130, h = 22;
    const max = Math.max(...values, 1);
    const pts = values.map((v, i) => `${(i / (maxPoints - 1)) * w},${h - (v / max) * h}`);
    const path = `M${pts.join(' L')}`;
    const current = values[values.length - 1];
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontFamily: "'SF Mono', monospace", width: 24, flexShrink: 0 }}>{label}</span>
        <svg width={w} height={h} style={{ flexShrink: 0 }}>
          <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={w} cy={h - (current / max) * h} r="2" fill={color} />
        </svg>
        <span style={{ fontSize: '10px', color, fontWeight: 600, fontFamily: "'SF Mono', monospace", width: 36, textAlign: 'right', flexShrink: 0 }}>
          {current.toFixed(0)}{suffix}
        </span>
      </div>
    );
  };

  return (
    <div style={{ padding: '8px 10px' }}>
      <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', marginBottom: '6px', fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>
        SYSTEM
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <Sparkline values={data.cpu} color="#4ade80" label="CPU" suffix="%" />
        <Sparkline values={data.mem} color="#60a5fa" label="MEM" suffix="%" />
        <Sparkline values={data.net} color="#c084fc" label="NET" suffix="k" />
      </div>
    </div>
  );
}

// ── Widget 5: Crypto Orderbook Depth Chart ──
function OrderbookDepth() {
  const [bids, setBids] = useState<number[]>([]);
  const [asks, setAsks] = useState<number[]>([]);
  const levels = 20;

  useEffect(() => {
    const genSide = (base: number, mult: number) =>
      Array.from({ length: levels }, (_, i) => base * Math.pow(mult, i) + Math.random() * base * 0.3);

    setBids(genSide(2.5, 1.08));
    setAsks(genSide(2.2, 1.06));

    const id = setInterval(() => {
      setBids(prev => prev.map(v => Math.max(0.5, v + (Math.random() - 0.5) * v * 0.15)));
      setAsks(prev => prev.map(v => Math.max(0.5, v + (Math.random() - 0.5) * v * 0.15)));
    }, 600);
    return () => clearInterval(id);
  }, []);

  if (!bids.length) return null;

  const w = 220, h = 50;
  const maxVol = Math.max(...bids, ...asks, 1);

  // Cumulative volumes
  const bidCum: number[] = [];
  bids.forEach((v, i) => bidCum.push((bidCum[i - 1] || 0) + v));
  const askCum: number[] = [];
  asks.forEach((v, i) => askCum.push((askCum[i - 1] || 0) + v));

  const maxCum = Math.max(bidCum[bidCum.length - 1], askCum[askCum.length - 1], 1);
  const midX = w / 2;

  // Bid path (left side, going outward)
  const bidPts = bidCum.map((c, i) => ({
    x: midX - (i / (levels - 1)) * midX,
    y: h - (c / maxCum) * (h - 4),
  }));
  const bidPath = `M${midX},${h} ` + bidPts.map(p => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ` L${bidPts[bidPts.length - 1]?.x.toFixed(1) || 0},${h} Z`;
  const bidLine = bidPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  // Ask path (right side, going outward)
  const askPts = askCum.map((c, i) => ({
    x: midX + (i / (levels - 1)) * midX,
    y: h - (c / maxCum) * (h - 4),
  }));
  const askPath = `M${midX},${h} ` + askPts.map(p => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ` L${askPts[askPts.length - 1]?.x.toFixed(1) || w},${h} Z`;
  const askLine = askPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <div style={{ padding: '8px 10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>BTC ORDERBOOK</span>
        <div style={{ display: 'flex', gap: '8px', fontSize: '9px', fontFamily: "'SF Mono', monospace" }}>
          <span style={{ color: '#4ade80' }}>BID {bidCum[bidCum.length - 1]?.toFixed(1)}</span>
          <span style={{ color: '#f87171' }}>ASK {askCum[askCum.length - 1]?.toFixed(1)}</span>
        </div>
      </div>
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="bid-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ade80" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#4ade80" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="ask-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f87171" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#f87171" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path d={bidPath} fill="url(#bid-fill)" />
        <path d={bidLine} fill="none" stroke="#4ade80" strokeWidth="1.5" />
        <path d={askPath} fill="url(#ask-fill)" />
        <path d={askLine} fill="none" stroke="#f87171" strokeWidth="1.5" />
        <line x1={midX} y1="0" x2={midX} y2={h} stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" strokeDasharray="2,2" />
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
  const { state, dispatch } = useDesktop();
  const isFullscreen = state.windows.terminal?.isFullscreen ?? false;
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

  // Exit fullscreen before opening a window so the terminal shrinks back first
  const openWindow = (id: string) => {
    if (isFullscreen) {
      dispatch({ type: 'TOGGLE_FULLSCREEN', id: 'terminal' });
      setTimeout(() => dispatch({ type: 'OPEN_WINDOW', id: id as any }), 150);
    } else {
      dispatch({ type: 'OPEN_WINDOW', id: id as any });
    }
  };

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
      openWindow(win);
    } else if (COMMANDS[cmd]) {
      const { window, desc } = COMMANDS[cmd];
      newLines.push({ type: 'system', text: `Opening ${desc.toLowerCase()}...` });
      openWindow(window);
    } else if (cmd.startsWith('cd ')) {
      const target = cmd.replace('cd ', '').replace(/[\/~]/g, '').trim();
      if (COMMANDS[target]) {
        const { window, desc } = COMMANDS[target];
        newLines.push({ type: 'system', text: `Opening ${desc.toLowerCase()}...` });
        openWindow(window);
      } else {
        newLines.push({ type: 'error', text: `cd: no such directory: ${target}` });
        newLines.push({ type: 'output', text: 'Type "help" to see available commands.' });
      }
    } else if (cmd.startsWith('open ')) {
      const target = cmd.replace('open ', '').trim();
      if (COMMANDS[target]) {
        const { window, desc } = COMMANDS[target];
        newLines.push({ type: 'system', text: `Opening ${desc.toLowerCase()}...` });
        openWindow(window);
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
    <div style={{ fontFamily: mono !== false ? "'SF Mono', 'JetBrains Mono', 'Menlo', monospace" : 'inherit', fontSize: compact ? '12.5px' : '13px', lineHeight: 1.5 }}>
      {history.map((line, i) => (
        <div key={i} style={{ color: getLineColor(line), whiteSpace: 'pre-wrap' }}>
          {line.type === 'prompt' ? (
            <><span style={{ color: '#4ade80', fontWeight: 700 }}>{prompt}</span><span style={{ color: '#fff', fontWeight: 500 }}>{line.command}</span></>
          ) : line.text.includes('\x1b[cmd]') ? renderColoredLine(line.text) : line.text}
        </div>
      ))}
      {introDone && (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ color: '#4ade80', fontWeight: 700, whiteSpace: 'pre', fontFamily: "'SF Mono', monospace", fontSize: compact ? '12.5px' : '13px' }}>{prompt}</span>
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
            spellCheck={false} autoComplete="off"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: "'SF Mono', monospace", fontSize: compact ? '12.5px' : '13px', color: '#fff', padding: 0, margin: 0, caretColor: '#4ade80' }} />
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
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', lineHeight: 1.5 }}>
            Using <RotatingWords /> to create<br />elegant and scalable solutions<br />to real world problems.
          </div>
        </div>

        {/* Right column — clock + contact info */}
        <div style={{ gridRow: '1 / 3', borderLeft: '1px solid rgba(255,255,255,0.04)', padding: '20px 16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <WorldClock />
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.04)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px' }}>
            <span style={{ color: '#fff' }}>📍 Waterloo, ON</span>
            <a href="mailto:ronnielgandhe@gmail.com" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>✉️ ronnielgandhe@gmail.com</a>
            <a href="https://github.com/ronnielgandhe" target="_blank" rel="noopener" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>🐙 github.com/ronnielgandhe</a>
          </div>
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
            <a href="mailto:ronnielgandhe@gmail.com" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>✉️ Email</a>
            <a href="https://github.com/ronnielgandhe" target="_blank" rel="noopener" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>🐙 GitHub</a>
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
            <a href="mailto:ronnielgandhe@gmail.com" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>✉️ Email</a>
            <a href="https://github.com/ronnielgandhe" target="_blank" rel="noopener" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>🐙 GitHub</a>
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
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', position: 'relative' as const }}>
      {/* Left — hero + portfolio (main focus) */}
      <div style={{
        width: isFullscreen ? '38%' : undefined,
        flex: isFullscreen ? 'none' : 1,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: isFullscreen ? '20px 20px 8px 28px' : '28px 20px 14px 28px', borderRight: '1px solid rgba(255,255,255,0.04)',
        minWidth: 0, flexShrink: 0,
        overflowY: isFullscreen ? 'auto' : 'hidden',
        overflowX: 'hidden',
        position: 'relative' as const,
      }}>
        {/* Hero text */}
        <div>
          <div style={{ fontFamily: "'SF Mono', 'JetBrains Mono', monospace", fontSize: '14px', lineHeight: 1.6, color: '#e0e0e0' }}>
            <div style={{ fontFamily: "'SF Pro Display', -apple-system, sans-serif", fontWeight: 800, fontSize: '34px', color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.1, marginBottom: '4px' }}>
              Ronniel Gandhe
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', fontWeight: 400, marginBottom: isFullscreen ? '8px' : '16px' }}>
              Software Engineer
            </div>
            {isFullscreen ? (
              <div style={{ marginTop: '0px' }}>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '10px', fontFamily: "'SF Mono', monospace" }}>
                  ABOUT
                </div>
                <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', lineHeight: 1.7, fontFamily: "'SF Pro Text', -apple-system, sans-serif", fontWeight: 400 }}>
                  Software engineer studying Computer Science at Wilfrid Laurier University, previously in the Waterloo CS &amp; Laurier BBA double degree program. Currently building growth systems at Augmentor Labs in New York. I like working across the stack — from low-level systems and infrastructure to product-facing features and data pipelines. Outside of work, I spend time on quantitative projects, reading, and exploring new tools.
                </div>
                <div style={{ marginTop: '12px' }}>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '8px', fontFamily: "'SF Mono', monospace" }}>
                    INTERESTS
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', lineHeight: 1.7, fontFamily: "'SF Pro Text', -apple-system, sans-serif", fontWeight: 400, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <div style={{ color: '#fff', fontWeight: 600, marginBottom: '2px' }}>Building</div>
                      <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        <li>Currently building Enttor — looking for cracked engineers.</li>
                        <li>Reach out at zzhang@enttor.ai if you want to build something meaningful.</li>
                      </ul>
                    </div>
                    <div>
                      <div style={{ color: '#fff', fontWeight: 600, marginBottom: '2px' }}>Reading</div>
                      <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        <li>Zero to One, Laws of Human Nature, Outliers, A Promised Land.</li>
                        <li>Sam Altman's "What I Wish Someone Had Told Me."</li>
                        <li>All books are fiction — written by biased humans.</li>
                      </ul>
                    </div>
                    <div>
                      <div style={{ color: '#fff', fontWeight: 600, marginBottom: '2px' }}>Health</div>
                      <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        <li>Dairy-avoidant pescatarian borrowing from Bryan Johnson's playbook.</li>
                        <li>Soulcycle 3–4x a week, religiously.</li>
                      </ul>
                    </div>
                    <div>
                      <div style={{ color: '#fff', fontWeight: 600, marginBottom: '2px' }}>Finance</div>
                      <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        <li>Fascinated by market microstructure and quantitative strategies.</li>
                        <li>I build models to understand how markets move.</li>
                      </ul>
                    </div>
                    <div>
                      <div style={{ color: '#fff', fontWeight: 600, marginBottom: '2px' }}>Philosophy</div>
                      <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        <li>Aggressive minimalist. Urgency over complacency.</li>
                        <li>Dress for the person you want to become.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: 1.7 }}>
                  Using {showRotating && <RotatingWords />}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: 1.7 }}>
                  to create elegant and scalable
                </div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: 1.7 }}>
                  solutions to real world problems.
                </div>
              </>
            )}
          </div>

          {/* Quick Start — grouped with hero when not fullscreen */}
          {!isFullscreen && <QuickStartTiles runCommand={runCommand} />}
        </div>

        {/* Now Playing — shown in non-fullscreen to fill space */}
        {!isFullscreen && (
          <div style={{ marginTop: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 12px', border: '0.5px solid rgba(255,255,255,0.06)' }}>
            <NowPlaying />
          </div>
        )}


        {/* Spacer — only in non-fullscreen; in fullscreen space-between handles it */}

        {/* Bottom section: Quick Start, Contact + GitHub */}
        <div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', marginTop: isFullscreen ? '8px' : '16px' }}>
            <div style={{ fontFamily: "'SF Mono', monospace", display: 'flex', flexDirection: 'column', gap: isFullscreen ? '2px' : '6px', fontSize: isFullscreen ? '12px' : '13px' }}>
              <span style={{ color: '#fff' }}>📍 Waterloo, ON</span>
              <a href="mailto:ronnielgandhe@gmail.com" style={{ color: '#fff', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>
                ✉️ ronnielgandhe@gmail.com
              </a>
              <a href="https://github.com/ronnielgandhe" target="_blank" rel="noopener" style={{ color: '#fff', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>
                🐙 github.com/ronnielgandhe
              </a>
              <a href="https://www.linkedin.com/in/ronniel-gandhe/" target="_blank" rel="noopener" style={{ color: '#fff', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>
                💼 linkedin.com/in/ronniel-gandhe
              </a>
            </div>
          </div>
        </div>
        {/* Empty space — right whitespace */}
      </div>

      {/* Middle — Site Guide, Tech Stack, Stats, Certs, GitHub heatmap */}
      {isFullscreen && (
        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <MiddlePanel runCommand={runCommand} />
        </div>
      )}

      {/* Right panel */}
      <div ref={scrollRef} onClick={() => inputRef.current?.focus()} style={{
        width: isFullscreen ? '30%' : undefined,
        flex: isFullscreen ? 'none' : 1,
        flexShrink: 0,
        display: 'flex', flexDirection: 'column',
        justifyContent: isFullscreen ? 'space-between' : undefined,
        cursor: 'text', fontFamily: "'SF Mono', monospace", overflow: 'hidden',
        borderLeft: isFullscreen ? '1px solid rgba(255,255,255,0.04)' : undefined,
      }}>
        {isFullscreen ? (
          /* ═══ FULLSCREEN: Date only ═══ */
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            {/* Date header */}
            <div style={{ padding: '12px 14px 0', textAlign: 'right', color: '#fff', fontSize: '11px', fontWeight: 600, fontFamily: "'SF Pro Display', -apple-system, sans-serif" }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        ) : (
          /* ═══ NORMAL: original layout ═══ */
          <>
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 0 }}>
              {/* Date — top right corner */}
              <div style={{ padding: '8px 14px 0', textAlign: 'right', color: '#fff', fontSize: '11px', fontWeight: 600, fontFamily: "'SF Pro Display', -apple-system, sans-serif" }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              {/* Stock ticker with chart — click to open Stocks app */}
              <div
                style={{ padding: '8px 14px 8px', cursor: 'pointer', borderRadius: 6, transition: 'background 0.15s' }}
                onClick={(e) => { e.stopPropagation(); openWindow('stocks'); }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <CyclingStock />
              </div>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.04)', margin: '0 14px' }} />
              <ExploreCommands smartCommandLinks={smartCommandLinks} runCommand={runCommand} />
            </div>
            {/* Terminal prompt */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '6px 14px', minHeight: '36px', maxHeight: '140px', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              {renderTerminal(true)}
            </div>
          </>
        )}
      </div>

      {/* Subtle glowing corner expand — bottom right, non-fullscreen only */}
      {!isFullscreen && (
        <div
          onClick={() => dispatch({ type: 'TOGGLE_FULLSCREEN', id: 'terminal' })}
          style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            cursor: 'pointer',
            zIndex: 10,
            animation: 'cornerPulse 2.5s ease-in-out infinite',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.animation = 'none'; }}
          onMouseLeave={e => { e.currentTarget.style.animation = 'cornerPulse 2.5s ease-in-out infinite'; }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M18 1v17H1" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}

      <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
@keyframes livePulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
@keyframes cornerGlow {
  0%, 100% { filter: drop-shadow(0 0 2px rgba(255,255,255,0.3)); }
  50% { filter: drop-shadow(0 0 6px rgba(255,255,255,0.7)); }
}
@keyframes cornerPulse {
  0%, 100% { opacity: 0.25; filter: drop-shadow(0 0 1px rgba(255,255,255,0.2)); }
  50% { opacity: 0.85; filter: drop-shadow(0 0 8px rgba(255,255,255,0.6)); }
}
@keyframes expandGlow {
  0%, 100% { filter: drop-shadow(0 0 2px rgba(97,218,251,0.4)); }
  50% { filter: drop-shadow(0 0 6px rgba(97,218,251,0.8)); }
}
.bloomberg-scroll::-webkit-scrollbar { display: none; }
.bloomberg-scroll { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
}

function Desktop() {
  const { state, dispatch } = useDesktop();
  const [isMobile, setIsMobile] = useState(false);
  const terminalOrigRef = useRef<{ width: number; height: number } | null>(null);

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

  // Terminal slide-over: when Education or Experience opens, shrink 20% and slide to middle-left
  // Only runs when browser viewport is wide enough (not split-screen / narrow view)
  useEffect(() => {
    const terminal = state.windows['terminal'];
    if (!terminal || terminal.isMinimized || !terminal.isOpen) return;

    // Skip slide-over animation when viewport is narrow (e.g. browser in split-screen)
    const MIN_WIDTH_FOR_SLIDE = 1024;
    if (window.innerWidth < MIN_WIDTH_FOR_SLIDE) return;

    const sideWindows = ['education', 'experience', 'stocks'] as const;
    const openSideWindow = sideWindows.find(id => {
      const w = state.windows[id];
      return w && w.isOpen && !w.isMinimized;
    });

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const menuBarH = 28;
    const dockH = 72;
    const gap = 10;
    const usableH = screenH - menuBarH - dockH;

    if (openSideWindow) {
      // Save original terminal size before any adjustments
      if (!terminalOrigRef.current) {
        terminalOrigRef.current = { width: terminal.size.width, height: terminal.size.height };
      }

      const sideWin = state.windows[openSideWindow]!;
      const sideW = sideWin.size.width;
      const sideH = sideWin.size.height; // Keep the window's current/default height

      // Place side window on right edge, vertically centered in usable area
      const sideX = screenW - gap - sideW;
      const sideY = menuBarH + Math.round((usableH - sideH) / 2);

      // Check if terminal fits without shrinking
      const origTermW = terminalOrigRef.current.width;
      const spaceForTerm = sideX - gap - gap; // left gap + right gap before side window
      const termW = Math.min(origTermW, spaceForTerm);
      const termH = terminal.size.height;

      // Shift terminal left only as much as needed
      const maxTermX = sideX - gap - termW;
      const centeredX = Math.round((screenW - termW) / 2);
      const termX = Math.max(gap, Math.min(centeredX, maxTermX));
      const termY = terminal.position.y;

      // Resize if needed, move if needed
      if (Math.abs(terminal.size.width - termW) > 10) {
        dispatch({ type: 'RESIZE_WINDOW', id: 'terminal', size: { width: termW, height: termH } });
      }
      if (Math.abs(terminal.position.x - termX) > 10) {
        dispatch({ type: 'MOVE_WINDOW', id: 'terminal', position: { x: termX, y: termY } });
      }

      if (Math.abs(sideWin.position.x - sideX) > 10 || Math.abs(sideWin.position.y - sideY) > 10) {
        dispatch({ type: 'MOVE_WINDOW', id: openSideWindow, position: { x: sideX, y: sideY } });
      }
    } else {
      // Restore terminal to original size and center when side windows close
      const origSize = terminalOrigRef.current;
      if (origSize) {
        const centeredX = Math.round((screenW - origSize.width) / 2);
        const origY = menuBarH + Math.round((usableH - origSize.height) / 2);
        dispatch({ type: 'RESIZE_WINDOW', id: 'terminal', size: { width: origSize.width, height: origSize.height } });
        dispatch({ type: 'MOVE_WINDOW', id: 'terminal', position: { x: centeredX, y: origY } });
        terminalOrigRef.current = null;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // Stable dependency: only re-run when the set of open side windows changes
    ['education', 'experience', 'stocks'].filter(id => state.windows[id]?.isOpen && !state.windows[id]?.isMinimized).join(','),
    state.windows['terminal']?.isOpen,
  ]);

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
      // Escape to close focused window (skip terminal)
      if (e.key === 'Escape' && state.focusedWindowId && state.focusedWindowId !== 'terminal') {
        dispatch({ type: 'CLOSE_WINDOW', id: state.focusedWindowId });
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
            const darkWindows: string[] = ['education', 'experience', 'detail', 'terminal', 'email', 'photos', 'content', 'projects', 'wifi-settings', 'stocks'];
            const isDark = darkWindows.includes(win.id);
            const titleBarBgMap: Record<string, string> = {
              projects: '#252526',
              blog: '#f0f0f0',
              'deep-research': '#f0f0f0',
              calendar: '#ffffff',
              stocks: '#1c1c1e',
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
      'LinkedIn: linkedin.com/in/ronniel-gandhe',
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
