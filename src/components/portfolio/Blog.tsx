import { useState, useEffect } from 'react';
import type { ContentViewData } from './ContentViewer';
import { contentMap } from './contentData';
import MarkdownRenderer from './MarkdownRenderer';

interface BlogProps {
  onContentClick?: (content: ContentViewData) => void;
  windowMode?: boolean;
}

const blogPosts = [
  {
    slug: "prestige-is-a-strong-drug",
    title: "Prestige Is a Strong Drug",
    summary: "What dropping out of one of Canada's best programs taught me about borrowed momentum and real growth.",
    tags: ["Personal", "Career", "Psychology"],
    readingTime: 5,
    publishedAt: "2026-02-20",
    folder: "Personal"
  },
  {
    slug: "trading-rabbit-hole",
    title: "What Going Down the Trading Rabbit Hole Taught Me About Finance",
    summary: "Anyone who gets interested in markets eventually falls into the same rabbit hole. Here is what I found at the bottom.",
    tags: ["Finance", "Markets", "Learning"],
    readingTime: 6,
    publishedAt: "2026-01-28",
    folder: "Finance"
  },
  {
    slug: "vc-investing-in-myself",
    title: "Roleplaying as a VC Investing in Myself",
    summary: "What happens when you evaluate your own life using the logic of venture capital.",
    tags: ["Productivity", "Psychology", "Personal"],
    readingTime: 5,
    publishedAt: "2026-01-15",
    folder: "Personal"
  },
  {
    slug: "most-ai-startups-api-calls",
    title: "Most AI Startups Are Just Fancy API Calls",
    summary: "And why that is actually working for now. The wrapper critique misses something important.",
    tags: ["AI", "Startups", "Systems"],
    readingTime: 5,
    publishedAt: "2025-12-10",
    folder: "Tech"
  },
  {
    slug: "explaining-ai-agents",
    title: "Explaining AI Agents With One Simple Analogy",
    summary: "Every time I try explaining AI agents to someone who is not technical, the conversation usually starts the same way.",
    tags: ["AI", "Agents", "Learning"],
    readingTime: 5,
    publishedAt: "2025-11-22",
    folder: "Tech"
  }
];

// Group posts by date section
function groupByDate(posts: typeof blogPosts) {
  const now = new Date();
  const groups: { label: string; posts: typeof blogPosts }[] = [];
  const buckets: Record<string, typeof blogPosts> = {};

  posts.forEach(post => {
    const d = new Date(post.publishedAt);
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

    let label: string;
    if (diffDays <= 7) label = 'Previous 7 Days';
    else if (diffDays <= 30) label = 'Previous 30 Days';
    else if (d.getFullYear() === now.getFullYear()) {
      label = d.toLocaleString('en-US', { month: 'long' });
    } else {
      label = String(d.getFullYear());
    }

    if (!buckets[label]) buckets[label] = [];
    buckets[label].push(post);
  });

  for (const [label, posts] of Object.entries(buckets)) {
    groups.push({ label, posts });
  }
  return groups;
}

const folders = [
  { name: 'All Notes', icon: '📓', count: blogPosts.length },
  { name: 'Personal', icon: '💭', count: blogPosts.filter(p => p.folder === 'Personal').length },
  { name: 'Finance', icon: '📈', count: blogPosts.filter(p => p.folder === 'Finance').length },
  { name: 'Tech', icon: '💻', count: blogPosts.filter(p => p.folder === 'Tech').length },
];

