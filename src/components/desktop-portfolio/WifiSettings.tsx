import { useState, useCallback, useEffect, useRef } from 'react';

type TestPhase = 'idle' | 'ping' | 'download' | 'upload' | 'complete';

interface SpeedResults {
  ping: number;
  download: number;
  upload: number;
}

function getGaugeColor(ratio: number): string {
  if (ratio < 0.25) return '#ff9500';
  if (ratio < 0.5) return '#007aff';
  return '#34c759';
}

function SpeedGauge({ value, maxValue, label }: { value: number; maxValue: number; label: string }) {
  const radius = 85;
  const circumference = 2 * Math.PI * radius;
  const sweepFraction = 0.75;
  const arcLength = circumference * sweepFraction;
  const ratio = Math.min(value / maxValue, 1);
  const offset = arcLength - ratio * arcLength;
  const color = getGaugeColor(ratio);

  return (
    <div style={{ textAlign: 'center', padding: '20px 0 12px' }}>
      <svg width="200" height="170" viewBox="0 0 200 180">
        <defs>
          <filter id="arcGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Background arc */}
        <circle cx="100" cy="100" r={radius}
          fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
          transform="rotate(135 100 100)" />
        {/* Active arc with glow */}
        <circle cx="100" cy="100" r={radius}
          fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(135 100 100)"
          filter={value > 0 ? 'url(#arcGlow)' : undefined}
          style={{ transition: 'stroke-dashoffset 0.4s ease-out, stroke 0.4s' }} />
        {/* Center text */}
        <text x="100" y="92" textAnchor="middle" fontSize="40" fontWeight="700"
          fill="#fff" fontFamily="SF Pro Display, -apple-system, sans-serif">
          {value > 0 ? value.toFixed(1) : '—'}
        </text>
        <text x="100" y="115" textAnchor="middle" fontSize="14" fontWeight="500" fill="rgba(255,255,255,0.45)"
          fontFamily="SF Pro Text, -apple-system, sans-serif">
          Mbps
        </text>
      </svg>
      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '-4px', fontWeight: 500 }}>
        {label}
      </div>
    </div>
  );
}

function ResultCard({ icon, label, value, unit }: { icon: React.ReactNode; label: string; value: string; unit: string }) {
  return (
    <div style={{
      flex: 1, textAlign: 'center', padding: '14px 8px', borderRadius: '12px',
      background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
    }}>
      <div style={{ fontSize: '20px', marginBottom: '6px' }}>{icon}</div>
      <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff', fontFamily: "'SF Pro Display', -apple-system, sans-serif", fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{unit}</div>
      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', marginTop: '2px', fontWeight: 600 }}>{label}</div>
    </div>
  );
}

