import { useState, useEffect, useRef } from 'react';

// ─── Shared Styles ────────────────────────────────────────────

const chartContainer: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.03)',
  border: '0.5px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  padding: '1.5rem',
  margin: '2rem 0',
  overflow: 'hidden',
};

const chartTitle: React.CSSProperties = {
  fontFamily: '"SF Mono", "JetBrains Mono", monospace',
  fontSize: '0.75rem',
  color: 'rgba(255, 255, 255, 0.4)',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  marginBottom: '1.25rem',
};

const sourceText: React.CSSProperties = {
  fontFamily: 'NeueMontreal-Light, sans-serif',
  fontSize: '0.7rem',
  color: 'rgba(255, 255, 255, 0.3)',
  marginTop: '1rem',
  fontStyle: 'italic',
};

// ─── Chart 1: S&P 500 vs Average Investor Return ──────────────

export const ReturnGapChart = () => {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const data = [
    { label: 'S&P 500 Index', value: 10.15, color: '#4ADE80', endValue: '$174,494' },
    { label: 'Avg. Equity Investor', value: 6.81, color: '#F87171', endValue: '$72,890' },
  ];

  return (
    <div ref={ref} style={chartContainer}>
      <p style={chartTitle}>Figure 1 &mdash; Annualized Returns (20-Year Period)</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {data.map((d) => (
          <div
            key={d.label}
            onMouseEnter={() => setHovered(d.label)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'default' }}
          >
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              marginBottom: '0.4rem',
            }}>
              <span style={{
                fontFamily: 'NeueMontreal-Medium, sans-serif',
                fontSize: '0.85rem',
                color: hovered === d.label ? 'white' : 'rgba(255,255,255,0.7)',
                transition: 'color 0.2s',
              }}>{d.label}</span>
              <span style={{
                fontFamily: '"SF Mono", monospace',
                fontSize: '0.85rem',
                color: d.color,
                fontWeight: 600,
              }}>{d.value}%</span>
            </div>
            <div style={{
              height: '28px',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '6px',
              overflow: 'hidden',
              position: 'relative',
            }}>
              <div style={{
                height: '100%',
                width: visible ? `${(d.value / 12) * 100}%` : '0%',
                background: `linear-gradient(90deg, ${d.color}33, ${d.color}88)`,
                borderRadius: '6px',
                transition: 'width 1.5s cubic-bezier(0.16, 1, 0.3, 1)',
                transitionDelay: '0.2s',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: '0.75rem',
              }}>
                {hovered === d.label && (
                  <span style={{
                    fontFamily: '"SF Mono", monospace',
                    fontSize: '0.7rem',
                    color: 'white',
                    whiteSpace: 'nowrap',
                  }}>
                    $10k → {d.endValue} over 30yr
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{
        marginTop: '1.25rem',
        padding: '0.75rem 1rem',
        background: 'rgba(248, 113, 113, 0.06)',
        border: '0.5px solid rgba(248, 113, 113, 0.15)',
        borderRadius: '8px',
      }}>
        <p style={{
          fontFamily: '"SF Mono", monospace',
          fontSize: '0.75rem',
          color: '#F87171',
          margin: 0,
        }}>
          Gap: 3.34% annually → $101,604 lost over 30 years on a $10,000 investment
        </p>
      </div>
      <p style={sourceText}>Source: DALBAR, 2023 QAIB Report</p>
    </div>
  );
};

// ─── Chart 2: Compound Growth Divergence ───────────────────────

export const CompoundGrowthChart = () => {
  const [visible, setVisible] = useState(false);
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const years = Array.from({ length: 31 }, (_, i) => i);
  const sp500 = years.map(y => 10000 * Math.pow(1.1015, y));
  const investor = years.map(y => 10000 * Math.pow(1.0681, y));
  const maxVal = sp500[30];

  const toY = (val: number) => 180 - (val / maxVal) * 160;
  const toX = (yr: number) => 40 + (yr / 30) * 520;

  const sp500Path = years.map((y, i) => `${i === 0 ? 'M' : 'L'} ${toX(y)} ${toY(sp500[y])}`).join(' ');
  const investorPath = years.map((y, i) => `${i === 0 ? 'M' : 'L'} ${toX(y)} ${toY(investor[y])}`).join(' ');

  const nearestYear = hoveredYear ?? 30;
  const sp500Val = sp500[nearestYear];
  const investorVal = investor[nearestYear];

  return (
    <div ref={ref} style={chartContainer}>
      <p style={chartTitle}>Figure 2 &mdash; $10,000 Compounded Over 30 Years</p>
      <svg
        viewBox="0 0 580 210"
        style={{ width: '100%', height: 'auto' }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 580;
          const year = Math.round(Math.max(0, Math.min(30, ((x - 40) / 520) * 30)));
          setHoveredYear(year);
        }}
        onMouseLeave={() => setHoveredYear(null)}
      >
        {/* Grid lines */}
        {[0, 50000, 100000, 150000].map((v) => (
          <g key={v}>
            <line x1="40" y1={toY(v)} x2="560" y2={toY(v)} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
            <text x="36" y={toY(v) + 4} textAnchor="end" fill="rgba(255,255,255,0.25)" fontSize="8" fontFamily="monospace">
              ${(v / 1000).toFixed(0)}k
            </text>
          </g>
        ))}

        {/* Year labels */}
        {[0, 5, 10, 15, 20, 25, 30].map((y) => (
          <text key={y} x={toX(y)} y="200" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="8" fontFamily="monospace">
            Yr {y}
          </text>
        ))}

        {/* S&P 500 line */}
        <path
          d={sp500Path}
          fill="none"
          stroke="#4ADE80"
          strokeWidth="2"
          strokeDasharray={visible ? '0' : '2000'}
          strokeDashoffset={visible ? '0' : '2000'}
          style={{ transition: 'stroke-dashoffset 2s ease-out' }}
        />

        {/* Investor line */}
        <path
          d={investorPath}
          fill="none"
          stroke="#F87171"
          strokeWidth="2"
          strokeDasharray={visible ? '0' : '2000'}
          strokeDashoffset={visible ? '0' : '2000'}
          style={{ transition: 'stroke-dashoffset 2s ease-out 0.3s' }}
        />

        {/* Hover crosshair */}
        {hoveredYear !== null && (
          <>
            <line
              x1={toX(hoveredYear)} y1="20" x2={toX(hoveredYear)} y2="190"
              stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" strokeDasharray="3 3"
            />
            <circle cx={toX(hoveredYear)} cy={toY(sp500[hoveredYear])} r="4" fill="#4ADE80" />
            <circle cx={toX(hoveredYear)} cy={toY(investor[hoveredYear])} r="4" fill="#F87171" />
          </>
        )}
      </svg>

      {/* Hover tooltip */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '0.75rem',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#4ADE80' }} />
          <span style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
            S&P 500: <strong style={{ color: '#4ADE80' }}>${Math.round(sp500Val).toLocaleString()}</strong>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F87171' }} />
          <span style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
            Avg. Investor: <strong style={{ color: '#F87171' }}>${Math.round(investorVal).toLocaleString()}</strong>
          </span>
        </div>
        <span style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
          Year {nearestYear}
        </span>
      </div>
      <p style={sourceText}>Source: DALBAR QAIB 2023, adapted for illustrative compounding</p>
    </div>
  );
};

// ─── Chart 3: Speculative Cycle ────────────────────────────────

export const SpeculativeCycleChart = () => {
  const [activePhase, setActivePhase] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const phases = [
    { name: 'Accumulation', desc: 'Early investors quietly build positions. Prices are low, sentiment is negative.', x: 60, y: 150, color: '#60A5FA' },
    { name: 'Early Trend', desc: 'Prices begin rising. Smart money recognizes the shift. Volume increases.', x: 150, y: 120, color: '#34D399' },
    { name: 'Narrative', desc: 'Media coverage increases. "This time is different" stories emerge. FOMO builds.', x: 270, y: 65, color: '#FBBF24' },
    { name: 'Retail Mania', desc: 'Mass participation. Everyone is buying. Taxi drivers give stock tips. Peak euphoria.', x: 370, y: 30, color: '#F87171' },
    { name: 'Distribution', desc: 'Early investors sell to late entrants. Volume spikes but price stalls.', x: 440, y: 60, color: '#FB923C' },
    { name: 'Collapse', desc: 'Liquidity disappears. Late buyers are trapped. Prices fall rapidly.', x: 520, y: 145, color: '#EF4444' },
  ];

  // SVG path for the cycle curve
  const curvePath = "M 60 150 C 80 140, 120 125, 150 120 C 200 110, 230 80, 270 65 C 310 50, 340 35, 370 30 C 400 25, 420 40, 440 60 C 470 90, 500 130, 520 145";

  return (
    <div ref={ref} style={chartContainer}>
      <p style={chartTitle}>Figure 3 &mdash; The Speculative Cycle (Interactive)</p>
      <svg viewBox="0 0 580 200" style={{ width: '100%', height: 'auto' }}>
        {/* Grid */}
        <line x1="40" y1="170" x2="560" y2="170" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        <text x="30" y="35" fill="rgba(255,255,255,0.2)" fontSize="7" fontFamily="monospace" textAnchor="end">Price</text>
        <text x="560" y="185" fill="rgba(255,255,255,0.2)" fontSize="7" fontFamily="monospace" textAnchor="end">Time →</text>

        {/* Curve */}
        <path
          d={curvePath}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="2"
          strokeDasharray={visible ? '0' : '1000'}
          strokeDashoffset={visible ? '0' : '1000'}
          style={{ transition: 'stroke-dashoffset 2s ease-out' }}
        />

        {/* Retail entry zone highlight */}
        <rect x="330" y="20" width="80" height="55" rx="4" fill="rgba(248,113,113,0.06)" stroke="rgba(248,113,113,0.15)" strokeWidth="0.5" strokeDasharray="3 3" />
        <text x="370" y="82" fill="rgba(248,113,113,0.4)" fontSize="6" fontFamily="monospace" textAnchor="middle">RETAIL ENTRY</text>

        {/* Phase dots */}
        {phases.map((p, i) => (
          <g
            key={p.name}
            onMouseEnter={() => setActivePhase(i)}
            onMouseLeave={() => setActivePhase(null)}
            style={{ cursor: 'pointer' }}
          >
            <circle
              cx={p.x} cy={p.y} r={activePhase === i ? 8 : 5}
              fill={activePhase === i ? p.color : `${p.color}88`}
              stroke={p.color}
              strokeWidth="1.5"
              style={{ transition: 'all 0.2s ease' }}
            />
            <text
              x={p.x} y={p.y - 14}
              fill={activePhase === i ? p.color : 'rgba(255,255,255,0.35)'}
              fontSize="7"
              fontFamily="monospace"
              textAnchor="middle"
              style={{ transition: 'fill 0.2s' }}
            >
              {p.name}
            </text>
          </g>
        ))}
      </svg>

      {/* Phase detail panel */}
      <div style={{
        minHeight: '52px',
        padding: '0.75rem 1rem',
        background: activePhase !== null ? `${phases[activePhase].color}08` : 'rgba(255,255,255,0.02)',
        border: `0.5px solid ${activePhase !== null ? `${phases[activePhase].color}22` : 'rgba(255,255,255,0.06)'}`,
        borderRadius: '8px',
        transition: 'all 0.3s ease',
        marginTop: '0.75rem',
      }}>
        {activePhase !== null ? (
          <>
            <span style={{
              fontFamily: '"SF Mono", monospace',
              fontSize: '0.8rem',
              color: phases[activePhase].color,
              fontWeight: 600,
            }}>
              {phases[activePhase].name}
            </span>
            <p style={{
              fontFamily: 'NeueMontreal-Light, sans-serif',
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.6)',
              margin: '0.3rem 0 0',
              lineHeight: 1.5,
            }}>
              {phases[activePhase].desc}
            </p>
          </>
        ) : (
          <p style={{
            fontFamily: '"SF Mono", monospace',
            fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.3)',
            margin: 0,
          }}>
            Hover over a phase to explore the cycle →
          </p>
        )}
      </div>
      <p style={sourceText}>Adapted from Minsky's Financial Instability Hypothesis (1986)</p>
    </div>
  );
};

