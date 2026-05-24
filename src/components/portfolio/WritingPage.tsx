import { useState } from 'react';
import PageShell, { useTheme, themeColors } from './PageShell';

const POSTS = [
  {
    slug: 'abdullah-notes',
    title: 'Abdullah Notes',
    date: '2026-01-01',
  },
  {
    slug: 'project-log',
    title: 'Project Log',
    date: '2026-01-02',
  },
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function WritingContent() {
  const { dark } = useTheme();
  const t = themeColors(dark);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 8 }}>
      {POSTS.map(post => (
        <a
          key={post.slug}
          href={`/writing/${post.slug}`}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            padding: '14px 0',
            borderBottom: `1px solid ${t.border}`,
            cursor: 'pointer',
            transition: 'background 0.2s',
            borderRadius: 4,
            textDecoration: 'none',
            color: 'inherit',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <span style={{
            color: t.textStrong,
            fontFamily: "'NeueMontreal-Medium', sans-serif",
            fontWeight: 500,
            fontSize: 15,
            position: 'relative',
          }}>
            {post.title}
          </span>
          <span style={{
            fontSize: 13,
            color: t.textMuted,
            whiteSpace: 'nowrap',
            marginLeft: 16,
            flexShrink: 0,
          }}>
            {formatDate(post.date)}
          </span>
        </a>
      ))}
    </div>
  );
}

export default function WritingPage() {
  return (
    <PageShell activePage="writing">
      <WritingContent />
    </PageShell>
  );
}