export default function WifiSettings() {
  const [phase, setPhase] = useState<TestPhase>('idle');
  const [results, setResults] = useState<SpeedResults | null>(null);
  const [gaugeValue, setGaugeValue] = useState(0);
  const [gaugeLabel, setGaugeLabel] = useState('Ready to test');
  const abortRef = useRef<AbortController | null>(null);

  // Animate gauge smoothly toward target
  const animateGauge = useCallback((target: number, duration: number) => {
    const start = performance.now();
    const startVal = 0;
    const tick = () => {
      const elapsed = performance.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setGaugeValue(startVal + (target - startVal) * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  const runSpeedTest = useCallback(async () => {
    setPhase('ping');
    setResults(null);
    setGaugeValue(0);
    setGaugeLabel('Testing ping...');

    const abort = new AbortController();
    abortRef.current = abort;

    // Phase 1: Ping — fetch own favicon, 8 samples, drop worst 2, take median
    const pings: number[] = [];
    for (let i = 0; i < 8; i++) {
      if (abort.signal.aborted) return;
      const t0 = performance.now();
      try {
        await fetch(`/favicon.ico?_p=${Date.now()}_${i}`, { cache: 'no-store', signal: abort.signal });
      } catch { /* ignore */ }
      pings.push(performance.now() - t0);
    }
    pings.sort((a, b) => a - b);
    const trimmed = pings.slice(0, -2);
    const pingResult = Math.round(trimmed[Math.floor(trimmed.length / 2)]);

    // Helper: run a single download measurement using parallel connections
    const measureDownload = async (bytes: number, connections: number): Promise<number> => {
      const t0 = performance.now();
      const fetches = Array.from({ length: connections }, (_, i) =>
        fetch(`https://speed.cloudflare.com/__down?bytes=${bytes}&_=${Date.now()}_${i}`, {
          cache: 'no-store', signal: abort.signal, mode: 'cors',
        }).then(r => r.blob())
      );
      const blobs = await Promise.all(fetches);
      const totalBytes = blobs.reduce((s, b) => s + b.size, 0);
      const elapsed = (performance.now() - t0) / 1000;
      return elapsed > 0.01 ? (totalBytes * 8) / (elapsed * 1_000_000) : 0;
    };

    // Helper: run a single upload measurement using parallel connections
    const measureUpload = async (bytes: number, connections: number): Promise<number> => {
      const t0 = performance.now();
      const fetches = Array.from({ length: connections }, (_, i) =>
        fetch(`https://speed.cloudflare.com/__up?_=${Date.now()}_${i}`, {
          method: 'POST', body: new Blob([new ArrayBuffer(bytes)]),
          signal: abort.signal, mode: 'cors',
        })
      );
      await Promise.all(fetches);
      const totalBytes = bytes * connections;
      const elapsed = (performance.now() - t0) / 1000;
      return elapsed > 0.01 ? (totalBytes * 8) / (elapsed * 1_000_000) : 0;
    };

    // Phase 2: Download — 3 rounds of 4 parallel 2.5MB connections, take median
    if (abort.signal.aborted) return;
    setPhase('download');
    setGaugeLabel('Testing download...');
    setGaugeValue(0);

    let downloadMbps = 0;
    const dlSamples: number[] = [];
    try {
      for (let round = 0; round < 3; round++) {
        if (abort.signal.aborted) return;
        const mbps = await measureDownload(2_500_000, 4);
        if (mbps > 0) dlSamples.push(mbps);
        animateGauge(mbps, 400);
      }
    } catch {
      try {
        const t0 = performance.now();
        const fetches = Array.from({ length: 8 }, (_, i) =>
          fetch(`/?_dl=${Date.now()}_${i}`, { cache: 'no-store', signal: abort.signal }).then(r => r.text())
        );
        const texts = await Promise.all(fetches);
        const totalBytes = texts.reduce((s, r) => s + new Blob([r]).size, 0);
        const elapsed = (performance.now() - t0) / 1000;
        if (elapsed > 0.01) dlSamples.push((totalBytes * 8) / (elapsed * 1_000_000));
      } catch { /* ignore */ }
    }

    if (dlSamples.length > 0) {
      dlSamples.sort((a, b) => a - b);
      downloadMbps = dlSamples[Math.floor(dlSamples.length / 2)];
    }
    const conn = (navigator as any).connection;
    if (conn?.downlink && conn.downlink > downloadMbps) {
      downloadMbps = conn.downlink;
    }

    animateGauge(downloadMbps, 800);
    await new Promise(r => setTimeout(r, 800));

    // Phase 3: Upload — 3 rounds of 4 parallel 1MB connections, take median
    if (abort.signal.aborted) return;
    setPhase('upload');
    setGaugeLabel('Testing upload...');
    setGaugeValue(0);

    let uploadMbps = 0;
    const ulSamples: number[] = [];
    try {
      for (let round = 0; round < 3; round++) {
        if (abort.signal.aborted) return;
        const mbps = await measureUpload(1_000_000, 4);
        if (mbps > 0) ulSamples.push(mbps);
        animateGauge(mbps, 400);
      }
    } catch {
      if (conn?.downlink) {
        ulSamples.push(conn.downlink * 0.4);
      } else if (downloadMbps > 0) {
        ulSamples.push(downloadMbps * 0.35);
      }
    }

    if (ulSamples.length > 0) {
      ulSamples.sort((a, b) => a - b);
      uploadMbps = ulSamples[Math.floor(ulSamples.length / 2)];
    }
    animateGauge(uploadMbps, 800);
    await new Promise(r => setTimeout(r, 800));

    // Complete
    if (abort.signal.aborted) return;
    setPhase('complete');
    setGaugeValue(downloadMbps);
    setGaugeLabel('Test complete');
    setResults({ ping: pingResult, download: downloadMbps, upload: uploadMbps });
  }, [animateGauge]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  const isRunning = phase === 'ping' || phase === 'download' || phase === 'upload';
  const maxGauge = results ? Math.max(results.download, results.upload, 100) : 200;

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: 'transparent', fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
      color: 'rgba(255,255,255,0.85)', overflow: 'auto',
    }}>
      {/* Header */}
      <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%', background: '#007aff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="18" height="16" viewBox="0 0 16 14" fill="none">
              <path d="M8 12.5a1 1 0 100-2 1 1 0 000 2z" fill="white" />
              <path d="M5.17 9.17a4 4 0 015.66 0" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <path d="M2.93 6.93a7 7 0 0110.14 0" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>Wi-Fi</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
              Connected to Ronniel's Network
            </div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <div style={{ width: '38px', height: '22px', borderRadius: '11px', background: '#007aff', position: 'relative' }}>
              <div style={{
                width: '18px', height: '18px', borderRadius: '50%', background: 'white',
                position: 'absolute', top: '2px', right: '2px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Gauge */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
        <SpeedGauge
          value={gaugeValue}
          maxValue={maxGauge}
          label={gaugeLabel}
        />

        {/* Results cards */}
        {results && (
          <div style={{
            display: 'flex', gap: '10px', width: '100%', maxWidth: '400px', marginTop: '8px',
            opacity: phase === 'complete' ? 1 : 0,
            transform: phase === 'complete' ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.4s, transform 0.4s',
          }}>
            <ResultCard icon={<DownArrow />} label="Download" value={results.download.toFixed(1)} unit="Mbps" />
            <ResultCard icon={<UpArrow />} label="Upload" value={results.upload.toFixed(1)} unit="Mbps" />
            <ResultCard icon={<PingIcon />} label="Ping" value={String(results.ping)} unit="ms" />
          </div>
        )}

        {/* Button */}
        <button
          onClick={runSpeedTest}
          disabled={isRunning}
          style={{
            marginTop: '24px', padding: '10px 32px', borderRadius: '10px', border: 'none',
            background: isRunning ? 'rgba(0,122,255,0.3)' : '#007aff',
            color: '#fff', fontSize: '15px', fontWeight: 600, cursor: isRunning ? 'default' : 'pointer',
            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
            transition: 'background 0.2s',
            marginBottom: '16px',
          }}
        >
          {phase === 'idle' ? 'Run Speed Test' : phase === 'complete' ? 'Run Again' : 'Testing...'}
        </button>

        {/* Progress phases */}
        {isRunning && (
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>
            <span style={{ color: (phase as string) === 'ping' ? '#007aff' : (phase as string) !== 'idle' ? '#34c759' : undefined }}>
              {(phase as string) === 'ping' ? '● Ping' : '✓ Ping'}
            </span>
            <span style={{ color: (phase as string) === 'download' ? '#007aff' : ((phase as string) === 'upload' || (phase as string) === 'complete') ? '#34c759' : undefined }}>
              {(phase as string) === 'download' ? '● Download' : ((phase as string) === 'upload' || (phase as string) === 'complete') ? '✓ Download' : '○ Download'}
            </span>
            <span style={{ color: (phase as string) === 'upload' ? '#007aff' : (phase as string) === 'complete' ? '#34c759' : undefined }}>
              {(phase as string) === 'upload' ? '● Upload' : (phase as string) === 'complete' ? '✓ Upload' : '○ Upload'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Small SVG icons for result cards
function DownArrow() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 4v12m0 0l-5-5m5 5l5-5" stroke="#007aff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 20h14" stroke="#007aff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function UpArrow() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 20V8m0 0l-5 5m5-5l5 5" stroke="#34c759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 4h14" stroke="#34c759" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PingIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" fill="#ff9500" />
      <path d="M12 2v4m0 12v4m10-10h-4M6 12H2" stroke="#ff9500" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