// ─── Chart 4: SPIVA Underperformance ──────────────────────────

export const SPIVAChart = () => {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const data = [
    { period: '1 Year', pct: 64, delay: 0 },
    { period: '3 Years', pct: 71, delay: 0.1 },
    { period: '5 Years', pct: 79, delay: 0.2 },
    { period: '10 Years', pct: 87, delay: 0.3 },
    { period: '15 Years', pct: 88, delay: 0.4 },
    { period: '20 Years', pct: 93, delay: 0.5 },
  ];

  return (
    <div ref={ref} style={chartContainer}>
      <p style={chartTitle}>Figure 4 &mdash; % of Active Managers Underperforming S&P 500</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {data.map((d, i) => (
          <div
            key={d.period}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'default' }}
          >
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              marginBottom: '0.25rem',
            }}>
              <span style={{
                fontFamily: '"SF Mono", monospace',
                fontSize: '0.75rem',
                color: hovered === i ? 'white' : 'rgba(255,255,255,0.5)',
                transition: 'color 0.2s',
                minWidth: '65px',
              }}>{d.period}</span>
              <span style={{
                fontFamily: '"SF Mono", monospace',
                fontSize: '0.8rem',
                color: d.pct > 85 ? '#EF4444' : d.pct > 70 ? '#FB923C' : '#FBBF24',
                fontWeight: 600,
              }}>{d.pct}%</span>
            </div>
            <div style={{
              height: '20px',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '4px',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: visible ? `${d.pct}%` : '0%',
                background: `linear-gradient(90deg, ${d.pct > 85 ? 'rgba(239,68,68,0.2)' : d.pct > 70 ? 'rgba(251,146,60,0.2)' : 'rgba(251,191,36,0.2)'}, ${d.pct > 85 ? 'rgba(239,68,68,0.5)' : d.pct > 70 ? 'rgba(251,146,60,0.5)' : 'rgba(251,191,36,0.5)'})`,
                borderRadius: '4px',
                transition: `width 1.2s cubic-bezier(0.16, 1, 0.3, 1)`,
                transitionDelay: `${d.delay + 0.3}s`,
              }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{
        marginTop: '1rem',
        padding: '0.6rem 0.8rem',
        background: 'rgba(239, 68, 68, 0.06)',
        border: '0.5px solid rgba(239, 68, 68, 0.12)',
        borderRadius: '6px',
      }}>
        <p style={{
          fontFamily: '"SF Mono", monospace',
          fontSize: '0.7rem',
          color: 'rgba(255,255,255,0.5)',
          margin: 0,
        }}>
          Over 20 years, 93% of professional fund managers fail to beat a simple index fund.
        </p>
      </div>
      <p style={sourceText}>Source: S&P Global SPIVA Scorecard, 2023</p>
    </div>
  );
};

