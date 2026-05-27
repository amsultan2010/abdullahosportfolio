import { useEffect, useMemo, useRef } from 'react';

interface PokemonDef {
  name: string;
  /** Path slug used in the sprite URL. Usually just the dex id, but
   *  some forms have a suffix (e.g. "423-east" for Gastrodon East Sea). */
  slug: string;
}

const GARCHOMP: PokemonDef = { name: 'garchomp', slug: '445' };

/** Candidate pool — Garchomp is always included separately. */
const CANDIDATES: PokemonDef[] = [
  { name: 'kyogre', slug: '382' },
  { name: 'rayquaza', slug: '384' },
  { name: 'zekrom', slug: '644' },
  { name: 'ursaluna', slug: '901' },
  { name: 'archaludon', slug: '1018' },
  { name: 'incineroar', slug: '727' },
  { name: 'crobat', slug: '169' },
  { name: 'gengar', slug: '94' },
  { name: 'kingdra', slug: '230' },
  { name: 'dragonite', slug: '149' },
  { name: 'flygon', slug: '330' },
  { name: 'walrein', slug: '365' },
  { name: 'relicanth', slug: '369' },
  { name: 'metagross', slug: '376' },
  { name: 'regirock', slug: '377' },
  { name: 'gastrodon-east', slug: '423-east' },
  { name: 'togekiss', slug: '468' },
  { name: 'regigigas', slug: '486' },
  { name: 'zebstrika', slug: '523' },
  { name: 'scolipede', slug: '545' },
  // Basculegion: default sprite (902) is the male form
  { name: 'basculegion', slug: '902' },
  { name: 'cofagrigus', slug: '563' },
  { name: 'eelektross', slug: '604' },
  { name: 'talonflame', slug: '663' },
  { name: 'dragalge', slug: '691' },
  { name: 'trevenant', slug: '709' },
  { name: 'noivern', slug: '715' },
  { name: 'golisopod', slug: '768' },
  { name: 'corviknight', slug: '823' },
  { name: 'grapploct', slug: '853' },
  // Urshifu: default sprite (892) is the single-strike form
  { name: 'urshifu', slug: '892' },
  { name: 'cetitan', slug: '975' },
  { name: 'baxcalibur', slug: '998' },
];

const RANDOM_COUNT = 10;

const SPRITE_URL = (slug: string) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${slug}.gif`;

function shuffle<T>(arr: readonly T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

interface WalkerState {
  x: number;
  vx: number;
  size: number;
  bobPhase: number;
}

interface Props {
  avoidDock?: boolean;
  zIndex?: number;
}

export default function PokemonWalkers({ avoidDock = false, zIndex = 9997 }: Props) {
  // Pick a fresh roster on every mount (i.e. every page load / refresh):
  // Garchomp + RANDOM_COUNT randomly-selected candidates.
  const roster = useMemo<PokemonDef[]>(() => {
    return [GARCHOMP, ...shuffle(CANDIDATES).slice(0, RANDOM_COUNT)];
  }, []);

  const itemRefs = useRef<(HTMLImageElement | null)[]>([]);
  const stateRef = useRef<WalkerState[]>([]);
  const dockBoundsRef = useRef<{ left: number; right: number } | null>(null);
  const animRef = useRef<number>(0);
  const initRef = useRef<boolean>(false);

  // Per-pokemon sizes. With 11 sprites we shrink a bit on mobile so they
  // don't overlap heavily at startup; movement spreads them naturally.
  const sizes = useMemo(() => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const isMobile = vw <= 768;
    const baseSize = isMobile ? 64 : 104;
    return roster.map((_, i) => baseSize + (i % 2 === 0 ? 0 : 12));
  }, [roster]);

  const containerHeight = useMemo(() => {
    return Math.max(...sizes) + 12;
  }, [sizes]);

  // Initialize positions once after mount
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const vw = window.innerWidth;

    stateRef.current = roster.map((_, i) => {
      const size = sizes[i];
      const slotW = vw / roster.length;
      const x = slotW * i + slotW * 0.5 - size / 2 + (Math.random() - 0.5) * slotW * 0.4;
      const dir = Math.random() < 0.5 ? -1 : 1;
      const speed = 24 + Math.random() * 22; // px/sec
      return {
        x: Math.max(0, Math.min(vw - size, x)),
        vx: dir * speed,
        size,
        bobPhase: Math.random() * Math.PI * 2,
      };
    });
  }, [roster, sizes]);

  // Track dock bounds (re-measure on resize + interval to handle dynamic mounts)
  useEffect(() => {
    if (!avoidDock) return;
    const update = () => {
      const el = document.querySelector('[data-pokemon-dock="true"]') as HTMLElement | null;
      if (el) {
        const r = el.getBoundingClientRect();
        dockBoundsRef.current = { left: r.left - 12, right: r.right + 12 };
      } else {
        dockBoundsRef.current = null;
      }
    };
    update();
    const interval = window.setInterval(update, 500);
    window.addEventListener('resize', update);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('resize', update);
    };
  }, [avoidDock]);

  // Animation loop — write directly to DOM to avoid React re-renders
  useEffect(() => {
    let last = performance.now();
    let mounted = true;

    const step = (t: number) => {
      if (!mounted) return;
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;

      const vw = window.innerWidth;
      const dock = dockBoundsRef.current;
      const states = stateRef.current;

      for (let i = 0; i < states.length; i++) {
        const s = states[i];
        s.x += s.vx * dt;
        s.bobPhase += dt * 6;

        if (s.x < 0) {
          s.x = 0;
          s.vx = Math.abs(s.vx);
        } else if (s.x + s.size > vw) {
          s.x = vw - s.size;
          s.vx = -Math.abs(s.vx);
        }

        if (dock) {
          const right = s.x + s.size;
          const overlapping = right > dock.left && s.x < dock.right;
          if (overlapping) {
            if (s.vx > 0) {
              s.x = dock.right;
            } else {
              s.x = dock.left - s.size;
            }
            if (s.x + s.size > vw) s.x = 0;
            if (s.x < 0) s.x = vw - s.size;
          }
        }

        const el = itemRefs.current[i];
        if (el) {
          const bob = Math.sin(s.bobPhase) * 2;
          const flip = s.vx >= 0 ? -1 : 1;
          el.style.transform = `translate3d(${s.x}px, ${bob}px, 0) scaleX(${flip})`;
        }
      }

      animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);
    return () => {
      mounted = false;
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100vw',
        height: containerHeight,
        pointerEvents: 'none',
        zIndex,
        overflow: 'hidden',
      }}
    >
      {roster.map((p, i) => (
        <img
          key={`${p.slug}-${i}`}
          ref={el => {
            itemRefs.current[i] = el;
          }}
          src={SPRITE_URL(p.slug)}
          alt=""
          draggable={false}
          style={{
            position: 'absolute',
            bottom: 4,
            left: 0,
            width: sizes[i],
            height: sizes[i],
            objectFit: 'contain',
            objectPosition: 'bottom center',
            // Showdown sprites are smooth/anti-aliased, so leave default rendering
            willChange: 'transform',
            filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.4))',
            userSelect: 'none',
          }}
        />
      ))}
    </div>
  );
}
