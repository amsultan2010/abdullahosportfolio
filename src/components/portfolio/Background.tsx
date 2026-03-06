/* eslint-disable react/no-unknown-property */
import { useRef, useMemo, useLayoutEffect, forwardRef } from 'react';
import { useFrame, Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const hexToNormalizedRGB = (hex: string) => {
  hex = hex.replace("#", "");
  return [
    parseInt(hex.slice(0, 2), 16) / 255,
    parseInt(hex.slice(2, 4), 16) / 255,
    parseInt(hex.slice(4, 6), 16) / 255,
  ];
};

const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vPosition = position;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform vec3  uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2  r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2  rot = mat2(c, -s, s, c);
  return rot * uv;
}

void main() {
  float rnd        = noise(gl_FragCoord.xy);
  vec2  uv         = rotateUvs(vUv * uScale, uRotation);
  vec2  tex        = uv * uScale;
  float tOffset    = uSpeed * uTime;

  tex.x += 0.2 * sin(8.0 * tex.y - tOffset);
  tex.y += 0.06 * sin(8.0 * tex.x - tOffset);

  float pattern = 0.6 +
                  0.4 * sin(5.0 * (tex.x + tex.y +
                                  cos(3.0 * tex.x + 5.0 * tex.y) +
                                  0.02 * tOffset) +
                          sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

  vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;
  col.a = 1.0;
  gl_FragColor = col;
}
`;

interface SilkPlaneProps {
  uniforms: Record<string, { value: unknown }>;
}

const SilkPlane = forwardRef<THREE.Mesh, SilkPlaneProps>(function SilkPlane({ uniforms }, ref) {
  const { viewport } = useThree();
  const meshRef = ref as React.RefObject<THREE.Mesh>;

  useLayoutEffect(() => {
    if (meshRef.current) {
      meshRef.current.scale.set(viewport.width, viewport.height, 1);
    }
  }, [meshRef, viewport]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value += 0.1 * delta;
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
});
SilkPlane.displayName = "SilkPlane";

const Background = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uSpeed: { value: 5 },
      uScale: { value: 0.8 },
      uNoiseIntensity: { value: 50 },
      uColor: { value: new THREE.Color(...hexToNormalizedRGB("#727272")) },
      uRotation: { value: Math.PI / 4 },
      uTime: { value: 0 },
    }),
    []
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: 'calc(100% - 1px)',
      height: '100%',
      zIndex: 0,
      overflow: 'hidden',
      pointerEvents: 'none'
    }}>
      <Canvas
        dpr={[1, 2]}
        frameloop="always"
        style={{
          width: 'calc(100% - 1px)',
          height: '100%',
          display: 'block'
        }}
      >
        <SilkPlane ref={meshRef} uniforms={uniforms} />
      </Canvas>
    </div>
  );
};

export default Background;
