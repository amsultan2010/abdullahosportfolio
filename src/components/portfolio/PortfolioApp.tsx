import { useState, useEffect, createContext, useContext } from 'react';

import ContentViewer from './ContentViewer';
import type { ContentViewData } from './ContentViewer';
import { contentMap } from './contentData';

/* ══════════════════════════════════════════════════════════
   Theme context — dark/light mode
   ══════════════════════════════════════════════════════════ */

const ThemeCtx = createContext<{ dark: boolean; toggle: () => void }>({ dark: true, toggle: () => {} });

function getInitialTheme() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('rg-theme') !== 'light';
  }
  return true;
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(getInitialTheme);
  const toggle = () => {
    setDark(d => {
      localStorage.setItem('rg-theme', d ? 'light' : 'dark');
      return !d;
    });
  };
  return <ThemeCtx.Provider value={{ dark, toggle }}>{children}</ThemeCtx.Provider>;
}

/* ══════════════════════════════════════════════════════════
   Data
   ══════════════════════════════════════════════════════════ */

const BUILDING = [
  {
    label: 'LinkedIn Games Solver',
    href: 'https://github.com/ronnielgandhe',
    desc: 'Chrome extension — 7+ users organically from one LinkedIn post',
  },
  {
    label: 'CreatorScope',
    href: 'https://github.com/ronnielgandhe/creatorscope',
    desc: 'go-to-market automation for sourcing TikTok creators, multi-source discovery + scoring',
  },
];

const PREVIOUSLY = [
  { role: 'Growth Engineering', company: 'Augmentor Labs', icon: '/augmentor-dark.svg', href: 'https://augmentorlabs.com' },
  { role: 'Software Engineering', company: 'Augmentor Labs', icon: '/augmentor-dark.svg', href: 'https://augmentorlabs.com' },
  { role: 'Data Science', company: 'CIBC', icon: '/cibc-dark.svg', href: 'https://www.cibc.com' },
];

const WRITING = [
  {
    slug: 'prestige-is-a-strong-drug',
    title: 'Prestige Is a Strong Drug',
    desc: "What dropping out of one of Canada's best programs taught me about borrowed momentum.",
  },
  {
    slug: 'trading-rabbit-hole',
    title: 'What Going Down the Trading Rabbit Hole Taught Me About Finance',
    desc: 'Anyone who gets interested in markets eventually falls into the same rabbit hole.',
  },
];

