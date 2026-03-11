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

function TerminalContent() {
  const { dispatch } = useDesktop();
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [introDone, setIntroDone] = useState(false);
  const [introText, setIntroText] = useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Auto-type intro
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
      '—————————————————————————————————————————',
      '',
      'Available commands:',
      '',
      '  education      Academic background & coursework',
      '  experience     Work experience & internships',
      '  projects       Side projects & builds',
      '  mythoughts     Blog posts & notes',
      '  deepresearch   Case studies & deep dives',
      '  calendar       Book a meeting with me',
      '',
      '  help           Show this list again',
      '  clear          Clear terminal',
      '',
      'Type a command and press Enter to explore.',
      '—————————————————————————————————————————',
    ];
    const full = lines.join('\n');
    let i = 0;
    const speed = 8;
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

  // Focus input & scroll on change
  useEffect(() => {
    if (introDone) inputRef.current?.focus();
  }, [introDone]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [history, introText]);

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
    } else if (cmd === 'echo hello' || cmd === 'echo "hello"') {
      newLines.push({ type: 'output', text: 'hello 👋' });
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
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Auto-complete
      if (input.trim()) {
        const partial = input.trim().toLowerCase();
        const prefix = partial.startsWith('cd ') ? partial.replace('cd ', '') : partial.startsWith('open ') ? partial.replace('open ', '') : partial;
        const match = Object.keys(COMMANDS).find(c => c.startsWith(prefix));
        if (match) {
          if (partial.startsWith('cd ') || input.trim().toLowerCase().startsWith('cd ')) {
            setInput('cd ' + match);
          } else if (input.trim().toLowerCase().startsWith('open ')) {
            setInput('open ' + match);
          } else {
            setInput(match);
          }
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

  return (
    <div
      ref={scrollRef}
      onClick={() => inputRef.current?.focus()}
      style={{
        padding: '16px 20px',
        fontFamily: "'SF Mono', 'JetBrains Mono', 'Menlo', monospace",
        fontSize: '13px',
        color: '#e0e0e0',
        lineHeight: 1.65,
        height: '100%',
        overflowY: 'auto',
        cursor: 'text',
        background: 'transparent',
      }}
    >
      {/* Intro text */}
      <pre style={{
        margin: 0,
        fontFamily: 'inherit',
        fontSize: 'inherit',
        lineHeight: 'inherit',
        whiteSpace: 'pre-wrap',
        color: 'rgba(255,255,255,0.7)',
      }}>
        {introText.split('\n').map((line, i) => {
          // Colorize intro lines
          if (i === 0) return <div key={i} style={{ fontWeight: 'bold', fontSize: '15px', color: '#fff' }}>{line}</div>;
          if (line.startsWith('Location:')) return <div key={i}><span style={{ color: '#ff6b9d', fontWeight: 600 }}>Location: </span><span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>{line.replace('Location: ', '')}</span></div>;
          if (line.startsWith('Email:')) return <div key={i}><span style={{ color: '#fbbf24', fontWeight: 600 }}>Email: </span><span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>{line.replace('Email: ', '')}</span></div>;
          if (line.startsWith('GitHub:')) return <div key={i}><span style={{ color: '#22d3ee', fontWeight: 600 }}>GitHub: </span><span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>{line.replace('GitHub: ', '')}</span></div>;
          if (line.startsWith('"')) return <div key={i} style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.45)' }}>{line}</div>;
          if (line.startsWith('Available commands:')) return <div key={i} style={{ color: '#4ade80', fontWeight: 700 }}>{line}</div>;
          if (line.startsWith('Type a command')) return <div key={i} style={{ color: 'rgba(255,255,255,0.5)' }}>{line}</div>;
          if (line.match(/^\s{2}\w/)) {
            const parts = line.match(/^(\s{2})(\S+)(\s+)(.+)$/);
            if (parts) {
              const cmdColors: Record<string, string> = {
                education: '#60a5fa',    // blue
                experience: '#c084fc',   // purple
                projects: '#4ade80',     // green
                mythoughts: '#fbbf24',   // amber
                deepresearch: '#f472b6', // pink
                calendar: '#22d3ee',     // cyan
                help: '#94a3b8',         // slate
                clear: '#94a3b8',        // slate
              };
              const cmdColor = cmdColors[parts[2]] || '#60a5fa';
              return <div key={i}>{parts[1]}<span style={{ color: cmdColor, fontWeight: 700 }}>{parts[2]}</span>{parts[3]}<span style={{ color: 'rgba(255,255,255,0.55)' }}>{parts[4]}</span></div>;
            }
          }
          if (line.startsWith('——')) return <div key={i} style={{ color: 'rgba(255,255,255,0.15)' }}>{line}</div>;
          return <div key={i}>{line}</div>;
        })}
      </pre>

      {/* Command history */}
      {history.map((line, i) => (
        <div key={i} style={{ color: getLineColor(line), whiteSpace: 'pre-wrap' }}>
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
            }}
          />
        </div>
      )}

      {/* Blinking cursor during intro */}
      {!introDone && (
        <span style={{
          display: 'inline-block',
          width: '8px',
          height: '15px',
          background: '#4ade80',
          verticalAlign: 'text-bottom',
          animation: 'blink 1s step-end infinite',
        }} />
      )}

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
            if (win.id === 'detail' && state.activeDetail) {
              return (
                <AppWindow key={win.id} windowState={win} darkMode={isDark}>
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
                <AppWindow key={win.id} windowState={win} darkMode={isDark}>
                  <ContentViewer
                    content={state.activeContent}
                    onClose={() => dispatch({ type: 'CLOSE_CONTENT' })}
                    windowMode
                  />
                </AppWindow>
              );
            }
            return (
              <AppWindow key={win.id} windowState={win} darkMode={isDark}>
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
