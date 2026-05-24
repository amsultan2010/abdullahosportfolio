import { useEffect, useMemo, useState } from 'react';

interface AbdullahAsciiLogoProps {
  width: number;
  height: number;
  color?: string;
  opacity?: number;
}

export default function AbdullahAsciiLogo({
  width,
  height,
  color = '#fff',
  opacity = 1,
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
    const fontSize = Math.min(width / (maxLine * 0.58), height / (lineCount * 1.08));

    return { fontSize: Math.max(fontSize, 0.45) };
  }, [ascii, height, width]);

  return (
    <div
      aria-label="abdullah"
      style={{
        width,
        height,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <pre
        style={{
          margin: 0,
          color,
          opacity,
          fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', monospace",
          fontSize: `${metrics.fontSize}px`,
          lineHeight: 1.08,
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
