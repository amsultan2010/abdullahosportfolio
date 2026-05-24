import { useRef, useState } from 'react';

interface WatchlistProps {
  windowMode?: boolean;
}

type Kind = 'book' | 'movie' | 'show';

interface Media {
  kind: Kind;
  title: string;
  meta: string;
  cover: string;
}

const WATCHLIST: Media[] = [
  { kind: 'book',  title: 'Never Eat Alone',                    meta: 'Keith Ferrazzi',   cover: '/images/watchlist/books/never-eat-alone.jpg' },
  { kind: 'book',  title: "The Qur'an",                         meta: 'Holy Scripture',   cover: '/images/watchlist/books/quran.jpg' },
  { kind: 'book',  title: 'How to Become a Straight-A Student', meta: 'Cal Newport',      cover: '/images/watchlist/books/straight-a-student.jpg' },
  { kind: 'movie', title: 'Interstellar',                       meta: '2014 · Sci-Fi',    cover: '/images/watchlist/movies/interstellar.jpg' },
  { kind: 'movie', title: 'F1',                                 meta: '2025 · Drama',     cover: '/images/watchlist/movies/f1.jpg' },
  { kind: 'movie', title: 'The Message',                        meta: '1976 · Epic',      cover: '/images/watchlist/movies/the-message.jpg' },
  { kind: 'movie', title: 'Whiplash',                           meta: '2014 · Drama',     cover: '/images/watchlist/movies/whiplash.jpg' },
  { kind: 'show',  title: 'Invincible',                         meta: '2021– · Animated', cover: '/images/watchlist/shows/invincible.jpg' },
  { kind: 'show',  title: 'Suits',                              meta: '2011–2019 · Legal',cover: '/images/watchlist/shows/suits.jpg' },
  { kind: 'show',  title: 'The Pitt',                           meta: '2025– · Medical',  cover: '/images/watchlist/shows/the-pitt.jpg' },
  { kind: 'show',  title: 'The Fresh Prince of Bel-Air',        meta: '1990–1996 · Sitcom', cover: '/images/watchlist/shows/fresh-prince.jpg' },
];

const HERO = WATCHLIST.find(m => m.title === 'Interstellar')!;

