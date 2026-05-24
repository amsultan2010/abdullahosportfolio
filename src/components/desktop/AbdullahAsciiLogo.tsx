import { useEffect, useMemo, useState } from 'react';

interface AbdullahAsciiLogoProps {
  width: number;
  height: number;
  color?: string;
  opacity?: number;
  fontWeight?: number;
  scale?: number;
  lineHeight?: number;
  align?: 'left' | 'center' | 'right';
}

export default function AbdullahAsciiLogo({
  width,
  height,
  color = '#fff',
  opacity = 1,
  fontWeight = 400,
  scale = 1,
  lineHeight = 1.08,
  align = 'center',
}: AbdullahAsciiLogoProps) {
  const [ascii, setAscii] = useState('');

  useEffect(() => {
    let cancelled = false;

    fetch('/images/logosicons/abdullalogo.txt')
      .then((response) => response.text())
      .then((text) => {
        if (!cancelled) setAscii(text.trimEnd());
      })
      .catch(() => {
        if (!cancelled) setAscii('abdullah');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const metrics = useMemo(() => {
    const lines = ascii.split('\n');
    const maxLine = Math.max(1, ...lines.map((line) => line.length));
    const lineCount = Math.max(1, lines.length);
    const baseFontSize = Math.min(width / (maxLine * 0.58), height / (lineCount * lineHeight));
    const maxWidthFit = width / (maxLine * 0.58);
    const fontSize = Math.min(baseFontSize * scale, maxWidthFit);

    return { fontSize: Math.max(fontSize, 0.45) };
  }, [ascii, height, width, scale, lineHeight]);

  return (
    <div
      aria-label="abdullah"
      style={{
        width,
        height,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: align === 'right' ? 'flex-end' : align === 'left' ? 'flex-start' : 'center',
        pointerEvents: 'none',
      }}
    >
      <pre
        style={{
          margin: 0,
          color,
          opacity,
          fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', monospace",
          fontWeight,
          fontSize: `${metrics.fontSize}px`,
          lineHeight,
          letterSpacing: 0,
          whiteSpace: 'pre',
          textAlign: 'left',
          transform: 'translateZ(0)',
          WebkitFontSmoothing: 'antialiased',
        }}
      >
        {ascii}
      </pre>
    </div>
  );
}
