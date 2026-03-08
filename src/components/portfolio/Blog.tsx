import { useState, useEffect, useRef } from 'react';
import { getTagColor } from './tagColors';
import type { ContentViewData } from './ContentViewer';
import { contentMap } from './contentData';

interface BlogProps {
  onContentClick?: (content: ContentViewData) => void;
}

// Boost rgba alpha to match ContentViewer pill appearance
function boostAlpha(rgba: string, factor: number): string {
  return rgba.replace(/([\d.]+)\)$/, (_, a) => `${Math.min(1, parseFloat(a) * factor)})`);
}

const Blog = ({ onContentClick }: BlogProps) => {
  const [titleAnimated, setTitleAnimated] = useState(false);
  const [animatedCards, setAnimatedCards] = useState(new Set<string>());
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target.classList.contains('blog-title')) {
              setTitleAnimated(true);
            } else {
              const id = (entry.target as HTMLElement).dataset.blogId;
              if (id) setAnimatedCards(prev => new Set([...prev, id]));
            }
          }
        });
      },
      { threshold: 0, rootMargin: '0px' }
    );

    const title = sectionRef.current?.querySelector('.blog-title');
    const cards = sectionRef.current?.querySelectorAll('.blog-card');
    if (title) observer.observe(title);
    if (cards) cards.forEach(c => observer.observe(c));

    return () => observer.disconnect();
  }, [animatedCards]);

  const blogPosts = [
    {
      slug: "prestige-is-a-strong-drug",
      title: "Prestige Is a Strong Drug",
      summary: "What dropping out of one of Canada's best programs taught me about borrowed momentum and real growth.",
      tags: ["Personal", "Career", "Psychology"],
      readingTime: 5,
      publishedAt: "2026-02-20"
    },
    {
      slug: "trading-rabbit-hole",
      title: "What Going Down the Trading Rabbit Hole Taught Me About Finance",
      summary: "Anyone who gets interested in markets eventually falls into the same rabbit hole. Here is what I found at the bottom.",
      tags: ["Finance", "Markets", "Learning"],
      readingTime: 6,
      publishedAt: "2026-01-28"
    },
    {
      slug: "vc-investing-in-myself",
      title: "Roleplaying as a VC Investing in Myself",
      summary: "What happens when you evaluate your own life using the logic of venture capital.",
      tags: ["Productivity", "Psychology", "Personal"],
      readingTime: 5,
      publishedAt: "2026-01-15"
    },
    {
      slug: "most-ai-startups-api-calls",
      title: "Most AI Startups Are Just Fancy API Calls",
      summary: "And why that is actually working for now. The wrapper critique misses something important.",
      tags: ["AI", "Startups", "Systems"],
      readingTime: 5,
      publishedAt: "2025-12-10"
    },
    {
      slug: "explaining-ai-agents",
      title: "Explaining AI Agents With One Simple Analogy",
      summary: "Every time I try explaining AI agents to someone who is not technical, the conversation usually starts the same way.",
      tags: ["AI", "Agents", "Learning"],
      readingTime: 5,
      publishedAt: "2025-11-22"
    }
  ];

  const handleCardClick = (slug: string) => {
    const data = contentMap[slug];
    if (data && onContentClick) {
      onContentClick(data);
    }
  };

  return (
    <div
      ref={sectionRef}
      id="blog"
      className="blog-container"
      style={{
        position: 'relative',
        marginTop: '80px',
        marginLeft: 'auto',
        marginRight: 'auto',
        zIndex: 10,
        width: '90%',
        maxWidth: '1200px',
        minWidth: '320px',
        overflow: 'hidden',
        paddingBottom: '80px'
      }}
    >
      <h2
        className="blog-title"
        style={{
          fontSize: '1.5rem',
          color: 'rgba(255, 255, 255, 0.75)',
          fontFamily: 'NeueMontreal-MediumItalic, sans-serif',
          fontStyle: 'italic',
          margin: '0 0 1rem 0',
          fontWeight: '500',
          opacity: titleAnimated ? 1 : 0,
          transform: titleAnimated ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.8s ease-out, transform 0.8s ease-out'
        }}
      >
        My Thoughts
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        width: '100%'
      }}>
        {blogPosts.map((post) => {
          const isAnimated = animatedCards.has(post.slug);
          return (
            <div
              key={post.slug}
              data-blog-id={post.slug}
              className={`blog-card glass-blog-card ${isAnimated ? 'animated' : ''}`}
              onClick={() => handleCardClick(post.slug)}
              onMouseEnter={() => setHoveredSlug(post.slug)}
              onMouseLeave={() => setHoveredSlug(null)}
              style={{ cursor: 'pointer' }}
            >
              <h3 style={{
                fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
                color: 'rgba(255, 255, 255, 0.8)',
                fontFamily: 'NeueMontreal-Medium, sans-serif',
                margin: '0 0 0.75rem',
                fontWeight: '500',
                lineHeight: '1.4'
              }}>
                {post.title}
              </h3>

              <p style={{
                color: 'rgba(255, 255, 255, 0.55)',
                fontSize: '0.9rem',
                fontFamily: 'NeueMontreal-Light, sans-serif',
                lineHeight: '1.5',
                margin: '0 0 1rem',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {post.summary}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
                {post.tags.map((tag, i) => {
                  const tc = getTagColor(tag);
                  const isHovered = hoveredSlug === post.slug;
                  return (
                    <span key={i} className="blog-tag-pill" style={{
                      fontSize: '0.7rem',
                      fontFamily: 'NeueMontreal-Light, sans-serif',
                      color: tc.text,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '12px',
                      background: tc.bg,
                      border: `0.5px solid ${tc.border}`
                    }}>
                      {tag}
                    </span>
                  );
                })}
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center'
              }}>
                <span style={{
                  fontSize: '0.85rem',
                  fontFamily: 'NeueMontreal-Medium, sans-serif',
                  color: 'rgba(255, 255, 255, 0.5)'
                }}>
                  Read →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .glass-blog-card {
          position: relative;
          background: rgba(128, 128, 128, 0.12);
          border-radius: 20px;
          border: 0.5px solid rgba(255, 255, 255, 0.2);
          padding: 1.5rem;
          overflow: hidden;
          box-sizing: border-box;
          transition: all 0.3s ease;
          opacity: 0;
          transform: translateY(20px);
        }
        .glass-blog-card.animated {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }
        .glass-blog-card h3,
        .glass-blog-card p,
        .glass-blog-card span {
          transition: color 0.3s ease !important;
        }
        .glass-blog-card:hover {
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.4);
          transform: translateZ(10px) scale(1.02);
          transition: all 0.3s ease;
        }
        .glass-blog-card:hover h3,
        .glass-blog-card:hover p,
        .glass-blog-card:hover span:not(.blog-tag-pill) {
          color: rgb(255, 255, 255) !important;
        }
        .blog-tag-pill {
          transition: all 0.3s ease !important;
        }
        .glass-blog-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
        }
        @media (max-width: 768px) {
          .blog-container { width: calc(95% - 40px) !important; min-width: 300px !important; padding: 0 20px 80px 20px !important; }
        }
        @media (max-width: 480px) {
          .blog-container { width: calc(98% - 40px) !important; min-width: 280px !important; padding: 0 20px 80px 20px !important; }
        }
      `}</style>
    </div>
  );
};

export default Blog;