// ─── Chart 5: Behavioral Biases Visual ─────────────────────────

export const BehavioralBiasesChart = () => {
  const [visible, setVisible] = useState(false);
  const [activeBias, setActiveBias] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const biases = [
    {
      icon: '👥',
      name: 'Herd Behavior',
      effect: 'Buy when everyone buys',
      result: 'Enter at peaks',
      color: '#60A5FA',
      source: 'Banerjee (1992)',
    },
    {
      icon: '📈',
      name: 'Recency Bias',
      effect: 'Assume trends continue',
      result: 'Extrapolate past returns',
      color: '#FBBF24',
      source: 'Barberis et al. (1998)',
    },
    {
      icon: '😰',
      name: 'Loss Aversion',
      effect: 'Feel losses 2x more than gains',
      result: 'Sell at bottoms',
      color: '#F87171',
      source: 'Kahneman & Tversky (1979)',
    },
  ];

  return (
    <div ref={ref} style={chartContainer}>
      <p style={chartTitle}>Figure 5 &mdash; Behavioral Biases That Drive the Gap</p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {biases.map((b, i) => (
          <div
            key={b.name}
            onMouseEnter={() => setActiveBias(i)}
            onMouseLeave={() => setActiveBias(null)}
            style={{
              flex: '1 1 160px',
              padding: '1rem',
              background: activeBias === i ? `${b.color}0D` : 'rgba(255,255,255,0.02)',
              border: `0.5px solid ${activeBias === i ? `${b.color}33` : 'rgba(255,255,255,0.08)'}`,
              borderRadius: '10px',
              cursor: 'default',
              transition: 'all 0.3s ease',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(12px)',
              transitionDelay: `${i * 0.15 + 0.2}s`,
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{b.icon}</div>
            <p style={{
              fontFamily: 'NeueMontreal-Medium, sans-serif',
              fontSize: '0.85rem',
              color: activeBias === i ? b.color : 'rgba(255,255,255,0.8)',
              margin: '0 0 0.3rem',
              transition: 'color 0.2s',
            }}>{b.name}</p>
            <p style={{
              fontFamily: 'NeueMontreal-Light, sans-serif',
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.5)',
              margin: '0 0 0.2rem',
              lineHeight: 1.5,
            }}>{b.effect}</p>
            <p style={{
              fontFamily: '"SF Mono", monospace',
              fontSize: '0.7rem',
              color: b.color,
              margin: '0.5rem 0 0',
              opacity: 0.8,
            }}>→ {b.result}</p>
            <p style={{
              fontFamily: '"SF Mono", monospace',
              fontSize: '0.6rem',
              color: 'rgba(255,255,255,0.25)',
              margin: '0.4rem 0 0',
            }}>{b.source}</p>
          </div>
        ))}
      </div>
      {/* The feedback loop */}
      <div style={{
        marginTop: '1.25rem',
        padding: '0.75rem 1rem',
        background: 'rgba(255,255,255,0.02)',
        border: '0.5px solid rgba(255,255,255,0.08)',
        borderRadius: '8px',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: '"SF Mono", monospace',
          fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.5)',
          margin: 0,
        }}>
          prices rise → confidence increases → investors buy → risk increases → <span style={{ color: '#F87171' }}>repeat</span>
        </p>
      </div>
    </div>
  );
};

