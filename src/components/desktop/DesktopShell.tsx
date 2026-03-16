import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { DesktopProvider, useDesktop } from './DesktopContext';
import Background from '../portfolio/Background';
import AppWindow from './AppWindow';
import BootScreen from './BootScreen';
import DesktopDock from './DesktopDock';
import DesktopMenuBar from './DesktopMenuBar';
import GitHubHeatmap from './GitHubHeatmap';
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
      return <BooksApplet />;
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
  type: 'prompt' | 'output' | 'error' | 'system' | 'human';
  text: string;
  command?: string;
  ts?: number; // timestamp for auto-fade
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

// ── Rolling titles ribbon for fullscreen subtitle ──
function RollingTitles() {
  const titles = [
    'Software Engineer', 'Data Scientist', 'Trader', 'Gym Bro',
    'Growth Engineer', 'Dog Lover', 'Carnivore Diet Enjoyer',
    'Night Owl', 'Coffee Addict', 'Market Watcher',
    'System Builder', 'Rabbit Hole Explorer', 'Open Source Fan',
    'Terminal Dweller', 'Full Stack Dev', 'Quantitative Thinker',
  ];
  const colors = [
    '#60a5fa', '#c084fc', '#4ade80', '#fbbf24', '#f472b6',
    '#22d3ee', '#fb923c', '#a78bfa', '#34d399', '#f87171',
    '#38bdf8', '#e879f9', '#86efac', '#fcd34d', '#fb7185',
    '#67e8f9',
  ];

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  const [built, setBuilt] = useState<{ text: string; color: string }[]>([]);
  const [charIdx, setCharIdx] = useState(0);
  const [titleIdx, setTitleIdx] = useState(0);
  const [phase, setPhase] = useState<'typing' | 'pause' | 'reverse-erase' | 'reverse-pause'>('typing');
  const [reverseIdx, setReverseIdx] = useState(0);
  const [reverseCharIdx, setReverseCharIdx] = useState(0);
  const [overflowed, setOverflowed] = useState(false);

  // Check if content overflows the container
  const checkOverflow = useCallback(() => {
    if (containerRef.current && contentRef.current) {
      const containerWidth = containerRef.current.offsetWidth - 10; // leave room for cursor
      const contentWidth = contentRef.current.scrollWidth;
      return contentWidth >= containerWidth;
    }
    return false;
  }, []);

  useEffect(() => {
    if (phase === 'typing') {
      // Check overflow after each render
      if (overflowed) {
        // We've hit the edge — pause then reverse
        const t = setTimeout(() => {
          const finalBuilt = [...built];
          const currentTitle = titles[titleIdx];
          if (charIdx > 0) {
            finalBuilt.push({ text: currentTitle.slice(0, charIdx), color: colors[titleIdx % colors.length] });
          }
          setBuilt(finalBuilt);
          setPhase('reverse-erase');
          setReverseIdx(finalBuilt.length - 1);
          setReverseCharIdx(finalBuilt[finalBuilt.length - 1]?.text.length || 0);
          setOverflowed(false);
        }, 1500);
        return () => clearTimeout(t);
      }

      const title = titles[titleIdx];
      if (charIdx < title.length) {
        // Before typing next char, check if we're close to the edge
        if (containerRef.current && contentRef.current) {
          const containerWidth = containerRef.current.offsetWidth - 20; // leave comfortable margin
          const contentWidth = contentRef.current.scrollWidth;
          if (contentWidth >= containerWidth) {
            // We're at the edge — don't add more characters, treat as overflow
            setOverflowed(true);
            return;
          }
        }
        const t = setTimeout(() => setCharIdx(c => c + 1), 35);
        return () => clearTimeout(t);
      } else {
        // Title done — add separator and move to next
        const newBuilt = [...built, { text: title, color: colors[titleIdx % colors.length] }];
        if (titleIdx + 1 < titles.length) {
          setBuilt(newBuilt);
          setTitleIdx(i => i + 1);
          setCharIdx(0);
        } else {
          // All titles typed — pause then reverse
          setBuilt(newBuilt);
          const t = setTimeout(() => {
            setPhase('reverse-erase');
            setReverseIdx(newBuilt.length - 1);
            setReverseCharIdx(newBuilt[newBuilt.length - 1].text.length);
          }, 1500);
          return () => clearTimeout(t);
        }
      }
    }

    if (phase === 'reverse-erase') {
      if (reverseCharIdx > 0) {
        const t = setTimeout(() => setReverseCharIdx(c => c - 1), 20);
        return () => clearTimeout(t);
      } else if (reverseIdx > 0) {
        const t = setTimeout(() => {
          setReverseIdx(i => i - 1);
          setReverseCharIdx(built[reverseIdx - 1].text.length);
        }, 50);
        return () => clearTimeout(t);
      } else {
        // All erased — restart
        const t = setTimeout(() => {
          setBuilt([]);
          setTitleIdx(0);
          setCharIdx(0);
          setPhase('typing');
        }, 800);
        return () => clearTimeout(t);
      }
    }
  }, [phase, charIdx, titleIdx, reverseIdx, reverseCharIdx, overflowed]);

  // After each render during typing, check if we've overflowed
  useEffect(() => {
    if (phase === 'typing' && !overflowed && checkOverflow()) {
      setOverflowed(true);
    }
  });

  // Build display items
  const displayItems: { text: string; color: string }[] = [];
  if (phase === 'typing') {
    displayItems.push(...built);
    const currentTitle = titles[titleIdx];
    if (charIdx > 0) {
      displayItems.push({ text: currentTitle.slice(0, charIdx), color: colors[titleIdx % colors.length] });
    }
  } else if (phase === 'reverse-erase') {
    for (let i = 0; i < reverseIdx; i++) {
      displayItems.push(built[i]);
    }
    if (reverseCharIdx > 0 && built[reverseIdx]) {
      displayItems.push({ text: built[reverseIdx].text.slice(0, reverseCharIdx), color: built[reverseIdx].color });
    }
  }

  const cursorColor = displayItems.length > 0 ? displayItems[displayItems.length - 1].color : colors[0];

  return (
    <div ref={containerRef} style={{ overflow: 'hidden', whiteSpace: 'nowrap', minHeight: '20px', width: '100%' }}>
      <span ref={contentRef} style={{ display: 'inline' }}>
        {displayItems.map((item, i) => (
          <span key={i}>
            <span style={{ color: item.color, fontWeight: 600, fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>{item.text}</span>
            {i < displayItems.length - 1 && <span style={{ color: 'rgba(255,255,255,0.15)', margin: '0 6px' }}>·</span>}
          </span>
        ))}
      </span>
      <span style={{
        display: 'inline-block', width: '2px', height: '14px',
        background: cursorColor, marginLeft: '1px',
        animation: 'blink 1s step-end infinite',
        verticalAlign: 'text-bottom',
      }} />
    </div>
  );
}

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
  { label: 'experience', cmd: 'npm run experience', color: '#c084fc', icon: '/icons/folder.png', emoji: '💼' },
  { label: 'education', cmd: 'git log --education', color: '#60a5fa', icon: '/icons/folder.png' },
  { label: 'projects', cmd: 'brew install projects', color: '#4ade80', icon: '/vscode.png' },
  { label: 'notes', cmd: 'cat mythoughts.md', color: '#fbbf24', icon: '/notes.png' },
  { label: 'research', cmd: 'cd deepresearch', color: '#f472b6', icon: '/books.png' },
  { label: 'calendar', cmd: 'open calendar.app', color: '#22d3ee', icon: '/calandar.png' },
];

function QuickStartTiles({ runCommand }: { runCommand: (cmd: string, source?: 'ui' | 'typed') => void }) {
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
            onClick={(e) => { e.stopPropagation(); runCommand(n.cmd, 'ui'); }}
            style={{
              padding: '10px 8px 8px', borderRadius: '10px', cursor: 'pointer', textAlign: 'center',
              border: `1px solid ${n.color}33`, background: `${n.color}0a`,
              fontSize: '12px', color: n.color, ['--gc' as any]: n.color,
            }}
          >
            <div style={{ marginBottom: '3px', display: 'flex', justifyContent: 'center' }}>{'emoji' in n && n.emoji ? <span style={{ fontSize: '20px', lineHeight: '22px' }}>{n.emoji}</span> : <img src={n.icon} alt={n.label} style={{ width: '22px', height: '22px', objectFit: 'contain' }} />}</div>
            <div style={{ fontWeight: 500 }}>{n.label}</div>
          </div>
        ))}
      </div>
      <style>{`
        .qs-pill { opacity:1; transition:opacity .2s,background .2s,border-color .2s,box-shadow .2s; }
        .qs-pills:hover .qs-pill { opacity:0.3; }
        .qs-pills:hover .qs-pill:hover { opacity:1; box-shadow:0 0 12px var(--gc,#fff)22; }
      `}</style>
    </div>
  );
}

