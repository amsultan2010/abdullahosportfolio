import { useEffect, useMemo, useRef } from 'react';

interface PokemonDef {
  id: number;
  name: string;
}

const POKEMON: PokemonDef[] = [
  { id: 445, name: 'garchomp' },
  { id: 382, name: 'kyogre' },
  { id: 384, name: 'rayquaza' },
  { id: 483, name: 'dialga' },
  { id: 644, name: 'zekrom' },
];

const SPRITE_URL = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;

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
  const itemRefs = useRef<(HTMLImageElement | null)[]>([]);
  const stateRef = useRef<WalkerState[]>([]);
  const dockBoundsRef = useRef<{ left: number; right: number } | null>(null);
  const animRef = useRef<number>(0);
  const initRef = useRef<boolean>(false);

  // Pick per-pokemon sizes synchronously so the <img> tags can match
  const sizes = useMemo(() => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const isMobile = vw <= 768;
    const baseSize = isMobile ? 78 : 104;
    return POKEMON.map((_, i) => baseSize + (i % 2 === 0 ? 0 : 12));
  }, []);

  const containerHeight = useMemo(() => {
    return Math.max(...sizes) + 12;
  }, [sizes]);

  // Initialize positions once after mount
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const vw = window.innerWidth;

    stateRef.current = POKEMON.map((_, i) => {
      const size = sizes[i];
      const slotW = vw / POKEMON.length;
      // Distribute pokemon across screen, with a little jitter
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
  }, [sizes]);

  // Track dock bounds (re-measure on resize + interval to handle dynamic mounts)
  useEffect(() => {
    if (!avoidDock) return;
    const update = () => {
      const el = document.querySelector('[data-pokemon-dock="true"]') as HTMLElement | null;
      if (el) {
        const r = el.getBoundingClientRect();
        // Add a small buffer so pokemon clearly steer around the dock
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

        // Bounce off viewport edges
        if (s.x < 0) {
          s.x = 0;
          s.vx = Math.abs(s.vx);
        } else if (s.x + s.size > vw) {
          s.x = vw - s.size;
          s.vx = -Math.abs(s.vx);
        }

        // Teleport around dock so we never cover it
        if (dock) {
          const right = s.x + s.size;
          const overlapping = right > dock.left && s.x < dock.right;
          if (overlapping) {
            if (s.vx > 0) {
              // Moving right → exit to the right side of dock
              s.x = dock.right;
            } else {
              // Moving left → exit to the left side of dock
              s.x = dock.left - s.size;
            }
            // If teleport pushed us off-screen, wrap to the opposite edge
            if (s.x + s.size > vw) s.x = 0;
            if (s.x < 0) s.x = vw - s.size;
          }
        }

        const el = itemRefs.current[i];
        if (el) {
          const bob = Math.sin(s.bobPhase) * 2; // gentle 2px walk bob
          const flip = s.vx >= 0 ? -1 : 1; // face direction of travel
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
      {POKEMON.map((p, i) => (
        <img
          key={p.id}
          ref={el => {
            itemRefs.current[i] = el;
          }}
          src={SPRITE_URL(p.id)}
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
            imageRendering: 'pixelated',
            willChange: 'transform',
            filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.4))',
            userSelect: 'none',
          }}
        />
      ))}
    </div>
  );
}