// ─── Chart 6: Motivation vs Discipline Over Time ────────────

export const MotivationDecayChart = () => {
  const [visible, setVisible] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const days = Array.from({ length: 91 }, (_, i) => i);
  const motivation = days.map(d => {
    const base = 92 * Math.exp(-d / 35);
    const volatility = 18 * Math.sin(d * 0.45) * Math.exp(-d / 50);
    return Math.max(5, Math.min(100, base + volatility));
  });
  const discipline = days.map(d => {
    const base = 12 + 58 * (1 - Math.exp(-d / 45));
    const noise = 2.5 * Math.sin(d * 0.25);
    return Math.max(5, Math.min(100, base + noise));
  });

  const crossoverDay = days.find(d => discipline[d] >= motivation[d]) || 32;

  const w = 580, h = 200;
  const pL = 40, pR = 20, pT = 10, pB = 30;
  const cW = w - pL - pR, cH = h - pT - pB;
  const toX = (d: number) => pL + (d / 90) * cW;
  const toY = (v: number) => pT + cH - (v / 100) * cH;

  const motivPath = days.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(d)} ${toY(motivation[d])}`).join(' ');
  const discPath = days.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(d)} ${toY(discipline[d])}`).join(' ');

  const nearDay = hoveredDay ?? 45;

  return (
    <div ref={ref} style={chartContainer}>
      <p style={chartTitle}>Figure 1 &mdash; Motivation vs Discipline Over 90 Days</p>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        style={{ width: '100%', height: 'auto' }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * w;
          const day = Math.round(Math.max(0, Math.min(90, ((x - pL) / cW) * 90)));
          setHoveredDay(day);
        }}
        onMouseLeave={() => setHoveredDay(null)}
      >
        {[0, 25, 50, 75, 100].map(v => (
          <g key={v}>
            <line x1={pL} y1={toY(v)} x2={w - pR} y2={toY(v)} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
            <text x={pL - 4} y={toY(v) + 3} textAnchor="end" fill="rgba(255,255,255,0.25)" fontSize="7" fontFamily="monospace">{v}%</text>
          </g>
        ))}

        {/* Crossover zone */}
        <rect x={toX(crossoverDay) - 12} y={pT} width="24" height={cH} fill="rgba(45, 212, 191, 0.05)" rx="3" />
        <text x={toX(crossoverDay)} y={pT + 8} fill="rgba(45, 212, 191, 0.5)" fontSize="6" fontFamily="monospace" textAnchor="middle">CROSSOVER</text>

        {/* Motivation line */}
        <path d={motivPath} fill="none" stroke="#FB923C" strokeWidth="2" opacity="0.8"
          strokeDasharray={visible ? '0' : '2000'} strokeDashoffset={visible ? '0' : '2000'}
          style={{ transition: 'stroke-dashoffset 2s ease-out' }} />

        {/* Discipline line */}
        <path d={discPath} fill="none" stroke="#2DD4BF" strokeWidth="2"
          strokeDasharray={visible ? '0' : '2000'} strokeDashoffset={visible ? '0' : '2000'}
          style={{ transition: 'stroke-dashoffset 2s ease-out 0.3s' }} />

        {hoveredDay !== null && (
          <>
            <line x1={toX(hoveredDay)} y1={pT} x2={toX(hoveredDay)} y2={h - pB}
              stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" strokeDasharray="3 3" />
            <circle cx={toX(hoveredDay)} cy={toY(motivation[hoveredDay])} r="4" fill="#FB923C" />
            <circle cx={toX(hoveredDay)} cy={toY(discipline[hoveredDay])} r="4" fill="#2DD4BF" />
          </>
        )}

        {[0, 15, 30, 45, 60, 75, 90].map(d => (
          <text key={d} x={toX(d)} y={h - 5} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="7" fontFamily="monospace">
            Day {d}
          </text>
        ))}
      </svg>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FB923C' }} />
          <span style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
            Motivation: <strong style={{ color: '#FB923C' }}>{Math.round(motivation[nearDay])}%</strong>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#2DD4BF' }} />
          <span style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
            Discipline: <strong style={{ color: '#2DD4BF' }}>{Math.round(discipline[nearDay])}%</strong>
          </span>
        </div>
        <span style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
          Day {nearDay}
        </span>
      </div>
      <div style={{
        marginTop: '1rem', padding: '0.75rem 1rem',
        background: 'rgba(45, 212, 191, 0.06)',
        border: '0.5px solid rgba(45, 212, 191, 0.15)',
        borderRadius: '8px',
      }}>
        <p style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
          Motivation starts high but decays exponentially. Discipline starts low but compounds. Around day {crossoverDay}, discipline becomes the dominant force.
        </p>
      </div>
      <p style={sourceText}>Model based on habituation research (Duhigg, 2012; Clear, 2018)</p>
    </div>
  );
};

