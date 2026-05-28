import { useEffect, useMemo, useRef } from 'react';

interface PokemonDef {
  name: string;
  /** Path slug used in the sprite URL (usually the dex id, sometimes a
   *  form-suffixed value like "423-east"). */
  slug: string;
  /** Per-pokemon size multiplier applied on top of the base height.
   *  1.0 = normal. Used to balance visual mass differences in showdown
   *  sprites (e.g. togekiss is drawn huge; eelektross is drawn tall). */
  scale?: number;
}

const GARCHOMP: PokemonDef = { name: 'garchomp', slug: '445' };

/** Candidate pool — Garchomp is always included separately. */
const CANDIDATES: PokemonDef[] = [
  { name: 'kyogre',         slug: '382',      scale: 0.88 },
  { name: 'rayquaza',       slug: '384' },
  { name: 'zekrom',         slug: '644' },
  { name: 'ursaluna',       slug: '901' },
  { name: 'archaludon',     slug: '1018' },
  { name: 'incineroar',     slug: '727' },
  { name: 'crobat',         slug: '169',      scale: 1.18 },
  { name: 'gengar',         slug: '94' },
  { name: 'kingdra',        slug: '230' },
  { name: 'dragonite',      slug: '149' },
  { name: 'flygon',         slug: '330',      scale: 1.08 },
  { name: 'walrein',        slug: '365',      scale: 0.88 },
  { name: 'relicanth',      slug: '369' },
  { name: 'metagross',      slug: '376' },
  { name: 'regirock',       slug: '377' },
  { name: 'gastrodon-east', slug: '423-east' },
  { name: 'togekiss',       slug: '468',      scale: 0.82 },
  { name: 'regigigas',      slug: '486' },
  { name: 'zebstrika',      slug: '523' },
  { name: 'scolipede',      slug: '545' },
  // Basculegion: default sprite (902) is the male form
  { name: 'basculegion',    slug: '902' },
  { name: 'cofagrigus',     slug: '563' },
  { name: 'eelektross',     slug: '604',      scale: 0.94 },
  { name: 'talonflame',     slug: '663',      scale: 1.2 },
  { name: 'dragalge',       slug: '691' },
  { name: 'trevenant',      slug: '709' },
  { name: 'noivern',        slug: '715',      scale: 1.18 },
  { name: 'golisopod',      slug: '768' },
  { name: 'corviknight',    slug: '823',      scale: 1.15 },
  { name: 'grapploct',      slug: '853' },
  // Urshifu: default sprite (892) is the single-strike form
  { name: 'urshifu',        slug: '892' },
  { name: 'cetitan',        slug: '975' },
  { name: 'baxcalibur',     slug: '998' },
];

/** Garchomp + this many random picks. Mobile gets fewer. */
const DESKTOP_RANDOM_COUNT = 9;
const MOBILE_RANDOM_COUNT = 4;

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
  zIndex?: number;
}

export default function PokemonWalkers({ zIndex = 9999 }: Props) {
  // Pick a fresh roster on every mount. Mobile gets a smaller roster.
  const roster = useMemo<PokemonDef[]>(() => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const count = vw <= 768 ? MOBILE_RANDOM_COUNT : DESKTOP_RANDOM_COUNT;
    return [GARCHOMP, ...shuffle(CANDIDATES).slice(0, count)];
  }, []);

  const itemRefs = useRef<(HTMLImageElement | null)[]>([]);
  const stateRef = useRef<WalkerState[]>([]);
  const animRef = useRef<number>(0);
  const initRef = useRef<boolean>(false);

  // Equal *base* height across all pokemon, modulated by per-pokemon scale.
  const baseHeight = useMemo(() => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const isMobile = vw <= 768;
    return isMobile ? 60 : 100;
  }, []);

  const heights = useMemo(() => {
    return roster.map(p => Math.round(baseHeight * (p.scale ?? 1)));
  }, [roster, baseHeight]);

  const containerHeight = Math.max(...heights) + 14;

  // Initialize positions once after mount. We don't know the per-sprite
  // width until each image loads, so start with a placeholder equal to the
  // height; onLoad refines it to the rendered width for accurate bounces.
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const vw = window.innerWidth;

    stateRef.current = roster.map((_, i) => {
      const size = heights[i];
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
  }, [roster, heights]);

  // Animation loop — write directly to DOM to avoid React re-renders.
  // No dock avoidance: pokemon walk freely across the entire bottom edge.
  useEffect(() => {
    let last = performance.now();
    let mounted = true;

    const step = (t: number) => {
      if (!mounted) return;
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;

      const vw = window.innerWidth;
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
          onLoad={e => {
            const img = e.currentTarget;
            if (!img.naturalWidth || !img.naturalHeight) return;
            const renderedW = (img.naturalWidth / img.naturalHeight) * heights[i];
            const s = stateRef.current[i];
            if (s) s.size = renderedW;
          }}
          style={{
            position: 'absolute',
            bottom: 4,
            left: 0,
            height: heights[i],
            width: 'auto',
            willChange: 'transform',
            filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.4))',
            userSelect: 'none',
          }}
        />
      ))}
    </div>
  );
}
