import { useState, useEffect, useRef } from 'react';
import { getTagColor } from './tagColors';
import type { ContentViewData } from './ContentViewer';
import { contentMap } from './contentData';

interface BlogProps {
  onContentClick?: (content: ContentViewData) => void;
}

const Blog = ({ onContentClick }: BlogProps) => {
  const [titleAnimated, setTitleAnimated] = useState(false);
  const [animatedCards, setAnimatedCards] = useState(new Set<string>());
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
      slug: "waterloo-notes-coops-ai-wave",
      title: "Notes from Waterloo Country: Co-ops, Campus Energy, and the AI Wrapper Wave",
      summary: "What campus recruiting and the YC accelerator wave look like from inside a co-op program.",
      tags: ["Learning", "Career", "AI"],
      readingTime: 8,
      publishedAt: "2025-10-17"
    },
    {
      slug: "agentification-3-phases",
      title: "Agentification: The 3 Phases and Why Most Demos Are Phase 0.5",
      summary: "Trying to understand what makes an AI system a real 'agent' vs. just a fancy API call.",
      tags: ["AI", "Agents", "Systems"],
      readingTime: 7,
      publishedAt: "2025-10-13"
    },
    {
      slug: "gold-vs-nasdaq",
      title: "What Got Me Curious About Gold vs. the Nasdaq",
      summary: "Why do gold and tech sometimes move opposite directions, and what does it tell us about market mood?",
      tags: ["Finance", "Python", "Markets"],
      readingTime: 7,
      publishedAt: "2025-10-13"
    },
    {
      slug: "risk-on-and-off-together",
      title: "When Risk-On and Risk-Off Rally Together",
      summary: "Some days both stocks and safe assets go up at the same time. What's happening on those days?",
      tags: ["Finance", "Markets", "Python"],
      readingTime: 6,
      publishedAt: "2025-10-13"
    },
    {
      slug: "demystifying-enterprise-saas",
      title: "What Makes Enterprise Software Sticky?",
      summary: "Trying to understand why companies pay millions for software that seems like it could be a spreadsheet.",
      tags: ["Enterprise", "SaaS", "Systems"],
      readingTime: 9,
      publishedAt: "2025-07-15"
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
        Blog
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
                  return (
                    <span key={i} style={{
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
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{
                  fontSize: '0.8rem',
                  fontFamily: 'NeueMontreal-Light, sans-serif',
                  color: 'rgba(255, 255, 255, 0.35)'
                }}>
                  {post.readingTime} min read
                </span>
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
        .glass-blog-card:hover {
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.4);
          transform: translateZ(10px) scale(1.02);
          transition: all 0.3s ease;
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