// ─── Chart 7: The 1% Rule / Compound Discipline ─────────────

export const CompoundDisciplineChart = () => {
  const [visible, setVisible] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const totalDays = 365;
  const samples = 74;
  const days = Array.from({ length: samples + 1 }, (_, i) => Math.round(i * totalDays / samples));
  const improve = days.map(d => Math.pow(1.01, d));
  const decline = days.map(d => Math.pow(0.99, d));
  const maxVal = improve[improve.length - 1];

  const w = 580, h = 220;
  const pL = 50, pR = 60, pT = 15, pB = 30;
  const cW = w - pL - pR, cH = h - pT - pB;

  const toY = (v: number) => {
    const logV = Math.log(Math.max(v, 0.02));
    const logMax = Math.log(maxVal * 1.1);
    const logMin = Math.log(0.02);
    return pT + cH - ((logV - logMin) / (logMax - logMin)) * cH;
  };
  const toX = (d: number) => pL + (d / totalDays) * cW;

  const improvePath = days.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(d)} ${toY(improve[i])}`).join(' ');
  const stagnantPath = `M ${toX(0)} ${toY(1)} L ${toX(totalDays)} ${toY(1)}`;
  const declinePath = days.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(d)} ${toY(decline[i])}`).join(' ');

  const nearIdx = hoveredDay !== null ? Math.min(Math.round((hoveredDay / totalDays) * samples), samples) : samples;
  const nearDay = days[nearIdx];

  return (
    <div ref={ref} style={chartContainer}>
      <p style={chartTitle}>Figure 2 &mdash; The 1% Rule: Marginal Gains vs Marginal Losses Over One Year</p>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        style={{ width: '100%', height: 'auto' }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * w;
          const day = Math.round(Math.max(0, Math.min(totalDays, ((x - pL) / cW) * totalDays)));
          setHoveredDay(day);
        }}
        onMouseLeave={() => setHoveredDay(null)}
      >
        {/* Grid */}
        <line x1={pL} y1={toY(1)} x2={w - pR} y2={toY(1)} stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" strokeDasharray="4 4" />

        {/* +1% line */}
        <path d={improvePath} fill="none" stroke="#4ADE80" strokeWidth="2.5"
          strokeDasharray={visible ? '0' : '2000'} strokeDashoffset={visible ? '0' : '2000'}
          style={{ transition: 'stroke-dashoffset 2.5s ease-out' }} />

        {/* Stagnant line */}
        <path d={stagnantPath} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4 4" />

        {/* -1% line */}
        <path d={declinePath} fill="none" stroke="#F87171" strokeWidth="2"
          strokeDasharray={visible ? '0' : '2000'} strokeDashoffset={visible ? '0' : '2000'}
          style={{ transition: 'stroke-dashoffset 2.5s ease-out 0.3s' }} />

        {/* End labels */}
        <text x={w - pR + 5} y={toY(improve[samples]) + 4} fill="#4ADE80" fontSize="9" fontFamily="monospace" fontWeight="bold">37.78x</text>
        <text x={w - pR + 5} y={toY(1) + 4} fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="monospace">1.00x</text>
        <text x={w - pR + 5} y={toY(decline[samples]) + 4} fill="#F87171" fontSize="9" fontFamily="monospace" fontWeight="bold">0.03x</text>

        {/* Hover */}
        {hoveredDay !== null && (
          <>
            <line x1={toX(nearDay)} y1={pT} x2={toX(nearDay)} y2={h - pB}
              stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" strokeDasharray="3 3" />
            <circle cx={toX(nearDay)} cy={toY(improve[nearIdx])} r="4" fill="#4ADE80" />
            <circle cx={toX(nearDay)} cy={toY(decline[nearIdx])} r="4" fill="#F87171" />
          </>
        )}

        {[0, 60, 120, 180, 240, 300, 365].map(d => (
          <text key={d} x={toX(d)} y={h - 5} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="7" fontFamily="monospace">
            {d === 0 ? 'Start' : `Day ${d}`}
          </text>
        ))}
      </svg>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.75rem', color: '#4ADE80' }}>
          +1%/day: {Math.pow(1.01, nearDay).toFixed(2)}x
        </span>
        <span style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.75rem', color: '#F87171' }}>
          -1%/day: {Math.pow(0.99, nearDay).toFixed(4)}x
        </span>
        <span style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
          Day {nearDay}
        </span>
      </div>
      <div style={{
        marginTop: '1rem', padding: '0.75rem 1rem',
        background: 'rgba(74, 222, 128, 0.06)',
        border: '0.5px solid rgba(74, 222, 128, 0.15)',
        borderRadius: '8px',
      }}>
        <p style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
          After one year: the disciplined path is <strong style={{ color: '#4ADE80' }}>1,260x</strong> better than the declining path. Same starting point. Same daily magnitude. Opposite direction.
        </p>
      </div>
      <p style={sourceText}>Based on James Clear's marginal gains framework, "Atomic Habits" (2018)</p>
    </div>
  );
};

