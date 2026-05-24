import { useState, useEffect, useCallback, useRef, createContext, useContext, lazy, Suspense } from 'react';

import ContentViewer from './ContentViewer';
import type { ContentViewData } from './ContentViewer';
import { contentMap } from './contentData';
import AbdullahAsciiLogo from '../desktop/AbdullahAsciiLogo';

const LazyDesktopShell = lazy(() => import('../desktop/DesktopShell'));

/* ══════════════════════════════════════════════════════════
   Theme context — dark/light mode
   ══════════════════════════════════════════════════════════ */

const ThemeCtx = createContext<{ dark: boolean; toggle: () => void; siteReady: boolean }>({ dark: false, toggle: () => {}, siteReady: false });

function getInitialTheme() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('rg-theme') === 'dark';
  }
  return false;
}

function ThemeProvider({ children, siteReady = false }: { children: React.ReactNode; siteReady?: boolean }) {
  const [dark, setDark] = useState(getInitialTheme);
  const toggle = () => {
    setDark(d => {
      localStorage.setItem('rg-theme', d ? 'light' : 'dark');
      return !d;
    });
  };
  return <ThemeCtx.Provider value={{ dark, toggle, siteReady }}>{children}</ThemeCtx.Provider>;
}

/* ══════════════════════════════════════════════════════════
   Data
   ══════════════════════════════════════════════════════════ */

const BUILDING = [
  {
    label: 'abdullahos',
    href: '/desktop',
    cover: '/readme/portfolio-desktop.jpg',
    desc: 'desktop-style portfolio w/ draggable windows and static apps.',
    tech: ['Astro', 'React', 'TypeScript'],
  },
  {
    label: 'tutoringbyabdullah',
    href: 'https://tutoringbyabdullah.xyz',
    cover: '/images/projects/tutoringpreview.png',
    desc: 'education product focused on understanding, not memorizing.',
    tech: ['Education', 'Product', 'Website'],
  },
];

const PREVIOUSLY = [
  { role: 'vertical ai for automation, enterprise software, productivity, education', company: 'projects', icon: '/icons/folder.png', href: '/projects' },
  { role: 'robotics + automation systems, with quant as technical proof', company: 'builds', icon: '/icons/folder.png', href: '/projects' },
];

const EDUCATION = [
  {
    school: 'american international school in riyadh',
    years: '2025-present',
    logo: '/images/logosicons/aisr.png',
    details: ['ap precalc, ap psych, ap compsci a', 'aspiring doctors club lead', '#2 varsity tennis seed'],
  },
  {
    school: 'the pingry school',
    years: '2021-2025',
    logo: '/images/logosicons/pingry.png',
    details: ['ap compsci principles 5/5', 'public forum debate', 'engineering + affinity leadership'],
  },
];

const SOCIALS = [
  { label: 'github', href: 'https://github.com/amsultan2010' },
  { label: 'youtube music', href: 'https://music.youtube.com/@amsultan303' },
  { label: 'email', href: 'mailto:abdullahmsultan1@gmail.com' },
];