const Blog = ({ onContentClick, windowMode }: BlogProps) => {
  const [selectedSlug, setSelectedSlug] = useState<string>(blogPosts[0].slug);
  const [activeFolder, setActiveFolder] = useState('All Notes');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = blogPosts.filter(p => {
    const matchFolder = activeFolder === 'All Notes' || p.folder === activeFolder;
    const matchSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFolder && matchSearch;
  });

  const grouped = groupByDate(filteredPosts);
  const selectedPost = blogPosts.find(p => p.slug === selectedSlug);
  const selectedContent = selectedPost ? contentMap[selectedPost.slug] : null;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const formatFullDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }) + ' at ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
      color: 'rgba(0,0,0,0.85)',
      fontSize: '13px',
    }}>
      {/* ── Notes Toolbar (full-width, Apple-style) ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '6px 12px',
        borderBottom: '0.5px solid rgba(0,0,0,0.1)',
        background: 'rgba(0,0,0,0.015)',
        minHeight: '32px',
      }}>
        {/* Sidebar toggle */}
        <NotesToolbarBtn>
          <svg width="15" height="14" viewBox="0 0 18 16" fill="none">
            <rect x="1" y="1" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.2" />
            <line x1="6" y1="1" x2="6" y2="15" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </NotesToolbarBtn>

        <div style={{ width: '1px', height: '16px', background: 'rgba(0,0,0,0.08)', margin: '0 4px' }} />

        {/* List / Grid view */}
        <NotesToolbarBtn active>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="2" width="14" height="2" rx="0.5" fill="currentColor" />
            <rect x="1" y="7" width="14" height="2" rx="0.5" fill="currentColor" />
            <rect x="1" y="12" width="14" height="2" rx="0.5" fill="currentColor" />
          </svg>
        </NotesToolbarBtn>
        <NotesToolbarBtn>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" />
            <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" />
            <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" />
            <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </NotesToolbarBtn>

        <div style={{ width: '1px', height: '16px', background: 'rgba(0,0,0,0.08)', margin: '0 4px' }} />

        {/* Delete */}
        <NotesToolbarBtn>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <polyline points="3,4 4,14 12,14 13,4" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="none" />
            <line x1="2" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M6 4V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V4" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </NotesToolbarBtn>

        {/* Compose */}
        <NotesToolbarBtn>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" />
            <line x1="5" y1="8" x2="11" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="5" y1="5.5" x2="11" y2="5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="5" y1="10.5" x2="8" y2="10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </NotesToolbarBtn>

        <div style={{ width: '1px', height: '16px', background: 'rgba(0,0,0,0.08)', margin: '0 4px' }} />

        {/* Aa formatting */}
        <NotesToolbarBtn>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'currentColor', lineHeight: 1 }}>Aa</span>
        </NotesToolbarBtn>

        {/* Adjustments */}
        <NotesToolbarBtn>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <line x1="2" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="2" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="5" cy="4" r="1.5" fill="rgba(0,0,0,0.04)" stroke="currentColor" strokeWidth="1" />
            <circle cx="10" cy="8" r="1.5" fill="rgba(0,0,0,0.04)" stroke="currentColor" strokeWidth="1" />
            <circle cx="7" cy="12" r="1.5" fill="rgba(0,0,0,0.04)" stroke="currentColor" strokeWidth="1" />
          </svg>
        </NotesToolbarBtn>

        {/* Table */}
        <NotesToolbarBtn>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.2" />
            <line x1="1" y1="5.5" x2="15" y2="5.5" stroke="currentColor" strokeWidth="1" />
            <line x1="1" y1="10.5" x2="15" y2="10.5" stroke="currentColor" strokeWidth="1" />
            <line x1="5.5" y1="1" x2="5.5" y2="15" stroke="currentColor" strokeWidth="1" />
            <line x1="10.5" y1="1" x2="10.5" y2="15" stroke="currentColor" strokeWidth="1" />
          </svg>
        </NotesToolbarBtn>

        <div style={{ flex: 1 }} />

        {/* Share */}
        <NotesToolbarBtn>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M4 9v4a1 1 0 001 1h6a1 1 0 001-1V9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <polyline points="5,5 8,2 11,5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <line x1="8" y1="2" x2="8" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </NotesToolbarBtn>

        {/* Search */}
        <NotesToolbarBtn>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.2" />
            <line x1="10" y1="10" x2="14" y2="14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </NotesToolbarBtn>
      </div>

      {/* ── Three-panel layout below toolbar ── */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

      {/* ── Left Sidebar: Folders ── */}
      <div style={{
        width: '180px',
        minWidth: '180px',
        borderRight: '0.5px solid rgba(0,0,0,0.1)',
        background: 'rgba(255,255,255,0.3)',
        padding: '12px 0',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Search */}
        <div style={{ padding: '0 10px 10px', position: 'relative' }}>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '5px 8px 5px 26px',
              fontSize: '12px',
              border: '0.5px solid rgba(0,0,0,0.12)',
              borderRadius: '6px',
              background: 'rgba(0,0,0,0.04)',
              color: 'rgba(0,0,0,0.8)',
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
          />
          <svg width="12" height="12" viewBox="0 0 16 16" style={{ position: 'absolute', left: '18px', top: '6px', opacity: 0.35 }}>
            <circle cx="6.5" cy="6.5" r="5.5" stroke="rgba(0,0,0,0.6)" strokeWidth="1.5" fill="none" />
            <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="rgba(0,0,0,0.6)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* iCloud section label */}
        <div style={{
          fontSize: '11px',
          fontWeight: 600,
          color: 'rgba(0,0,0,0.35)',
          padding: '8px 14px 4px',
          letterSpacing: '0.02em',
        }}>
          iCloud
        </div>

        {folders.map(folder => {
          const isActive = activeFolder === folder.name;
          return (
            <div
              key={folder.name}
              onClick={() => setActiveFolder(folder.name)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 14px',
                cursor: 'default',
                borderRadius: '6px',
                margin: '0 6px',
                background: isActive ? 'rgba(59,130,246,0.12)' : 'transparent',
                color: isActive ? '#007AFF' : 'rgba(0,0,0,0.7)',
                fontWeight: isActive ? 500 : 400,
                fontSize: '13px',
                transition: 'background 0.15s',
              }}
            >
              <span style={{ fontSize: '14px', width: '18px', textAlign: 'center' }}>{folder.icon}</span>
              <span style={{ flex: 1 }}>{folder.name}</span>
              <span style={{
                fontSize: '12px',
                color: isActive ? '#007AFF' : 'rgba(0,0,0,0.3)',
                fontWeight: 400,
              }}>
                {folder.count}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Middle: Notes List ── */}
      <div style={{
        width: '240px',
        minWidth: '240px',
        borderRight: '0.5px solid rgba(0,0,0,0.1)',
        overflowY: 'auto',
        background: 'rgba(255,255,255,0.4)',
      }}>
        {/* Notes grouped by date */}
        {grouped.map(group => (
          <div key={group.label}>
            <div style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'rgba(0,0,0,0.4)',
              padding: '12px 14px 4px',
            }}>
              {group.label}
            </div>
            {group.posts.map(post => {
              const isSelected = post.slug === selectedSlug;
              return (
                <div
                  key={post.slug}
                  onClick={() => setSelectedSlug(post.slug)}
                  style={{
                    padding: '10px 14px',
                    cursor: 'default',
                    borderRadius: '8px',
                    margin: '2px 6px',
                    background: isSelected ? '#FFCA28' : 'transparent',
                    transition: 'background 0.12s',
                  }}
                >
                  <div style={{
                    fontWeight: 600,
                    fontSize: '13px',
                    color: isSelected ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.8)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {post.title}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '2px',
                    fontSize: '12px',
                    color: isSelected ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)',
                  }}>
                    <span>{formatDate(post.publishedAt)}</span>
                    <span style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {post.summary.slice(0, 30)}...
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginTop: '3px',
                    fontSize: '11px',
                    color: isSelected ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.3)',
                  }}>
                    <span>📓</span>
                    <span>{post.folder}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* ── Right: Content Reader ── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px 32px',
        background: 'rgba(255,255,255,0.4)',
      }}>
        {selectedPost && selectedContent ? (
          <>
            {/* Date header */}
            <div style={{
              textAlign: 'center',
              fontSize: '12px',
              color: 'rgba(0,0,0,0.35)',
              marginBottom: '20px',
            }}>
              {formatFullDate(selectedPost.publishedAt)}
            </div>

            {/* Title */}
            <h1 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: 'rgba(0,0,0,0.9)',
              lineHeight: 1.3,
              margin: '0 0 8px',
              fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
            }}>
              {selectedPost.title}
            </h1>

            {/* Summary/subtitle */}
            <p style={{
              fontSize: '15px',
              color: 'rgba(0,0,0,0.5)',
              lineHeight: 1.5,
              margin: '0 0 24px',
            }}>
              {selectedPost.summary}
            </p>

            {/* Markdown content */}
            <div className="notes-content" style={{
              fontSize: '15px',
              lineHeight: 1.7,
              color: 'rgba(0,0,0,0.8)',
            }}>
              <MarkdownRenderer content={selectedContent.markdown} />
            </div>
          </>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'rgba(0,0,0,0.25)',
            fontSize: '15px',
          }}>
            Select a note to read
          </div>
        )}
      </div>

      </div>{/* close three-panel layout */}

      <style>{`
        /* Override MarkdownRenderer dark-theme inline styles */
        .notes-content h2,
        .notes-content h3 {
          font-size: 18px !important;
          font-weight: 700 !important;
          color: rgba(0,0,0,0.85) !important;
          margin: 1.5em 0 0.5em !important;
        }
        .notes-content p {
          margin: 0 0 1em !important;
          color: rgba(0,0,0,0.7) !important;
        }
        .notes-content strong {
          font-weight: 600 !important;
          color: rgba(0,0,0,0.85) !important;
        }
        .notes-content em {
          color: rgba(0,0,0,0.75) !important;
        }
        .notes-content blockquote {
          border-left: 3px solid rgba(0,0,0,0.15) !important;
          padding-left: 16px !important;
          margin: 1em 0 !important;
          color: rgba(0,0,0,0.55) !important;
          font-style: italic;
        }
        .notes-content code {
          background: rgba(0,0,0,0.06) !important;
          color: rgba(0,0,0,0.8) !important;
          padding: 2px 6px !important;
          border-radius: 4px !important;
          font-size: 13px !important;
        }
        .notes-content pre {
          background: rgba(0,0,0,0.04) !important;
          border: 0.5px solid rgba(0,0,0,0.08) !important;
          border-radius: 8px !important;
          padding: 12px 16px !important;
          overflow-x: auto;
        }
        .notes-content pre code {
          background: none !important;
          padding: 0 !important;
        }
        .notes-content hr {
          border: none !important;
          border-top: 1px solid rgba(0,0,0,0.1) !important;
        }
        .notes-content a {
          color: #007AFF !important;
          text-decoration-color: rgba(0,122,255,0.3) !important;
        }
        .notes-content li {
          color: rgba(0,0,0,0.7) !important;
        }
        .notes-content table th {
          color: rgba(0,0,0,0.85) !important;
          border-bottom-color: rgba(0,0,0,0.15) !important;
        }
        .notes-content table td {
          color: rgba(0,0,0,0.7) !important;
          border-bottom-color: rgba(0,0,0,0.06) !important;
        }
      `}</style>
    </div>
  );
};

function NotesToolbarBtn({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <div style={{
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '4px',
      cursor: 'default',
      color: active ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.35)',
    }}>
      {children}
    </div>
  );
}

export default Blog;