// ─── Chart 8: The Dopamine Abandonment Loop ─────────────────

export const DopamineCycleChart = () => {
  const [activePhase, setActivePhase] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const phases = [
    { name: 'New Idea', desc: 'A fresh concept sparks excitement. The brain floods with dopamine at the novelty of pure possibility.', x: 60, y: 130, color: '#A78BFA' },
    { name: 'Honeymoon', desc: 'Everything clicks. Progress feels effortless. This is what passion is supposed to feel like.', x: 155, y: 48, color: '#4ADE80' },
    { name: 'Plateau', desc: 'The easy wins are gone. Progress slows. The work becomes repetitive and dopamine drops.', x: 270, y: 78, color: '#FBBF24' },
    { name: 'The Valley', desc: 'Boredom. Self-doubt. "Maybe this is not the right path." The brain craves something new.', x: 370, y: 140, color: '#F87171' },
    { name: 'Crisis Point', desc: '85% of people quit here. The pain of continuing feels greater than the pain of starting over.', x: 440, y: 155, color: '#EF4444' },
    { name: 'Mastery', desc: 'The 15% who push through find compound growth. Discipline replaces motivation as the engine.', x: 530, y: 95, color: '#2DD4BF' },
  ];

  const curvePath = "M 60 130 C 90 85, 125 52, 155 48 C 195 40, 230 62, 270 78 C 310 95, 340 125, 370 140 C 400 152, 420 158, 440 155 C 465 148, 500 112, 530 95";

  return (
    <div ref={ref} style={chartContainer}>
      <p style={chartTitle}>Figure 3 &mdash; The Dopamine Abandonment Loop (Interactive)</p>
      <svg viewBox="0 0 580 200" style={{ width: '100%', height: 'auto' }}>
        <line x1="40" y1="175" x2="560" y2="175" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        <text x="30" y="48" fill="rgba(255,255,255,0.2)" fontSize="7" fontFamily="monospace" textAnchor="end">Drive</text>
        <text x="560" y="190" fill="rgba(255,255,255,0.2)" fontSize="7" fontFamily="monospace" textAnchor="end">Time</text>

        {/* Quit zone */}
        <rect x="345" y="128" width="115" height="38" rx="4" fill="rgba(248,113,113,0.06)" stroke="rgba(248,113,113,0.15)" strokeWidth="0.5" strokeDasharray="3 3" />
        <text x="403" y="175" fill="rgba(248,113,113,0.4)" fontSize="6" fontFamily="monospace" textAnchor="middle">85% QUIT HERE</text>

        {/* Curve */}
        <path d={curvePath} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2"
          strokeDasharray={visible ? '0' : '1000'} strokeDashoffset={visible ? '0' : '1000'}
          style={{ transition: 'stroke-dashoffset 2s ease-out' }} />

        {phases.map((p, i) => (
          <g key={p.name} onMouseEnter={() => setActivePhase(i)} onMouseLeave={() => setActivePhase(null)} style={{ cursor: 'pointer' }}>
            <circle cx={p.x} cy={p.y} r={activePhase === i ? 8 : 5}
              fill={activePhase === i ? p.color : `${p.color}88`}
              stroke={p.color} strokeWidth="1.5"
              style={{ transition: 'all 0.2s ease' }} />
            <text x={p.x} y={p.y - 14} fill={activePhase === i ? p.color : 'rgba(255,255,255,0.35)'}
              fontSize="7" fontFamily="monospace" textAnchor="middle" style={{ transition: 'fill 0.2s' }}>
              {p.name}
            </text>
          </g>
        ))}
      </svg>

      <div style={{
        minHeight: '52px', padding: '0.75rem 1rem',
        background: activePhase !== null ? `${phases[activePhase].color}08` : 'rgba(255,255,255,0.02)',
        border: `0.5px solid ${activePhase !== null ? `${phases[activePhase].color}22` : 'rgba(255,255,255,0.06)'}`,
        borderRadius: '8px', transition: 'all 0.3s ease', marginTop: '0.75rem',
      }}>
        {activePhase !== null ? (
          <>
            <span style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.8rem', color: phases[activePhase].color, fontWeight: 600 }}>
              {phases[activePhase].name}
            </span>
            <p style={{ fontFamily: 'NeueMontreal-Light, sans-serif', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', margin: '0.3rem 0 0', lineHeight: 1.5 }}>
              {phases[activePhase].desc}
            </p>
          </>
        ) : (
          <p style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
            Hover over a phase to explore the cycle
          </p>
        )}
      </div>
      <p style={sourceText}>Adapted from Huberman Lab research on dopamine and motivation (2021)</p>
    </div>
  );
};

// ─── Chart 9: Grit Formula (Interactive) ────────────────────

export const GritFormulaChart = () => {
  const [visible, setVisible] = useState(false);
  const [effort, setEffort] = useState(5);
  const [talent, setTalent] = useState(3);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const skill = talent * effort;
  const achievement = skill * effort;

  return (
    <div ref={ref} style={chartContainer}>
      <p style={chartTitle}>Figure 4 &mdash; Duckworth's Grit Equation (Interactive)</p>

      <div style={{
        display: 'flex', flexDirection: 'column', gap: '1.25rem',
        opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'all 0.8s ease-out',
      }}>
        {/* Equation 1 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
          justifyContent: 'center', padding: '1rem',
          background: 'rgba(255,255,255,0.02)', borderRadius: '8px',
          border: '0.5px solid rgba(255,255,255,0.08)',
        }}>
          <span style={{ fontFamily: '"SF Mono", monospace', fontSize: '1rem', color: '#60A5FA' }}>
            Talent ({talent})
          </span>
          <span style={{ fontFamily: '"SF Mono", monospace', fontSize: '1.2rem', color: 'rgba(255,255,255,0.3)' }}>&times;</span>
          <span style={{ fontFamily: '"SF Mono", monospace', fontSize: '1rem', color: '#FBBF24', fontWeight: 'bold' }}>
            Effort ({effort})
          </span>
          <span style={{ fontFamily: '"SF Mono", monospace', fontSize: '1.2rem', color: 'rgba(255,255,255,0.3)' }}>=</span>
          <span style={{ fontFamily: '"SF Mono", monospace', fontSize: '1rem', color: '#A78BFA' }}>
            Skill ({skill})
          </span>
        </div>

        {/* Equation 2 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
          justifyContent: 'center', padding: '1rem',
          background: 'rgba(255,255,255,0.02)', borderRadius: '8px',
          border: '0.5px solid rgba(255,255,255,0.08)',
        }}>
          <span style={{ fontFamily: '"SF Mono", monospace', fontSize: '1rem', color: '#A78BFA' }}>
            Skill ({skill})
          </span>
          <span style={{ fontFamily: '"SF Mono", monospace', fontSize: '1.2rem', color: 'rgba(255,255,255,0.3)' }}>&times;</span>
          <span style={{ fontFamily: '"SF Mono", monospace', fontSize: '1rem', color: '#FBBF24', fontWeight: 'bold' }}>
            Effort ({effort})
          </span>
          <span style={{ fontFamily: '"SF Mono", monospace', fontSize: '1.2rem', color: 'rgba(255,255,255,0.3)' }}>=</span>
          <span style={{ fontFamily: '"SF Mono", monospace', fontSize: '1.1rem', color: '#4ADE80', fontWeight: 'bold' }}>
            Achievement ({achievement})
          </span>
        </div>

        {/* Interactive sliders */}
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ flex: '1 1 200px', maxWidth: '250px' }}>
            <label style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.75rem', color: '#60A5FA', display: 'block', marginBottom: '0.4rem' }}>
              Talent: {talent}
            </label>
            <input type="range" min="1" max="10" value={talent} onChange={(e) => setTalent(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#60A5FA' }} />
          </div>
          <div style={{ flex: '1 1 200px', maxWidth: '250px' }}>
            <label style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.75rem', color: '#FBBF24', display: 'block', marginBottom: '0.4rem' }}>
              Effort: {effort}
            </label>
            <input type="range" min="1" max="10" value={effort} onChange={(e) => setEffort(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#FBBF24' }} />
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '1.25rem', padding: '0.75rem 1rem',
        background: 'rgba(251, 191, 36, 0.06)',
        border: '0.5px solid rgba(251, 191, 36, 0.15)',
        borderRadius: '8px',
      }}>
        <p style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
          <span style={{ color: '#FBBF24' }}>Effort appears in both equations.</span> Doubling effort quadruples achievement. Doubling talent only doubles it. The algebra is unambiguous: effort is the dominant variable.
        </p>
      </div>
      <p style={sourceText}>Source: Angela Duckworth, "Grit: The Power of Passion and Perseverance" (2016)</p>
    </div>
  );
};

// ─── Chart 10: The Marshmallow Test / Delayed Gratification ──

export const DelayedGratificationChart = () => {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={chartContainer}>
      <p style={chartTitle}>Figure 5 &mdash; The Marshmallow Test: 40-Year Follow-Up</p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {/* Waited group */}
        <div
          onMouseEnter={() => setHovered('waited')}
          onMouseLeave={() => setHovered(null)}
          style={{
            flex: '1 1 220px', padding: '1.25rem',
            background: hovered === 'waited' ? 'rgba(74, 222, 128, 0.08)' : 'rgba(255,255,255,0.02)',
            border: `0.5px solid ${hovered === 'waited' ? 'rgba(74, 222, 128, 0.25)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: '10px', cursor: 'default', transition: 'all 0.3s ease',
            opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(15px)',
            transitionDelay: '0.2s',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem', letterSpacing: '0.2em' }}>
              <span role="img" aria-label="marshmallow">&#x25CB;</span>
              <span role="img" aria-label="marshmallow" style={{ marginLeft: '0.25rem' }}>&#x25CB;</span>
            </div>
            <p style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.8rem', color: '#4ADE80', margin: 0, fontWeight: 600 }}>
              Waited (Delayed Gratification)
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { metric: 'SAT Scores', value: '+210 points' },
              { metric: 'College Graduation', value: '+36% rate' },
              { metric: 'Income at 40', value: '+32% higher' },
              { metric: 'BMI (Health)', value: '5 pts lower' },
            ].map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: 'NeueMontreal-Light, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{m.metric}</span>
                <span style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.75rem', color: '#4ADE80', fontWeight: 600 }}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Didn't wait group */}
        <div
          onMouseEnter={() => setHovered('ate')}
          onMouseLeave={() => setHovered(null)}
          style={{
            flex: '1 1 220px', padding: '1.25rem',
            background: hovered === 'ate' ? 'rgba(248, 113, 113, 0.08)' : 'rgba(255,255,255,0.02)',
            border: `0.5px solid ${hovered === 'ate' ? 'rgba(248, 113, 113, 0.25)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: '10px', cursor: 'default', transition: 'all 0.3s ease',
            opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(15px)',
            transitionDelay: '0.35s',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>
              <span role="img" aria-label="marshmallow">&#x25CB;</span>
            </div>
            <p style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.8rem', color: '#F87171', margin: 0, fontWeight: 600 }}>
              Ate Immediately (Instant Gratification)
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { metric: 'SAT Scores', value: 'Baseline' },
              { metric: 'College Graduation', value: 'Baseline' },
              { metric: 'Income at 40', value: 'Baseline' },
              { metric: 'BMI (Health)', value: 'Baseline' },
            ].map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: 'NeueMontreal-Light, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{m.metric}</span>
                <span style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.75rem', color: '#F87171' }}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '1rem', padding: '0.75rem 1rem',
        background: 'rgba(167, 139, 250, 0.06)',
        border: '0.5px solid rgba(167, 139, 250, 0.15)',
        borderRadius: '8px',
      }}>
        <p style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
          The ability to delay gratification at age 4 predicted life outcomes more reliably than IQ, socioeconomic background, or parental education.
        </p>
      </div>
      <p style={sourceText}>Source: Mischel et al. (1989), Shoda et al. (1990), Casey et al. (2011)</p>
    </div>
  );
};

// ─── Chart Registry ───────────────────────────────────────────

export const chartRegistry: Record<string, React.FC> = {
  'return-gap': ReturnGapChart,
  'compound-growth': CompoundGrowthChart,
  'speculative-cycle': SpeculativeCycleChart,
  'spiva': SPIVAChart,
  'behavioral-biases': BehavioralBiasesChart,
  'motivation-decay': MotivationDecayChart,
  'compound-discipline': CompoundDisciplineChart,
  'dopamine-cycle': DopamineCycleChart,
  'grit-formula': GritFormulaChart,
  'delayed-gratification': DelayedGratificationChart,
};