export default function Watchlist({ windowMode = false }: WatchlistProps) {
  const books = WATCHLIST.filter(m => m.kind === 'book');
  const movies = WATCHLIST.filter(m => m.kind === 'movie');
  const shows = WATCHLIST.filter(m => m.kind === 'show');

  return (
    <div style={{
      width: '100%',
      height: '100%',
      overflowY: 'auto',
      overflowX: 'hidden',
      background: '#141414',
      color: '#fff',
      fontFamily: "'Netflix Sans', 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
      WebkitFontSmoothing: 'antialiased',
    }}>
      <Hero media={HERO} />

      <div style={{ padding: windowMode ? '0 0 56px' : '0 0 80px' }}>
        <Row title="My Books" items={books} />
        <Row title="My Movies" items={movies} />
        <Row title="My Shows" items={shows} />
      </div>

      <style>{`
        .nflx-row-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        .nflx-row-scroll::-webkit-scrollbar { display: none; }
        .nflx-card {
          transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.32s ease, z-index 0s linear 0.32s;
          will-change: transform;
        }
        .nflx-card:hover {
          transform: scale(1.08);
          box-shadow: 0 12px 32px rgba(0,0,0,0.65), 0 0 0 2px rgba(255,255,255,0.06);
          z-index: 5;
          transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.32s ease, z-index 0s linear 0s;
        }
        .nflx-card-overlay {
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.25s ease 0.05s, transform 0.25s ease 0.05s;
        }
        .nflx-card:hover .nflx-card-overlay {
          opacity: 1;
          transform: translateY(0);
        }
        .nflx-arrow {
          opacity: 0;
          transition: opacity 0.2s ease, background 0.2s ease;
        }
        .nflx-row:hover .nflx-arrow {
          opacity: 1;
        }
        .nflx-arrow:hover { background: rgba(0,0,0,0.85) !important; }
        @media (hover: none) {
          .nflx-card-overlay { opacity: 1 !important; transform: none !important; }
          .nflx-arrow { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function Hero({ media }: { media: Media }) {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      aspectRatio: '16 / 7',
      minHeight: 220,
      maxHeight: 420,
      overflow: 'hidden',
      background: '#000',
    }}>
      <img
        src={media.cover}
        alt={media.title}
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center 18%',
          filter: 'saturate(1.05)',
        }}
        draggable={false}
      />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, rgba(20,20,20,0.92) 0%, rgba(20,20,20,0.55) 38%, rgba(20,20,20,0.05) 68%, rgba(20,20,20,0) 100%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(20,20,20,0) 55%, rgba(20,20,20,0.92) 100%)',
      }} />
      <div style={{
        position: 'absolute', left: 'clamp(20px, 4vw, 56px)', bottom: 'clamp(28px, 5vw, 56px)',
        maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        <div style={{
          fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
          color: '#e50914', fontWeight: 700,
        }}>
          Abdullah's Watchlist
        </div>
        <div style={{
          fontFamily: "'Bebas Neue', 'SF Pro Display', sans-serif",
          fontSize: 'clamp(32px, 5vw, 56px)',
          fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1,
          textShadow: '0 4px 24px rgba(0,0,0,0.6)',
        }}>
          {media.title}
        </div>
        <div style={{
          color: 'rgba(255,255,255,0.82)', fontSize: 14, lineHeight: 1.5, maxWidth: 460,
          textShadow: '0 1px 8px rgba(0,0,0,0.6)',
        }}>
          The books, films, and shows I keep coming back to — equal parts inspiration, comfort, and obsession.
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <HeroBtn primary>▶ Featured: {media.meta}</HeroBtn>
          <HeroBtn>Scroll for more</HeroBtn>
        </div>
      </div>
    </div>
  );
}

function HeroBtn({ children, primary }: { children: React.ReactNode; primary?: boolean }) {
  return (
    <div style={{
      padding: '8px 18px', borderRadius: 4,
      background: primary ? '#fff' : 'rgba(109,109,110,0.7)',
      color: primary ? '#000' : '#fff',
      fontWeight: 600, fontSize: 13, letterSpacing: '0.01em',
      backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
      whiteSpace: 'nowrap',
      cursor: 'default',
    }}>
      {children}
    </div>
  );
}

function Row({ title, items }: { title: string; items: Media[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const updateArrows = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <div className="nflx-row" style={{ position: 'relative', padding: '28px 0 6px' }}>
      <h2 style={{
        margin: '0 0 14px',
        padding: '0 clamp(20px, 4vw, 56px)',
        fontSize: 'clamp(15px, 1.4vw, 19px)',
        fontWeight: 700,
        color: '#e5e5e5',
        letterSpacing: '-0.01em',
      }}>
        {title}
      </h2>

      {canLeft && (
        <button
          className="nflx-arrow"
          onClick={() => scrollBy(-1)}
          aria-label="Scroll left"
          style={{
            position: 'absolute', left: 0, top: '50%', transform: 'translateY(-25%)',
            zIndex: 6, width: 'clamp(36px, 4vw, 56px)', height: 'clamp(90px, 12vw, 150px)',
            background: 'rgba(0,0,0,0.55)', border: 'none', color: '#fff', cursor: 'pointer',
            fontSize: 26, fontWeight: 700, borderTopRightRadius: 4, borderBottomRightRadius: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >‹</button>
      )}
      {canRight && (
        <button
          className="nflx-arrow"
          onClick={() => scrollBy(1)}
          aria-label="Scroll right"
          style={{
            position: 'absolute', right: 0, top: '50%', transform: 'translateY(-25%)',
            zIndex: 6, width: 'clamp(36px, 4vw, 56px)', height: 'clamp(90px, 12vw, 150px)',
            background: 'rgba(0,0,0,0.55)', border: 'none', color: '#fff', cursor: 'pointer',
            fontSize: 26, fontWeight: 700, borderTopLeftRadius: 4, borderBottomLeftRadius: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >›</button>
      )}

      <div
        ref={scrollerRef}
        onScroll={updateArrows}
        className="nflx-row-scroll"
        style={{
          display: 'flex', gap: 8,
          padding: '20px clamp(20px, 4vw, 56px)',
          overflowX: 'auto', overflowY: 'hidden',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {items.map(item => (
          <Card key={item.title} item={item} />
        ))}
      </div>
    </div>
  );
}

function Card({ item }: { item: Media }) {
  return (
    <div
      className="nflx-card"
      style={{
        flex: '0 0 auto',
        width: 'clamp(140px, 16vw, 200px)',
        aspectRatio: '2 / 3',
        borderRadius: 4,
        overflow: 'hidden',
        background: '#222',
        position: 'relative',
        scrollSnapAlign: 'start',
        cursor: 'pointer',
      }}
    >
      <img
        src={item.cover}
        alt={item.title}
        loading="lazy"
        draggable={false}
        style={{
          width: '100%', height: '100%', objectFit: 'cover', display: 'block',
        }}
      />
      <div
        className="nflx-card-overlay"
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          padding: '28px 12px 10px',
          background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.82) 60%, rgba(0,0,0,0.92) 100%)',
          pointerEvents: 'none',
        }}
      >
        <div style={{
          fontSize: 13, fontWeight: 700, lineHeight: 1.2, marginBottom: 3,
          overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {item.title}
        </div>
        <div style={{
          fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 500,
        }}>
          {item.meta}
        </div>
      </div>
    </div>
  );
}