// ── Explore Commands (constantly lit, highlight on hover) ──
function ExploreCommands({ smartCommandLinks, runCommand }: {
  smartCommandLinks: { cmd: string; color: string }[];
  runCommand: (cmd: string, source?: 'ui' | 'typed') => void;
}) {
  return (
    <div style={{ padding: '8px 14px' }}>
      <div style={{ color: '#fff', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', marginBottom: '4px' }}>EXPLORE</div>
      <div className="explore-list" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {smartCommandLinks.map((item) => (
          <div
            key={item.cmd}
            className="explore-cmd"
            onClick={(e) => { e.stopPropagation(); runCommand(item.cmd, 'ui'); }}
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

const STOCK_NAMES: { symbol: string; name: string }[] = [
  // ── Indices & ETFs ──
  { symbol: 'SPY', name: 'S&P 500' }, { symbol: 'QQQ', name: 'Nasdaq 100' },
  { symbol: 'DIA', name: 'Dow Jones' }, { symbol: 'IWM', name: 'Russell 2000' },
  { symbol: 'VOO', name: 'Vanguard S&P 500' }, { symbol: 'VTI', name: 'Total Stock Market' },
  { symbol: 'ARKK', name: 'ARK Innovation' }, { symbol: 'XLF', name: 'Financial Select' },
  { symbol: 'XLE', name: 'Energy Select' }, { symbol: 'XLK', name: 'Tech Select' },
  // ── Mega Cap Tech ──
  { symbol: 'AAPL', name: 'Apple' }, { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'GOOG', name: 'Alphabet' }, { symbol: 'GOOGL', name: 'Alphabet A' },
  { symbol: 'AMZN', name: 'Amazon' }, { symbol: 'META', name: 'Meta Platforms' },
  { symbol: 'NVDA', name: 'NVIDIA' }, { symbol: 'TSLA', name: 'Tesla' },
  { symbol: 'AVGO', name: 'Broadcom' }, { symbol: 'ORCL', name: 'Oracle' },
  // ── Semiconductors ──
  { symbol: 'AMD', name: 'AMD' }, { symbol: 'INTC', name: 'Intel' },
  { symbol: 'QCOM', name: 'Qualcomm' }, { symbol: 'TXN', name: 'Texas Instruments' },
  { symbol: 'MU', name: 'Micron' }, { symbol: 'MRVL', name: 'Marvell' },
  { symbol: 'ARM', name: 'ARM Holdings' }, { symbol: 'SMCI', name: 'Super Micro' },
  { symbol: 'ASML', name: 'ASML' }, { symbol: 'TSM', name: 'TSMC' },
  { symbol: 'LRCX', name: 'Lam Research' }, { symbol: 'AMAT', name: 'Applied Materials' },
  { symbol: 'KLAC', name: 'KLA Corp' }, { symbol: 'ON', name: 'ON Semiconductor' },
  // ── Software & Cloud ──
  { symbol: 'CRM', name: 'Salesforce' }, { symbol: 'ADBE', name: 'Adobe' },
  { symbol: 'NOW', name: 'ServiceNow' }, { symbol: 'INTU', name: 'Intuit' },
  { symbol: 'SNOW', name: 'Snowflake' }, { symbol: 'NET', name: 'Cloudflare' },
  { symbol: 'CRWD', name: 'CrowdStrike' }, { symbol: 'DDOG', name: 'Datadog' },
  { symbol: 'PLTR', name: 'Palantir' }, { symbol: 'MDB', name: 'MongoDB' },
  { symbol: 'ZS', name: 'Zscaler' }, { symbol: 'PANW', name: 'Palo Alto Networks' },
  { symbol: 'FTNT', name: 'Fortinet' }, { symbol: 'WDAY', name: 'Workday' },
  { symbol: 'TEAM', name: 'Atlassian' }, { symbol: 'HUBS', name: 'HubSpot' },
  { symbol: 'VEEV', name: 'Veeva Systems' }, { symbol: 'BILL', name: 'Bill Holdings' },
  // ── Internet & Social ──
  { symbol: 'NFLX', name: 'Netflix' }, { symbol: 'UBER', name: 'Uber' },
  { symbol: 'SHOP', name: 'Shopify' }, { symbol: 'SQ', name: 'Block' },
  { symbol: 'SNAP', name: 'Snap' }, { symbol: 'RBLX', name: 'Roblox' },
  { symbol: 'PINS', name: 'Pinterest' }, { symbol: 'SPOT', name: 'Spotify' },
  { symbol: 'DASH', name: 'DoorDash' }, { symbol: 'ABNB', name: 'Airbnb' },
  { symbol: 'BKNG', name: 'Booking Holdings' }, { symbol: 'PYPL', name: 'PayPal' },
  { symbol: 'ROKU', name: 'Roku' }, { symbol: 'TTD', name: 'Trade Desk' },
  { symbol: 'U', name: 'Unity Software' }, { symbol: 'TWLO', name: 'Twilio' },
  // ── Finance & Banking ──
  { symbol: 'JPM', name: 'JPMorgan Chase' }, { symbol: 'BAC', name: 'Bank of America' },
  { symbol: 'WFC', name: 'Wells Fargo' }, { symbol: 'C', name: 'Citigroup' },
  { symbol: 'GS', name: 'Goldman Sachs' }, { symbol: 'MS', name: 'Morgan Stanley' },
  { symbol: 'SCHW', name: 'Charles Schwab' }, { symbol: 'BLK', name: 'BlackRock' },
  { symbol: 'V', name: 'Visa' }, { symbol: 'MA', name: 'Mastercard' },
  { symbol: 'AXP', name: 'American Express' }, { symbol: 'COF', name: 'Capital One' },
  { symbol: 'USB', name: 'U.S. Bancorp' }, { symbol: 'PNC', name: 'PNC Financial' },
  // ── Healthcare & Pharma ──
  { symbol: 'JNJ', name: 'Johnson & Johnson' }, { symbol: 'UNH', name: 'UnitedHealth' },
  { symbol: 'LLY', name: 'Eli Lilly' }, { symbol: 'PFE', name: 'Pfizer' },
  { symbol: 'MRK', name: 'Merck' }, { symbol: 'ABBV', name: 'AbbVie' },
  { symbol: 'TMO', name: 'Thermo Fisher' }, { symbol: 'ABT', name: 'Abbott Labs' },
  { symbol: 'BMY', name: 'Bristol-Myers' }, { symbol: 'AMGN', name: 'Amgen' },
  { symbol: 'GILD', name: 'Gilead Sciences' }, { symbol: 'ISRG', name: 'Intuitive Surgical' },
  { symbol: 'VRTX', name: 'Vertex Pharma' }, { symbol: 'REGN', name: 'Regeneron' },
  { symbol: 'MDT', name: 'Medtronic' }, { symbol: 'DHR', name: 'Danaher' },
  { symbol: 'ELV', name: 'Elevance Health' }, { symbol: 'CI', name: 'Cigna' },
  { symbol: 'HCA', name: 'HCA Healthcare' }, { symbol: 'MRNA', name: 'Moderna' },
  // ── Consumer ──
  { symbol: 'DIS', name: 'Disney' }, { symbol: 'NKE', name: 'Nike' },
  { symbol: 'SBUX', name: 'Starbucks' }, { symbol: 'MCD', name: "McDonald's" },
  { symbol: 'KO', name: 'Coca-Cola' }, { symbol: 'PEP', name: 'PepsiCo' },
  { symbol: 'PG', name: 'Procter & Gamble' }, { symbol: 'COST', name: 'Costco' },
  { symbol: 'WMT', name: 'Walmart' }, { symbol: 'TGT', name: 'Target' },
  { symbol: 'HD', name: 'Home Depot' }, { symbol: 'LOW', name: "Lowe's" },
  { symbol: 'TJX', name: 'TJX Companies' }, { symbol: 'LULU', name: 'Lululemon' },
  { symbol: 'EL', name: 'Estée Lauder' }, { symbol: 'CPNG', name: 'Coupang' },
  { symbol: 'CMG', name: 'Chipotle' }, { symbol: 'YUM', name: 'Yum! Brands' },
  { symbol: 'MNST', name: 'Monster Beverage' }, { symbol: 'CL', name: 'Colgate-Palmolive' },
  // ── Industrial & Defense ──
  { symbol: 'BA', name: 'Boeing' }, { symbol: 'CAT', name: 'Caterpillar' },
  { symbol: 'HON', name: 'Honeywell' }, { symbol: 'GE', name: 'GE Aerospace' },
  { symbol: 'RTX', name: 'RTX Corp' }, { symbol: 'LMT', name: 'Lockheed Martin' },
  { symbol: 'NOC', name: 'Northrop Grumman' }, { symbol: 'GD', name: 'General Dynamics' },
  { symbol: 'DE', name: 'John Deere' }, { symbol: 'UPS', name: 'UPS' },
  { symbol: 'FDX', name: 'FedEx' }, { symbol: 'UNP', name: 'Union Pacific' },
  // ── Energy ──
  { symbol: 'XOM', name: 'ExxonMobil' }, { symbol: 'CVX', name: 'Chevron' },
  { symbol: 'COP', name: 'ConocoPhillips' }, { symbol: 'SLB', name: 'Schlumberger' },
  { symbol: 'EOG', name: 'EOG Resources' }, { symbol: 'OXY', name: 'Occidental' },
  { symbol: 'MPC', name: 'Marathon Petroleum' }, { symbol: 'VLO', name: 'Valero Energy' },
  // ── Telecom & Media ──
  { symbol: 'T', name: 'AT&T' }, { symbol: 'VZ', name: 'Verizon' },
  { symbol: 'TMUS', name: 'T-Mobile' }, { symbol: 'CMCSA', name: 'Comcast' },
  { symbol: 'WBD', name: 'Warner Bros Discovery' }, { symbol: 'PARA', name: 'Paramount' },
  // ── Real Estate ──
  { symbol: 'AMT', name: 'American Tower' }, { symbol: 'PLD', name: 'Prologis' },
  { symbol: 'CCI', name: 'Crown Castle' }, { symbol: 'EQIX', name: 'Equinix' },
  { symbol: 'O', name: 'Realty Income' }, { symbol: 'SPG', name: 'Simon Property' },
  // ── Auto ──
  { symbol: 'F', name: 'Ford' }, { symbol: 'GM', name: 'General Motors' },
  { symbol: 'RIVN', name: 'Rivian' }, { symbol: 'LCID', name: 'Lucid Motors' },
  { symbol: 'TM', name: 'Toyota' }, { symbol: 'HMC', name: 'Honda' },
  // ── Crypto ──
  { symbol: 'BTC', name: 'Bitcoin' }, { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'COIN', name: 'Coinbase' }, { symbol: 'MSTR', name: 'MicroStrategy' },
  { symbol: 'SOL', name: 'Solana' }, { symbol: 'DOGE', name: 'Dogecoin' },
  // ── Other Notable ──
  { symbol: 'BRK-B', name: 'Berkshire Hathaway' }, { symbol: 'NEE', name: 'NextEra Energy' },
  { symbol: 'LIN', name: 'Linde' }, { symbol: 'ACN', name: 'Accenture' },
  { symbol: 'IBM', name: 'IBM' }, { symbol: 'CSCO', name: 'Cisco' },
  { symbol: 'TXN', name: 'Texas Instruments' }, { symbol: 'ANET', name: 'Arista Networks' },
  { symbol: 'APH', name: 'Amphenol' }, { symbol: 'FI', name: 'Fiserv' },
  { symbol: 'SO', name: 'Southern Company' }, { symbol: 'DUK', name: 'Duke Energy' },
  { symbol: 'SHW', name: 'Sherwin-Williams' }, { symbol: 'MMM', name: '3M' },
  { symbol: 'SPGI', name: 'S&P Global' }, { symbol: 'ICE', name: 'Intercontinental Exchange' },
  { symbol: 'CME', name: 'CME Group' }, { symbol: 'MCO', name: "Moody's" },
  { symbol: 'CB', name: 'Chubb' }, { symbol: 'AIG', name: 'AIG' },
  { symbol: 'ZTS', name: 'Zoetis' }, { symbol: 'SYK', name: 'Stryker' },
  { symbol: 'BSX', name: 'Boston Scientific' }, { symbol: 'EW', name: 'Edwards Lifesciences' },
  { symbol: 'SNPS', name: 'Synopsys' }, { symbol: 'CDNS', name: 'Cadence Design' },
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
// GitHubHeatmap moved to ./GitHubHeatmap.tsx

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
const DEV_PLAYLIST_URL = 'https://open.spotify.com/playlist/2uud5zGJZf3U98FlTnQip8';
const DEV_PLAYLIST_TRACKS = [
  { title: 'fiano', artist: 'the wine is ok', durationMs: 163000 },
  { title: 'The Way Things Go', artist: 'chromas', durationMs: 185000 },
  { title: 'a good man with a broken heart', artist: 'LoVibe.', durationMs: 142000 },
  { title: 'astrophilia.', artist: 'Ok Pretty Boy', durationMs: 174000 },
  { title: 'merlot', artist: 'the wine is ok', durationMs: 156000 },
  { title: 'reading in berlin', artist: 'the wine is ok', durationMs: 189000 },
  { title: 'Mar', artist: 'QUANT, Constança Quinteiro', durationMs: 198000 },
  { title: 'Night of Arará', artist: 'Miki Ikhifa, Nubalix', durationMs: 210000 },
  { title: 'Fascination', artist: 'Gaston', durationMs: 176000 },
  { title: 'reading in london', artist: 'the wine is ok', durationMs: 168000 },
  { title: 'Take Four.', artist: 'Bolden.', durationMs: 152000 },
  { title: 'RDV (Late Nite Edit)', artist: 'Teuteu', durationMs: 195000 },
  { title: 'Elevator Vibes', artist: 'The Brothers Nylon', durationMs: 144000 },
  { title: 'saWasdee', artist: 'wza', durationMs: 160000 },
  { title: 'Dawn in LA.', artist: 'Bolden.', durationMs: 183000 },
];

function NowPlaying() {
  const [track, setTrack] = useState<{ isPlaying: boolean; title: string; artist: string; album: string; albumArt: string; progressMs: number; durationMs: number; isPlaylistFallback?: boolean } | null>(null);
  const [progress, setProgress] = useState(0);
  const [fallback] = useState(() => {
    const t = DEV_PLAYLIST_TRACKS[Math.floor(Math.random() * DEV_PLAYLIST_TRACKS.length)];
    return { isPlaying: true, title: t.title, artist: t.artist, album: 'session', albumArt: '', progressMs: Math.floor(Math.random() * 0.6 * t.durationMs), durationMs: t.durationMs, isPlaylistFallback: true };
  });

  useEffect(() => {
    const fetchTrack = () => {
      fetch('/api/spotify')
        .then(r => r.ok ? r.json() : null)
        .then(d => {
          if (d && d.title) {
            setTrack(d);
            setProgress(d.progressMs || 0);
          }
        })
        .catch(() => {});
    };
    fetchTrack();
    const id = setInterval(fetchTrack, 30000);
    return () => clearInterval(id);
  }, []);

  const active = track || fallback;

  useEffect(() => {
    if (!track) setProgress(fallback.progressMs);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const id = setInterval(() => setProgress(p => {
      const next = p + 1000;
      return next >= active.durationMs ? (active.isPlaylistFallback ? 0 : active.durationMs) : next;
    }), 1000);
    return () => clearInterval(id);
  }, [active]);

  const fmtTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  };

  const isPlaylistFallback = active.isPlaylistFallback;
  const pct = active.durationMs > 0 ? (progress / active.durationMs) * 100 : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ color: '#fff', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '8px', fontFamily: "'SF Mono', monospace" }}>
        {isPlaylistFallback ? '♫ DEV PLAYLIST' : active.isPlaying ? '♫ NOW PLAYING' : '♫ RECENTLY PLAYED'}
      </div>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1 }}>
        {active.albumArt ? (
          <img src={active.albumArt} alt="" style={{ width: 48, height: 48, borderRadius: 6, flexShrink: 0 }} />
        ) : (
          <a href={DEV_PLAYLIST_URL} target="_blank" rel="noopener noreferrer" style={{ width: 48, height: 48, borderRadius: 6, flexShrink: 0, background: 'rgba(29, 185, 84, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
          </a>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>
            {active.title}
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: "'SF Mono', monospace" }}>
            {active.artist}
          </div>
          <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 1, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: '#1DB954', borderRadius: 1, transition: 'width 1s linear' }} />
            </div>
            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontFamily: "'SF Mono', monospace", flexShrink: 0 }}>
              {fmtTime(progress)} / {fmtTime(active.durationMs)}
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
  const [expanded, setExpanded] = useState(false);
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
    if (pct >= 0) return `rgba(${Math.round(30 + intensity * 10)}, ${Math.round(90 + intensity * 60)}, ${Math.round(60 + intensity * 30)}, ${0.5 + intensity * 0.35})`;
    return `rgba(${Math.round(130 + intensity * 50)}, ${Math.round(50 - intensity * 15)}, ${Math.round(55 - intensity * 10)}, ${0.5 + intensity * 0.35})`;
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

  const treemapContent = (
    <div style={{ position: 'relative', width: '100%', flex: 1, minHeight: expanded ? '400px' : '160px', borderRadius: 4, overflow: 'hidden' }}>
      {rows.map((row) => {
        const rowWeight = row.items.reduce((a, b) => a + b.weight, 0);
        let xPos = 0;
        return row.items.map((item) => {
          const w = (item.weight / rowWeight) * W;
          const x = xPos;
          xPos += w;
          const symSize = expanded ? (w > 12 ? '16px' : '12px') : (w > 12 ? '13px' : '10px');
          const pctSize = expanded ? '13px' : '11px';
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
              <div style={{ fontSize: symSize, fontWeight: 700, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.6)', fontFamily: "'SF Mono', monospace", lineHeight: 1.2 }}>
                {item.symbol}
              </div>
              {w > 8 && (
                <div style={{ fontSize: pctSize, fontWeight: 600, color: 'rgba(255,255,255,0.95)', fontFamily: "'SF Mono', monospace" }}>
                  {item.pct >= 0 ? '+' : ''}{item.pct.toFixed(1)}%
                </div>
              )}
            </div>
          );
        });
      })}
    </div>
  );

  return (
    <div style={{ padding: '10px 12px', height: expanded ? 'auto' : '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.1em', fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>
          MARKET TREEMAP
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            onClick={() => setExpanded(e => !e)}
            style={{ cursor: 'pointer', fontSize: '9px', color: 'rgba(255,255,255,0.7)', fontFamily: "'SF Mono', monospace", padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.2s' }}
          >
            {expanded ? '↙ Collapse' : '↗ Expand'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', color: 'rgba(255,255,255,0.85)', fontFamily: "'SF Mono', monospace" }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'livePulse 2s ease-in-out infinite' }} />
            LIVE
          </div>
        </div>
      </div>
      {treemapContent}
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
        <span style={{ fontSize: '10px', fontWeight: 700, color: isOpen ? '#4ade80' : '#f87171', fontFamily: "'SF Mono', monospace", letterSpacing: '0.05em' }}>
          {isOpen ? 'MARKET OPEN' : 'MARKET CLOSED'}
        </span>
      </div>
      <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '0.1em', fontFamily: "'SF Mono', monospace", marginBottom: '4px' }}>
        {targetLabel}
      </div>
      <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff', fontFamily: "'SF Mono', monospace", fontVariantNumeric: 'tabular-nums', letterSpacing: '0.5px' }}>
        {countdown}
      </div>
      <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', fontFamily: "'SF Mono', monospace", marginTop: '4px' }}>
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
  const rafRef = useRef<number>(0);
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
  const rafRef = useRef<number>(0);

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
const SALESFORCE_COLORS = ['#00A1E0','#00A1E0','#00A1E0','#00A1E0','#00A1E0','#00A1E0','#00A1E0','#00A1E0','#00A1E0','#00A1E0'];

function BrandText({ text, colors }: { text: string; colors: string[] }) {
  return <>{text.split('').map((ch, i) => <span key={i} style={{ color: colors[i % colors.length] }}>{ch}</span>)}</>;
}

const CERTIFICATIONS = [
  { name: 'Machine Learning for Trading Specialization', issuer: 'Google Cloud', status: '', issuerColors: GOOGLE_COLORS },
  { name: 'Finance & Quantitative Modeling for Analysts', issuer: 'Wharton Online', status: '', issuerColors: WHARTON_COLORS },
  { name: 'AWS Cloud Practitioner', issuer: 'Amazon Web Services', status: 'In Progress', issuerColors: AMAZON_COLORS },
  { name: 'Salesforce Certified B2C Commerce Cloud Developer', issuer: 'Salesforce', status: 'In Progress', issuerColors: SALESFORCE_COLORS },
];

const sectionLabel: React.CSSProperties = {
  color: '#fff', fontSize: '11px', fontWeight: 700,
  letterSpacing: '0.1em', marginBottom: '10px', fontFamily: "'SF Mono', monospace",
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

// ── Bloomberg Terminal Components (fullscreen easter egg) ──

const SECTOR_COLORS = ['#4ade80', '#60a5fa', '#f472b6', '#facc15', '#a78bfa', '#fb923c', '#2dd4bf'];

const LEADERBOARD_FUNDS = [
  { name: 'S&P 500 (SPY)', annualReturn: 10 },
  { name: 'Nasdaq (QQQ)', annualReturn: 15 },
  { name: 'Berkshire Hathaway', annualReturn: 12 },
  { name: 'Renaissance Technologies', annualReturn: 30 },
  { name: 'Bridgewater Associates', annualReturn: 8 },
  { name: 'Citadel Wellington', annualReturn: 20 },
  { name: 'Two Sigma', annualReturn: 18 },
  { name: 'D.E. Shaw', annualReturn: 15 },
  { name: 'AQR Capital', annualReturn: 10 },
  { name: 'Tiger Global', annualReturn: 22 },
  { name: 'Millennium Management', annualReturn: 14 },
  { name: 'Point72', annualReturn: 16 },
];

function BloombergTopBar({ stocks, gameMode, onToggleGame }: { stocks: StockData[]; gameMode: boolean; onToggleGame: () => void }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const tickerSymbols = ['SPY', 'QQQ', 'DIA', 'BTC'];
  const tickerStocks = tickerSymbols.map(sym => stocks.find(s => s.symbol === sym)).filter(Boolean) as StockData[];

  return (
    <div style={{
      height: '32px', minHeight: '32px', background: '#0a0c12', borderBottom: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px',
      fontFamily: "'SF Mono', monospace", fontSize: '10px',
    }}>
      <span style={{ color: '#ff6b35', fontWeight: 700, letterSpacing: '0.15em', fontSize: '11px' }}>BLOOMBERG</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
        {tickerStocks.map((s, i) => (
          <React.Fragment key={s.symbol}>
            {i > 0 && <span style={{ color: 'rgba(255,255,255,0.2)', margin: '0 8px' }}>{'\u2502'}</span>}
            <span style={{ color: 'rgba(255,255,255,0.8)' }}>{s.symbol}</span>
            <span style={{ color: 'rgba(255,255,255,0.95)', margin: '0 4px' }}>{s.price < 1000 ? s.price.toFixed(2) : s.price.toFixed(0)}</span>
            <span style={{ color: s.pct >= 0 ? '#4ade80' : '#f87171' }}>
              {s.pct >= 0 ? '\u25B2' : '\u25BC'}{Math.abs(s.pct).toFixed(2)}%
            </span>
          </React.Fragment>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Game button hidden for now */}
        <span style={{ color: 'rgba(255,255,255,0.7)' }}>
          {time.toLocaleTimeString('en-US', { hour12: false })}
        </span>
      </div>
    </div>
  );
}

function BloombergStockGrid6({ stocks, onStockClick }: { stocks: StockData[]; onStockClick: (symbol: string, name: string) => void }) {
  const currentStocks = useRef<(StockData | null)[]>(Array(9).fill(null));
  const [hovered, setHovered] = useState<number | null>(null);

  const handleCurrentStock = (cellIdx: number, stock: StockData) => {
    currentStocks.current[cellIdx] = stock;
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0' }}>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
        <div key={i}
          onClick={(e) => {
            e.stopPropagation();
            const s = currentStocks.current[i];
            if (s) onStockClick(s.symbol, s.name);
          }}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
          style={{
            padding: '8px 10px',
            borderBottom: i < 6 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            borderRight: i % 3 !== 2 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            cursor: 'pointer',
            background: hovered === i ? 'rgba(255,255,255,0.04)' : 'transparent',
            transition: 'background 0.15s',
          }}>
          <CyclingStock stocks={stocks} startOffset={i * 4} compact instanceId={100 + i} onCurrentStock={(s) => handleCurrentStock(i, s)} />
        </div>
      ))}
    </div>
  );
}

// ── Performance Bar Chart — top movers ──
function PerformanceBarChart({ stocks }: { stocks: StockData[] }) {
  const sorted = [...stocks].filter(s => s.pct !== 0).sort((a, b) => b.pct - a.pct);
  const top5 = sorted.slice(0, 5);
  const bottom5 = sorted.slice(-5).reverse();
  const movers = [...top5, ...bottom5];
  const maxAbs = Math.max(...movers.map(s => Math.abs(s.pct)), 1);

  return (
    <div style={{ padding: '10px 14px' }}>
      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.1em', marginBottom: '8px', fontWeight: 700, fontFamily: "'SF Mono', monospace" }}>TOP MOVERS</div>
      {movers.map((s, i) => {
        const isUp = s.pct >= 0;
        const barPct = (Math.abs(s.pct) / maxAbs) * 100;
        return (
          <div key={s.symbol} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', opacity: 0, animation: `fadeInLeft 0.3s ease ${i * 0.04}s forwards` }}>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', fontFamily: "'SF Mono', monospace", minWidth: '40px' }}>{s.symbol}</span>
            <div style={{ flex: 1, height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden', position: 'relative' }}>
              <div style={{
                position: 'absolute', [isUp ? 'left' : 'right']: '50%', top: 0, height: '100%',
                width: `${barPct / 2}%`, borderRadius: '2px',
                background: isUp ? 'rgba(74,222,128,0.6)' : 'rgba(248,113,113,0.6)',
                transition: 'width 0.5s ease',
              }} />
              <div style={{ position: 'absolute', left: '50%', top: 0, width: '1px', height: '100%', background: 'rgba(255,255,255,0.15)' }} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, fontFamily: "'SF Mono', monospace", minWidth: '52px', textAlign: 'right', color: isUp ? '#4ade80' : '#f87171' }}>
              {isUp ? '+' : ''}{s.pct.toFixed(2)}%
            </span>
          </div>
        );
      })}
      <style>{`@keyframes fadeInLeft { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }`}</style>
    </div>
  );
}

// ── Correlation Matrix — sector correlations ──
function CorrelationMatrix({ stocks }: { stocks: StockData[] }) {
  const sectorNames = SECTORS.map(s => s.name);
  // Build sector average histories
  const sectorHistories = SECTORS.map(sector => {
    const matched = stocks.filter(s => sector.symbols.includes(s.symbol));
    if (matched.length === 0) return [];
    const maxLen = Math.max(...matched.map(s => s.history.length));
    const avg: number[] = [];
    for (let i = 0; i < maxLen; i++) {
      const vals = matched.map(s => s.history[i]).filter(v => v != null);
      avg.push(vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0);
    }
    return avg;
  });

  // Compute correlation between two arrays
  const corr = (a: number[], b: number[]) => {
    const n = Math.min(a.length, b.length);
    if (n < 2) return 0;
    const meanA = a.slice(0, n).reduce((s, v) => s + v, 0) / n;
    const meanB = b.slice(0, n).reduce((s, v) => s + v, 0) / n;
    let num = 0, denA = 0, denB = 0;
    for (let i = 0; i < n; i++) {
      const da = a[i] - meanA, db = b[i] - meanB;
      num += da * db; denA += da * da; denB += db * db;
    }
    return denA > 0 && denB > 0 ? num / Math.sqrt(denA * denB) : 0;
  };

  const matrix = sectorHistories.map((a, i) => sectorHistories.map((b, j) => i === j ? 1 : corr(a, b)));

  const getColor = (v: number) => {
    const clamped = Math.max(-1, Math.min(1, v));
    if (clamped >= 0) return `rgba(74,222,128,${0.15 + clamped * 0.55})`;
    return `rgba(248,113,113,${0.15 + Math.abs(clamped) * 0.55})`;
  };

  return (
    <div style={{ padding: '10px 14px' }}>
      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.1em', marginBottom: '8px', fontWeight: 700, fontFamily: "'SF Mono', monospace" }}>SECTOR CORRELATION</div>
      <div style={{ display: 'grid', gridTemplateColumns: `40px repeat(${sectorNames.length}, 1fr)`, gap: '2px' }}>
        {/* Header row */}
        <div />
        {sectorNames.map(name => (
          <div key={name} style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', textAlign: 'center', fontFamily: "'SF Mono', monospace", padding: '2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
            {name.slice(0, 4)}
          </div>
        ))}
        {/* Data rows */}
        {sectorNames.map((rowName, ri) => (
          <React.Fragment key={rowName}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', fontFamily: "'SF Mono', monospace", display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '4px', fontWeight: 600 }}>
              {rowName.slice(0, 4)}
            </div>
            {matrix[ri].map((val, ci) => (
              <div key={ci} style={{
                background: getColor(val),
                borderRadius: '2px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                aspectRatio: '1', minHeight: '26px',
                fontSize: '12px', color: 'rgba(255,255,255,0.95)', fontFamily: "'SF Mono', monospace", fontWeight: 700,
              }}>
                {val.toFixed(1)}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ── Volatility Gauge — sector volatility rings ──
function VolatilityGauge({ stocks }: { stocks: StockData[] }) {
  const sectorVols = SECTORS.map((sector, i) => {
    const matched = stocks.filter(s => sector.symbols.includes(s.symbol));
    // Average absolute pct change as proxy for volatility
    const avgVol = matched.length > 0 ? matched.reduce((sum, s) => sum + Math.abs(s.pct), 0) / matched.length : 0;
    return { name: sector.name, vol: avgVol, color: SECTOR_COLORS[i % SECTOR_COLORS.length] };
  }).sort((a, b) => b.vol - a.vol);

  const maxVol = Math.max(...sectorVols.map(s => s.vol), 1);

  return (
    <div style={{ padding: '10px 14px' }}>
      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.1em', marginBottom: '8px', fontWeight: 700, fontFamily: "'SF Mono', monospace" }}>VOLATILITY INDEX</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {sectorVols.map((s, i) => {
          const pct = (s.vol / maxVol) * 100;
          return (
            <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', fontFamily: "'SF Mono', monospace", minWidth: '56px' }}>{s.name}</span>
              <div style={{ flex: 1, height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${pct}%`, height: '100%', borderRadius: '4px',
                  background: `linear-gradient(90deg, ${s.color}88, ${s.color})`,
                  transition: 'width 1s ease',
                  animation: `volGrow${i} 1.2s ease ${i * 0.08}s both`,
                }} />
              </div>
              <span style={{ fontSize: '10px', color: s.color, fontFamily: "'SF Mono', monospace", minWidth: '42px', textAlign: 'right', fontWeight: 600 }}>
                {s.vol.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
      <style>{SECTORS.map((_, i) => `@keyframes volGrow${i} { from { width: 0; } }`).join('\n')}</style>
    </div>
  );
}

function SectorPieChart({ stocks }: { stocks: StockData[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 100); return () => clearTimeout(t); }, []);

  const sectorData = SECTORS.map((sector, i) => {
    const sectorStocks = stocks.filter(s => sector.symbols.includes(s.symbol));
    const totalValue = sectorStocks.reduce((sum, s) => sum + Math.abs(s.price), 0);
    return { name: sector.name, value: totalValue || 1, color: SECTOR_COLORS[i % SECTOR_COLORS.length], count: sectorStocks.length };
  });
  const total = sectorData.reduce((s, d) => s + d.value, 0);

  const r = 60;
  const cx = 80;
  const cy = 80;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div style={{ padding: '10px 14px', height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.1em', marginBottom: '8px', fontFamily: "'SF Mono', monospace" }}>
        SECTOR ALLOCATION
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
        <svg width="180" height="180" viewBox="0 0 160 160" style={{ flexShrink: 0 }}>
          {sectorData.map((d, i) => {
            const pct = d.value / total;
            const dashLen = pct * circumference;
            const currentOffset = offset;
            offset += dashLen;
            return (
              <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={d.color} strokeWidth="20"
                strokeDasharray={`${mounted ? dashLen : 0} ${circumference}`}
                strokeDashoffset={-currentOffset}
                style={{ transition: 'stroke-dasharray 0.8s ease-out', transformOrigin: `${cx}px ${cy}px` }}
              />
            );
          })}
          <text x={cx} y={cy - 4} textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="18" fontWeight="700" fontFamily="'SF Mono', monospace">{SECTORS.length}</text>
          <text x={cx} y={cy + 12} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="9" fontFamily="'SF Mono', monospace">SECTORS</text>
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {sectorData.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontFamily: "'SF Mono', monospace" }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.color, flexShrink: 0 }} />
              <span style={{ color: 'rgba(255,255,255,0.85)', minWidth: '55px' }}>{d.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>{((d.value / total) * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BloombergBottomBar() {
  const [data, setData] = useState({
    advancers: 2145, decliners: 987,
    upVol: 1.82, dnVol: 0.94,
    pcRatio: 0.92, tick: 187, trin: 1.05, vix: 18.4,
  });

  useEffect(() => {
    const t = setInterval(() => {
      setData(prev => ({
        advancers: Math.max(500, prev.advancers + Math.round((Math.random() - 0.5) * 40)),
        decliners: Math.max(300, prev.decliners + Math.round((Math.random() - 0.5) * 30)),
        upVol: Math.max(0.3, +(prev.upVol + (Math.random() - 0.5) * 0.08).toFixed(2)),
        dnVol: Math.max(0.2, +(prev.dnVol + (Math.random() - 0.5) * 0.06).toFixed(2)),
        pcRatio: Math.max(0.5, Math.min(1.5, +(prev.pcRatio + (Math.random() - 0.5) * 0.04).toFixed(2))),
        tick: Math.max(-400, Math.min(600, prev.tick + Math.round((Math.random() - 0.5) * 50))),
        trin: Math.max(0.5, Math.min(2.0, +(prev.trin + (Math.random() - 0.5) * 0.06).toFixed(2))),
        vix: Math.max(10, Math.min(40, +(prev.vix + (Math.random() - 0.5) * 0.5).toFixed(1))),
      }));
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const items: { label: string; value: string; color?: string }[] = [
    { label: 'A/D', value: `${data.advancers.toLocaleString()} / ${data.decliners.toLocaleString()}` },
    { label: 'UP VOL', value: `${data.upVol}B`, color: '#4ade80' },
    { label: 'DN VOL', value: `${data.dnVol}B`, color: '#f87171' },
    { label: 'P/C', value: `${data.pcRatio}` },
    { label: 'TICK', value: `${data.tick > 0 ? '+' : ''}${data.tick}`, color: data.tick >= 0 ? '#4ade80' : '#f87171' },
    { label: 'TRIN', value: `${data.trin}` },
    { label: 'VIX', value: `${data.vix}`, color: data.vix > 25 ? '#f87171' : data.vix > 20 ? '#facc15' : '#4ade80' },
  ];

  const adTotal = data.advancers + data.decliners;
  const adPct = data.advancers / adTotal * 100;

  return (
    <div style={{
      height: '32px', minHeight: '32px', background: '#0a0c12', borderTop: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', alignItems: 'center', padding: '0 12px', gap: '16px',
      fontFamily: "'SF Mono', monospace", fontSize: '10px',
    }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>{item.label}</span>
          {item.label === 'A/D' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: 'rgba(255,255,255,0.9)' }}>{item.value}</span>
              <div style={{ width: '40px', height: '4px', background: '#f87171', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${adPct}%`, height: '100%', background: '#4ade80', borderRadius: '2px', transition: 'width 0.5s' }} />
              </div>
            </div>
          ) : (
            <span style={{ color: item.color || 'rgba(255,255,255,0.9)' }}>{item.value}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function StockPickerGame({ stocks }: { stocks: StockData[] }) {
  // ── Trading Simulator State ──
  type TradeOrder = { id: number; type: 'buy' | 'sell'; qty: number; price: number; day: number; symbol: string };
  type Position = { symbol: string; qty: number; avgCost: number };
  type HistData = { symbol: string; name: string; closes: number[]; timestamps: number[] };
  type OHLCBar = { open: number; high: number; low: number; close: number; volume: number };

  const TRADE_SYMBOLS = 'AAPL,MSFT,NVDA,TSLA,META,AMZN,GOOG,NFLX,AMD,JPM,V,BA,DIS,COIN,PLTR,UBER,LLY,XOM,GS,BTC';

  const getName = (sym: string) => {
    const found = STOCK_NAMES.find(s => s.symbol === sym);
    return found ? found.name : sym;
  };


  // ── Seeded random for reproducible OHLC ──
  const seededRandom = (seed: number) => {
    let s = seed;
    return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
  };

  // ── Generate OHLC from closes ──
  const generateOHLC = (closes: number[]): OHLCBar[] => {
    const rng = seededRandom(42);
    return closes.map((close, i) => {
      const open = i === 0 ? close * (0.99 + rng() * 0.02) : closes[i - 1];
      const highMult = 1 + rng() * 0.03;
      const lowMult = 0.97 + rng() * 0.03;
      const high = Math.max(open, close) * highMult;
      const low = Math.min(open, close) * lowMult;
      const volume = Math.floor(5000000 + rng() * 30000000);
      return { open, high, low, close, volume };
    });
  };

  // ── Ranks & Achievements ──
  const RANKS = [
    { title: 'Intern', minXp: 0, color: 'rgba(255,255,255,0.4)' },
    { title: 'Junior Analyst', minXp: 100, color: '#60a5fa' },
    { title: 'Analyst', minXp: 300, color: '#818cf8' },
    { title: 'Senior Analyst', minXp: 600, color: '#a78bfa' },
    { title: 'Vice President', minXp: 1000, color: '#c084fc' },
    { title: 'Director', minXp: 1600, color: '#f472b6' },
    { title: 'Managing Director', minXp: 2500, color: '#ff6b35' },
    { title: 'Wolf of Wall Street', minXp: 4000, color: '#fbbf24' },
  ];
  const ACHIEVEMENTS = [
    { id: 'first_trade', label: 'First Blood', desc: 'Execute your first trade', icon: '\u2694\uFE0F' },
    { id: 'profit_1k', label: 'Comma Club', desc: 'Earn $1,000+ profit', icon: '\uD83D\uDCB0' },
    { id: 'profit_10k', label: 'Big Leagues', desc: 'Earn $10,000+ profit', icon: '\uD83D\uDCC8' },
    { id: 'streak_3', label: 'Hot Streak', desc: '3 profitable trades in a row', icon: '\uD83D\uDD25' },
    { id: 'streak_5', label: 'On Fire', desc: '5 profitable trades in a row', icon: '\u26A1' },
    { id: 'buy_low', label: 'Bottom Fisher', desc: 'Buy at the daily low', icon: '\uD83C\uDFA3' },
    { id: 'quick_flip', label: 'Scalper', desc: 'Profit within 2 days of buying', icon: '\u23F1\uFE0F' },
    { id: 'diamond_hands', label: 'Diamond Hands', desc: 'Hold a position for 20+ days', icon: '\uD83D\uDC8E' },
    { id: 'beat_market', label: 'Market Beater', desc: 'Outperform S&P 500', icon: '\uD83C\uDFC6' },
    { id: 'ten_trades', label: 'Active Trader', desc: 'Execute 10+ trades', icon: '\uD83D\uDCCA' },
  ];
  const LEADERBOARD_ENTRIES = [
    { name: 'Warren Buffett', firm: 'Berkshire Hathaway', annualReturn: 19.8, style: 'Value' },
    { name: 'Jim Simons', firm: 'Renaissance Tech', annualReturn: 66.1, style: 'Quant' },
    { name: 'Ray Dalio', firm: 'Bridgewater', annualReturn: 12.0, style: 'Macro' },
    { name: 'George Soros', firm: 'Quantum Fund', annualReturn: 30.0, style: 'Macro' },
    { name: 'Peter Lynch', firm: 'Magellan Fund', annualReturn: 29.2, style: 'Growth' },
    { name: 'Carl Icahn', firm: 'Icahn Capital', annualReturn: 14.6, style: 'Activist' },
    { name: 'Steve Cohen', firm: 'Point72', annualReturn: 30.0, style: 'Multi-Strat' },
    { name: 'Ken Griffin', firm: 'Citadel', annualReturn: 26.0, style: 'Market Making' },
    { name: 'Cathie Wood', firm: 'ARK Invest', annualReturn: 15.2, style: 'Disruptive' },
    { name: 'S&P 500 Index', firm: 'Passive', annualReturn: 10.5, style: 'Index' },
  ];

  // ── State ──
  const [cash, setCash] = useState(100000);
  const [portfolioHistory, setPortfolioHistory] = useState<number[]>([100000]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [orders, setOrders] = useState<TradeOrder[]>([]);
  const [histDataMap, setHistDataMap] = useState<Record<string, HistData>>({});
  const [loading, setLoading] = useState(true);
  const [round, setRound] = useState(1);
  const [totalRounds] = useState(3);
  const [currentSymbol, setCurrentSymbol] = useState('');
  const [visibleDays, setVisibleDays] = useState(0);
  const [roundComplete, setRoundComplete] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [orderQty, setOrderQty] = useState(10);
  const [limitPrice, setLimitPrice] = useState(0);
  const [flashEffect, setFlashEffect] = useState<'buy' | 'sell' | null>(null);
  const [pnlFlash, setPnlFlash] = useState(0);
  const [dayPnl, setDayPnl] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [usedSymbols, setUsedSymbols] = useState<string[]>([]);
  const [roundScores, setRoundScores] = useState<{ symbol: string; pnl: number; spReturn: number }[]>([]);
  const [animatingCandle, setAnimatingCandle] = useState(-1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chartRef = useRef<SVGSVGElement | null>(null);
  const totalDays = 60;

  // ── Gamification state ──
  const [xp, setXp] = useState(0);
  const [profitStreak, setProfitStreak] = useState(0);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [achievementToast, setAchievementToast] = useState<{ label: string; icon: string; desc: string } | null>(null);
  const [xpPopups, setXpPopups] = useState<{ id: number; amount: number; x: number }[]>([]);
  const [buyDay, setBuyDay] = useState(-1);
  const [started, setStarted] = useState(false);

  // ── Rank calculation ──
  const currentRank = useMemo(() => {
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (xp >= RANKS[i].minXp) return RANKS[i];
    }
    return RANKS[0];
  }, [xp]);
  const nextRank = useMemo(() => {
    const idx = RANKS.findIndex(r => r.title === currentRank.title);
    return idx < RANKS.length - 1 ? RANKS[idx + 1] : null;
  }, [currentRank]);
  const xpProgress = nextRank ? (xp - currentRank.minXp) / (nextRank.minXp - currentRank.minXp) : 1;

  // ── Achievement unlock helper ──
  const unlockAchievement = useCallback((id: string) => {
    if (unlockedAchievements.includes(id)) return;
    const ach = ACHIEVEMENTS.find(a => a.id === id);
    if (!ach) return;
    setUnlockedAchievements(prev => [...prev, id]);
    setAchievementToast({ label: ach.label, icon: ach.icon, desc: ach.desc });
    setXp(prev => prev + 150);
    addXpPopup(150);
    setTimeout(() => setAchievementToast(null), 3000);
  }, [unlockedAchievements]);

  // ── XP popup helper ──
  const addXpPopup = useCallback((amount: number) => {
    const id = Date.now() + Math.random();
    setXpPopups(prev => [...prev, { id, amount, x: 50 + Math.random() * 200 }]);
    setTimeout(() => setXpPopups(prev => prev.filter(p => p.id !== id)), 1500);
  }, []);

  // ── Fetch historical data ──
  useEffect(() => {
    const syms = TRADE_SYMBOLS.split(',');
    fetch(`/api/stock-history?symbols=${syms.join(',')}&range=3mo`)
      .then(r => r.json())
      .then(json => {
        const map: Record<string, HistData> = {};
        for (const sym of syms) {
          if (json.data?.[sym]) {
            map[sym] = {
              symbol: sym,
              name: getName(sym),
              closes: json.data[sym].closes,
              timestamps: json.data[sym].timestamps,
            };
          }
        }
        setHistDataMap(map);
        setLoading(false);
      })
      .catch(() => {
        // Generate fallback data
        const map: Record<string, HistData> = {};
        const rng = seededRandom(99);
        for (const sym of syms) {
          let p = 100 + rng() * 400;
          const closes: number[] = [];
          const timestamps: number[] = [];
          for (let i = 0; i < 70; i++) {
            p *= 0.97 + rng() * 0.06;
            closes.push(Math.round(p * 100) / 100);
            timestamps.push(Date.now() - (70 - i) * 86400000);
          }
          map[sym] = { symbol: sym, name: getName(sym), closes, timestamps };
        }
        setHistDataMap(map);
        setLoading(false);
      });
  }, []);

  // ── Pick random stock for round ──
  const startRound = useCallback((roundNum: number) => {
    const available = Object.keys(histDataMap).filter(s => !usedSymbols.includes(s));
    if (available.length === 0) return;
    const rng = seededRandom(roundNum * 7 + 13);
    const pick = available[Math.floor(rng() * available.length)];
    setCurrentSymbol(pick);
    setUsedSymbols(prev => [...prev, pick]);
    setVisibleDays(0);
    setRoundComplete(false);
    setRevealed(false);
    setDayPnl(0);
    setAnimatingCandle(-1);
  }, [histDataMap, usedSymbols]);

  useEffect(() => {
    if (!loading && Object.keys(histDataMap).length > 0 && !currentSymbol) {
      startRound(1);
    }
  }, [loading, histDataMap, currentSymbol, startRound]);

  // ── Day timer ──
  useEffect(() => {
    if (!currentSymbol || roundComplete || loading) return;
    timerRef.current = setInterval(() => {
      setVisibleDays(prev => {
        const next = prev + 1;
        setAnimatingCandle(next - 1);
        setTimeout(() => setAnimatingCandle(-1), 400);
        if (next >= totalDays) {
          setRoundComplete(true);
          if (timerRef.current) clearInterval(timerRef.current);
        }
        return next;
      });
    }, 800);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentSymbol, roundComplete, loading]);

  // ── Current data ──
  const histData = currentSymbol ? histDataMap[currentSymbol] : null;
  const ohlcData = useMemo((): OHLCBar[] => histData ? generateOHLC(histData.closes) : [], [histData]);
  const visibleOHLC = ohlcData.slice(0, visibleDays);
  const currentPrice = visibleOHLC.length > 0 ? visibleOHLC[visibleOHLC.length - 1].close : 0;
  const prevPrice = visibleOHLC.length > 1 ? visibleOHLC[visibleOHLC.length - 2].close : currentPrice;
  const spread = currentPrice * 0.001;
  const bidPrice = Math.round((currentPrice - spread / 2) * 100) / 100;
  const askPrice = Math.round((currentPrice + spread / 2) * 100) / 100;

  // ── Position for current symbol ──
  const currentPos = positions.find(p => p.symbol === currentSymbol);
  const unrealizedPnl = currentPos ? (currentPrice - currentPos.avgCost) * currentPos.qty : 0;
  const totalPositionValue = positions.reduce((sum, p) => {
    const price = histDataMap[p.symbol]?.closes?.[Math.min(visibleDays - 1, (histDataMap[p.symbol]?.closes?.length || 1) - 1)] || 0;
    return sum + price * p.qty;
  }, 0);
  const portfolioValue = cash + totalPositionValue;
  const totalPnl = portfolioValue - 100000;

  // ── Track day P&L + achievement checks ──
  useEffect(() => {
    if (visibleOHLC.length > 1 && currentPos) {
      const dayChange = (currentPrice - prevPrice) * currentPos.qty;
      setDayPnl(dayChange);
      if (Math.abs(dayChange) > 0.01) {
        setPnlFlash(dayChange > 0 ? 1 : -1);
        setTimeout(() => setPnlFlash(0), 600);
      }
      // Diamond hands: held 20+ days
      if (buyDay >= 0 && visibleDays - buyDay >= 20) unlockAchievement('diamond_hands');
    }
    // Profit milestones
    if (totalPnl >= 1000) unlockAchievement('profit_1k');
    if (totalPnl >= 10000) unlockAchievement('profit_10k');
  }, [visibleDays]);

  // ── Execute trade ──
  const executeTrade = useCallback((side: 'buy' | 'sell', qty: number) => {
    if (qty <= 0 || !currentSymbol) return;
    const price = side === 'buy' ? askPrice : bidPrice;
    const cost = price * qty;

    if (side === 'buy') {
      if (cost > cash) return;
      setCash(prev => prev - cost);
      setPositions(prev => {
        const existing = prev.find(p => p.symbol === currentSymbol);
        if (existing) {
          const totalQty = existing.qty + qty;
          const avgCost = (existing.avgCost * existing.qty + price * qty) / totalQty;
          return prev.map(p => p.symbol === currentSymbol ? { ...p, qty: totalQty, avgCost } : p);
        }
        return [...prev, { symbol: currentSymbol, qty, avgCost: price }];
      });
    } else {
      const pos = positions.find(p => p.symbol === currentSymbol);
      if (!pos || pos.qty < qty) return;
      setCash(prev => prev + cost);
      setPositions(prev => {
        const existing = prev.find(p => p.symbol === currentSymbol);
        if (!existing) return prev;
        if (existing.qty === qty) return prev.filter(p => p.symbol !== currentSymbol);
        return prev.map(p => p.symbol === currentSymbol ? { ...p, qty: p.qty - qty } : p);
      });
    }

    const newOrder: TradeOrder = { id: Date.now(), type: side, qty, price, day: visibleDays, symbol: currentSymbol };
    setOrders(prev => [...prev, newOrder]);

    setFlashEffect(side);
    setTimeout(() => setFlashEffect(null), 500);

    // ── Gamification: XP + achievements ──
    const baseXp = 25 + Math.floor(qty / 10) * 5;
    setXp(prev => prev + baseXp);
    addXpPopup(baseXp);

    // First trade
    if (orders.length === 0) unlockAchievement('first_trade');
    // 10 trades
    if (orders.length + 1 >= 10) unlockAchievement('ten_trades');

    if (side === 'buy') {
      setBuyDay(visibleDays);
    }

    if (side === 'sell') {
      const pos = positions.find(p => p.symbol === currentSymbol);
      if (pos) {
        const tradeProfit = (price - pos.avgCost) * qty;
        if (tradeProfit > 0) {
          const newStreak = profitStreak + 1;
          setProfitStreak(newStreak);
          const streakBonus = Math.floor(newStreak * 15);
          setXp(prev => prev + streakBonus);
          if (streakBonus > 0) addXpPopup(streakBonus);
          if (newStreak >= 3) unlockAchievement('streak_3');
          if (newStreak >= 5) unlockAchievement('streak_5');
          // Quick flip
          if (buyDay >= 0 && visibleDays - buyDay <= 2) unlockAchievement('quick_flip');
        } else {
          setProfitStreak(0);
        }
      }
    }
  }, [currentSymbol, askPrice, bidPrice, cash, positions, visibleDays, orders, profitStreak, buyDay, unlockAchievement, addXpPopup]);

  // ── Next round ──
  const nextRound = useCallback(() => {
    // Close all positions for current symbol
    const pos = positions.find(p => p.symbol === currentSymbol);
    if (pos) {
      const proceeds = currentPrice * pos.qty;
      setCash(prev => prev + proceeds);
      setPositions(prev => prev.filter(p => p.symbol !== currentSymbol));
    }

    const spReturn = histData ? ((histData.closes[Math.min(totalDays - 1, histData.closes.length - 1)] / histData.closes[0]) - 1) * 100 : 0;
    const roundPnl = orders.filter(o => o.symbol === currentSymbol).reduce((sum, o) => {
      return sum + (o.type === 'sell' ? o.price * o.qty : -o.price * o.qty);
    }, 0) + (pos ? currentPrice * pos.qty : 0);

    setRoundScores(prev => [...prev, { symbol: currentSymbol, pnl: roundPnl, spReturn }]);

    if (round >= totalRounds) {
      setGameOver(true);
    } else {
      setRound(prev => prev + 1);
      startRound(round + 1);
    }
  }, [positions, currentSymbol, currentPrice, round, totalRounds, startRound, histData, orders]);

  // ── Format helpers ──
  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtPnl = (n: number) => (n >= 0 ? '+' : '') + fmt(n);

  // ── Candlestick chart renderer ──
  const CandlestickChart = useMemo(() => {
    if (!visibleOHLC.length) return null;
    const chartW = 700;
    const chartH = 320;
    const volH = 60;
    const pad = { top: 20, right: 60, bottom: 5, left: 60 };
    const plotW = chartW - pad.left - pad.right;
    const plotH = chartH - pad.top - pad.bottom;

    const allData = ohlcData.slice(0, Math.max(visibleDays, 1));
    const minPrice = Math.min(...allData.map(d => d.low)) * 0.998;
    const maxPrice = Math.max(...allData.map(d => d.high)) * 1.002;
    const priceRange = maxPrice - minPrice || 1;
    const maxVol = Math.max(...allData.map(d => d.volume));

    const candleW = Math.max(2, Math.min(10, plotW / totalDays - 2));
    const gap = plotW / totalDays;

    const yScale = (p: number) => pad.top + plotH - ((p - minPrice) / priceRange) * plotH;
    const volScale = (v: number) => (v / maxVol) * volH;

    // Grid lines
    const gridLines = [];
    const priceStep = priceRange / 5;
    for (let i = 0; i <= 5; i++) {
      const price = minPrice + priceStep * i;
      const y = yScale(price);
      gridLines.push(
        <g key={`grid-${i}`}>
          <line x1={pad.left} y1={y} x2={chartW - pad.right} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <text x={chartW - pad.right + 5} y={y + 4} fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="'SF Mono', monospace">{price.toFixed(2)}</text>
        </g>
      );
    }

    // Candles
    const candles = visibleOHLC.map((d, i) => {
      const x = pad.left + i * gap + gap / 2;
      const isGreen = d.close >= d.open;
      const color = isGreen ? '#4ade80' : '#f87171';
      const bodyTop = yScale(Math.max(d.open, d.close));
      const bodyBot = yScale(Math.min(d.open, d.close));
      const bodyH = Math.max(1, bodyBot - bodyTop);
      const isAnimating = i === animatingCandle;

      return (
        <g key={`candle-${i}`} style={{
          opacity: isAnimating ? 0 : 1,
          animation: isAnimating ? 'none' : undefined,
          transition: 'opacity 0.3s ease',
        }}>
          {/* Wick */}
          <line x1={x} y1={yScale(d.high)} x2={x} y2={yScale(d.low)} stroke={color} strokeWidth="1" />
          {/* Body */}
          <rect
            x={x - candleW / 2}
            y={bodyTop}
            width={candleW}
            height={bodyH}
            fill={isGreen ? color : color}
            stroke={color}
            strokeWidth="0.5"
            rx="0.5"
          />
        </g>
      );
    });

    // Volume bars
    const volBars = visibleOHLC.map((d, i) => {
      const x = pad.left + i * gap + gap / 2;
      const isGreen = d.close >= d.open;
      const h = volScale(d.volume);
      return (
        <rect
          key={`vol-${i}`}
          x={x - candleW / 2}
          y={chartH + volH - h}
          width={candleW}
          height={h}
          fill={isGreen ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}
          rx="0.5"
        />
      );
    });

    // Current price line
    const curY = yScale(currentPrice);

    return (
      <svg ref={chartRef} width="100%" height="100%" viewBox={`0 0 ${chartW} ${chartH + volH + 10}`} preserveAspectRatio="xMidYMid meet">
        {/* Background */}
        <rect width={chartW} height={chartH + volH + 10} fill="transparent" />
        {gridLines}
        {/* Separator line between chart and volume */}
        <line x1={pad.left} y1={chartH} x2={chartW - pad.right} y2={chartH} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        {candles}
        {volBars}
        {/* Current price dashed line */}
        {visibleOHLC.length > 0 && (
          <g>
            <line x1={pad.left} y1={curY} x2={chartW - pad.right} y2={curY} stroke="#ff6b35" strokeWidth="1" strokeDasharray="4,3" opacity="0.7" />
            <rect x={chartW - pad.right} y={curY - 10} width={55} height={20} rx="3" fill="#ff6b35" />
            <text x={chartW - pad.right + 27} y={curY + 4} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" fontFamily="'SF Mono', monospace">{currentPrice.toFixed(2)}</text>
            {/* Pulsing dot */}
            <circle cx={pad.left + visibleDays * gap - gap / 2} cy={curY} r="3" fill="#ff6b35">
              <animate attributeName="r" values="3;6;3" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
            </circle>
          </g>
        )}
        {/* Order markers */}
        {orders.filter(o => o.symbol === currentSymbol).map(o => {
          const ox = pad.left + o.day * gap + gap / 2;
          const oy = yScale(o.price);
          return (
            <g key={o.id}>
              <polygon
                points={o.type === 'buy'
                  ? `${ox},${oy + 8} ${ox - 5},${oy + 14} ${ox + 5},${oy + 14}`
                  : `${ox},${oy - 8} ${ox - 5},${oy - 14} ${ox + 5},${oy - 14}`}
                fill={o.type === 'buy' ? '#4ade80' : '#f87171'}
                opacity="0.9"
              />
            </g>
          );
        })}
        {/* Day counter */}
        <text x={pad.left} y={chartH + volH + 8} fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="'SF Mono', monospace">
          Day {visibleDays}/{totalDays}
        </text>
      </svg>
    );
  }, [visibleOHLC, ohlcData, visibleDays, animatingCandle, currentPrice, orders, currentSymbol]);

  // ── Max qty user can buy ──
  const maxBuyQty = currentPrice > 0 ? Math.floor(cash / askPrice) : 0;
  const maxSellQty = currentPos?.qty || 0;

  // ── Start screen ──
  if (!started && !loading) {
    return (
      <div style={{
        height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(ellipse at center, #0f1119 0%, #0a0c12 70%)',
        fontFamily: "'SF Mono', monospace", color: '#fff', gap: '20px', padding: '40px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Animated background grid */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'linear-gradient(rgba(255,107,53,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,53,0.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div style={{ fontSize: '11px', letterSpacing: '0.3em', color: 'rgba(255,107,53,0.6)', textTransform: 'uppercase', zIndex: 1 }}>Bloomberg Terminal Presents</div>
        <div style={{
          fontSize: '42px', fontWeight: 900, color: '#ff6b35', letterSpacing: '0.05em', zIndex: 1,
          textShadow: '0 0 60px rgba(255,107,53,0.3), 0 0 120px rgba(255,107,53,0.1)',
        }}>
          TRADING ARENA
        </div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', maxWidth: '400px', textAlign: 'center', lineHeight: 1.8, zIndex: 1 }}>
          Trade mystery stocks in real-time. Earn XP, unlock achievements, and climb the ranks from Intern to Wolf of Wall Street.
        </div>
        <div style={{ display: 'flex', gap: '32px', margin: '16px 0', zIndex: 1 }}>
          {[
            { val: '$100K', label: 'STARTING CAPITAL' },
            { val: '3', label: 'ROUNDS' },
            { val: '60', label: 'TRADING DAYS' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#ff6b35' }}>{s.val}</div>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
        <button onClick={() => setStarted(true)} style={{
          padding: '14px 48px', border: '2px solid #ff6b35', borderRadius: '6px', cursor: 'pointer',
          background: 'rgba(255,107,53,0.1)', color: '#ff6b35', fontSize: '14px', fontWeight: 800,
          fontFamily: "'SF Mono', monospace", letterSpacing: '0.15em', zIndex: 1,
          transition: 'all 0.3s ease', animation: 'pulse-glow 2s ease infinite',
        }}
          onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = 'rgba(255,107,53,0.25)'; }}
          onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = 'rgba(255,107,53,0.1)'; }}
        >
          START TRADING
        </button>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', marginTop: '8px', zIndex: 1 }}>
          Can you beat the legends?
        </div>
      </div>
    );
  }

  // ── Loading screen ──
  if (loading) {
    return (
      <div style={{
        height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0a0c12', color: '#ff6b35', fontFamily: "'SF Mono', monospace",
        flexDirection: 'column', gap: '16px',
      }}>
        <div style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '0.1em' }}>LOADING MARKET DATA</div>
        <div style={{
          width: '200px', height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden',
        }}>
          <div style={{
            width: '40%', height: '100%', background: '#ff6b35', borderRadius: '2px',
            animation: 'loading-slide 1.5s ease-in-out infinite',
          }} />
        </div>
        <style>{`@keyframes loading-slide { 0% { transform: translateX(-100%); } 100% { transform: translateX(350%); } }`}</style>
      </div>
    );
  }

  // ── Game over screen ──
  if (gameOver) {
    const totalReturn = ((portfolioValue / 100000) - 1) * 100;
    const avgSpReturn = roundScores.reduce((s, r) => s + r.spReturn, 0) / roundScores.length;
    const beatMarket = totalReturn > avgSpReturn;
    // Build leaderboard with user inserted
    const scaledReturn = totalReturn * (365 / (totalDays * totalRounds));
    const leaderboardWithUser = [...LEADERBOARD_ENTRIES, { name: 'YOU', firm: currentRank.title, annualReturn: scaledReturn, style: 'Manual' }]
      .sort((a, b) => b.annualReturn - a.annualReturn);
    const userRankIdx = leaderboardWithUser.findIndex(e => e.name === 'YOU');

    return (
      <div className="bloomberg-scroll" style={{
        height: '100%', overflowY: 'auto', background: 'radial-gradient(ellipse at top, #0f1119 0%, #0a0c12 70%)',
        color: '#fff', fontFamily: "'SF Mono', monospace", padding: '32px 40px',
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontSize: '10px', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>TRADING SESSION COMPLETE</div>
            <div style={{
              fontSize: '36px', fontWeight: 900, color: beatMarket ? '#4ade80' : '#f87171',
              textShadow: `0 0 40px ${beatMarket ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}`,
              marginBottom: '8px',
            }}>
              {beatMarket ? 'YOU BEAT THE MARKET' : 'MARKET WINS'}
            </div>
            <div style={{ fontSize: '12px', color: currentRank.color, fontWeight: 700 }}>
              Final Rank: {currentRank.title} ({xp} XP)
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', justifyContent: 'center' }}>
            {[
              { val: `${totalReturn >= 0 ? '+' : ''}${totalReturn.toFixed(2)}%`, label: 'YOUR RETURN', color: totalReturn >= 0 ? '#4ade80' : '#f87171' },
              { val: `$${fmt(portfolioValue)}`, label: 'FINAL VALUE', color: '#fff' },
              { val: `${orders.length}`, label: 'TRADES', color: '#ff6b35' },
              { val: `${unlockedAchievements.length}/${ACHIEVEMENTS.length}`, label: 'ACHIEVEMENTS', color: '#fbbf24' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', flex: 1 }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: s.color, marginBottom: '4px' }}>{s.val}</div>
                <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Round breakdown + Leaderboard side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            {/* Rounds */}
            <div>
              <div style={{ fontSize: '10px', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', marginBottom: '10px' }}>ROUND BREAKDOWN</div>
              {roundScores.map((r, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '8px 10px', marginBottom: '4px',
                  background: 'rgba(255,255,255,0.03)', borderRadius: '4px', borderLeft: `2px solid ${r.pnl >= 0 ? '#4ade80' : '#f87171'}`,
                }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>R{i + 1}: {r.symbol}</span>
                  <span style={{ color: r.pnl >= 0 ? '#4ade80' : '#f87171', fontSize: '11px', fontWeight: 600 }}>{fmtPnl(r.pnl)}</span>
                </div>
              ))}
            </div>
            {/* Leaderboard */}
            <div>
              <div style={{ fontSize: '10px', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', marginBottom: '10px' }}>LEADERBOARD (ANNUALIZED)</div>
              {leaderboardWithUser.map((entry, i) => {
                const isUser = entry.name === 'YOU';
                return (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '5px 8px', marginBottom: '2px', borderRadius: '3px',
                    background: isUser ? 'rgba(255,107,53,0.12)' : 'rgba(255,255,255,0.02)',
                    border: isUser ? '1px solid rgba(255,107,53,0.3)' : '1px solid transparent',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', width: '16px' }}>#{i + 1}</span>
                      <span style={{ fontSize: '10px', color: isUser ? '#ff6b35' : 'rgba(255,255,255,0.6)', fontWeight: isUser ? 800 : 500 }}>{entry.name}</span>
                      <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.25)' }}>{entry.firm}</span>
                    </div>
                    <span style={{
                      fontSize: '10px', fontWeight: 700,
                      color: entry.annualReturn >= 0 ? '#4ade80' : '#f87171',
                    }}>{entry.annualReturn >= 0 ? '+' : ''}{entry.annualReturn.toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Achievements */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '10px', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', marginBottom: '10px' }}>ACHIEVEMENTS UNLOCKED</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {ACHIEVEMENTS.map(a => {
                const unlocked = unlockedAchievements.includes(a.id);
                return (
                  <div key={a.id} style={{
                    padding: '6px 10px', borderRadius: '4px', fontSize: '10px',
                    background: unlocked ? 'rgba(255,107,53,0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${unlocked ? 'rgba(255,107,53,0.25)' : 'rgba(255,255,255,0.06)'}`,
                    color: unlocked ? '#ff6b35' : 'rgba(255,255,255,0.15)',
                    opacity: unlocked ? 1 : 0.5,
                  }}>
                    {a.icon} {a.label}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Play again */}
          <div style={{ textAlign: 'center' }}>
            <button onClick={() => { setStarted(false); setGameOver(false); setCash(100000); setPositions([]); setOrders([]); setRound(1); setCurrentSymbol(''); setUsedSymbols([]); setRoundScores([]); setXp(0); setProfitStreak(0); setUnlockedAchievements([]); setVisibleDays(0); setRoundComplete(false); }} style={{
              padding: '10px 32px', border: '2px solid #ff6b35', borderRadius: '6px', cursor: 'pointer',
              background: 'rgba(255,107,53,0.1)', color: '#ff6b35', fontSize: '12px', fontWeight: 700,
              fontFamily: "'SF Mono', monospace", letterSpacing: '0.1em',
            }}>PLAY AGAIN</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main trading UI ──
  return (
    <div style={{
      height: '100%', display: 'grid',
      gridTemplateColumns: '1fr 320px',
      gridTemplateRows: '48px 1fr 40px',
      background: '#0a0c12', fontFamily: "'SF Mono', monospace", color: '#fff',
      overflow: 'hidden',
    }}>
      {/* Flash overlay */}
      {flashEffect && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 50,
          background: flashEffect === 'buy' ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
          pointerEvents: 'none',
          animation: 'flash-fade 0.5s ease-out forwards',
        }} />
      )}
      <style>{`
        @keyframes flash-fade { from { opacity: 1; } to { opacity: 0; } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 8px rgba(255,107,53,0.3); } 50% { box-shadow: 0 0 20px rgba(255,107,53,0.6); } }
        @keyframes count-up { from { transform: translateY(8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes xp-float { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(-40px); opacity: 0; } }
        @keyframes toast-in { 0% { transform: translateX(120%); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
        @keyframes toast-out { 0% { transform: translateX(0); opacity: 1; } 100% { transform: translateX(120%); opacity: 0; } }
      `}</style>

      {/* Achievement toast */}
      {achievementToast && (
        <div style={{
          position: 'absolute', top: '60px', right: '16px', zIndex: 100,
          background: 'rgba(255,107,53,0.12)', border: '1px solid rgba(255,107,53,0.35)',
          borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px',
          animation: 'toast-in 0.4s ease-out',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 0 20px rgba(255,107,53,0.15)',
        }}>
          <span style={{ fontSize: '22px' }}>{achievementToast.icon}</span>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#ff6b35', letterSpacing: '0.05em' }}>ACHIEVEMENT UNLOCKED</div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>{achievementToast.label}</div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)' }}>{achievementToast.desc}</div>
          </div>
          <span style={{ fontSize: '11px', color: '#fbbf24', fontWeight: 700 }}>+150 XP</span>
        </div>
      )}

      {/* XP float popups */}
      {xpPopups.map(p => (
        <div key={p.id} style={{
          position: 'absolute', top: '40px', left: `${p.x}px`, zIndex: 90,
          color: '#fbbf24', fontSize: '13px', fontWeight: 800, pointerEvents: 'none',
          animation: 'xp-float 1.2s ease-out forwards',
          textShadow: '0 0 8px rgba(251,191,36,0.4)',
        }}>+{p.amount} XP</div>
      ))}

      {/* ── Portfolio Stats Bar ── */}
      <div style={{
        gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '24px', padding: '0 16px',
        background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>ROUND</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#ff6b35' }}>{round}/{totalRounds}</span>
        </div>
        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.08)' }} />
        {[
          { label: 'CASH', value: `$${fmt(cash)}`, color: '#fff' },
          { label: 'PORTFOLIO', value: `$${fmt(portfolioValue)}`, color: '#fff' },
          { label: 'TOTAL P&L', value: `$${fmtPnl(totalPnl)}`, color: totalPnl >= 0 ? '#4ade80' : '#f87171' },
          { label: "DAY P&L", value: `$${fmtPnl(dayPnl)}`, color: dayPnl >= 0 ? '#4ade80' : '#f87171' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>{item.label}</span>
            <span style={{
              fontSize: '12px', fontWeight: 700, color: item.color,
              animation: (item.label === 'TOTAL P&L' || item.label === "DAY P&L") && pnlFlash !== 0 ? 'count-up 0.4s ease' : 'none',
              textShadow: pnlFlash !== 0 && (item.label === "DAY P&L") ? `0 0 12px ${pnlFlash > 0 ? 'rgba(74,222,128,0.5)' : 'rgba(248,113,113,0.5)'}` : 'none',
            }}>{item.value}</span>
          </div>
        ))}
        <div style={{ flex: 1 }} />
        {/* Rank + XP bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '9px', fontWeight: 700, color: currentRank.color, letterSpacing: '0.05em' }}>{currentRank.title.toUpperCase()}</span>
          <div style={{ width: '60px', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${xpProgress * 100}%`, height: '100%', background: currentRank.color, borderRadius: '2px', transition: 'width 0.4s ease' }} />
          </div>
          <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)' }}>{xp}XP</span>
          {profitStreak >= 2 && (
            <span style={{ fontSize: '9px', color: '#fbbf24', fontWeight: 700, animation: 'count-up 0.3s ease' }}>{profitStreak}x streak</span>
          )}
        </div>
        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.08)' }} />
        {/* Day progress */}
        <div style={{
          width: '100px', height: '4px',
          background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden',
        }}>
          <div style={{
            width: `${(visibleDays / totalDays) * 100}%`, height: '100%',
            background: roundComplete ? '#4ade80' : '#ff6b35', borderRadius: '2px',
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* ── Chart Area ── */}
      <div style={{
        padding: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Chart header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#ff6b35', letterSpacing: '0.05em' }}>
              {revealed || roundComplete ? currentSymbol : '???'}
            </span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
              {revealed || roundComplete ? getName(currentSymbol) : 'Hidden Stock'}
            </span>
          </div>
          {visibleOHLC.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
                O <span style={{ color: '#fff' }}>{visibleOHLC[visibleOHLC.length - 1].open.toFixed(2)}</span>
              </span>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
                H <span style={{ color: '#4ade80' }}>{visibleOHLC[visibleOHLC.length - 1].high.toFixed(2)}</span>
              </span>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
                L <span style={{ color: '#f87171' }}>{visibleOHLC[visibleOHLC.length - 1].low.toFixed(2)}</span>
              </span>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
                C <span style={{ color: currentPrice >= prevPrice ? '#4ade80' : '#f87171' }}>{currentPrice.toFixed(2)}</span>
              </span>
            </div>
          )}
        </div>
        {/* SVG Chart */}
        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          {CandlestickChart}
        </div>
      </div>

      {/* ── Right Panel: Order Entry + Positions ── */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Order Entry */}
        <div style={{
          padding: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.01)',
        }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>ORDER ENTRY</div>

          {/* Bid/Ask */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>BID</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#4ade80' }}>{bidPrice.toFixed(2)}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>SPREAD</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>{spread.toFixed(2)}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>ASK</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#f87171' }}>{askPrice.toFixed(2)}</div>
            </div>
          </div>

          {/* Order type toggle */}
          <div style={{ display: 'flex', marginBottom: '10px', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
            {(['market', 'limit'] as const).map(t => (
              <button key={t} onClick={() => setOrderType(t)} style={{
                flex: 1, padding: '6px', border: 'none', cursor: 'pointer', fontSize: '10px', fontWeight: 600,
                letterSpacing: '0.1em', fontFamily: "'SF Mono', monospace", textTransform: 'uppercase',
                background: orderType === t ? 'rgba(255,107,53,0.15)' : 'transparent',
                color: orderType === t ? '#ff6b35' : 'rgba(255,255,255,0.3)',
                transition: 'all 0.2s ease',
              }}>{t}</button>
            ))}
          </div>

          {/* Limit price input */}
          {orderType === 'limit' && (
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginBottom: '4px', letterSpacing: '0.1em' }}>LIMIT PRICE</div>
              <input
                type="number"
                value={limitPrice || currentPrice}
                onChange={e => setLimitPrice(Number(e.target.value))}
                style={{
                  width: '100%', padding: '6px 8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '4px', color: '#fff', fontSize: '12px', fontFamily: "'SF Mono', monospace", outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          {/* Quantity */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginBottom: '4px', letterSpacing: '0.1em' }}>QUANTITY</div>
            <input
              type="number"
              value={orderQty}
              onChange={e => setOrderQty(Math.max(1, Number(e.target.value)))}
              style={{
                width: '100%', padding: '6px 8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '4px', color: '#fff', fontSize: '12px', fontFamily: "'SF Mono', monospace", outline: 'none',
                marginBottom: '6px', boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: '4px' }}>
              {[10, 50, 100].map(q => (
                <button key={q} onClick={() => setOrderQty(q)} style={{
                  flex: 1, padding: '4px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px',
                  background: orderQty === q ? 'rgba(255,107,53,0.12)' : 'transparent', cursor: 'pointer',
                  color: orderQty === q ? '#ff6b35' : 'rgba(255,255,255,0.3)', fontSize: '10px',
                  fontFamily: "'SF Mono', monospace", fontWeight: 600, transition: 'all 0.15s ease',
                }}>{q}</button>
              ))}
              <button onClick={() => setOrderQty(maxBuyQty)} style={{
                flex: 1, padding: '4px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px',
                background: 'transparent', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontSize: '10px',
                fontFamily: "'SF Mono', monospace", fontWeight: 600, transition: 'all 0.15s ease',
              }}>ALL</button>
            </div>
          </div>

          {/* Buy/Sell buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => executeTrade('buy', orderQty)}
              disabled={roundComplete || orderQty <= 0 || orderQty > maxBuyQty}
              style={{
                flex: 1, padding: '10px', border: 'none', borderRadius: '4px', cursor: roundComplete ? 'not-allowed' : 'pointer',
                background: roundComplete ? 'rgba(74,222,128,0.08)' : 'rgba(74,222,128,0.15)',
                color: roundComplete ? 'rgba(74,222,128,0.3)' : '#4ade80',
                fontSize: '12px', fontWeight: 800, fontFamily: "'SF Mono', monospace", letterSpacing: '0.1em',
                transition: 'all 0.2s ease',
                boxShadow: !roundComplete ? '0 0 12px rgba(74,222,128,0.1)' : 'none',
              }}
              onMouseEnter={e => { if (!roundComplete) (e.target as HTMLButtonElement).style.background = 'rgba(74,222,128,0.25)'; }}
              onMouseLeave={e => { if (!roundComplete) (e.target as HTMLButtonElement).style.background = 'rgba(74,222,128,0.15)'; }}
            >
              BUY
            </button>
            <button
              onClick={() => executeTrade('sell', Math.min(orderQty, maxSellQty))}
              disabled={roundComplete || maxSellQty <= 0}
              style={{
                flex: 1, padding: '10px', border: 'none', borderRadius: '4px', cursor: roundComplete || maxSellQty <= 0 ? 'not-allowed' : 'pointer',
                background: roundComplete || maxSellQty <= 0 ? 'rgba(248,113,113,0.08)' : 'rgba(248,113,113,0.15)',
                color: roundComplete || maxSellQty <= 0 ? 'rgba(248,113,113,0.3)' : '#f87171',
                fontSize: '12px', fontWeight: 800, fontFamily: "'SF Mono', monospace", letterSpacing: '0.1em',
                transition: 'all 0.2s ease',
                boxShadow: !(roundComplete || maxSellQty <= 0) ? '0 0 12px rgba(248,113,113,0.1)' : 'none',
              }}
              onMouseEnter={e => { if (!(roundComplete || maxSellQty <= 0)) (e.target as HTMLButtonElement).style.background = 'rgba(248,113,113,0.25)'; }}
              onMouseLeave={e => { if (!(roundComplete || maxSellQty <= 0)) (e.target as HTMLButtonElement).style.background = 'rgba(248,113,113,0.15)'; }}
            >
              SELL
            </button>
          </div>
        </div>

        {/* Position Tracker */}
        <div style={{ padding: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)', flex: '0 0 auto' }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', marginBottom: '10px' }}>POSITIONS</div>
          {currentPos ? (
            <div style={{
              padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px',
              borderLeft: `2px solid ${unrealizedPnl >= 0 ? '#4ade80' : '#f87171'}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#ff6b35' }}>{revealed || roundComplete ? currentSymbol : '???'}</span>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{currentPos.qty} shares</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                <div>
                  <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>ENTRY</div>
                  <div style={{ fontSize: '11px', color: '#fff' }}>{currentPos.avgCost.toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>CURRENT</div>
                  <div style={{ fontSize: '11px', color: '#fff' }}>{currentPrice.toFixed(2)}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>UNREALIZED P&L</div>
                  <div style={{
                    fontSize: '14px', fontWeight: 700, color: unrealizedPnl >= 0 ? '#4ade80' : '#f87171',
                    textShadow: pnlFlash !== 0 ? `0 0 10px ${unrealizedPnl >= 0 ? 'rgba(74,222,128,0.4)' : 'rgba(248,113,113,0.4)'}` : 'none',
                    transition: 'text-shadow 0.3s ease',
                  }}>
                    {fmtPnl(unrealizedPnl)} ({((unrealizedPnl / (currentPos.avgCost * currentPos.qty)) * 100).toFixed(2)}%)
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', textAlign: 'center', padding: '16px' }}>No open positions</div>
          )}
        </div>

        {/* Round complete actions */}
        {roundComplete && (
          <div style={{ padding: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{
              padding: '10px', background: 'rgba(255,107,53,0.08)', borderRadius: '4px',
              border: '1px solid rgba(255,107,53,0.2)', textAlign: 'center',
            }}>
              <div style={{ fontSize: '10px', color: '#ff6b35', letterSpacing: '0.15em', marginBottom: '6px' }}>
                ROUND {round} COMPLETE
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '10px' }}>
                Stock: <span style={{ color: '#ff6b35', fontWeight: 700 }}>{currentSymbol}</span> — {getName(currentSymbol)}
              </div>
              <button
                onClick={nextRound}
                style={{
                  padding: '8px 24px', border: 'none', borderRadius: '4px', cursor: 'pointer',
                  background: '#ff6b35', color: '#fff', fontSize: '11px', fontWeight: 700,
                  fontFamily: "'SF Mono', monospace", letterSpacing: '0.1em',
                  transition: 'all 0.2s ease', animation: 'pulse-glow 2s ease infinite',
                }}
              >
                {round >= totalRounds ? 'VIEW RESULTS' : `NEXT ROUND →`}
              </button>
            </div>
          </div>
        )}

        {/* Order History */}
        <div style={{ flex: 1, overflow: 'auto', padding: '14px', minHeight: 0 }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', marginBottom: '10px' }}>ORDER HISTORY</div>
          {orders.filter(o => o.symbol === currentSymbol).length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', textAlign: 'center', padding: '12px' }}>No trades yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {orders.filter(o => o.symbol === currentSymbol).slice().reverse().map(o => (
                <div key={o.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '6px 8px', background: 'rgba(255,255,255,0.02)', borderRadius: '3px',
                  borderLeft: `2px solid ${o.type === 'buy' ? '#4ade80' : '#f87171'}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      fontSize: '9px', fontWeight: 700, padding: '2px 5px', borderRadius: '2px',
                      background: o.type === 'buy' ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
                      color: o.type === 'buy' ? '#4ade80' : '#f87171',
                    }}>{o.type.toUpperCase()}</span>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>{o.qty} @ {o.price.toFixed(2)}</span>
                  </div>
                  <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)' }}>D{o.day}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div style={{
        gridColumn: '1 / -1', display: 'flex', alignItems: 'center', padding: '0 16px',
        background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)',
        fontSize: '9px', color: 'rgba(255,255,255,0.3)', gap: '16px', letterSpacing: '0.05em',
      }}>
        <span>TRADING ARENA v2.0</span>
        <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
        <span>{visibleDays}/{totalDays} DAYS</span>
        <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
        <span>{orders.length} TRADES</span>
        <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
        <span style={{ color: '#fbbf24' }}>{unlockedAchievements.length} ACHIEVEMENTS</span>
        <span style={{ flex: 1 }} />
        <span style={{ color: roundComplete ? '#4ade80' : '#ff6b35' }}>
          {roundComplete ? 'MARKET CLOSED' : 'MARKET OPEN'}
        </span>
      </div>
    </div>
  );
}

function BloombergTerminalView({ drillDown, setDrillDown }: {
  drillDown: { type: 'stock'; symbol: string; name: string } | { type: 'sector'; name: string } | null;
  setDrillDown: (v: { type: 'stock'; symbol: string; name: string } | { type: 'sector'; name: string } | null) => void;
}) {
  const stocks = useStockData();
  // Game mode disabled for now — code preserved but not accessible
  const gameMode = false;

  const hasDrillDown = drillDown !== null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0a0c12', fontFamily: "'SF Mono', monospace" }}>
      <BloombergTopBar stocks={stocks} gameMode={gameMode} onToggleGame={() => {}} />
      <div style={{ flex: 1, overflow: 'hidden', display: hasDrillDown ? 'block' : 'grid', gridTemplateColumns: hasDrillDown ? undefined : '50% 50%' }}>
        {hasDrillDown ? (
          <div className="bloomberg-scroll" style={{ height: '100%', overflowY: 'auto', background: '#1c1c1e' }}>
            {drillDown.type === 'stock' ? (
              <StockDetailView symbol={drillDown.symbol} name={drillDown.name} onBack={() => setDrillDown(null)} onSectorClick={(name) => setDrillDown({ type: 'sector', name })} />
            ) : (
              <SectorDetailView sectorName={drillDown.name} onBack={() => setDrillDown(null)} onStockClick={(symbol, name) => setDrillDown({ type: 'stock', symbol, name })} />
            )}
          </div>
        ) : (
          <>
            {/* Left column */}
            <div className="bloomberg-scroll" style={{ height: '100%', overflowY: 'auto', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
              <BloombergStockGrid6 stocks={stocks} onStockClick={(symbol, name) => setDrillDown({ type: 'stock', symbol, name })} />
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
              <MarketStatsBar />
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
              <PerformanceBarChart stocks={stocks} />
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
              <ScrollingNewsTape />
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
              <EconomicCalendar />
            </div>
            {/* Right column */}
            <div className="bloomberg-scroll" style={{ height: '100%', overflowY: 'auto' }}>
              <div style={{ display: 'flex', height: '240px' }}>
                <div style={{ flex: 1, borderRight: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}><SectorTreemap /></div>
                <div style={{ flex: 1, overflow: 'hidden' }}><SectorPieChart stocks={stocks} /></div>
              </div>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
              <CorrelationMatrix stocks={stocks} />
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
              <VolatilityGauge stocks={stocks} />
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
              <div style={{ display: 'flex' }}>
                <div style={{ flex: 1, borderRight: '1px solid rgba(255,255,255,0.06)' }}><MarketClock /></div>
                <div style={{ flex: 1 }}><OrderbookDepth /></div>
              </div>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
              <LiveNewsFeed />
            </div>
          </>
        )}
      </div>
      <BloombergBottomBar />
    </div>
  );
}

// ── Standalone Stocks App ──
function StocksApp() {
  const { state } = useDesktop();
  const isFullscreen = state.windows.stocks?.isFullscreen ?? false;
  const [drillDown, setDrillDown] = useState<{ type: 'stock'; symbol: string; name: string } | { type: 'sector'; name: string } | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && drillDown) { setDrillDown(null); e.preventDefault(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drillDown]);

  if (isFullscreen) {
    return <BloombergTerminalView drillDown={drillDown} setDrillDown={setDrillDown} />;
  }

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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '28px 24px 14px 24px', justifyContent: 'space-between' }}>
      <div>
        {/* Tech Stack */}
        <div style={{ marginTop: '16px' }}>
          <div style={sectionLabel}>TECH STACK</div>
          {TECH_STACK.map(cat => (
            <div key={cat.category} style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '10px', color: '#fff', fontFamily: "'SF Mono', monospace", marginBottom: '5px', textTransform: 'uppercase' as const, fontWeight: 600 }}>{cat.category}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {cat.items.map((item, i) => {
                  const theme = CATEGORY_THEME[cat.category] || { color: '#fff', rgb: '255,255,255' };
                  const opacity = 0.18 - (i * 0.02);
                  return (
                    <span key={item} style={{
                      fontSize: '11.5px', padding: '3px 10px', borderRadius: 5,
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

      </div>

      {/* GitHub Heatmap removed — moved to notification center */}
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
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#ff6b35', letterSpacing: '0.1em', fontFamily: "'SF Mono', monospace", padding: '0 10px', flexShrink: 0 }}>
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
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff', letterSpacing: '0.1em', fontFamily: "'SF Mono', monospace" }}>
          MARKET NEWS
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', color: 'rgba(255,255,255,0.85)', fontFamily: "'SF Mono', monospace" }}>
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
              <span style={{ color: getColor(item.source), fontSize: '10px', fontWeight: 700, fontFamily: "'SF Mono', monospace", letterSpacing: '0.05em' }}>
                {item.source.toUpperCase()}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontFamily: "'SF Mono', monospace" }}>
                {timeAgo(item.pubDate)}
              </span>
            </div>
            <div style={{
              fontSize: '11px', fontWeight: 500, color: 'rgba(255,255,255,0.85)', lineHeight: 1.35,
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
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', fontWeight: 700, letterSpacing: '0.08em', fontFamily: "'SF Mono', monospace", marginBottom: '2px' }}>
                {ind.label}
              </div>
              <div style={{ fontSize: '13px', color: '#fff', fontWeight: 600, fontFamily: "'SF Mono', monospace", fontVariantNumeric: 'tabular-nums' }}>
                {ind.value}
              </div>
              <div style={{ fontSize: '10px', color, fontWeight: 600, fontFamily: "'SF Mono', monospace" }}>
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
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff', letterSpacing: '0.1em', fontFamily: "'SF Mono', monospace" }}>
          UPCOMING
        </div>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', fontFamily: "'SF Mono', monospace" }}>
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
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)', fontFamily: "'SF Mono', monospace", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {evt.label}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontFamily: "'SF Mono', monospace" }}>
                  {new Date(evt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span style={{ fontSize: '10px', fontWeight: 600, color: countdown === 'Today' ? '#f87171' : countdown === 'Tomorrow' ? '#fbbf24' : 'rgba(255,255,255,0.75)', fontFamily: "'SF Mono', monospace", minWidth: '44px', textAlign: 'right' }}>
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
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.1em', fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>BTC ORDERBOOK</span>
        <div style={{ display: 'flex', gap: '8px', fontSize: '10px', fontFamily: "'SF Mono', monospace" }}>
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

function ChronographWatch() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 50);
    return () => clearInterval(id);
  }, []);
  const h = time.getHours() % 12;
  const m = time.getMinutes();
  const s = time.getSeconds();
  const ms = time.getMilliseconds();
  const hAngle = (h * 30 + m * 0.5) - 90;
  const mAngle = (m * 6 + s * 0.1) - 90;
  const sAngle = (s * 6 + ms * 0.006) - 90;
  const C = 100; // center
  const toRad = (deg: number) => deg * (Math.PI / 180);
  return (
    <svg width="160" height="160" viewBox="0 0 200 200" fill="none" style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.1))' }}>
      {/* Outer rings */}
      <circle cx={C} cy={C} r="94" stroke="rgba(255,255,255,0.6)" strokeWidth="1" fill="none" />
      <circle cx={C} cy={C} r="90" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" fill="none" />
      {/* Brand name */}
      <text x={C} y="48" textAnchor="middle" fill="#fff" fontSize="7" fontFamily="'SF Pro Display', -apple-system, sans-serif" fontWeight="700" letterSpacing="3">GANDHE</text>
      {/* Hour markers */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = toRad(i * 30 - 90);
        const r1 = i % 3 === 0 ? 74 : 78;
        const r2 = 86;
        return <line key={i} x1={C + r1 * Math.cos(a)} y1={C + r1 * Math.sin(a)} x2={C + r2 * Math.cos(a)} y2={C + r2 * Math.sin(a)} stroke="rgba(255,255,255,0.9)" strokeWidth={i % 3 === 0 ? 2.5 : 1} strokeLinecap="round" />;
      })}
      {/* Minute ticks */}
      {Array.from({ length: 60 }).map((_, i) => {
        if (i % 5 === 0) return null;
        const a = toRad(i * 6 - 90);
        return <line key={`t${i}`} x1={C + 83 * Math.cos(a)} y1={C + 83 * Math.sin(a)} x2={C + 86 * Math.cos(a)} y2={C + 86 * Math.sin(a)} stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />;
      })}
      {/* Sub-dial top — 30min */}
      <circle cx={C} cy={68} r="15" stroke="rgba(255,255,255,0.5)" strokeWidth="0.7" fill="none" />
      <line x1={C} y1={68} x2={C + 11 * Math.cos(toRad(m * 12 - 90))} y2={68 + 11 * Math.sin(toRad(m * 12 - 90))} stroke="rgba(255,255,255,0.8)" strokeWidth="0.8" strokeLinecap="round" />
      {/* Sub-dial left — running seconds */}
      <circle cx={68} cy={C} r="15" stroke="rgba(255,255,255,0.5)" strokeWidth="0.7" fill="none" />
      <line x1={68} y1={C} x2={68 + 11 * Math.cos(toRad(sAngle))} y2={C + 11 * Math.sin(toRad(sAngle))} stroke="rgba(255,255,255,0.9)" strokeWidth="0.8" strokeLinecap="round" />
      {/* Sub-dial right — 12hr */}
      <circle cx={132} cy={C} r="15" stroke="rgba(255,255,255,0.5)" strokeWidth="0.7" fill="none" />
      <line x1={132} y1={C} x2={132 + 11 * Math.cos(toRad(hAngle))} y2={C + 11 * Math.sin(toRad(hAngle))} stroke="rgba(255,255,255,0.8)" strokeWidth="0.8" strokeLinecap="round" />
      {/* Hour hand */}
      <line x1={C} y1={C} x2={C + 46 * Math.cos(toRad(hAngle))} y2={C + 46 * Math.sin(toRad(hAngle))} stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      {/* Minute hand */}
      <line x1={C} y1={C} x2={C + 64 * Math.cos(toRad(mAngle))} y2={C + 64 * Math.sin(toRad(mAngle))} stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      {/* Second hand — bright white */}
      <line x1={C - 14 * Math.cos(toRad(sAngle))} y1={C - 14 * Math.sin(toRad(sAngle))} x2={C + 78 * Math.cos(toRad(sAngle))} y2={C + 78 * Math.sin(toRad(sAngle))} stroke="#fff" strokeWidth="0.8" strokeLinecap="round" />
      {/* Center */}
      <circle cx={C} cy={C} r="4" fill="rgba(255,255,255,0.8)" />
      <circle cx={C} cy={C} r="1.8" fill="#fff" />
      {/* Crown */}
      <rect x="192" y="96" width="7" height="8" rx="1.5" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.7" />
      {/* Pushers */}
      <rect x="190" y="70" width="8" height="4" rx="1" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />
      <rect x="190" y="126" width="8" height="4" rx="1" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />
    </svg>
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
  const isSmallScreen = typeof window !== 'undefined' && window.innerHeight < 850;

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

  const runCommand = (raw: string, _source: 'ui' | 'typed' = 'typed') => {
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
      const { window: win, output } = SMART_COMMANDS[cmd];
      newLines.push({ type: 'system', text: output });
      openWindow(win);
    } else if (COMMANDS[cmd]) {
      const { window: winId, desc } = COMMANDS[cmd];
      newLines.push({ type: 'system', text: `Opening ${desc.toLowerCase()}...` });
      openWindow(winId);
    } else if (cmd.startsWith('cd ')) {
      const target = cmd.replace('cd ', '').replace(/[\/~]/g, '').trim();
      if (COMMANDS[target]) {
        const { window: winId2, desc } = COMMANDS[target];
        newLines.push({ type: 'system', text: `Opening ${desc.toLowerCase()}...` });
        openWindow(winId2);
      } else {
        newLines.push({ type: 'error', text: `cd: no such directory: ${target}` });
        newLines.push({ type: 'output', text: 'Type "help" to see available commands.' });
      }
    } else if (cmd.startsWith('open ')) {
      const target = cmd.replace('open ', '').trim();
      if (COMMANDS[target]) {
        const { window: winId3, desc } = COMMANDS[target];
        newLines.push({ type: 'system', text: `Opening ${desc.toLowerCase()}...` });
        openWindow(winId3);
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

    const now = Date.now();
    const stamped = newLines.map(l => ({ ...l, ts: now }));
    setHistory(prev => [...prev, ...stamped]);
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
      case 'human': return 'rgba(255,255,255,0.55)';
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
  const DESIGN_MODE = 'split' as 'split' | 'bento' | 'bigtype' | 'dashboard';

  // Auto-fade old terminal lines after 15s
  useEffect(() => {
    if (history.length === 0) return;
    const timer = setInterval(() => {
      const now = Date.now();
      setHistory(prev => prev.filter(line => !line.ts || now - line.ts < 18000));
    }, 3000);
    return () => clearInterval(timer);
  }, [history.length]);

  // Shared terminal prompt + history renderer
  const renderTerminal = (compact?: boolean, mono?: boolean) => (
    <div style={{ fontFamily: mono !== false ? "'SF Mono', 'JetBrains Mono', 'Menlo', monospace" : 'inherit', fontSize: compact ? '12.5px' : '13px', lineHeight: 1.5 }}>
      {history.map((line, i) => {
        const age = line.ts ? Date.now() - line.ts : 0;
        const isFading = line.ts && age > 15000;
        return (
          <div key={i} style={{
            color: getLineColor(line), whiteSpace: 'pre-wrap',
            opacity: isFading ? 0 : 1,
            transform: isFading ? 'translateY(-12px) scale(0.97)' : 'translateY(0) scale(1)',
            filter: isFading ? 'blur(2px)' : 'blur(0px)',
            transition: 'opacity 3s ease-out, transform 3s ease-out, filter 3s ease-out',
          }}>
            {line.type === 'prompt' ? (
              <><span style={{ color: '#4ade80', fontWeight: 700 }}>{prompt}</span><span style={{ color: '#fff', fontWeight: 500 }}>{line.command}</span></>
            ) : line.text.includes('\x1b[cmd]') ? renderColoredLine(line.text) : line.text}
          </div>
        );
      })}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
            <a href="https://www.linkedin.com/in/ronniel-gandhe/" target="_blank" rel="noopener" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>💼 linkedin.com/in/ronniel-gandhe</a>
            <a href="https://github.com/ronnielgandhe" target="_blank" rel="noopener" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>🐙 github.com/ronnielgandhe</a>
            <a href="mailto:ronnielgandhe@gmail.com" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>✉️ ronnielgandhe@gmail.com</a>
            <span style={{ color: '#fff' }}>📍 Waterloo, ON</span>
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
          <div style={{ display: 'flex', gap: '20px', fontSize: '13px', fontFamily: "'SF Mono', monospace", marginBottom: '24px' }}>
            <a href="https://www.linkedin.com/in/ronniel-gandhe/" target="_blank" rel="noopener" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>💼 LinkedIn</a>
            <a href="https://github.com/ronnielgandhe" target="_blank" rel="noopener" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>🐙 GitHub</a>
            <a href="mailto:ronnielgandhe@gmail.com" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>✉️ Email</a>
            <span style={{ color: '#fff' }}>📍 Waterloo, ON</span>
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
          <div style={{ display: 'flex', gap: '16px', fontSize: '13px', fontFamily: "'SF Mono', monospace", marginBottom: '20px' }}>
            <a href="https://www.linkedin.com/in/ronniel-gandhe/" target="_blank" rel="noopener" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>💼 LinkedIn</a>
            <a href="https://github.com/ronnielgandhe" target="_blank" rel="noopener" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>🐙 GitHub</a>
            <a href="mailto:ronnielgandhe@gmail.com" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>✉️ Email</a>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>📍 Waterloo</span>
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
        width: isFullscreen ? '100%' : undefined,
        flex: isFullscreen ? 'none' : 1,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: isFullscreen ? (isSmallScreen ? '20px 28px 36px 28px' : '28px 48px 50px 48px') : '28px 20px 14px 28px', borderRight: isFullscreen ? 'none' : '1px solid rgba(255,255,255,0.04)',
        minWidth: 0, flexShrink: 0,
        overflowY: isFullscreen ? 'auto' : 'hidden',
        overflowX: 'hidden',
        position: 'relative' as const,
      }}>
        {/* Hero text */}
        <div>
          <div style={{ fontFamily: "'SF Mono', 'JetBrains Mono', monospace", fontSize: isFullscreen ? '15.5px' : '14px', lineHeight: 1.6, color: isFullscreen ? '#f0f0f0' : '#e0e0e0' }}>
            {isFullscreen ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontFamily: "'SF Pro Display', -apple-system, sans-serif", fontWeight: 800, fontSize: isSmallScreen ? '32px' : '42px', color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.1, marginBottom: '4px' }}>
                    Ronniel Gandhe
                  </div>
                  <div style={{ fontSize: isSmallScreen ? '12px' : '14px', marginBottom: isSmallScreen ? '8px' : '12px', fontFamily: "'SF Pro Text', -apple-system, sans-serif", letterSpacing: '0.3px' }}>
                    <RollingTitles />
                  </div>
                </div>
                <div style={{ color: '#fff', fontSize: '11px', fontWeight: 700, fontFamily: "'SF Pro Display', -apple-system, sans-serif", textAlign: 'right', paddingTop: '8px', flexShrink: 0, marginLeft: '16px' }}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontFamily: "'SF Pro Display', -apple-system, sans-serif", fontWeight: 800, fontSize: '34px', color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.1, marginBottom: '4px' }}>
                  Ronniel Gandhe
                </div>
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', fontWeight: 400, marginBottom: '16px' }}>
                  Software Engineer
                </div>
              </>
            )}
            {isFullscreen ? (() => {
              const sHead: React.CSSProperties = { color: '#fff', fontSize: isSmallScreen ? '10px' : '11.5px', fontWeight: 700, letterSpacing: '0.12em', marginBottom: isSmallScreen ? '5px' : '8px', fontFamily: "'SF Mono', monospace" };
              const sPara: React.CSSProperties = { color: 'rgba(255,255,255,0.92)', fontSize: isSmallScreen ? '12px' : '14.5px', lineHeight: isSmallScreen ? 1.5 : 1.65, fontFamily: "'SF Pro Text', -apple-system, sans-serif", fontWeight: 400 };
              const sRule: React.CSSProperties = { width: '40px', height: '1px', background: 'rgba(255,255,255,0.1)', margin: isSmallScreen ? '6px 0' : '10px 0' };
              return (
              <div style={{ marginTop: '2px', display: 'flex', gap: isSmallScreen ? '24px' : '40px' }}>
                {/* ── Left Column ── */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  {/* About */}
                  <div style={sHead}>ABOUT</div>
                  <div style={sPara}>
                    Currently based in Waterloo, Canada. Waterloo is a weird place. Half the people here are trying to build startups, the other half are trying to get into big tech, and the rest end up falling into strange rabbit holes like trading, crypto, or building random tools at 2AM. I fall somewhere in that third group.
                  </div>
                  <div style={{ ...sPara, marginTop: '6px' }}>
                    Most of my time is spent building software, studying markets, and trying to understand systems that actually move money and incentives in the real world. Over the last few years I have moved between software engineering, data science, and financial markets. Some of that was intentional. Some of it was just curiosity turning into a rabbit hole that got deeper than expected. Recently I have also gotten into growth engineering.
                  </div>
                  <div style={{ ...sPara, marginTop: '6px' }}>
                  </div>

                  <div style={sRule} />

                  {/* Software */}
                  <div style={sHead}>SOFTWARE</div>
                  <div style={sPara}>
                    Software is probably the most powerful skill you can have right now. If you know how to code, you can build almost anything. You do not need permission from anyone, you just sit down and make it.
                  </div>
                  <div style={{ ...sPara, marginTop: '6px' }}>
                    Most of the things I build end up somewhere between software engineering, data systems, and financial markets. I like tools that interact with real incentives. Things where the outcome actually matters and you can see the result of what you built.
                  </div>

                  {/* Chronograph Watch */}
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, marginTop: '0px' }}>
                    <ChronographWatch />
                  </div>


                </div>

                {/* ── Right Column ── */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  {/* Reading */}
                  <div style={sHead}>READING</div>
                  <div style={sPara}>
                    Most of what I read falls into biographies, strategy, and people trying to explain how the world actually works. I like biographies because they show how messy reality actually is.
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px' }}>
                    {[
                      'Zero to One — Peter Thiel',
                      'The Laws of Human Nature — Robert Greene',
                      'Poor Charlie\'s Almanack — Charlie Munger',
                      'The Power Broker — Robert Caro',
                    ].map((book, i) => (
                      <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                        <span style={{ color: '#fff', fontSize: '9px', fontFamily: "'SF Mono', monospace" }}>›</span>
                        <span style={{ ...sPara }}>{book}</span>
                      </div>
                    ))}
                  </div>

                  <div style={sRule} />

                  {/* Health */}
                  <div style={sHead}>HEALTH</div>
                  <div style={sPara}>
                    Coding and trading are both very good ways to destroy your body if you are not careful. I try to keep some structure around it. I lift about four times a week, try to get around ten thousand steps a day, and my diet is almost carnivore at this point. It keeps me sharp and offsets the reality of staring at screens most of the day.
                  </div>

                  {/* Current Focus + Online (left) | Markets (right) */}
                  <div style={{ display: 'flex', gap: '48px', marginTop: '14px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={sHead}>CURRENT FOCUS</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {[
                          'Building software and internal tools',
                          'Studying financial markets and trading systems',
                          'Turning ideas into working products quickly',
                        ].map((item, i) => (
                          <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                            <span style={{ color: '#fff', fontSize: '9px', fontFamily: "'SF Mono', monospace" }}>›</span>
                            <span style={{ ...sPara }}>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={sHead}>MARKETS</div>
                      <div style={sPara}>
                        Markets are one of the most honest systems in the world. They do not care where you went to school or about your opinions. They only care about decisions and consequences. At first I thought markets were about intelligence. Then I realized they are mostly about self-control.
                      </div>
                    </div>
                  </div>

                </div>
              </div>
              );
            })() : (
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

        {/* Bottom section: Contact */}
        <div>
          {isFullscreen ? (
            <div style={{
              display: 'flex', flexDirection: isSmallScreen ? 'column' : 'row',
              gap: isSmallScreen ? '4px' : '16px', alignItems: isSmallScreen ? 'flex-start' : 'center',
              fontFamily: "'SF Mono', monospace", fontSize: isSmallScreen ? '12px' : '15px',
              marginTop: isSmallScreen ? '14px' : '24px', paddingBottom: isSmallScreen ? '20px' : '40px',
            }}>
              <a href="https://www.linkedin.com/in/ronniel-gandhe/" target="_blank" rel="noopener" style={{ color: '#fff', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>
                💼 {isSmallScreen ? 'linkedin.com/in/ronniel-gandhe' : 'linkedin'}
              </a>
              {!isSmallScreen && <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>}
              <a href="https://github.com/ronnielgandhe" target="_blank" rel="noopener" style={{ color: '#fff', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>
                🐙 {isSmallScreen ? 'github.com/ronnielgandhe' : 'github'}
              </a>
              {!isSmallScreen && <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>}
              <a href="mailto:ronnielgandhe@gmail.com" style={{ color: '#fff', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>
                ✉️ ronnielgandhe@gmail.com
              </a>
              {!isSmallScreen && <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>}
              <span style={{ color: '#fff' }}>📍 Waterloo, ON</span>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', marginTop: '16px' }}>
              <div style={{ fontFamily: "'SF Mono', monospace", display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px' }}>
                <a href="https://www.linkedin.com/in/ronniel-gandhe/" target="_blank" rel="noopener" style={{ color: '#fff', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>
                  💼 linkedin.com/in/ronniel-gandhe
                </a>
                <a href="https://github.com/ronnielgandhe" target="_blank" rel="noopener" style={{ color: '#fff', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>
                  🐙 github.com/ronnielgandhe
                </a>
                <a href="mailto:ronnielgandhe@gmail.com" style={{ color: '#fff', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>
                  ✉️ ronnielgandhe@gmail.com
                </a>
                <span style={{ color: '#fff' }}>📍 Waterloo, ON</span>
              </div>
            </div>
          )}
        </div>
        {/* Empty space — right whitespace */}
      </div>

      {/* Middle — Tech Stack, Certs, GitHub heatmap (fullscreen only) */}
      {isFullscreen && (
        <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', overflowX: 'hidden' }}>
          <MiddlePanel runCommand={runCommand} />
        </div>
      )}

      {/* Right panel — hidden in fullscreen */}
      <div ref={scrollRef} onClick={() => inputRef.current?.focus()} style={{
        flex: isFullscreen ? 'none' : 1,
        width: isFullscreen ? 0 : undefined,
        flexShrink: 0,
        display: isFullscreen ? 'none' : 'flex', flexDirection: 'column',
        cursor: 'text', fontFamily: "'SF Mono', monospace", overflow: 'hidden',
      }}>
        {isFullscreen ? null : (
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

      {/* Collapse hint — bottom right, fullscreen only */}
      {isFullscreen && (
        <div
          onClick={() => dispatch({ type: 'TOGGLE_FULLSCREEN', id: 'terminal' })}
          style={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            cursor: 'pointer',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px 5px 12px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
          }}
        >
          <span style={{
            fontSize: '11px',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.7)',
            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
            letterSpacing: '0.02em',
          }}>Collapse</span>
          <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
            <path d="M1 17V1h17" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}

      {/* Expand hint — bottom right, non-fullscreen only, hidden while typing */}
      {!isFullscreen && !input && (
        <div
          onClick={() => dispatch({ type: 'TOGGLE_FULLSCREEN', id: 'terminal' })}
          style={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            cursor: 'pointer',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px 5px 12px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(8px)',
            animation: 'expandHintPulse 3s ease-in-out infinite',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
            e.currentTarget.style.animation = 'none';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.animation = 'expandHintPulse 3s ease-in-out infinite';
          }}
        >
          <span style={{
            fontSize: '11px',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.7)',
            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
            letterSpacing: '0.02em',
          }}>Click to expand</span>
          <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
            <path d="M18 1v17H1" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
@keyframes expandHintPulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
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

// ── Books data ──
const BOOKS_DATA = [
  {
    slug: 'investor-behavior-gap',
    title: 'Why Investors Underperform the Markets They Invest In',
    summary: 'Financial markets produce strong long-term returns, yet the average investor consistently earns far less.',
    readingTime: 14,
    coverGradient: ['#0a1628', '#1a2744', '#2a3a5c'],
    coverAccent: '#4a9eff',
    company: 'NDX',
  },
  {
    slug: 'discipline-paradox',
    title: 'The Discipline Paradox',
    summary: 'Why do insanely talented people fail while mediocre disciplined people win?',
    readingTime: 16,
    coverGradient: ['#1a0a0a', '#2a1515', '#3d2020'],
    coverAccent: '#e8554a',
    company: 'IKIGAI',
  },
  {
    slug: 'enterprise-software-cost',
    title: 'Why Enterprise Software Costs Millions',
    summary: 'Understanding why companies pay enormous sums for tools that often look like spreadsheets.',
    readingTime: 12,
    coverGradient: ['#0a1a0a', '#152e15', '#1e4420'],
    coverAccent: '#4ade80',
    company: 'SAP',
  },
  {
    slug: 'attention-economy',
    title: 'The Attention Economy Is Rewiring Human Motivation',
    summary: 'Why the ability to focus may become the most valuable skill in the modern economy.',
    readingTime: 13,
    coverGradient: ['#1a0a14', '#2e1525', '#44203a'],
    coverAccent: '#f472b6',
    company: 'DEEP FOCUS',
  },
];

function ReaderPage({ text }: { text: string }) {
  if (!text) return <div style={{ flex: 1 }} />;
  const lines = text.split('\n');
  return (
    <div style={{ flex: 1, fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: '14px', lineHeight: 1.7, color: '#2a2218', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('### ')) return <h3 key={i} style={{ fontSize: '15px', fontWeight: 700, margin: '14px 0 6px', fontFamily: "'Georgia', serif" }}>{trimmed.slice(4)}</h3>;
        if (trimmed.startsWith('## ')) return <h2 key={i} style={{ fontSize: '17px', fontWeight: 700, margin: '16px 0 8px', fontFamily: "'Georgia', serif" }}>{trimmed.slice(3)}</h2>;
        if (trimmed.startsWith('# ')) return <h1 key={i} style={{ fontSize: '19px', fontWeight: 700, margin: '18px 0 10px', fontFamily: "'Georgia', serif" }}>{trimmed.slice(2)}</h1>;
        if (trimmed === '') return <div key={i} style={{ height: '8px' }} />;
        const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i} style={{ margin: '0 0 4px', textAlign: 'justify' }}>
            {parts.map((part, j) =>
              part.startsWith('**') && part.endsWith('**')
                ? <strong key={j}>{part.slice(2, -2)}</strong>
                : part
            )}
          </p>
        );
      })}
    </div>
  );
}

// ── 3D Book rendering helper (shared between applet grid and expanded view) ──
function Book3D({ book, isOpen, isSelected, isHovered, phase, gradient, rotY, rotX, contentData, readerMode, readerPages, readerPage, setReaderMode, setReaderPages, setReaderPage, handleClose }: {
  book: typeof BOOKS_DATA[0]; isOpen: boolean; isSelected: boolean; isHovered: boolean;
  phase: string; gradient: string; rotY: number; rotX: number;
  contentData: ContentViewData | null; readerMode: boolean; readerPages: string[];
  readerPage: number; setReaderMode: (v: boolean | ((p: boolean) => boolean)) => void;
  setReaderPages: (v: string[]) => void; setReaderPage: (v: number | ((p: number) => number)) => void;
  handleClose: () => void;
}) {
  return (
    <>
      {/* 3D Book front face */}
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: '4px 10px 10px 4px',
        overflow: 'hidden',
        background: gradient,
        boxShadow: (isSelected && isOpen)
          ? `0 40px 100px rgba(0,0,0,0.7), 0 15px 40px rgba(0,0,0,0.5), -8px 8px 25px rgba(0,0,0,0.3)`
          : isHovered
            ? `0 30px 80px rgba(0,0,0,0.6), 0 10px 30px rgba(0,0,0,0.4)`
            : `0 20px 60px rgba(0,0,0,0.5), 0 6px 20px rgba(0,0,0,0.3)`,
        transition: 'box-shadow 0.4s ease',
      }}>
        {/* Spine edge */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: isOpen && isSelected ? '10px' : '8px',
          background: `linear-gradient(90deg, ${book.coverGradient[0]}ee, ${book.coverGradient[1]}cc)`,
          borderRight: '1px solid rgba(255,255,255,0.06)',
          transition: 'width 0.4s ease', zIndex: 2,
        }} />
        {/* Spine highlight */}
        <div style={{
          position: 'absolute', left: '2px', top: '8px', bottom: '8px', width: '1px',
          background: 'rgba(255,255,255,0.12)', borderRadius: '1px', zIndex: 3,
        }} />

        {/* Book cover content */}
        {!(isSelected && phase === 'content') ? (
          <div style={{
            position: 'absolute', inset: 0,
            padding: isOpen && isSelected ? '40px 30px 30px 36px' : '28px 22px 22px 26px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            transition: 'padding 0.7s ease', zIndex: 5,
          }}>
            <div>
              {book.company === 'NDX' ? (
                <img src="/NASDAQ_Logo.svg.png" alt="Nasdaq"
                  height={isOpen && isSelected ? 32 : 22}
                  style={{ filter: 'brightness(0) invert(1)', opacity: 0.9, transition: 'height 0.6s ease' }} />
              ) : book.company === 'IKIGAI' ? (
                <img src="/ikigai.png" alt="Ikigai"
                  height={isOpen && isSelected ? 50 : 36}
                  style={{ opacity: 0.9, transition: 'height 0.6s ease' }} />
              ) : book.company === 'SAP' ? (
                <img src="/sap_white_transparent.png" alt="SAP"
                  height={isOpen && isSelected ? 36 : 24}
                  style={{ opacity: 0.9, transition: 'height 0.6s ease' }} />
              ) : book.company === 'DEEP FOCUS' ? (
                <img src="/lotus_white_transparent.png" alt="Deep Focus"
                  height={isOpen && isSelected ? 44 : 30}
                  style={{ opacity: 0.9, transition: 'height 0.6s ease' }} />
              ) : (
                <span style={{
                  fontSize: isOpen && isSelected ? '14px' : '10px', fontWeight: 700,
                  letterSpacing: '0.15em', color: book.coverAccent, opacity: 0.85,
                  fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                  transition: 'font-size 0.6s ease', textTransform: 'uppercase',
                }}>{book.company}</span>
              )}
            </div>
            <div>
              <h3 style={{
                fontSize: isOpen && isSelected ? '24px' : '17px',
                fontWeight: 700, color: '#ffffff', lineHeight: 1.35, margin: '0 0 10px',
                fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                transition: 'font-size 0.6s ease', textShadow: '0 1px 4px rgba(0,0,0,0.3)',
              }}>{book.title}</h3>
              <p style={{
                fontSize: isOpen && isSelected ? '14px' : '12px',
                color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, margin: 0,
                transition: 'font-size 0.6s ease',
              }}>{book.summary}</p>
            </div>
            <div>
              <div style={{
                height: '2px', width: isOpen && isSelected ? '60px' : '40px',
                borderRadius: '1px', background: book.coverAccent, opacity: 0.7,
                transition: 'width 0.6s ease',
                marginBottom: isOpen && isSelected ? '12px' : '0',
              }} />
              {isOpen && isSelected && phase === 'expanding' && (
                <span style={{
                  fontSize: '13px', color: 'rgba(255,255,255,0.45)',
                  fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                  animation: 'contentFadeIn 0.5s ease-out 0.6s both', letterSpacing: '0.02em',
                }}>Tap to open →</span>
              )}
            </div>
          </div>
        ) : (
          /* Content phase: show the ContentViewer inside the book */
          <div style={{
            position: 'absolute', inset: 0,
            background: readerMode ? '#f5f1ea' : 'rgba(20, 20, 20, 0.85)',
            overflow: 'hidden', display: 'flex', flexDirection: 'column',
            borderRadius: '4px 10px 10px 4px', zIndex: 10, transition: 'background 0.3s ease',
          }}>
            {/* Top bar: reader toggle + close */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px 0', zIndex: 11 }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!readerMode && contentData?.markdown) {
                    const text = contentData.markdown;
                    const chunks: string[] = [];
                    const paragraphs = text.split('\n\n');
                    let current = '';
                    for (const p of paragraphs) {
                      if (current.length + p.length > 800 && current.length > 200) { chunks.push(current.trim()); current = p + '\n\n'; }
                      else { current += p + '\n\n'; }
                    }
                    if (current.trim()) chunks.push(current.trim());
                    setReaderPages(chunks); setReaderPage(0);
                  }
                  setReaderMode(!readerMode);
                }}
                style={{
                  background: readerMode ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
                  border: `1px solid ${readerMode ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)'}`,
                  color: readerMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)',
                  borderRadius: '6px', padding: '4px 10px', cursor: 'pointer',
                  fontSize: '10px', fontFamily: "'SF Mono', monospace",
                  transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '4px',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                {readerMode ? 'Scroll' : 'Reader'}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleClose(); }}
                style={{
                  background: readerMode ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
                  border: `1px solid ${readerMode ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)'}`,
                  color: readerMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)',
                  borderRadius: '6px', padding: '4px 12px', cursor: 'pointer',
                  fontSize: '11px', fontFamily: "'SF Mono', monospace", transition: 'all 0.15s',
                }}
              >ESC</button>
            </div>
            {contentData ? (
              readerMode ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <div style={{ flex: 1, display: 'flex', gap: '1px', background: 'rgba(0,0,0,0.08)', margin: '8px 10px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ flex: 1, background: '#f8f5ef', padding: '24px 20px 16px 24px', overflowY: 'auto', fontSize: '11px', lineHeight: 1.7, color: '#2a2a2a', fontFamily: "'Georgia', 'Times New Roman', serif", borderRight: '1px solid rgba(0,0,0,0.06)' }}>
                      <ReaderPage text={readerPages[readerPage * 2] || ''} />
                      <div style={{ position: 'absolute', bottom: '8px', left: '20px', fontSize: '9px', color: 'rgba(0,0,0,0.25)' }}>{readerPage * 2 + 1}</div>
                    </div>
                    <div style={{ flex: 1, background: '#faf7f2', padding: '24px 24px 16px 20px', overflowY: 'auto', fontSize: '11px', lineHeight: 1.7, color: '#2a2a2a', fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                      <ReaderPage text={readerPages[readerPage * 2 + 1] || ''} />
                      <div style={{ position: 'absolute', bottom: '8px', right: '20px', fontSize: '9px', color: 'rgba(0,0,0,0.25)' }}>{readerPage * 2 + 2}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', padding: '4px 0 8px' }}>
                    <button onClick={(e) => { e.stopPropagation(); setReaderPage(p => Math.max(0, p - 1)); }} disabled={readerPage === 0}
                      style={{ background: 'none', border: 'none', cursor: readerPage === 0 ? 'default' : 'pointer', color: readerPage === 0 ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.5)', fontSize: '16px', padding: '2px 8px' }}>‹</button>
                    <span style={{ fontSize: '10px', color: 'rgba(0,0,0,0.4)', fontFamily: "'SF Mono', monospace" }}>
                      {readerPage * 2 + 1}–{Math.min(readerPage * 2 + 2, readerPages.length)} of {readerPages.length}
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); setReaderPage(p => Math.min(Math.ceil(readerPages.length / 2) - 1, p + 1)); }}
                      disabled={readerPage >= Math.ceil(readerPages.length / 2) - 1}
                      style={{ background: 'none', border: 'none', cursor: readerPage >= Math.ceil(readerPages.length / 2) - 1 ? 'default' : 'pointer', color: readerPage >= Math.ceil(readerPages.length / 2) - 1 ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.5)', fontSize: '16px', padding: '2px 8px' }}>›</button>
                  </div>
                </div>
              ) : (
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <ContentViewer content={contentData} onClose={handleClose} windowMode />
                </div>
              )
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Loading...</div>
            )}
          </div>
        )}

        {/* Grain texture */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, pointerEvents: 'none', backgroundImage: 'radial-gradient(rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '3px 3px', zIndex: 6 }} />
        {/* Light reflection */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 7, background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 40%)', borderRadius: '4px 10px 10px 4px' }} />

        {/* Page peel corner */}
        {isSelected && phase === 'expanding' && (
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: '80px', height: '80px', cursor: 'pointer', zIndex: 8 }}>
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: '70px', height: '70px', background: 'linear-gradient(135deg, #f5f1ea 0%, #e8e4dc 60%, #d4d0c8 100%)', borderRadius: '0 0 10px 0', animation: 'contentFadeIn 0.5s ease-out 0.3s both' }} />
            <div style={{ position: 'absolute', bottom: '3px', right: '3px', width: '50px', height: '50px', background: gradient, zIndex: 9, transformOrigin: 'bottom right', animation: 'pagePeelHint 3s ease-in-out 0.6s infinite', boxShadow: '-4px -4px 10px rgba(0,0,0,0.2)', clipPath: 'polygon(100% 0%, 0% 100%, 100% 100%)' }} />
          </div>
        )}
      </div>

      {/* 3D page edges (right side) */}
      <div style={{ position: 'absolute', right: '-10px', top: '3px', bottom: '3px', width: '10px', background: 'linear-gradient(90deg, #e8e4dc, #f5f1ea, #e0dcd4)', borderRadius: '0 3px 3px 0', transform: 'rotateY(90deg)', transformOrigin: 'left center', boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.1)' }} />
      {/* 3D bottom edge */}
      <div style={{ position: 'absolute', left: '4px', right: '4px', bottom: '-8px', height: '8px', background: 'linear-gradient(180deg, #e0dcd4, #d4d0c8)', borderRadius: '0 0 3px 3px', transform: 'rotateX(-90deg)', transformOrigin: 'top center', boxShadow: 'inset 0 -1px 3px rgba(0,0,0,0.1)' }} />
    </>
  );
}

// ── Books Applet (renders inside AppWindow with 2x2 grid, expands out on click) ──
function BooksApplet() {
  const [selected, setSelected] = useState<string | null>(null);
  const [phase, setPhase] = useState<'idle' | 'expanding' | 'peeling' | 'content' | 'closing'>('idle');
  const [contentData, setContentData] = useState<ContentViewData | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const bookRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [readerMode, setReaderMode] = useState(false);
  const [readerPage, setReaderPage] = useState(0);
  const [readerPages, setReaderPages] = useState<string[]>([]);
  const [bookRects, setBookRects] = useState<Record<string, DOMRect>>({});
  const [sidebarCategory, setSidebarCategory] = useState('All');

  const screenH = typeof window !== 'undefined' ? window.innerHeight : 900;
  const screenW = typeof window !== 'undefined' ? window.innerWidth : 1440;
  const isSmallScreen = screenH < 850;
  const BIG_H = isSmallScreen ? 550 : 700;
  const BIG_W = Math.round(BIG_H * 3 / 4);
  const expandedTop = Math.round((screenH - BIG_H) / 2);
  const expandedLeft = Math.round((screenW - BIG_W) / 2);

  useEffect(() => {
    if (selected) {
      import('../portfolio/contentData').then(mod => {
        const data = mod.contentMap[selected];
        if (data) setContentData(data as ContentViewData);
      });
    } else { setContentData(null); }
  }, [selected]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (phase === 'content' || phase === 'expanding' || phase === 'peeling') {
          e.stopImmediatePropagation();
          handleClose();
        }
      }
    };
    if (phase !== 'idle') {
      window.addEventListener('keydown', handleKey, true);
      return () => window.removeEventListener('keydown', handleKey, true);
    }
  }, [phase]);

  const handleBookClick = (slug: string) => {
    if (phase === 'idle') {
      const el = bookRefs.current[slug];
      if (el) setBookRects(prev => ({ ...prev, [slug]: el.getBoundingClientRect() }));
      setSelected(slug);
      setPhase('expanding');
    } else if (phase === 'expanding' && selected === slug) {
      // User clicks the expanded book — peel page back to reveal content
      setPhase('peeling');
      setTimeout(() => setPhase('content'), 1000);
    }
  };

  const handleClose = () => {
    setPhase('closing');
    setTimeout(() => { setSelected(null); setPhase('idle'); setReaderMode(false); setReaderPage(0); }, 500);
  };

  const isOpen = phase === 'expanding' || phase === 'peeling' || phase === 'content';

  const sidebarItems = [
    { icon: '🏠', label: 'Home', category: 'Apple Books' },
    { icon: '🏪', label: 'Book Store', category: 'Apple Books' },
    { icon: '📖', label: 'All', category: 'Library' },
    { icon: '📑', label: 'Want to Read', category: 'Library' },
    { icon: '✅', label: 'Finished', category: 'Library' },
    { icon: '📚', label: 'Deep Research', category: 'My Collections' },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', background: '#f5f5f5' }}>
      <style>{`
        @keyframes bookCoverPeel {
          0% { transform: perspective(1200px) rotateY(0deg); transform-origin: left center; }
          100% { transform: perspective(1200px) rotateY(-160deg); transform-origin: left center; }
        }
        @keyframes contentFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pagePeelHint {
          0%,100% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(-3deg) scale(1.05); }
        }
      `}</style>

      {/* ── Sidebar ── */}
      <div style={{
        width: '180px', minWidth: '180px', background: 'rgba(245,245,245,0.95)',
        borderRight: '1px solid rgba(0,0,0,0.08)', padding: '12px 0',
        display: 'flex', flexDirection: 'column', gap: '2px',
        fontFamily: "'SF Pro Text', -apple-system, sans-serif", fontSize: '13px',
        overflowY: 'auto',
      }}>
        {/* Search */}
        <div style={{ padding: '4px 14px 10px' }}>
          <div style={{
            background: 'rgba(0,0,0,0.04)', borderRadius: '6px', padding: '5px 8px',
            display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(0,0,0,0.35)', fontSize: '12px',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            Search
          </div>
        </div>

        {(() => {
          let lastCategory = '';
          return sidebarItems.map((item, i) => {
            const isActive = sidebarCategory === item.label;
            const showHeader = item.category !== lastCategory;
            lastCategory = item.category;
            return (
              <React.Fragment key={i}>
                {showHeader && (
                  <div style={{
                    padding: `${i === 0 ? '2px' : '14px'} 14px 4px`,
                    fontSize: '11px', fontWeight: 700, color: 'rgba(0,0,0,0.45)',
                    textTransform: 'uppercase', letterSpacing: '0.03em',
                  }}>{item.category}</div>
                )}
                <div
                  onClick={() => setSidebarCategory(item.label)}
                  style={{
                    padding: '4px 14px', margin: '0 8px', borderRadius: '6px',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px',
                    background: isActive ? 'rgba(59,130,246,0.12)' : 'transparent',
                    color: isActive ? '#2563eb' : 'rgba(0,0,0,0.75)',
                    fontWeight: isActive ? 600 : 400,
                    transition: 'background 0.15s',
                  }}
                >
                  <span style={{ fontSize: '14px', width: '18px', textAlign: 'center' }}>{item.icon}</span>
                  {item.label}
                </div>
              </React.Fragment>
            );
          });
        })()}
      </div>

      {/* ── Main content area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '20px 28px 8px' }}>
          <h2 style={{
            fontSize: '26px', fontWeight: 800, color: '#1a1a1a', margin: 0,
            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
          }}>All</h2>
          <div style={{ height: '1px', background: 'rgba(0,0,0,0.08)', marginTop: '12px' }} />
        </div>

        {/* Book grid */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '16px 28px 28px',
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '24px 20px', alignContent: 'start', perspective: '1200px',
        }}>
          {BOOKS_DATA.map((book) => {
            const isBookSelected = selected === book.slug;
            const isBookHovered = hovered === book.slug && phase === 'idle';
            const gradient = `linear-gradient(160deg, ${book.coverGradient[0]}, ${book.coverGradient[1]}, ${book.coverGradient[2]})`;

            if (isBookSelected && phase !== 'idle') {
              return (
                <div key={book.slug} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ aspectRatio: '3/4', visibility: 'hidden' }} />
                </div>
              );
            }

            return (
              <div key={book.slug} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div
                  ref={el => { bookRefs.current[book.slug] = el; }}
                  onClick={() => handleBookClick(book.slug)}
                  onMouseEnter={() => phase === 'idle' && setHovered(book.slug)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    position: 'relative', aspectRatio: '3/4', cursor: 'pointer',
                    transformStyle: 'preserve-3d',
                    transform: isBookHovered ? 'scale(1.04)' : 'scale(1)',
                    transition: 'transform 0.2s ease-out',
                    borderRadius: '4px',
                    boxShadow: isBookHovered
                      ? '0 12px 40px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.15)'
                      : '0 4px 16px rgba(0,0,0,0.15), 0 1px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  {/* Book cover */}
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: '4px 8px 8px 4px',
                    overflow: 'hidden', background: gradient,
                  }}>
                    {/* Spine */}
                    <div style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px',
                      background: `linear-gradient(90deg, ${book.coverGradient[0]}ee, ${book.coverGradient[1]}cc)`,
                      borderRight: '1px solid rgba(255,255,255,0.06)', zIndex: 2,
                    }} />
                    <div style={{
                      position: 'absolute', left: '2px', top: '6px', bottom: '6px', width: '1px',
                      background: 'rgba(255,255,255,0.1)', zIndex: 3,
                    }} />
                    {/* Cover content */}
                    <div style={{
                      position: 'absolute', inset: 0, padding: '20px 16px 16px 20px',
                      display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 5,
                    }}>
                      <div>
                        {book.company === 'NDX' ? (
                          <img src="/NASDAQ_Logo.svg.png" alt="Nasdaq" height={18}
                            style={{ filter: 'brightness(0) invert(1)', opacity: 0.9 }} />
                        ) : book.company === 'IKIGAI' ? (
                          <img src="/ikigai.png" alt="Ikigai" height={28} style={{ opacity: 0.9 }} />
                        ) : book.company === 'SAP' ? (
                          <img src="/sap_white_transparent.png" alt="SAP" height={20}
                            style={{ opacity: 0.9 }} />
                        ) : book.company === 'DEEP FOCUS' ? (
                          <img src="/lotus_white_transparent.png" alt="Deep Focus" height={26}
                            style={{ opacity: 0.9 }} />
                        ) : (
                          <span style={{
                            fontSize: '9px', fontWeight: 700, letterSpacing: '0.15em',
                            color: book.coverAccent, opacity: 0.85, textTransform: 'uppercase',
                            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                          }}>{book.company}</span>
                        )}
                      </div>
                      <div>
                        <h3 style={{
                          fontSize: '14px', fontWeight: 700, color: '#fff', lineHeight: 1.3,
                          margin: '0 0 6px', fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                          textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                        }}>{book.title}</h3>
                      </div>
                      <div style={{
                        height: '2px', width: '30px', borderRadius: '1px',
                        background: book.coverAccent, opacity: 0.7,
                      }} />
                    </div>
                    {/* Grain + reflection */}
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.04, pointerEvents: 'none', backgroundImage: 'radial-gradient(rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '3px 3px', zIndex: 6 }} />
                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 7, background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 40%)', borderRadius: '4px 8px 8px 4px' }} />
                  </div>
                </div>
                {/* Label below book */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2px' }}>
                  <span style={{
                    fontSize: '11px', color: 'rgba(0,0,0,0.55)',
                    fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px',
                  }}>{book.readingTime} min read</span>
                  <span style={{ fontSize: '14px', color: 'rgba(0,0,0,0.3)', cursor: 'pointer', letterSpacing: '1px' }}>···</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Expanded book overlay (portaled to body to escape AppWindow clipping) ── */}
      {selected && phase !== 'idle' && createPortal(
        <>
          <div onClick={handleClose} style={{ position: 'fixed', inset: 0, zIndex: 9997, background: isOpen ? 'rgba(0,0,0,0.4)' : 'transparent', transition: 'background 0.4s ease' }} />
          <div onClick={handleClose} style={{
            position: 'fixed', top: `${expandedTop - 44}px`, left: `${expandedLeft}px`,
            zIndex: 10003, width: '36px', height: '36px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: '18px', color: 'rgba(255,255,255,0.9)', fontWeight: 300,
            boxShadow: '0 0 15px rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
          >✕</div>
          {(() => {
            const book = BOOKS_DATA.find(b => b.slug === selected)!;
            const gradient = `linear-gradient(160deg, ${book.coverGradient[0]}, ${book.coverGradient[1]}, ${book.coverGradient[2]})`;
            const originRect = bookRects[selected];
            const isExpanded = phase === 'expanding' || phase === 'peeling' || phase === 'content';
            const isClosing = phase === 'closing';
            const fromLeft = originRect ? originRect.left : expandedLeft;
            const fromTop = originRect ? originRect.top : expandedTop;
            const fromW = originRect ? originRect.width : BIG_W;
            const fromH = originRect ? originRect.height : BIG_H;
            const isPeeling = phase === 'peeling';
            const isContent = phase === 'content';
            return (
              <div
                style={{
                  position: 'fixed',
                  left: isExpanded && !isClosing ? `${expandedLeft}px` : `${fromLeft}px`,
                  top: isExpanded && !isClosing ? `${expandedTop}px` : `${fromTop}px`,
                  width: isExpanded && !isClosing ? `${BIG_W}px` : `${fromW}px`,
                  height: isExpanded && !isClosing ? `${BIG_H}px` : `${fromH}px`,
                  zIndex: 10001,
                  transform: isClosing ? 'scale(0.95)' : 'none',
                  transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                  opacity: isClosing ? 0 : 1,
                  perspective: '1200px',
                }}
              >
                {/* Content layer — sits behind the cover, revealed as cover peels */}
                {(isPeeling || isContent) && (
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: '4px 10px 10px 4px',
                    background: readerMode ? '#f5f1ea' : 'rgba(20, 20, 20, 0.95)',
                    overflow: 'hidden', display: 'flex', flexDirection: 'column', zIndex: 1,
                    animation: 'contentFadeIn 0.4s ease-out both',
                    transition: 'background 0.3s ease',
                  }}>
                    {/* Top bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px 0', zIndex: 11 }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!readerMode && contentData?.markdown) {
                            const text = contentData.markdown;
                            const chunks: string[] = [];
                            const paragraphs = text.split('\n\n');
                            let current = '';
                            for (const p of paragraphs) {
                              if (current.length + p.length > 800 && current.length > 200) { chunks.push(current.trim()); current = p + '\n\n'; }
                              else { current += p + '\n\n'; }
                            }
                            if (current.trim()) chunks.push(current.trim());
                            setReaderPages(chunks); setReaderPage(0);
                          }
                          setReaderMode(!readerMode);
                        }}
                        style={{
                          background: readerMode ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
                          border: `1px solid ${readerMode ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)'}`,
                          color: readerMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)',
                          borderRadius: '6px', padding: '4px 10px', cursor: 'pointer',
                          fontSize: '10px', fontFamily: "'SF Mono', monospace",
                          transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '4px',
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                        </svg>
                        {readerMode ? 'Scroll' : 'Reader'}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleClose(); }}
                        style={{
                          background: readerMode ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
                          border: `1px solid ${readerMode ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)'}`,
                          color: readerMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)',
                          borderRadius: '6px', padding: '4px 12px', cursor: 'pointer',
                          fontSize: '11px', fontFamily: "'SF Mono', monospace", transition: 'all 0.15s',
                        }}
                      >ESC</button>
                    </div>
                    {contentData ? (
                      readerMode ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                          <div style={{ flex: 1, display: 'flex', gap: '1px', background: 'rgba(0,0,0,0.08)', margin: '8px 10px', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ flex: 1, background: '#f8f5ef', padding: '24px 20px 16px 24px', overflowY: 'auto', fontSize: '11px', lineHeight: 1.7, color: '#2a2a2a', fontFamily: "'Georgia', 'Times New Roman', serif", borderRight: '1px solid rgba(0,0,0,0.06)' }}>
                              <ReaderPage text={readerPages[readerPage * 2] || ''} />
                            </div>
                            <div style={{ flex: 1, background: '#faf7f2', padding: '24px 24px 16px 20px', overflowY: 'auto', fontSize: '11px', lineHeight: 1.7, color: '#2a2a2a', fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                              <ReaderPage text={readerPages[readerPage * 2 + 1] || ''} />
                            </div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', padding: '4px 0 8px' }}>
                            <button onClick={(e) => { e.stopPropagation(); setReaderPage(p => Math.max(0, p - 1)); }} disabled={readerPage === 0}
                              style={{ background: 'none', border: 'none', cursor: readerPage === 0 ? 'default' : 'pointer', color: readerPage === 0 ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.5)', fontSize: '16px', padding: '2px 8px' }}>‹</button>
                            <span style={{ fontSize: '10px', color: 'rgba(0,0,0,0.4)', fontFamily: "'SF Mono', monospace" }}>
                              {readerPage * 2 + 1}–{Math.min(readerPage * 2 + 2, readerPages.length)} of {readerPages.length}
                            </span>
                            <button onClick={(e) => { e.stopPropagation(); setReaderPage(p => Math.min(Math.ceil(readerPages.length / 2) - 1, p + 1)); }}
                              disabled={readerPage >= Math.ceil(readerPages.length / 2) - 1}
                              style={{ background: 'none', border: 'none', cursor: readerPage >= Math.ceil(readerPages.length / 2) - 1 ? 'default' : 'pointer', color: readerPage >= Math.ceil(readerPages.length / 2) - 1 ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.5)', fontSize: '16px', padding: '2px 8px' }}>›</button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <ContentViewer content={contentData} onClose={handleClose} windowMode />
                        </div>
                      )
                    ) : (
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Loading...</div>
                    )}
                  </div>
                )}

                {/* Book cover — peels away like opening a book from the right edge */}
                {!isContent && (
                  <div
                    onClick={(e) => { e.stopPropagation(); if (phase === 'expanding') { setPhase('peeling'); setTimeout(() => setPhase('content'), 1000); } }}
                    style={{
                      position: 'absolute', inset: 0, zIndex: 2,
                      transformOrigin: 'left center',
                      transform: isPeeling ? 'rotateY(-160deg)' : 'rotateY(0deg)',
                      transition: isPeeling ? 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
                      cursor: phase === 'expanding' ? 'pointer' : 'default',
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    <Book3D
                      book={book} isOpen={isOpen} isSelected={true} isHovered={false}
                      phase={phase} gradient={gradient} rotY={0} rotX={0}
                      contentData={null} readerMode={false} readerPages={[]}
                      readerPage={0} setReaderMode={setReaderMode} setReaderPages={setReaderPages}
                      setReaderPage={setReaderPage} handleClose={handleClose}
                    />
                  </div>
                )}
              </div>
            );
          })()}
        </>,
        document.body
      )}
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

    const sideWindows = ['education', 'experience', 'stocks', 'deep-research'] as const;
    const openSideWindow = sideWindows.find(id => {
      const w = state.windows[id];
      return w && w.isOpen && !w.isMinimized;
    });

    const hasSideContent = !!openSideWindow;

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const menuBarH = 28;
    const dockH = 72;
    const gap = 10;
    const usableH = screenH - menuBarH - dockH;

    if (hasSideContent) {
      // Save original terminal size before any adjustments
      if (!terminalOrigRef.current) {
        terminalOrigRef.current = { width: terminal.size.width, height: terminal.size.height };
      }

      // Determine how much space the side content takes
      const sideWin = state.windows[openSideWindow]!;
      const is13Inch = screenH < 900 || screenW < 1500;
      // On 13-inch displays, scale down side windows to prevent terminal compression
      const sideW = is13Inch ? Math.min(sideWin.size.width, Math.round(screenW * 0.38)) : sideWin.size.width;
      const sideH = is13Inch ? Math.min(sideWin.size.height, usableH - 20) : sideWin.size.height;
      // Resize side window if needed on small screens
      if (is13Inch && (Math.abs(sideWin.size.width - sideW) > 10 || Math.abs(sideWin.size.height - sideH) > 10)) {
        dispatch({ type: 'RESIZE_WINDOW', id: openSideWindow, size: { width: sideW, height: sideH } });
      }
      // Place side window on right edge, vertically centered in usable area
      const sideX = screenW - gap - sideW;
      const sideY = menuBarH + Math.round((usableH - sideH) / 2);
      if (Math.abs(sideWin.position.x - sideX) > 10 || Math.abs(sideWin.position.y - sideY) > 10) {
        dispatch({ type: 'MOVE_WINDOW', id: openSideWindow, position: { x: sideX, y: sideY } });
      }

      // Check if terminal fits without shrinking — ensure minimum width
      const origTermW = terminalOrigRef.current.width;
      const spaceForTerm = sideX - gap - gap;
      const minTermW = is13Inch ? 500 : 600;
      const termW = Math.max(minTermW, Math.min(origTermW, spaceForTerm));
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
    ['education', 'experience', 'stocks', 'deep-research'].filter(id => state.windows[id]?.isOpen && !state.windows[id]?.isMinimized).join(','),
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
        <Background />
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
      <Background />
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
              'deep-research': '#f5f5f5',
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

type MobileTab = 'home' | 'work' | 'projects' | 'research' | 'more';
type MobileSection = 'education' | 'experience' | 'blog' | 'calendar' | 'stocks' | null;

// ── MobileBooks: iOS Notes-style research articles ──
function MobileBooks({ onContentClick }: { onContentClick: (content: ContentViewData) => void }) {
  const [contentMap, setContentMap] = useState<Record<string, ContentViewData>>({});
  const [tapped, setTapped] = useState<string | null>(null);

  useEffect(() => {
    import('../portfolio/contentData').then(mod => {
      setContentMap(mod.contentMap as Record<string, ContentViewData>);
    });
  }, []);

  const handleBookTap = (slug: string) => {
    setTapped(slug);
    const content = contentMap[slug];
    if (content) {
      setTimeout(() => {
        onContentClick(content);
        setTimeout(() => setTapped(null), 300);
      }, 200);
    }
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {BOOKS_DATA.map((book, idx) => {
        const gradient = `linear-gradient(160deg, ${book.coverGradient[0]}, ${book.coverGradient[1]}, ${book.coverGradient[2]})`;
        const isTapped = tapped === book.slug;
        return (
          <div
            key={book.slug}
            onClick={() => handleBookTap(book.slug)}
            style={{
              borderRadius: '16px',
              overflow: 'hidden',
              background: gradient,
              border: `1px solid ${book.coverAccent}25`,
              boxShadow: `0 12px 40px rgba(0,0,0,0.5), 0 0 30px ${book.coverAccent}15`,
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              transform: isTapped ? 'scale(0.97)' : 'scale(1)',
              transition: 'transform 0.2s ease',
              animation: `mobileFadeIn 0.4s ease-out ${idx * 0.08}s both`,
              position: 'relative' as const,
            }}
          >
            {/* Spine edge */}
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px',
              background: `linear-gradient(180deg, ${book.coverGradient[0]}ee, ${book.coverGradient[2]}cc)`,
              borderRight: `1px solid ${book.coverAccent}15`,
              zIndex: 2,
            }} />

            <div style={{ padding: '20px 18px 18px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Company / Publisher tag */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {book.company === 'NDX' ? (
                  <img src="/NASDAQ_Logo.svg.png" alt="Nasdaq" height={16}
                    style={{ filter: 'brightness(0) invert(1)', opacity: 0.9 }} />
                ) : book.company === 'IKIGAI' ? (
                  <img src="/ikigai.png" alt="Ikigai" height={24} style={{ opacity: 0.9 }} />
                ) : book.company === 'SAP' ? (
                  <img src="/sap_white_transparent.png" alt="SAP" height={18}
                    style={{ opacity: 0.9 }} />
                ) : book.company === 'DEEP FOCUS' ? (
                  <img src="/lotus_white_transparent.png" alt="Deep Focus" height={24}
                    style={{ opacity: 0.9 }} />
                ) : (
                  <span style={{
                    fontSize: '9px', fontWeight: 800, letterSpacing: '0.18em',
                    color: book.coverAccent, fontFamily: "'SF Mono', monospace",
                    textTransform: 'uppercase' as const,
                  }}>
                    {book.company}
                  </span>
                )}
                <span style={{
                  fontSize: '9px', color: 'rgba(255,255,255,0.35)',
                  fontFamily: "'SF Mono', monospace",
                }}>
                  {book.readingTime} min read
                </span>
              </div>

              {/* Title */}
              <div style={{
                fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                fontWeight: 700, fontSize: '18px', color: '#fff',
                lineHeight: 1.25, letterSpacing: '-0.3px',
              }}>
                {book.title}
              </div>

              {/* Summary */}
              <div style={{
                fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                fontSize: '13px', color: 'rgba(255,255,255,0.6)',
                lineHeight: 1.5,
              }}>
                {book.summary}
              </div>

              {/* Read indicator */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px',
              }}>
                <div style={{
                  width: '20px', height: '2px', borderRadius: '1px',
                  background: book.coverAccent, opacity: 0.6,
                }} />
                <span style={{
                  fontSize: '10px', fontWeight: 600, color: book.coverAccent,
                  fontFamily: "'SF Pro Text', sans-serif", opacity: 0.8,
                }}>
                  Tap to read →
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── MobileStocks: Bloomberg terminal experience for mobile ──
function MobileStocks() {
  const [drillDown, setDrillDown] = useState<{ type: 'stock'; symbol: string; name: string } | { type: 'sector'; name: string } | null>(null);

  return (
    <div className="bloomberg-scroll" style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden', fontFamily: "'SF Mono', monospace", background: '#1c1c1e' }}>
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
            <div style={{ padding: '12px 14px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', animation: 'livePulse 2s ease-in-out infinite' }} />
                <span style={{ color: '#fff', fontSize: '12px', fontWeight: 600, fontFamily: "'SF Pro Display', -apple-system, sans-serif", letterSpacing: '0.02em' }}>LIVE</span>
              </div>
              <div style={{ color: '#fff', fontSize: '12px', fontWeight: 600, fontFamily: "'SF Pro Display', -apple-system, sans-serif" }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
            <StockGrid onStockClick={(symbol, name) => setDrillDown({ type: 'stock', symbol, name })} />
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 14px' }} />
            <SectorSparklines onSectorClick={(name) => setDrillDown({ type: 'sector', name })} />
            <ScrollingNewsTape />
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 14px' }} />
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

function MobileProjects({ onCardClick }: { onCardClick: (detail: DetailContent) => void }) {
  // Import project data from Projects component — these are the same projects
  const mobileProjects = [
    {
      title: 'QuantZoo',
      desc: 'Production-grade Python framework for systematic quantitative trading research with backtesting, walk-forward validation, and live paper trading.',
      coverImage: '/trading.png',
      gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      tech: ['Python', 'PyTorch', 'FastAPI', 'NumPy'],
      repoUrl: 'https://github.com/ronnielgandhe/quantzoo',
    },
    {
      title: 'CreatorScope',
      desc: 'Go-to-market automation tool for brands to discover and evaluate TikTok creators for partnerships at scale with a proprietary Creator Intent Score.',
      coverImage: '/cover.png',
      gradient: 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #21262d 100%)',
      tech: ['Python', 'FastAPI', 'SQLAlchemy'],
      repoUrl: 'https://github.com/ronnielgandhe/creatorscope',
    },
    {
      title: 'YourNews',
      desc: 'AI-powered personalized news aggregator that learns reading preferences and ranks articles using TF-IDF, BM25, and GPT-4 summarization.',
      coverImage: '/yournews-cover.png',
      gradient: 'linear-gradient(135deg, #1a1a1a 0%, #2d1f3d 50%, #1a1a2e 100%)',
      tech: ['Python', 'GPT-4 API', 'React', 'FastAPI'],
      repoUrl: 'https://github.com/ronnielgandhe/yournews',
    },
    {
      title: 'How Many Clicks',
      desc: 'A Wikipedia racing game — navigate between two random articles using only hyperlinks. Features BFS pathfinding and competitive leaderboards.',
      coverImage: '/howmanyclicks-cover.png',
      gradient: 'linear-gradient(135deg, #1a1a1a 0%, #2a1a1a 50%, #1a1a2e 100%)',
      tech: ['React', 'JavaScript', 'Wikipedia API'],
      repoUrl: 'https://github.com/ronnielgandhe/howmanyclicks',
    },
  ];

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {mobileProjects.map((proj, i) => (
        <div
          key={i}
          onClick={() => window.open(proj.repoUrl, '_blank')}
          style={{
            borderRadius: '16px',
            overflow: 'hidden',
            background: proj.gradient,
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {/* Cover image */}
          <div style={{ width: '100%', height: '160px', overflow: 'hidden' }}>
            <img src={proj.coverImage} alt={proj.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
          </div>
          {/* Content */}
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ fontFamily: "'SF Pro Display', -apple-system, sans-serif", fontWeight: 700, fontSize: '18px', color: '#fff' }}>
                {proj.title}
              </div>
              <a href={proj.repoUrl} target="_blank" rel="noopener" onClick={e => e.stopPropagation()} style={{ color: 'rgba(255,255,255,0.5)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              </a>
            </div>
            <div style={{ fontFamily: "'SF Pro Text', -apple-system, sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, marginBottom: '12px' }}>
              {proj.desc}
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {proj.tech.map(t => (
                <span key={t} style={{
                  padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600,
                  fontFamily: "'SF Mono', monospace",
                  background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)',
                  border: '0.5px solid rgba(255,255,255,0.12)',
                }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MobileCalendarIcon() {
  const now = new Date();
  const month = now.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const day = now.getDate();
  return (
    <div style={{ width: '28px', height: '28px', borderRadius: '7px', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <div style={{ height: '9px', background: '#ea4335', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '5px', fontWeight: 800, color: 'white', letterSpacing: '0.5px' }}>{month}</span>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <span style={{ fontSize: '13px', fontWeight: 300, color: '#1a1a1a', lineHeight: 1 }}>{day}</span>
      </div>
    </div>
  );
}

function MobileLayout() {
  const [activeSection, setActiveSection] = useState<MobileSection>(null);
  const [activeDetail, setActiveDetail] = useState<DetailContent | null>(null);
  const [activeContent, setActiveContent] = useState<ContentViewData | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [expandedPanel, setExpandedPanel] = useState<'sound' | 'wifi' | 'notif' | null>(null);
  const [mobileSpotify, setMobileSpotify] = useState<{ isPlaying: boolean; title: string; artist: string; albumArt: string; progressMs: number; durationMs: number; trackUrl?: string; fetchedAt?: number } | null>(null);
  const [mobileLocation, setMobileLocation] = useState<{ city: string; region: string } | null>(null);

  // Spotify polling for mobile control center
  useEffect(() => {
    const poll = () => {
      fetch('/api/spotify').then(r => r.json()).then(d => {
        if (d?.title) setMobileSpotify({ ...d, fetchedAt: Date.now() });
        else setMobileSpotify(null);
      }).catch(() => {});
    };
    poll();
    const id = setInterval(poll, 15000);
    return () => clearInterval(id);
  }, []);

  // Location for WiFi panel
  useEffect(() => {
    fetch('https://ipapi.co/json/').then(r => r.json()).then(d => setMobileLocation({ city: d.city, region: d.region_code || d.region })).catch(() => setMobileLocation({ city: 'Toronto', region: 'ON' }));
  }, []);

  const handleCardClick = (detail: DetailContent) => setActiveDetail(detail);
  const handleContentClick = (content: ContentViewData) => setActiveContent(content);

  // Shared styles
  const glass: React.CSSProperties = {
    background: 'rgba(20, 20, 28, 0.82)',
    backdropFilter: 'saturate(140%) blur(24px)',
    WebkitBackdropFilter: 'saturate(140%) blur(24px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  };
  const sHead: React.CSSProperties = { color: '#fff', fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', marginBottom: '6px', fontFamily: "'SF Mono', monospace" };
  const sPara: React.CSSProperties = { color: 'rgba(255,255,255,0.88)', fontSize: '13px', lineHeight: 1.6, fontFamily: "'SF Pro Text', -apple-system, sans-serif", fontWeight: 400 };

  const SLIDE_TITLES = ['ABOUT', 'SOFTWARE', 'READING', 'CURRENT FOCUS'];
  const nextSlide = () => setSlideIndex(i => (i + 1) % 4);
  const prevSlide = () => setSlideIndex(i => (i + 3) % 4);

  const mIcon = (src: string, alt: string, scale = 1.12) => (
    <div style={{ width: '56px', height: '56px', borderRadius: '14px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src={src} alt={alt} style={{ width: `${56 * scale}px`, height: `${56 * scale}px`, objectFit: 'cover', pointerEvents: 'none' }} />
    </div>
  );

  const APP_GRID: { label: string; icon: React.ReactNode; action: () => void }[] = [
    { label: 'VS Code', icon: mIcon('/vscode.png', 'VS Code'), action: () => setActiveSection('experience') },
    { label: 'Deep Research', icon: mIcon('/books.png', 'Deep Research', 1.18), action: () => setActiveSection('blog') },
    { label: 'My Thoughts', icon: mIcon('/notes.png', 'My Thoughts'), action: () => setActiveSection('blog') },
    { label: 'Stocks', icon: mIcon('/usethisonestocks1111.png', 'Stocks'), action: () => setActiveSection('stocks') },
    { label: 'Photos', icon: mIcon('/icons/photos.png', 'Photos'), action: () => setActiveSection('education') },
    { label: 'Calendar', icon: (() => {
      const now = new Date();
      const monthStr = now.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
      const dayNum = now.getDate();
      return (
        <div style={{ width: '56px', height: '56px', borderRadius: '14px', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#fff' }}>
          <div style={{ height: '18px', background: '#ea4335', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: 'white', letterSpacing: '0.5px' }}>{monthStr}</span>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
            <span style={{ fontSize: '22px', fontWeight: 300, color: '#1a1a1a', lineHeight: 1 }}>{dayNum}</span>
          </div>
        </div>
      );
    })(), action: () => setActiveSection('calendar') },
    { label: 'GitHub', icon: <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #2d2d2d, #434343)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg></div>, action: () => window.open('https://github.com/ronnielgandhe', '_blank') },
    { label: 'Mail', icon: mIcon('/usethismailicon.png', 'Mail', 1.25), action: () => { window.location.href = 'mailto:ronnielgandhe@gmail.com'; } },
    { label: 'Spotify', icon: mIcon('/spotify.png', 'Spotify'), action: () => window.open('https://open.spotify.com/playlist/2uud5zGJZf3U98FlTnQip8', '_blank') },
    { label: 'LinkedIn', icon: <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#0A66C2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></div>, action: () => window.open('https://linkedin.com/in/ronniel-gandhe', '_blank') },
  ];

  return (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
      animation: 'mobileFadeIn 0.6s ease-out',
      touchAction: 'manipulation',
    }}>
      {/* Main scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', position: 'relative' }}>
        <div style={{ padding: '0 20px 40px', animation: 'mobileFadeIn 0.4s ease-out' }}>
          {/* Scrolling ticker strip */}
          <div style={{
            position: 'sticky', top: 0, zIndex: 10,
            padding: '10px 0', marginBottom: '16px',
            fontFamily: "'SF Mono', monospace", fontSize: '10px',
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            marginLeft: '-20px', marginRight: '-20px',
            borderBottom: '0.5px solid rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'inline-flex', gap: '24px', whiteSpace: 'nowrap',
              animation: 'tickerScroll 20s linear infinite',
              paddingLeft: '20px',
            }}>
              <CompactTickers /><span style={{ color: 'rgba(255,255,255,0.1)' }}>│</span>
              <CompactTickers /><span style={{ color: 'rgba(255,255,255,0.1)' }}>│</span>
              <CompactTickers />
            </div>
          </div>

          {/* Flippable Hero Card */}
          <div style={{ perspective: '1000px', marginBottom: '20px' }}>
            <div
              onClick={() => setCardFlipped(f => !f)}
              style={{
                position: 'relative',
                transformStyle: 'preserve-3d',
                transform: cardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
              }}
            >
              {/* Front: Hero */}
              <div style={{
                ...glass, padding: 0, overflow: 'hidden',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', padding: '10px 14px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.15)',
                }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f57' }} />
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#febc2e' }} />
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28c840' }} />
                  </div>
                  <span style={{ flex: 1, textAlign: 'center', fontFamily: "'SF Mono', monospace", fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                    ronnielgandhe.tech — zsh
                  </span>
                  <div style={{ width: '42px' }} />
                </div>
                <div style={{ padding: '20px 18px 24px' }}>
                  <div style={{ fontFamily: "'SF Pro Display', -apple-system, sans-serif", fontWeight: 800, fontSize: '28px', color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.1, marginBottom: '4px' }}>
                    Ronniel Gandhe
                  </div>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontFamily: "'SF Pro Text', sans-serif", marginBottom: '12px' }}>
                    Software Engineer
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', lineHeight: 1.5, fontFamily: "'SF Mono', monospace" }}>
                    Using <RotatingWords /> to create<br />elegant and scalable solutions<br />to real world problems.
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontFamily: "'SF Pro Text', sans-serif" }}>
                      {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontFamily: "'SF Mono', monospace" }}>tap to flip ↻</div>
                  </div>
                </div>
              </div>

              {/* Back: Slides */}
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  ...glass, padding: '18px',
                  position: 'absolute', top: 0, left: 0, right: 0,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  minHeight: '100%',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <button onClick={(e) => { e.stopPropagation(); prevSlide(); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '16px', cursor: 'pointer', padding: '4px 8px', WebkitTapHighlightColor: 'transparent' }}>‹</button>
                  <div style={sHead}>{SLIDE_TITLES[slideIndex]}</div>
                  <button onClick={(e) => { e.stopPropagation(); nextSlide(); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '16px', cursor: 'pointer', padding: '4px 8px', WebkitTapHighlightColor: 'transparent' }}>›</button>
                </div>
                <div key={slideIndex} style={{ animation: 'mobileFadeIn 0.25s ease-out' }}>
                  {slideIndex === 0 && (
                    <div>
                      <div style={sPara}>
                        Currently based in Waterloo, Canada. Most of my time is spent building software, studying markets, and trying to understand systems that actually move money and incentives in the real world.
                      </div>
                      <div style={{ ...sPara, marginTop: '8px' }}>
                        Over the last few years I have moved between software engineering, data science, and financial markets. Some of that was intentional. Some of it was just curiosity turning into a rabbit hole that got deeper than expected.
                      </div>
                    </div>
                  )}
                  {slideIndex === 1 && (
                    <div style={sPara}>
                      Software is probably the most powerful skill you can have right now. If you know how to code, you can build almost anything. You do not need permission from anyone, you just sit down and make it.
                    </div>
                  )}
                  {slideIndex === 2 && (
                    <div>
                      {['Zero to One — Thiel', "Poor Charlie's Almanack", 'The Power Broker — Caro', 'Laws of Human Nature'].map((book, i) => (
                        <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'baseline', marginBottom: '3px' }}>
                          <span style={{ color: '#fff', fontSize: '8px', fontFamily: "'SF Mono', monospace" }}>›</span>
                          <span style={{ ...sPara, fontSize: '12px', lineHeight: 1.45 }}>{book}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {slideIndex === 3 && (
                    <div>
                      {['Building software & internal tools', 'Studying financial markets', 'Turning ideas into products'].map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'baseline', marginBottom: '3px' }}>
                          <span style={{ color: '#fff', fontSize: '8px', fontFamily: "'SF Mono', monospace" }}>›</span>
                          <span style={{ ...sPara, fontSize: '12px', lineHeight: 1.45 }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} style={{
                        width: i === slideIndex ? '16px' : '6px', height: '6px',
                        borderRadius: '3px',
                        background: i === slideIndex ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.2)',
                        transition: 'all 0.2s ease',
                      }} />
                    ))}
                  </div>
                  <div onClick={(e) => { e.stopPropagation(); setCardFlipped(false); }} style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontFamily: "'SF Mono', monospace", cursor: 'pointer' }}>↻ flip back</div>
                </div>
              </div>
            </div>
          </div>

          {/* App Grid (iOS home screen style) */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px 12px', justifyItems: 'center' }}>
              {APP_GRID.map((app, i) => (
                <button
                  key={`${app.label}-${i}`}
                  onClick={app.action}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent', padding: 0,
                  }}
                >
                  {app.icon}
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', fontFamily: "'SF Pro Text', sans-serif", fontWeight: 500 }}>
                    {app.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Watch */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <ChronographWatch />
          </div>

          {/* World Clocks */}
          <div style={{ textAlign: 'center', fontFamily: "'SF Mono', monospace", fontSize: '10px', marginBottom: '14px' }}>
            <CompactClocks />
          </div>

          {/* Control Center: Sound, WiFi, Notifications */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
            {/* Sound / Spotify */}
            <button onClick={() => setExpandedPanel(expandedPanel === 'sound' ? null : 'sound')} style={{
              ...glass, flex: 1, padding: '14px', border: expandedPanel === 'sound' ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
              WebkitTapHighlightColor: 'transparent', color: '#fff', textAlign: 'center',
            }}>
              <svg width="20" height="18" viewBox="0 0 16 14" fill="none">
                <path d="M2 5h2l4-3v10l-4-3H2a1 1 0 01-1-1V6a1 1 0 011-1z" fill="rgba(255,255,255,0.9)" />
                <path d="M11 4.5a3.5 3.5 0 010 5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.1" strokeLinecap="round" fill="none" />
                <path d="M13 2.5a6.5 6.5 0 010 9" stroke="rgba(255,255,255,0.5)" strokeWidth="1.1" strokeLinecap="round" fill="none" />
              </svg>
              <span style={{ fontSize: '10px', fontFamily: "'SF Pro Text', sans-serif", fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>Sound</span>
            </button>

            {/* WiFi */}
            <button onClick={() => setExpandedPanel(expandedPanel === 'wifi' ? null : 'wifi')} style={{
              ...glass, flex: 1, padding: '14px', border: expandedPanel === 'wifi' ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
              WebkitTapHighlightColor: 'transparent', color: '#fff', textAlign: 'center',
            }}>
              <svg width="20" height="16" viewBox="0 0 16 12" fill="none">
                <path d="M8 10.5a1 1 0 100-2 1 1 0 000 2z" fill="rgba(255,255,255,1)" />
                <path d="M5.17 7.17a4 4 0 015.66 0" stroke="rgba(255,255,255,0.9)" strokeWidth="1.3" strokeLinecap="round" fill="none" />
                <path d="M2.93 4.93a7 7 0 0110.14 0" stroke="rgba(255,255,255,0.75)" strokeWidth="1.3" strokeLinecap="round" fill="none" />
              </svg>
              <span style={{ fontSize: '10px', fontFamily: "'SF Pro Text', sans-serif", fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>Wi-Fi</span>
            </button>

            {/* Notifications */}
            <button onClick={() => setExpandedPanel(expandedPanel === 'notif' ? null : 'notif')} style={{
              ...glass, flex: 1, padding: '14px', border: expandedPanel === 'notif' ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
              WebkitTapHighlightColor: 'transparent', color: '#fff', textAlign: 'center',
            }}>
              <svg width="18" height="20" viewBox="0 0 16 18" fill="none">
                <path d="M8 1a4 4 0 00-4 4v3l-2 2v1h12v-1l-2-2V5a4 4 0 00-4-4z" fill="rgba(255,255,255,0.9)" />
                <path d="M6 14a2 2 0 004 0" stroke="rgba(255,255,255,0.9)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
              </svg>
              <span style={{ fontSize: '10px', fontFamily: "'SF Pro Text', sans-serif", fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>Activity</span>
            </button>
          </div>

          {/* Expanded Panel */}
          {expandedPanel === 'sound' && (
            <div style={{ ...glass, padding: '16px', marginBottom: '14px', animation: 'mobileFadeIn 0.2s ease-out' }}>
              <div style={{ ...sHead, marginBottom: '10px' }}>{mobileSpotify?.isPlaying ? '♫ NOW PLAYING' : '♫ SPOTIFY'}</div>
              {mobileSpotify ? (
                <div>
                  <a href={mobileSpotify.trackUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', gap: '12px', alignItems: 'center', textDecoration: 'none', color: 'inherit', marginBottom: '12px' }}>
                    {mobileSpotify.albumArt && <img src={mobileSpotify.albumArt} alt="" style={{ width: '52px', height: '52px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mobileSpotify.title}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mobileSpotify.artist}</div>
                      <div style={{ fontSize: '10px', color: '#1DB954', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                        Spotify
                      </div>
                    </div>
                  </a>
                  {/* Progress bar */}
                  <div style={{ height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${mobileSpotify.durationMs > 0 ? (mobileSpotify.progressMs / mobileSpotify.durationMs) * 100 : 0}%`, background: '#1DB954', borderRadius: '2px' }} />
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '12px 0', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Not currently playing</div>
              )}
              {/* Volume slider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px' }}>
                <svg width="12" height="10" viewBox="0 0 16 14" fill="none" style={{ opacity: 0.45, flexShrink: 0 }}>
                  <path d="M2 5h2l4-3v10l-4-3H2a1 1 0 01-1-1V6a1 1 0 011-1z" fill="rgba(255,255,255,0.55)" />
                </svg>
                <div style={{ flex: 1, height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)', position: 'relative' }}>
                  <div style={{ height: '100%', width: '70%', background: 'rgba(255,255,255,0.4)', borderRadius: '2px' }} />
                  <div style={{ position: 'absolute', top: '-4px', left: '70%', transform: 'translateX(-50%)', width: '10px', height: '10px', borderRadius: '50%', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                </div>
                <svg width="14" height="10" viewBox="0 0 16 14" fill="none" style={{ opacity: 0.45, flexShrink: 0 }}>
                  <path d="M2 5h2l4-3v10l-4-3H2a1 1 0 01-1-1V6a1 1 0 011-1z" fill="rgba(255,255,255,0.55)" />
                  <path d="M11 4.5a3.5 3.5 0 010 5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.1" strokeLinecap="round" fill="none" />
                  <path d="M13 2.5a6.5 6.5 0 010 9" stroke="rgba(255,255,255,0.25)" strokeWidth="1.1" strokeLinecap="round" fill="none" />
                </svg>
              </div>
            </div>
          )}

          {expandedPanel === 'wifi' && (
            <div style={{ ...glass, padding: 0, marginBottom: '14px', animation: 'mobileFadeIn 0.2s ease-out', overflow: 'hidden' }}>
              <WifiSettings />
            </div>
          )}

          {expandedPanel === 'notif' && (
            <div style={{ ...glass, padding: '14px', marginBottom: '14px', animation: 'mobileFadeIn 0.2s ease-out' }}>
              <GitHubHeatmap />
            </div>
          )}

          {/* Contact */}
          <div style={{ ...glass, padding: '16px', marginBottom: '20px' }}>
            <div style={sHead}>CONTACT</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: "'SF Mono', monospace", fontSize: '12px' }}>
              <a href="https://www.linkedin.com/in/ronniel-gandhe/" target="_blank" rel="noopener" style={{ color: '#fff', textDecoration: 'none' }}>💼 linkedin.com/in/ronniel-gandhe</a>
              <a href="https://github.com/ronnielgandhe" target="_blank" rel="noopener" style={{ color: '#fff', textDecoration: 'none' }}>🐙 github.com/ronnielgandhe</a>
              <a href="mailto:ronnielgandhe@gmail.com" style={{ color: '#fff', textDecoration: 'none' }}>✉️ ronnielgandhe@gmail.com</a>
              <span style={{ color: '#fff' }}>📍 Waterloo, ON</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section Overlay ── */}
      {activeSection && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(10, 12, 20, 0.97)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          display: 'flex', flexDirection: 'column',
          animation: 'mobileSlideUp 0.3s ease-out',
          overflowY: 'auto', overscrollBehavior: 'contain',
        }}>
          {/* Header */}
          <div style={{
            position: 'sticky', top: 0, zIndex: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', minHeight: '50px',
            background: 'rgba(10, 12, 20, 0.9)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '0.5px solid rgba(255,255,255,0.08)',
          }}>
            <button
              onClick={() => setActiveSection(null)}
              style={{
                background: 'none', border: 'none', color: '#60a5fa', fontSize: '15px',
                cursor: 'pointer', fontFamily: "'SF Pro Text', sans-serif", padding: '4px 0',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              ← Back
            </button>
            <span style={{ fontFamily: "'SF Mono', monospace", fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
              {activeSection === 'education' ? 'Photos' : activeSection === 'experience' ? 'Experience' : activeSection === 'blog' ? 'My Thoughts' : activeSection === 'stocks' ? 'Stocks' : 'Calendar'}
            </span>
            <div style={{ width: '50px' }} />
          </div>
          {/* Section content */}
          <div style={{ flex: 1, paddingBottom: '40px' }}>
            {activeSection === 'education' && <Education onCardClick={handleCardClick} windowMode />}
            {activeSection === 'experience' && <Experience onCardClick={handleCardClick} windowMode />}
            {activeSection === 'blog' && <Blog onContentClick={handleContentClick} windowMode />}
            {activeSection === 'stocks' && <MobileStocks />}
            {activeSection === 'calendar' && <Calendar windowMode />}
          </div>
        </div>
      )}

      {/* ── Detail Overlay ── */}
      {activeDetail && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          animation: 'mobileSlideRight 0.3s ease-out',
        }}>
          <DetailPanel detail={activeDetail} onClose={() => setActiveDetail(null)} />
        </div>
      )}

      {/* ── Content Overlay ── */}
      {activeContent && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          animation: 'mobileSlideRight 0.3s ease-out',
        }}>
          <ContentViewer content={activeContent} onClose={() => setActiveContent(null)} />
        </div>
      )}

      <style>{`
        @keyframes mobileFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes mobileSlideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes mobileSlideRight {
          from { transform: translateX(30%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes mobileDrawerUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes tickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
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