const SOCIALS = [
  { label: 'github', href: 'https://github.com/ronnielgandhe' },
  { label: 'linkedin', href: 'https://www.linkedin.com/in/ronniel-gandhe/' },
  { label: 'email', href: 'mailto:ronnielgandhe@gmail.com' },
];

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
  external = true,
}: {
  href: string;
  children: React.ReactNode;
  icon?: string;
  external?: boolean;
}) {
  const { dark } = useContext(ThemeCtx);
  const fg = dark ? '#d6d3d1' : '#44403c';
  const ul = dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="rg-slink"
      style={{ color: fg, '--ul': ul, '--fg-hover': dark ? '#d6d3d1' : '#44403c' } as React.CSSProperties}
    >
      {icon && <Ico src={icon} alt="" />}
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

      <div className="rg-container">
        {/* ── Header ── */}
        <header className="rg-header">
          <h1 className="rg-name" style={{ color: t.textStrong }}>ronniel gandhe</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <nav className="rg-nav">
              <a href="/" className="rg-nav-link" style={{ color: t.textStrong }}>about</a>
              <a href="/projects" className="rg-nav-link" style={{ color: t.text }}>projects</a>
              <a href="/writing" className="rg-nav-link" style={{ color: t.text }}>writing</a>
            </nav>
            <button onClick={toggle} className="rg-theme-btn" style={{ color: t.text, border: `1px solid ${t.border}`, background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }} aria-label="Toggle theme">
              {dark ? (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>) : (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>)}
            </button>
          </div>
        </header>

        {/* ── Main bullet list ── */}
        <ul className="rg-list" id="projects">
          {/* Current: Salesforce Engineering @ CIBC */}
          <BulletItem diamond={t.diamond}>
            <span style={{ color: t.text }}>
              Salesforce Engineering{' '}
              <span className="rg-inline-link-group">
                <SLink href="https://www.cibc.com" icon="/cibc-dark.svg">CIBC</SLink>
              </span>
            </span>
          </BulletItem>

          {/* Current: CS @ Wilfrid Laurier, previously Waterloo + Laurier */}
          <li className="rg-item rg-item-nested">
            <div className="rg-diamond" style={{ background: t.diamond }} />
            <span style={{ color: t.text }}>
              CS{' '}
              <span className="rg-inline-link-group">
                <SLink href="https://www.wlu.ca" icon="/laurier-seal.png">Wilfrid Laurier</SLink>
              </span>
            </span>
            <ul className="rg-sublist">
              <li className="rg-subitem">
                <span className="rg-arrow" style={{ color: t.textMuted }}>↳</span>
                <span style={{ color: t.text }}>
                  previously{' '}
                  <span className="rg-inline-link-group">
                    <SLink href="https://uwaterloo.ca" icon="/waterloo-logo.png">Waterloo</SLink>
                    {' + '}
                    <SLink href="https://www.wlu.ca" icon="/laurier-seal.png">Laurier</SLink>
                  </span>
                </span>
              </li>
            </ul>
          </li>

          {/* What I've been building */}
          <li className="rg-item rg-item-nested">
            <div className="rg-diamond" style={{ background: t.diamond }} />
            <span className="rg-section-label" style={{ color: t.text }}>what i've been building:</span>
            <ul className="rg-sublist">
              {BUILDING.map((b, i) => (
                <li key={i} className="rg-subitem">
                  <span className="rg-arrow" style={{ color: t.textMuted }}>↳</span>
                  <span style={{ color: t.text }}>
                    <SLink href={b.href}>{b.label}</SLink>
                    {' — '}{b.desc}
                  </span>
                </li>
              ))}
            </ul>
          </li>

          {/* Previously */}
          <li className="rg-item rg-item-nested">
            <div className="rg-diamond" style={{ background: t.diamond }} />
            <span className="rg-section-label" style={{ color: t.text }}>previously:</span>
            <ul className="rg-sublist">
              {/* Removed — now on the Laurier line above */}
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

        {/* ── "see what i've built" + RonnielOS links ── */}
        <a href="/projects" className="rg-projects-link" style={{
          borderColor: dark ? '#57534e' : '#a8a29e',
          color: t.text,
          background: dark ? '#1c1917' : '#fafaf9',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        }}>
          see what i've built{' '}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'top', marginLeft: 4 }}><path d="M2 7v10"/><path d="M6 5v14"/><rect x="10" y="3" width="12" height="18" rx="2"/></svg>
        </a>

        {/* ── Signature (animated GIF, plays once, replay button) ── */}
        <SignatureReveal dark={dark} />

        {/* ── Footer (Martin-style: icon + label expands on hover) ── */}
        <footer className="rg-footer">
          <div style={{ height: 1, background: t.footerLine }} />
          <div className="rg-socials">
            <FooterIcon href="https://github.com/ronnielgandhe" label="github" dark={dark}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </FooterIcon>
            <FooterIcon href="https://www.linkedin.com/in/ronniel-gandhe/" label="linkedin" dark={dark}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </FooterIcon>
            <FooterIcon href="mailto:ronnielgandhe@gmail.com" label="email" dark={dark} external={false}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </FooterIcon>
            <FooterIcon href="/Ronniel_Gandhe_Resume.pdf" label="resume" dark={dark}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </FooterIcon>
          </div>
          <p style={{ fontSize: 13, color: t.textMuted, marginTop: 4 }}>2026 &copy; Ronniel Gandhe</p>
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
          justify-content: center;
          align-items: flex-start;
          font-family: 'NeueMontreal-Regular', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-weight: 300;
          line-height: 1.6;
          transition: background 0.3s, color 0.3s;
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
          padding: 60px 24px 40px;
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

        /* Writing */
        .rg-writing {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 8px;
        }
        .rg-writing-card {
          display: flex;
          flex-direction: column;
          gap: 2px;
          background: none;
          border: 1px solid;
          border-radius: 8px;
          padding: 16px 20px;
          cursor: pointer;
          text-align: left;
          transition: transform 0.3s, border-color 0.3s, box-shadow 0.3s;
          font-family: inherit;
          font-size: inherit;
        }
        .rg-writing-card:hover {
          transform: scale(1.02);
          box-shadow: 0 2px 12px rgba(0,0,0,0.2);
        }
        .rg-writing-card:active { transform: scale(0.98); }
        .rg-writing-title {
          font-family: 'NeueMontreal-Medium', sans-serif;
          font-weight: 500;
          font-size: 15px;
        }
        .rg-writing-desc {
          font-size: 14px;
          line-height: 1.5;
        }
        .rg-writing-arrow {
          opacity: 0.4;
          transition: opacity 0.2s;
        }
        .rg-writing-card:hover .rg-writing-arrow { opacity: 1; }

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
          width: 240px;
          height: auto;
          -webkit-mask-image: linear-gradient(to right, black 0%, black 45%, transparent 50%);
          mask-image: linear-gradient(to right, black 0%, black 45%, transparent 50%);
          -webkit-mask-size: 230% 100%;
          mask-size: 230% 100%;
          -webkit-mask-position: 100% 0;
          mask-position: 100% 0;
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
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
          .rg-container { padding: 40px 20px 32px; }
        }
      `}</style>
    </div>
  );
}

function SignatureReveal({ dark }: { dark: boolean }) {
  const [key, setKey] = useState(0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, marginTop: 16 }}>
      <img
        key={key}
        src="/ronniel_signature_transparent_clean.png"
        alt="R Gandhe signature"
        className="rg-signature-img"
        style={{
          filter: dark ? 'invert(1) contrast(2) brightness(2)' : 'contrast(2) brightness(0.1)',
        }}
      />
      <button
        onClick={() => setKey(k => k + 1)}
        aria-label="Replay signature"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: dark ? '#78716c' : '#78716c',
          fontSize: 16,
          padding: 0,
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = dark ? '#d6d3d1' : '#44403c')}
        onMouseLeave={e => (e.currentTarget.style.color = dark ? '#78716c' : '#78716c')}
      >
        ↻
      </button>
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

export default function PortfolioApp() {
  return (
    <ThemeProvider>
      <Inner />
    </ThemeProvider>
  );
}
