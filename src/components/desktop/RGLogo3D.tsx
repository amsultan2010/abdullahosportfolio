import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// ── Create thick volumetric 3D logo from image ──
function useLogoVolume(url: string, layers = 14, perLayer = 700) {
  const [data, setData] = useState<{ targets: Float32Array; count: number } | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const cvs = document.createElement('canvas');
      const sz = 100;
      cvs.width = sz; cvs.height = sz;
      const ctx = cvs.getContext('2d')!;
      ctx.drawImage(img, 0, 0, sz, sz);
      const px = ctx.getImageData(0, 0, sz, sz).data;

      const valid: { x: number; y: number }[] = [];
      for (let y = 0; y < sz; y++) {
        for (let x = 0; x < sz; x++) {
          const i = (y * sz + x) * 4;
          if (px[i + 3] > 50) valid.push({ x, y });
        }
      }

      const pts: number[] = [];
      const depth = 3.0; // thick volume for real 3D

      for (let layer = 0; layer < layers; layer++) {
        const zBase = (layer / (layers - 1)) * depth - depth / 2;
        for (let p = 0; p < perLayer; p++) {
          const pixel = valid[Math.floor(Math.random() * valid.length)];
          const xp = (pixel.x / sz - 0.5) * 5.0 + (Math.random() - 0.5) * 0.06;
          const yp = -(pixel.y / sz - 0.5) * 5.0 + (Math.random() - 0.5) * 0.06;
          const zp = zBase + (Math.random() - 0.5) * (depth / layers);
          pts.push(xp, yp, zp);
        }
      }

      setData({ targets: new Float32Array(pts), count: pts.length / 3 });
    };
    img.src = url;
  }, [url, layers, perLayer]);

  return data;
}

// ── Main particle cloud ──
function ParticleCloud() {
  const ref = useRef<THREE.Points>(null);
  const logo = useLogoVolume('/images/profile/profilepicture.png', 14, 700);

  const drift = useMemo(() => {
    if (!logo) return null;
    return {
      phase: Float32Array.from({ length: logo.count }, () => Math.random() * Math.PI * 2),
      sx: Float32Array.from({ length: logo.count }, () => (Math.random() - 0.5) * 0.2),
      sy: Float32Array.from({ length: logo.count }, () => (Math.random() - 0.5) * 0.2),
      sz: Float32Array.from({ length: logo.count }, () => (Math.random() - 0.5) * 0.12),
    };
  }, [logo]);

  useFrame((state) => {
    if (!ref.current || !logo || !drift) return;
    const t = state.clock.elapsedTime;
    const pos = ref.current.geometry.attributes.position;

    for (let i = 0; i < logo.count; i++) {
      const i3 = i * 3;
      pos.setXYZ(
        i,
        logo.targets[i3] + Math.sin(t * drift.sx[i] + drift.phase[i]) * 0.025,
        logo.targets[i3 + 1] + Math.cos(t * drift.sy[i] + drift.phase[i] * 1.3) * 0.025,
        logo.targets[i3 + 2] + Math.sin(t * drift.sz[i] + drift.phase[i] * 0.7) * 0.035
      );
    }
    pos.needsUpdate = true;
  });

  if (!logo || !drift) return null;

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array(logo.targets), 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#d8e4f0"
        transparent
        opacity={0.65}
        sizeAttenuation
        depthWrite
      />
    </points>
  );
}

// ── Ambient atmosphere particles ──
function Atmosphere() {
  const ref = useRef<THREE.Points>(null);
  const count = 300;

  const positions = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      a[i * 3] = (Math.random() - 0.5) * 12;
      a[i * 3 + 1] = (Math.random() - 0.5) * 10;
      a[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return a;
  }, []);

  const speeds = useMemo(() =>
    Float32Array.from({ length: count }, () => 0.1 + Math.random() * 0.3), []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const pos = ref.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      let y = pos.getY(i) - speeds[i] * 0.003;
      if (y < -5) { y = 5; pos.setX(i, (Math.random() - 0.5) * 12); }
      pos.setY(i, y);
      pos.setX(i, pos.getX(i) + Math.sin(t * 0.2 + i) * 0.0008);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.006}
        color="#ffffff"
        transparent
        opacity={0.15}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Scene() {
  return (
    <>
      <ParticleCloud />
      <Atmosphere />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
        autoRotate
        autoRotateSpeed={0.35}
      />
    </>
  );
}

export default function RGLogo3D() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src="/images/profile/profilepicture.png" alt="abdullah" style={{ width: '80px', height: '80px', opacity: 0.5, filter: 'brightness(0) invert(1)' }} />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [1.5, 0.5, 4.5], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