function MainAsciiBackdrop({ dark }: { dark: boolean }) {
  const [size, setSize] = useState({ width: 1180, height: 820 });

  useEffect(() => {
    const setViewportSize = () => {
      setSize({
        width: Math.max(760, Math.round(window.innerWidth * 0.62)),
        height: Math.max(860, Math.round(window.innerHeight * 1.18)),
      });
    };

    setViewportSize();
    window.addEventListener('resize', setViewportSize);
    return () => window.removeEventListener('resize', setViewportSize);
  }, []);

  return (
    <div className="rg-ascii-backdrop" aria-hidden="true">
      <AbdullahAsciiLogo
        width={size.width}
        height={size.height}
        color={dark ? '#f5f5f4' : '#1c1917'}
        opacity={dark ? 0.26 : 0.23}
        fontWeight={900}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Inline icon helper
   ══════════════════════════════════════════════════════════ */

function Ico({ src, alt }: { src: string; alt: string }) {
  const { dark } = useContext(ThemeCtx);
  // Only invert augmentor icon on light mode (it's white-on-transparent for dark bg)
  const needsInvert = !dark && src.includes('augmentor');
  return (
    <img
      src={src}
      alt={alt}
      style={{
        width: 14,
        height: 14,
        objectFit: 'contain',
        display: 'inline-block',
        verticalAlign: 'middle',
        position: 'relative',
        top: -1,
        marginRight: 4,
        borderRadius: 2,
        filter: needsInvert ? 'invert(1)' : 'none',
      }}
    />
  );
}

/* ══════════════════════════════════════════════════════════
   Styled link (sweep underline on hover like Martin's)
   ══════════════════════════════════════════════════════════ */

function SLink({
  href,
  children,
  icon,
  iconDark,
  external = true,
}: {
  href: string;
  children: React.ReactNode;
  icon?: string;
  iconDark?: string;
  external?: boolean;
}) {
  const { dark } = useContext(ThemeCtx);
  const fg = dark ? '#d6d3d1' : '#44403c';
  const ul = dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';
  const resolvedIcon = dark && iconDark ? iconDark : icon;
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="rg-slink"
      style={{ color: fg, '--ul': ul, '--fg-hover': dark ? '#d6d3d1' : '#44403c' } as React.CSSProperties}
    >
      {resolvedIcon && <Ico src={resolvedIcon} alt="" />}
      {children}
    </a>
  );
}

/* ══════════════════════════════════════════════════════════
   Main app
   ══════════════════════════════════════════════════════════ */

function Inner() {
  const { dark, toggle } = useContext(ThemeCtx);
  const [activeContent, setActiveContent] = useState<ContentViewData | null>(null);

  const openPost = (slug: string) => {
    const data = contentMap[slug];
    if (data) setActiveContent(data);
  };

  const t = {
    bg: dark ? '#000000' : '#f5f5f4',
    text: dark ? '#a3a3a3' : '#57534e',
    textStrong: dark ? '#d6d3d1' : '#44403c',
    textMuted: dark ? '#78716c' : '#78716c',
    diamond: dark ? '#d6d3d1' : '#1c1917',
    border: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    cardBg: dark ? '#171717' : '#f5f5f5',
    footerLine: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    dotGrid: dark ? 'radial-gradient(#1f2937 1px, transparent 1px)' : 'radial-gradient(#e5e7eb 1px, transparent 1px)',
  };

  return (
    <div className="rg-root" style={{ background: t.bg, color: t.text }}>
      <MainAsciiBackdrop dark={dark} />

      <div className="rg-container">
        {/* ── Header ── */}
        <header className="rg-header">
          <h1 className="rg-name" style={{ color: t.textStrong }}>abdullah sultan</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <nav className="rg-nav">
              <a href="/" className="rg-nav-link" style={{ color: t.textStrong }}>about</a>
              <a href="/projects" className="rg-nav-link" style={{ color: t.text }}>projects</a>
              <a href="#education" className="rg-nav-link" style={{ color: t.text }}>education</a>
            </nav>
            <button onClick={toggle} className="rg-theme-btn" style={{ color: t.text, border: `1px solid ${t.border}`, background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }} aria-label="Toggle theme">
              {dark ? (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>) : (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>)}
            </button>
          </div>
        </header>

        {/* ── Main bullet list ── */}
        <ul className="rg-list" id="projects">
          <BulletItem diamond={t.diamond}>
            <span style={{ color: t.text }}>
              Student builder{' '}
              <span className="rg-inline-link-group">
                <SLink
                  href="/desktop"
                  icon="/icons/folder.png"
                >
                  abdullahos
                </SLink>
              </span>
            </span>
          </BulletItem>

          <BulletItem diamond={t.diamond}>
            <span style={{ color: t.text }}>
              interested in{' '}
              <span className="rg-inline-link-group">
                <SLink href="/projects" icon="/icons/folder.png">startups</SLink>
                {' + '}
                <SLink href="/projects" icon="/icons/folder.png">vertical ai</SLink>
                {' + '}
                <SLink href="/projects" icon="/icons/folder.png">robotics</SLink>
              </span>
            </span>
          </BulletItem>

          <BulletItem diamond={t.diamond}>
            <span style={{ color: t.text }}>
              aiming to become the cto of a yc-funded startup that actually does something meaningful
            </span>
          </BulletItem>

          {/* What I've been building */}
          <li className="rg-item rg-item-nested" style={{ marginTop: 8 }}>
            <div className="rg-diamond" style={{ background: t.diamond }} />
            <span className="rg-section-label" style={{ color: t.text }}>what i've been building:</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 4, width: '100%' }}>
              {BUILDING.map((b, i) => (
                <a key={i} href={b.href} target="_blank" rel="noopener noreferrer" className="rg-build-card" style={{
                  background: t.cardBg,
                  borderColor: t.border,
                }}>
                  <div style={{
                    aspectRatio: '16 / 10',
                    overflow: 'hidden',
                    borderRadius: '8px 8px 0 0',
                    margin: '-16px -16px 12px -16px',
                    width: 'calc(100% + 32px)',
                  }}>
                    <img src={b.cover} alt={b.label} className="rg-build-cover" style={{
                      width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                      transition: 'transform 0.4s ease',
                    }} />
                  </div>
                  <span className="rg-build-label" style={{ color: t.textStrong }}>{b.label}</span>
                  <span className="rg-build-desc" style={{ color: t.text }}>{b.desc}</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                    {b.tech.map((tag, j) => (
                      <span key={j} style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 99,
                        background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                        color: t.textMuted,
                      }}>{tag}</span>
                    ))}
                  </div>
                </a>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6, width: '100%' }}>
              <a href="/projects" style={{ fontSize: 13, color: t.textMuted, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = t.textStrong)}
                onMouseLeave={e => (e.currentTarget.style.color = t.textMuted)}
              >see more →</a>
            </div>
          </li>

          {/* Education */}
          <li id="education" className="rg-item rg-item-nested" style={{ marginTop: 8 }}>
            <div className="rg-diamond" style={{ background: t.diamond }} />
            <span className="rg-section-label" style={{ color: t.text }}>education:</span>
            <div className="rg-education">
              {EDUCATION.map((edu, i) => (
                <div key={i} className="rg-education-card" style={{ borderColor: t.border, background: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                  <img src={edu.logo} alt="" className="rg-education-logo" />
                  <div style={{ minWidth: 0 }}>
                    <div className="rg-education-title" style={{ color: t.textStrong }}>{edu.school}</div>
                    <div className="rg-education-years" style={{ color: t.textMuted }}>{edu.years}</div>
                    <div className="rg-education-details" style={{ color: t.text }}>
                      {edu.details.join(' · ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </li>

          {/* Previously */}
          <li className="rg-item rg-item-nested" style={{ marginTop: 8 }}>
            <div className="rg-diamond" style={{ background: t.diamond }} />
            <span className="rg-section-label" style={{ color: t.text }}>exploring:</span>
            <ul className="rg-sublist">
               
              {PREVIOUSLY.map((p, i) => (
                <li key={i} className="rg-subitem">
                  <span className="rg-arrow" style={{ color: t.textMuted }}>↳</span>
                  <span style={{ color: t.text }}>
                    {p.role}{' '}
                    <span className="rg-inline-link-group">
                      <SLink href={p.href} icon={p.icon}>{p.company}</SLink>
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </li>
        </ul>


        <div className="rg-signature" style={{ color: t.textStrong }}>Abdullah</div>

        {/* ── Footer (Martin-style: icon + label expands on hover) ── */}
        <footer className="rg-footer">
          <div style={{ height: 1, background: t.footerLine }} />
          <div className="rg-socials">
            <FooterIcon href="https://github.com/amsultan2010" label="github" dark={dark}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </FooterIcon>
            <FooterIcon href="https://music.youtube.com/@amsultan303" label="music" dark={dark}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M10 8l6 4-6 4z"/></svg>
            </FooterIcon>
            <FooterIcon href="mailto:abdullahmsultan1@gmail.com" label="email" dark={dark} external={false}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </FooterIcon>
            <FooterIcon href="https://github.com/amsultan2010" label="projects" dark={dark}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </FooterIcon>
          </div>
          <p style={{ fontSize: 13, color: t.textMuted, marginTop: 4 }}>2026 &copy; Abdullah Sultan</p>
        </footer>
      </div>

      {/* Content viewer modal */}
      {activeContent && (
        <ContentViewer content={activeContent} onClose={() => setActiveContent(null)} />
      )}

      <style>{`
        :root {
          color-scheme: ${dark ? 'dark' : 'light'};
          font-synthesis: none;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .rg-root {
          position: relative;
          min-height: 100vh;
          width: 100%;
          display: flex;
          justify-content: flex-start;
          align-items: flex-start;
          font-family: 'NeueMontreal-Regular', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-weight: 300;
          line-height: 1.6;
          overflow: hidden;
          transition: background 0.3s, color 0.3s;
        }

        .rg-ascii-backdrop {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: min(62vw, 920px);
          z-index: 0;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          pointer-events: none;
          overflow: hidden;
          transform: translate3d(-4vw, -1vh, 0);
          transition: opacity 0.3s ease;
          user-select: none;
        }

        .rg-root ::selection {
          background: ${dark ? 'rgba(133, 77, 14, 0.6)' : 'rgba(254, 240, 138, 0.8)'};
        }

        .rg-container {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
          max-width: 500px;
          margin-left: clamp(48px, 15vw, 196px);
          padding: 60px 24px 40px 0;
        }

        /* Header */
        .rg-header { display: flex; justify-content: space-between; align-items: center; }
        .rg-name {
          font-family: 'NeueMontreal-Medium', -apple-system, sans-serif;
          font-weight: 600;
          font-size: 16px;
          margin: 0;
          letter-spacing: -0.01em;
        }
        .rg-nav { display: flex; gap: 16px; }
        .rg-nav-link {
          font-size: 14px;
          text-decoration: none;
          position: relative;
          transition: color 0.2s, opacity 0.2s;
        }
        .rg-nav-link::after {
          content: '';
          position: absolute;
          left: 0; bottom: -1px;
          width: 100%; height: 1px;
          background: currentColor;
          opacity: 0.25;
        }
        .rg-nav-link:hover { opacity: 1; }

        .rg-theme-btn {
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: background 0.2s, border-color 0.2s;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .rg-theme-btn:hover { background: rgba(128,128,128,0.15); }

        /* List */
        .rg-list {
          list-style: none;
          padding: 0; margin: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 16px;
        }
        .rg-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding-left: 16px;
          position: relative;
          transition: transform 0.2s;
        }
        .rg-item:hover { transform: translateX(4px); }
        .rg-item-nested {
          flex-direction: column;
          gap: 12px;
          padding-top: 2px;
        }
        .rg-diamond {
          position: absolute;
          left: 0; top: 10px;
          width: 6px; height: 6px;
          transform: rotate(45deg);
          flex-shrink: 0;
          transition: transform 0.3s;
        }
        .rg-item:hover > .rg-diamond { transform: rotate(90deg) scale(1.1); }

        .rg-section-label {
          font-style: italic;
          font-family: 'NeueMontreal-Medium', sans-serif;
          font-weight: 700;
        }

        .rg-inline-link-group { margin-left: 6px; }

        /* Build cards */
        .rg-build-card {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 16px;
          border-radius: 10px;
          border: 1px solid;
          text-decoration: none;
          transition: transform 0.2s, box-shadow 0.2s;
          overflow: hidden;
        }
        .rg-build-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }
        .rg-build-card:hover .rg-build-cover { transform: scale(1.05); }
        .rg-build-label {
          font-family: 'NeueMontreal-Medium', sans-serif;
          font-weight: 600;
          font-size: 14px;
        }
        .rg-build-desc {
          font-size: 13px;
          line-height: 1.5;
        }

        /* Sweep-underline link */
        .rg-slink {
          text-decoration: none;
          font-family: 'NeueMontreal-Medium', sans-serif;
          font-weight: 700;
          position: relative;
          transition: color 0.2s;
        }
        .rg-slink::after {
          content: '';
          position: absolute;
          left: 0; bottom: -1px;
          width: 100%; height: 1px;
          background: var(--ul);
          z-index: 1;
        }
        .rg-slink::before {
          content: '';
          position: absolute;
          left: 0; bottom: -1px;
          width: 100%; height: 1px;
          background: var(--fg-hover);
          z-index: 2;
          transform: scaleX(0);
          transform-origin: left;
          opacity: 0;
          transition: opacity 0.15s;
        }
        .rg-slink:hover { color: var(--fg-hover); }
        .rg-slink:hover::before {
          opacity: 1;
          animation: sweep 2s ease-in-out infinite;
        }

        @keyframes sweep {
          0%   { transform: scaleX(0); transform-origin: left; }
          50%  { transform: scaleX(1); transform-origin: left; }
          50.1%{ transform: scaleX(1); transform-origin: right; }
          100% { transform: scaleX(0); transform-origin: right; }
        }

        /* Sublist */
        .rg-sublist {
          list-style: none;
          padding: 0 0 0 16px;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .rg-subitem {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }
        .rg-arrow {
          position: absolute;
          left: -20px; top: 0;
        }

        /* Projects link */
        .rg-projects-link {
          display: block;
          text-align: center;
          padding: 14px 20px;
          border-radius: 8px;
          border: 1px solid;
          text-decoration: none;
          font-size: 14px;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .rg-projects-link:hover {
          transform: scale(1.02);
          box-shadow: 0 2px 12px rgba(0,0,0,0.15);
        }
        .rg-projects-link:active { transform: scale(0.98); }

        /* Education */
        .rg-education {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 8px;
          width: 100%;
        }
        .rg-education-card {
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid;
          border-radius: 8px;
          padding: 12px 14px;
          text-align: left;
          transition: transform 0.3s, border-color 0.3s, box-shadow 0.3s;
          font-family: inherit;
          font-size: inherit;
        }
        .rg-education-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 12px rgba(0,0,0,0.2);
        }
        .rg-education-logo {
          width: 36px;
          height: 36px;
          object-fit: contain;
          border-radius: 6px;
          flex-shrink: 0;
        }
        .rg-education-title {
          font-family: 'NeueMontreal-Medium', sans-serif;
          font-weight: 500;
          font-size: 15px;
        }
        .rg-education-years {
          font-size: 12px;
          line-height: 1.4;
        }
        .rg-education-details {
          font-size: 14px;
          line-height: 1.5;
        }

        /* CTA */
        .rg-cta { font-size: 14px; margin: 8px 0 0; }
        .rg-cta-link {
          text-decoration: none;
          border-bottom: 1px solid currentColor;
          transition: opacity 0.2s;
        }
        .rg-cta-link:hover { opacity: 1; }

        /* Signature with sweep reveal */
        .rg-signature-img {
          width: 180px;
          height: auto;
          -webkit-mask-image: linear-gradient(to right, black 0%, black 45%, transparent 50%);
          mask-image: linear-gradient(to right, black 0%, black 45%, transparent 50%);
          -webkit-mask-size: 230% 100%;
          mask-size: 230% 100%;
          -webkit-mask-position: 100% 0;
          mask-position: 100% 0;
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
        }
        .rg-signature-img.rg-sig-animate {
          animation: sig-write 2.5s cubic-bezier(0.25, 0.1, 0.25, 1) 0.5s both;
        }
        @keyframes sig-write {
          0%   { -webkit-mask-position: 100% 0; mask-position: 100% 0; }
          100% { -webkit-mask-position: 0% 0;   mask-position: 0% 0; }
        }

        /* Footer */
        .rg-footer { display: flex; flex-direction: column; gap: 12px; margin-top: 4px; }
        .rg-socials { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }

        @media (max-width: 500px) {
          .rg-container {
            margin-left: 36px;
            padding: 40px 20px 32px 0;
          }
          .rg-ascii-backdrop {
            width: 72vw;
            transform: translate3d(10vw, 0, 0);
          }
        }
      `}</style>
    </div>
  );
}

/* Footer icon with label that expands on hover (like Martin's) */
function FooterIcon({ href, label, dark, children, external = true }: {
  href: string; label: string; dark: boolean; children: React.ReactNode; external?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const color = dark ? '#78716c' : '#78716c';
  const hoverColor = dark ? '#d6d3d1' : '#44403c';
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        color: hovered ? hoverColor : color,
        textDecoration: 'none',
        transition: 'color 0.3s',
      }}
    >
      <span style={{ display: 'flex', transition: 'transform 0.5s ease', transform: hovered ? 'scale(1.1)' : 'scale(1)' }}>
        {children}
      </span>
      <span style={{
        display: 'inline-block',
        overflow: 'hidden',
        width: hovered ? 'auto' : 0,
        maxWidth: hovered ? 80 : 0,
        marginLeft: hovered ? 6 : 0,
        opacity: hovered ? 1 : 0,
        fontSize: 14,
        whiteSpace: 'nowrap',
        transition: 'max-width 0.5s ease, opacity 0.5s ease, margin-left 0.3s ease',
      }}>
        {label}
      </span>
    </a>
  );
}

function BulletItem({ diamond, children }: { diamond: string; children: React.ReactNode }) {
  return (
    <li className="rg-item">
      <div className="rg-diamond" style={{ background: diamond }} />
      {children}
    </li>
  );
}

/* ══════════════════════════════════════════════════════════
   Site loader + Page curl / AbdullahOS launcher
   ══════════════════════════════════════════════════════════ */

type AppPhase = 'loading' | 'site' | 'peeling' | 'desktop';

function SiteLoader({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'fade' | 'done'>('loading');

  useEffect(() => {
    let p = 0;
    const interval = setInterval(() => {
      const speed = Math.max(0.6, 3.5 * (1 - p / 100));
      p = Math.min(100, p + speed);
      setProgress(p);
      if (p >= 100) clearInterval(interval);
    }, 25);

    const t1 = setTimeout(() => setPhase('fade'), 2200);
    const t2 = setTimeout(() => {
      setPhase('done');
      onDone();
    }, 2800);

    return () => { clearInterval(interval); clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  if (phase === 'done') return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10001, background: '#f5f5f4',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: phase === 'fade' ? 0 : 1,
      transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    }}>
      <div style={{ width: 56, height: 56, animation: 'siteLoad 0.6s ease-out' }}>
        <AbdullahAsciiLogo width={56} height={56} color="#57534e" opacity={0.95} />
      </div>
      <div style={{
        marginTop: 24, width: 180, height: 3, borderRadius: 2,
        background: 'rgba(0,0,0,0.08)', overflow: 'hidden',
        animation: 'siteLoad 0.6s ease-out',
      }}>
        <div style={{
          height: '100%', width: `${progress}%`,
          background: '#57534e', borderRadius: 2,
          transition: 'width 0.08s linear',
        }} />
      </div>
      <style>{`
        @keyframes siteLoad {
          from { opacity: 0; transform: scale(0.92) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

/** ryo.lu-style page peel — CSS clip-path + layered gradients + spring transition */

function OSCloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      onClick={onClose}
      className="os-close-btn"
      aria-label="Close AbdullahOS"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
      <style>{`
        .os-close-btn {
          position: fixed;
          top: 36px;
          right: 16px;
          z-index: 10002;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 0.5px solid rgba(0,0,0,0.08);
          background: rgba(255,255,255,0.55);
          color: rgba(0,0,0,0.5);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(12px);
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .os-close-btn:hover {
          background: rgba(255,255,255,0.75);
          color: rgba(0,0,0,0.8);
          transform: scale(1.1);
        }
      `}</style>
    </button>
  );
}

export default function PortfolioApp() {
  const [phase, setPhase] = useState<AppPhase>('loading');
  const [expanded, setExpanded] = useState(false);

  const handleLoaded = useCallback(() => {
    setPhase('site');
  }, []);

  const handleClose = useCallback(() => {
    setExpanded(false);
    setPhase('site');
  }, []);

  // Toggle peek open/close
  const peelTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const togglePeek = useCallback(() => {
    if (!expanded) {
      setExpanded(true);
      // After the clip-path transition finishes, switch to full desktop mode
      peelTimer.current = setTimeout(() => setPhase('desktop'), 700);
    }
  }, [expanded]);

  // Escape key to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (expanded || phase === 'desktop')) {
        clearTimeout(peelTimer.current);
        setExpanded(false);
        setPhase('site');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expanded, phase]);

  return (
    <ThemeProvider siteReady={phase !== 'loading'}>
      {/* Portfolio page — the main content (hidden but not unmounted during desktop phase to avoid remount flash) */}
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', background: '#f5f5f4', display: (phase === 'loading' || phase === 'site') ? undefined : 'none' }}>
        <Inner />
      </div>

      {/* Corner fold — static, click to expand into AbdullahOS */}
      {(phase === 'site' || phase === 'desktop') && (
        <div className={`peek-container ${expanded ? 'peek-expanded' : ''}`}>
          <div className="peek-desktop">
            <Suspense fallback={<div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/images/wallpaper/wallpaper.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }} />}>
              <LazyDesktopShell skipBoot />
            </Suspense>
            {phase === 'desktop' && <OSCloseButton onClose={handleClose} />}
          </div>
          <div
            className={`page-curl ${expanded ? 'curl-hidden' : ''}`}
            onClick={togglePeek}
            role="button"
            aria-label="Open AbdullahOS"
          />
        </div>
      )}

      <style>{`
        .peek-container {
          position: fixed;
          top: 0;
          right: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 999;
          overflow: visible;
        }
        .peek-desktop {
          position: absolute;
          top: 0;
          right: 0;
          width: 100%;
          height: 100%;
          pointer-events: auto;
          clip-path: polygon(
            calc(100% - 200px) 0%,
            100% 0%,
            100% 200px,
            calc(100% - 200px) 0%
          );
          transition: clip-path 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .peek-expanded .peek-desktop {
          clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
        }
        .page-curl {
          position: absolute;
          top: 0;
          right: 0;
          width: 200px;
          height: 200px;
          pointer-events: auto;
          cursor: pointer;
          z-index: 1001;
          background:
            linear-gradient(225deg, transparent 48%, rgba(0,0,0,0.08) 49.5%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.05) 51%, transparent 53%);
          transition: opacity 0.3s linear;
        }
        .curl-hidden {
          opacity: 0 !important;
          pointer-events: none;
        }
        body.blackbook-active .peek-container {
          display: none !important;
        }
        @media (max-width: 768px) {
          .peek-container {
            display: none !important;
          }
        }
      `}</style>

      {/* Loading overlay */}
      {phase === 'loading' && (
        <SiteLoader onDone={handleLoaded} />
      )}

    </ThemeProvider>
  );
}
