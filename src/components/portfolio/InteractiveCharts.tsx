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

// ─── Enterprise Software: Cost Breakdown ─────────────────────

export const EnterpriseCostBreakdownChart = () => {
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
    { label: 'Implementation & Consulting', pct: 35, cost: '$3.5M', color: '#4A9EFF', desc: 'System integrators, process mapping, configuration' },
    { label: 'Customization & Integration', pct: 20, cost: '$2.0M', color: '#06B6D4', desc: 'API connections, custom workflows, data bridges' },
    { label: 'License / Subscription', pct: 20, cost: '$2.0M', color: '#38BDF8', desc: 'The sticker price — what appears on the invoice' },
    { label: 'Ongoing Maintenance', pct: 17, cost: '$1.7M', color: '#67E8F9', desc: 'Patches, upgrades, support contracts, hosting' },
    { label: 'Training & Change Mgmt', pct: 8, cost: '$0.8M', color: '#A5F3FC', desc: 'User adoption, documentation, organizational change' },
  ];

  const total = 10;

  return (
    <div ref={ref} style={chartContainer}>
      <p style={chartTitle}>Figure 1 &mdash; True Cost of a $10M Enterprise Deployment</p>

      {/* Stacked bar */}
      <div style={{
        display: 'flex', height: '48px', borderRadius: '8px', overflow: 'hidden',
        background: 'rgba(255,255,255,0.04)', marginBottom: '1.25rem',
      }}>
        {data.map((d, i) => (
          <div
            key={d.label}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              width: visible ? `${d.pct}%` : '0%',
              background: hovered === i
                ? `linear-gradient(180deg, ${d.color}CC, ${d.color}88)`
                : `linear-gradient(180deg, ${d.color}66, ${d.color}33)`,
              transition: `width 1.2s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.12}s, background 0.2s`,
              cursor: 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRight: i < data.length - 1 ? '1px solid rgba(0,0,0,0.3)' : 'none',
            }}
          >
            {visible && d.pct >= 15 && (
              <span style={{
                fontFamily: '"SF Mono", monospace', fontSize: '0.7rem',
                color: 'white', fontWeight: 600, whiteSpace: 'nowrap',
              }}>{d.pct}%</span>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {data.map((d, i) => (
          <div
            key={d.label}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.5rem 0.75rem', borderRadius: '8px',
              background: hovered === i ? `${d.color}0D` : 'transparent',
              border: `0.5px solid ${hovered === i ? `${d.color}33` : 'transparent'}`,
              transition: 'all 0.2s', cursor: 'default',
              opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(-12px)',
              transitionDelay: `${i * 0.1 + 0.5}s`,
            }}
          >
            <div style={{ width: 12, height: 12, borderRadius: '3px', background: d.color, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{
                  fontFamily: 'NeueMontreal-Medium, sans-serif', fontSize: '0.8rem',
                  color: hovered === i ? 'white' : 'rgba(255,255,255,0.7)',
                  transition: 'color 0.2s',
                }}>{d.label}</span>
                <span style={{
                  fontFamily: '"SF Mono", monospace', fontSize: '0.8rem',
                  color: d.color, fontWeight: 600,
                }}>{d.cost}</span>
              </div>
              {hovered === i && (
                <p style={{
                  fontFamily: 'NeueMontreal-Light, sans-serif', fontSize: '0.7rem',
                  color: 'rgba(255,255,255,0.5)', margin: '0.2rem 0 0',
                }}>{d.desc}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '1.25rem', padding: '0.75rem 1rem',
        background: 'rgba(74, 158, 255, 0.06)',
        border: '0.5px solid rgba(74, 158, 255, 0.15)',
        borderRadius: '8px',
      }}>
        <p style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
          The license fee is only <strong style={{ color: '#4A9EFF' }}>20%</strong> of total cost. For every $1 spent on software, $4 is spent making it work.
        </p>
      </div>
      <p style={sourceText}>Source: Panorama Consulting Group, 2024 ERP Report</p>
    </div>
  );
};

// ─── Enterprise Software: Switching Cost Growth ──────────────

export const SwitchingCostChart = () => {
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

  const years = Array.from({ length: 21 }, (_, i) => i);
  const switchingCost = years.map(y => {
    const base = 2 + 18 * (1 - Math.exp(-y / 4));
    const integrations = 0.5 * y;
    return Math.min(30, base + integrations);
  });
  const maxVal = 35;

  const w = 580, h = 200;
  const pL = 50, pR = 20, pT = 15, pB = 30;
  const cW = w - pL - pR, cH = h - pT - pB;
  const toX = (yr: number) => pL + (yr / 20) * cW;
  const toY = (v: number) => pT + cH - (v / maxVal) * cH;

  const costPath = years.map((y, i) => `${i === 0 ? 'M' : 'L'} ${toX(y)} ${toY(switchingCost[y])}`).join(' ');
  const areaPath = costPath + ` L ${toX(20)} ${toY(0)} L ${toX(0)} ${toY(0)} Z`;

  const nearYear = hoveredYear ?? 10;

  const zones = [
    { start: 0, end: 3, label: 'Feasible', color: '#4ADE80' },
    { start: 3, end: 7, label: 'Expensive', color: '#FBBF24' },
    { start: 7, end: 14, label: 'Disruptive', color: '#FB923C' },
    { start: 14, end: 20, label: 'Effectively Permanent', color: '#EF4444' },
  ];

  return (
    <div ref={ref} style={chartContainer}>
      <p style={chartTitle}>Figure 2 &mdash; Enterprise Switching Cost Over Time</p>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        style={{ width: '100%', height: 'auto' }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * w;
          const year = Math.round(Math.max(0, Math.min(20, ((x - pL) / cW) * 20)));
          setHoveredYear(year);
        }}
        onMouseLeave={() => setHoveredYear(null)}
      >
        {/* Zone backgrounds */}
        {zones.map((z) => (
          <rect key={z.label} x={toX(z.start)} y={pT} width={toX(z.end) - toX(z.start)} height={cH}
            fill={`${z.color}06`} />
        ))}

        {/* Grid */}
        {[0, 10, 20, 30].map(v => (
          <g key={v}>
            <line x1={pL} y1={toY(v)} x2={w - pR} y2={toY(v)} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
            <text x={pL - 4} y={toY(v) + 3} textAnchor="end" fill="rgba(255,255,255,0.25)" fontSize="7" fontFamily="monospace">
              ${v}M
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="url(#switchGrad)" opacity={visible ? 0.3 : 0} style={{ transition: 'opacity 1.5s' }} />
        <defs>
          <linearGradient id="switchGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="35%" stopColor="#FBBF24" />
            <stop offset="65%" stopColor="#FB923C" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
        </defs>

        {/* Cost line */}
        <path d={costPath} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2"
          strokeDasharray={visible ? '0' : '2000'} strokeDashoffset={visible ? '0' : '2000'}
          style={{ transition: 'stroke-dashoffset 2s ease-out' }} />

        {/* Zone labels */}
        {zones.map((z) => (
          <text key={z.label} x={(toX(z.start) + toX(z.end)) / 2} y={h - pB + 20}
            textAnchor="middle" fill={z.color} fontSize="6.5" fontFamily="monospace" opacity="0.7">
            {z.label}
          </text>
        ))}

        {/* Year labels */}
        {[0, 5, 10, 15, 20].map(y => (
          <text key={y} x={toX(y)} y={h - 5} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="7" fontFamily="monospace">
            Yr {y}
          </text>
        ))}

        {/* Hover */}
        {hoveredYear !== null && (
          <>
            <line x1={toX(hoveredYear)} y1={pT} x2={toX(hoveredYear)} y2={pT + cH}
              stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" strokeDasharray="3 3" />
            <circle cx={toX(hoveredYear)} cy={toY(switchingCost[hoveredYear])} r="5"
              fill="white" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
          </>
        )}
      </svg>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
          Year {nearYear}: <strong style={{ color: '#06B6D4' }}>${switchingCost[nearYear].toFixed(1)}M</strong> estimated switching cost
        </span>
      </div>
      <p style={sourceText}>Model based on Panorama Consulting & Gartner research on ERP lifecycle costs</p>
    </div>
  );
};

// ─── Enterprise Software: Process Complexity ─────────────────

export const ProcessComplexityChart = () => {
  const [visible, setVisible] = useState(false);
  const [activeLayer, setActiveLayer] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const layers = [
    { name: 'UI & Dashboards', desc: 'What executives see: clean reports and dashboards. ~5% of total complexity.', pct: 5, color: '#38BDF8', icon: '📊' },
    { name: 'Business Logic', desc: 'Approval workflows, pricing rules, compliance checks, tax calculations across jurisdictions.', pct: 20, color: '#4A9EFF', icon: '⚙️' },
    { name: 'Data Integration', desc: '200–1,000 connected systems. Real-time sync, ETL pipelines, API gateways, message queues.', pct: 30, color: '#06B6D4', icon: '🔗' },
    { name: 'Legacy Migration', desc: 'Decades of accumulated data in inconsistent formats. Deduplication, normalization, validation.', pct: 25, color: '#0891B2', icon: '🏗️' },
    { name: 'Compliance & Audit', desc: 'SOX, GDPR, HIPAA, industry-specific regulations. Every transaction must be traceable.', pct: 20, color: '#0E7490', icon: '🔒' },
  ];

  return (
    <div ref={ref} style={chartContainer}>
      <p style={chartTitle}>Figure 3 &mdash; The Iceberg: Hidden Complexity Layers</p>

      {/* Iceberg visualization */}
      <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
        {/* Waterline */}
        <div style={{
          position: 'relative', display: 'flex', flexDirection: 'column', gap: '3px',
        }}>
          {layers.map((l, i) => {
            const widthPct = 30 + (i * 17.5);
            return (
              <div
                key={l.name}
                onMouseEnter={() => setActiveLayer(i)}
                onMouseLeave={() => setActiveLayer(null)}
                style={{
                  width: visible ? `${Math.min(widthPct, 100)}%` : '0%',
                  height: '40px',
                  background: activeLayer === i
                    ? `linear-gradient(90deg, ${l.color}44, ${l.color}88)`
                    : `linear-gradient(90deg, ${l.color}22, ${l.color}44)`,
                  borderRadius: '6px',
                  margin: '0 auto',
                  transition: `width 1s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.15}s, background 0.2s`,
                  cursor: 'default',
                  display: 'flex', alignItems: 'center', paddingLeft: '1rem', gap: '0.5rem',
                  border: `0.5px solid ${activeLayer === i ? `${l.color}55` : `${l.color}22`}`,
                  position: 'relative',
                }}
              >
                <span style={{ fontSize: '0.9rem' }}>{l.icon}</span>
                <span style={{
                  fontFamily: '"SF Mono", monospace', fontSize: '0.7rem',
                  color: activeLayer === i ? 'white' : 'rgba(255,255,255,0.5)',
                  transition: 'color 0.2s', whiteSpace: 'nowrap',
                }}>{l.name}</span>
                <span style={{
                  fontFamily: '"SF Mono", monospace', fontSize: '0.65rem',
                  color: l.color, marginLeft: 'auto', paddingRight: '0.75rem',
                }}>{l.pct}%</span>
                {i === 0 && (
                  <div style={{
                    position: 'absolute', right: '-70px', top: '50%', transform: 'translateY(-50%)',
                    fontFamily: '"SF Mono", monospace', fontSize: '0.6rem',
                    color: 'rgba(74, 158, 255, 0.5)', whiteSpace: 'nowrap',
                  }}>← Visible</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Waterline indicator */}
        <div style={{
          position: 'absolute', top: '42px', left: 0, right: 0,
          borderTop: '1px dashed rgba(74, 158, 255, 0.3)',
        }}>
          <span style={{
            position: 'absolute', right: '0', top: '-8px',
            fontFamily: '"SF Mono", monospace', fontSize: '0.55rem',
            color: 'rgba(74, 158, 255, 0.4)',
          }}>WATERLINE ▼</span>
        </div>
      </div>

      {/* Detail panel */}
      <div style={{
        minHeight: '48px', padding: '0.75rem 1rem', marginTop: '1rem',
        background: activeLayer !== null ? `${layers[activeLayer].color}08` : 'rgba(255,255,255,0.02)',
        border: `0.5px solid ${activeLayer !== null ? `${layers[activeLayer].color}22` : 'rgba(255,255,255,0.06)'}`,
        borderRadius: '8px', transition: 'all 0.3s ease',
      }}>
        {activeLayer !== null ? (
          <>
            <span style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.8rem', color: layers[activeLayer].color, fontWeight: 600 }}>
              {layers[activeLayer].name}
            </span>
            <p style={{ fontFamily: 'NeueMontreal-Light, sans-serif', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', margin: '0.3rem 0 0', lineHeight: 1.5 }}>
              {layers[activeLayer].desc}
            </p>
          </>
        ) : (
          <p style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
            Hover over a layer to explore the hidden complexity
          </p>
        )}
      </div>
      <p style={sourceText}>Source: Adapted from enterprise architecture research, Gartner & Davenport (1998)</p>
    </div>
  );
};

// ─── Enterprise Software: Market Size ────────────────────────

export const EnterpriseMarketSizeChart = () => {
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

  const segments = [
    { name: 'ERP', revenue: 52, share: 'SAP 24%, Oracle 12%', color: '#4A9EFF', companies: 'SAP, Oracle, Microsoft' },
    { name: 'CRM', revenue: 69, share: 'Salesforce 23%', color: '#06B6D4', companies: 'Salesforce, Microsoft, Oracle' },
    { name: 'SCM', revenue: 24, share: 'SAP 17%, Oracle 14%', color: '#38BDF8', companies: 'SAP, Oracle, Blue Yonder' },
    { name: 'HCM', revenue: 31, share: 'Workday 15%', color: '#67E8F9', companies: 'Workday, SAP, ADP' },
    { name: 'BI & Analytics', revenue: 29, share: 'Microsoft 20%', color: '#A5F3FC', companies: 'Microsoft, Salesforce, SAP' },
  ];

  const maxRev = 75;

  return (
    <div ref={ref} style={chartContainer}>
      <p style={chartTitle}>Figure 4 &mdash; Enterprise Software Market by Segment ($B Annual Revenue)</p>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', height: '180px', padding: '0 1rem' }}>
        {segments.map((s, i) => (
          <div
            key={s.name}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'flex-end', height: '100%', cursor: 'default',
            }}
          >
            {/* Value label */}
            <span style={{
              fontFamily: '"SF Mono", monospace', fontSize: '0.75rem',
              color: hovered === i ? 'white' : s.color,
              fontWeight: 600, marginBottom: '0.35rem',
              opacity: visible ? 1 : 0, transition: 'opacity 0.5s',
              transitionDelay: `${i * 0.12 + 0.8}s`,
            }}>${s.revenue}B</span>

            {/* Bar */}
            <div style={{
              width: '100%', maxWidth: '80px',
              height: visible ? `${(s.revenue / maxRev) * 150}px` : '0px',
              background: hovered === i
                ? `linear-gradient(180deg, ${s.color}CC, ${s.color}55)`
                : `linear-gradient(180deg, ${s.color}66, ${s.color}22)`,
              borderRadius: '6px 6px 2px 2px',
              transition: `height 1.2s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.12}s, background 0.2s`,
              border: `0.5px solid ${hovered === i ? `${s.color}88` : `${s.color}33`}`,
            }} />

            {/* Label */}
            <span style={{
              fontFamily: '"SF Mono", monospace', fontSize: '0.7rem',
              color: hovered === i ? 'white' : 'rgba(255,255,255,0.5)',
              marginTop: '0.5rem', textAlign: 'center', transition: 'color 0.2s',
            }}>{s.name}</span>
          </div>
        ))}
      </div>

      {/* Hover detail */}
      <div style={{
        minHeight: '40px', padding: '0.6rem 0.8rem', marginTop: '1rem',
        background: hovered !== null ? `${segments[hovered].color}08` : 'rgba(255,255,255,0.02)',
        border: `0.5px solid ${hovered !== null ? `${segments[hovered].color}22` : 'rgba(255,255,255,0.06)'}`,
        borderRadius: '8px', transition: 'all 0.3s ease',
      }}>
        {hovered !== null ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.75rem', color: segments[hovered].color }}>
              {segments[hovered].name}: {segments[hovered].share}
            </span>
            <span style={{ fontFamily: 'NeueMontreal-Light, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
              Top vendors: {segments[hovered].companies}
            </span>
          </div>
        ) : (
          <p style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
            Hover over a segment to see market leaders
          </p>
        )}
      </div>

      <div style={{
        marginTop: '0.75rem', padding: '0.6rem 0.8rem',
        background: 'rgba(74, 158, 255, 0.06)',
        border: '0.5px solid rgba(74, 158, 255, 0.12)',
        borderRadius: '6px',
      }}>
        <p style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
          Combined enterprise software market: <strong style={{ color: '#4A9EFF' }}>$205B+</strong> annual revenue. The top 5 vendors capture over 50% of total spend.
        </p>
      </div>
      <p style={sourceText}>Source: Gartner Market Share Analysis 2024, IDC Enterprise Software Forecast</p>
    </div>
  );
};

// ─── Attention Economy: Attention Span Decline ───────────────

export const AttentionSpanChart = () => {
  const [visible, setVisible] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const data = [
    { year: 2000, seconds: 12, event: 'Pre-smartphone era' },
    { year: 2004, seconds: 10.5, event: 'Facebook launches' },
    { year: 2007, seconds: 9.5, event: 'iPhone released' },
    { year: 2010, seconds: 8.5, event: 'Instagram launches' },
    { year: 2013, seconds: 8.0, event: 'Vine popularizes short video' },
    { year: 2016, seconds: 7.5, event: 'TikTok precursor (Musical.ly)' },
    { year: 2019, seconds: 6.8, event: 'TikTok goes mainstream' },
    { year: 2022, seconds: 6.0, event: 'Reels, Shorts, infinite scroll' },
    { year: 2024, seconds: 5.5, event: 'AI-curated feeds everywhere' },
  ];

  const w = 580, h = 200;
  const pL = 50, pR = 20, pT = 15, pB = 35;
  const cW = w - pL - pR, cH = h - pT - pB;
  const toX = (i: number) => pL + (i / (data.length - 1)) * cW;
  const toY = (v: number) => pT + cH - ((v - 4) / 10) * cH;

  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(d.seconds)}`).join(' ');
  const areaPath = linePath + ` L ${toX(data.length - 1)} ${toY(4)} L ${toX(0)} ${toY(4)} Z`;

  const nearIdx = hoveredIdx ?? data.length - 1;

  return (
    <div ref={ref} style={chartContainer}>
      <p style={chartTitle}>Figure 1 &mdash; Average Sustained Attention Span (Seconds) Over Time</p>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        style={{ width: '100%', height: 'auto' }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * w;
          const idx = Math.round(Math.max(0, Math.min(data.length - 1, ((x - pL) / cW) * (data.length - 1))));
          setHoveredIdx(idx);
        }}
        onMouseLeave={() => setHoveredIdx(null)}
      >
        {/* Grid */}
        {[4, 6, 8, 10, 12, 14].map(v => (
          <g key={v}>
            <line x1={pL} y1={toY(v)} x2={w - pR} y2={toY(v)} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
            <text x={pL - 4} y={toY(v) + 3} textAnchor="end" fill="rgba(255,255,255,0.25)" fontSize="7" fontFamily="monospace">{v}s</text>
          </g>
        ))}

        {/* Goldfish line at 9s */}
        <line x1={pL} y1={toY(9)} x2={w - pR} y2={toY(9)}
          stroke="rgba(245, 158, 11, 0.2)" strokeWidth="1" strokeDasharray="4 4" />
        <text x={w - pR - 2} y={toY(9) - 4} textAnchor="end" fill="rgba(245, 158, 11, 0.4)" fontSize="6.5" fontFamily="monospace">
          Goldfish: 9s
        </text>

        {/* Area */}
        <path d={areaPath} fill="rgba(232, 85, 74, 0.08)" opacity={visible ? 1 : 0} style={{ transition: 'opacity 1.5s' }} />

        {/* Line */}
        <path d={linePath} fill="none" stroke="#E8554A" strokeWidth="2.5"
          strokeDasharray={visible ? '0' : '2000'} strokeDashoffset={visible ? '0' : '2000'}
          style={{ transition: 'stroke-dashoffset 2s ease-out' }} />

        {/* Data points */}
        {data.map((d, i) => (
          <circle key={i} cx={toX(i)} cy={toY(d.seconds)} r={hoveredIdx === i ? 6 : 3}
            fill={hoveredIdx === i ? '#E8554A' : '#E8554A88'}
            stroke={hoveredIdx === i ? 'white' : 'none'} strokeWidth="1.5"
            style={{ transition: 'all 0.2s' }} />
        ))}

        {/* Year labels */}
        {data.filter((_, i) => i % 2 === 0 || i === data.length - 1).map((d, _, arr) => {
          const i = data.indexOf(d);
          return (
            <text key={d.year} x={toX(i)} y={h - 5} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="7" fontFamily="monospace">
              {d.year}
            </text>
          );
        })}

        {/* Hover crosshair */}
        {hoveredIdx !== null && (
          <line x1={toX(hoveredIdx)} y1={pT} x2={toX(hoveredIdx)} y2={pT + cH}
            stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" strokeDasharray="3 3" />
        )}
      </svg>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.75rem', color: '#E8554A' }}>
          {data[nearIdx].year}: {data[nearIdx].seconds}s avg. attention
        </span>
        <span style={{ fontFamily: 'NeueMontreal-Light, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>
          {data[nearIdx].event}
        </span>
      </div>

      <div style={{
        marginTop: '0.75rem', padding: '0.6rem 0.8rem',
        background: 'rgba(232, 85, 74, 0.06)',
        border: '0.5px solid rgba(232, 85, 74, 0.12)',
        borderRadius: '6px',
      }}>
        <p style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
          Average attention span has dropped <strong style={{ color: '#E8554A' }}>54%</strong> since 2000, falling below the commonly cited goldfish benchmark of 9 seconds.
        </p>
      </div>
      <p style={sourceText}>Source: Microsoft Attention Span Study (2015), Gloria Mark UC Irvine (2023)</p>
    </div>
  );
};

// ─── Attention Economy: Dopamine Feedback Loop ───────────────

export const DopamineFeedbackChart = () => {
  const [visible, setVisible] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const steps = [
    { name: 'Notification', desc: 'A buzz, a red badge, a sound. The brain detects a potential social reward.', icon: '🔔', color: '#F59E0B' },
    { name: 'Dopamine Spike', desc: 'Anticipation of reward triggers dopamine release. You feel compelled to check.', icon: '⚡', color: '#E8554A' },
    { name: 'Variable Reward', desc: 'Sometimes great content, sometimes nothing. The unpredictability maximizes engagement.', icon: '🎰', color: '#F97316' },
    { name: 'Scroll / Consume', desc: 'Infinite scroll removes stopping cues. Each swipe is a new potential reward.', icon: '📱', color: '#EF4444' },
    { name: 'Tolerance', desc: 'The baseline shifts. More stimulation needed for the same dopamine response.', icon: '📉', color: '#DC2626' },
    { name: 'Craving', desc: 'Without the stimulus, restlessness and boredom emerge. The cycle restarts.', icon: '🔄', color: '#F59E0B' },
  ];

  return (
    <div ref={ref} style={chartContainer}>
      <p style={chartTitle}>Figure 2 &mdash; The Dopamine Feedback Loop (Interactive)</p>

      {/* Circular loop visualization */}
      <svg viewBox="0 0 400 260" style={{ width: '100%', maxWidth: '500px', height: 'auto', margin: '0 auto', display: 'block' }}>
        {/* Circular path */}
        <ellipse cx="200" cy="125" rx="150" ry="90" fill="none"
          stroke="rgba(232, 85, 74, 0.12)" strokeWidth="2"
          strokeDasharray={visible ? '0' : '1000'} strokeDashoffset={visible ? '0' : '1000'}
          style={{ transition: 'stroke-dashoffset 2s ease-out' }} />

        {/* Arrow indicators on the path */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
          const rad = (angle - 90) * Math.PI / 180;
          const x = 200 + 150 * Math.cos(rad);
          const y = 125 + 90 * Math.sin(rad);
          return (
            <g key={i}
              onMouseEnter={() => setActiveStep(i)}
              onMouseLeave={() => setActiveStep(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle cx={x} cy={y} r={activeStep === i ? 22 : 18}
                fill={activeStep === i ? `${steps[i].color}33` : `${steps[i].color}15`}
                stroke={steps[i].color}
                strokeWidth={activeStep === i ? 2 : 1}
                style={{ transition: 'all 0.2s' }} />
              <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle"
                fontSize="14" style={{ transition: 'all 0.2s' }}>
                {steps[i].icon}
              </text>
              <text x={x} y={y + (angle > 90 && angle < 270 ? 30 : -26)}
                textAnchor="middle" fill={activeStep === i ? steps[i].color : 'rgba(255,255,255,0.4)'}
                fontSize="7" fontFamily="monospace" style={{ transition: 'fill 0.2s' }}>
                {steps[i].name}
              </text>
            </g>
          );
        })}

        {/* Center label */}
        <text x="200" y="122" textAnchor="middle" fill="rgba(232, 85, 74, 0.3)" fontSize="8" fontFamily="monospace">
          FEEDBACK
        </text>
        <text x="200" y="133" textAnchor="middle" fill="rgba(232, 85, 74, 0.3)" fontSize="8" fontFamily="monospace">
          LOOP
        </text>
      </svg>

      {/* Detail panel */}
      <div style={{
        minHeight: '52px', padding: '0.75rem 1rem',
        background: activeStep !== null ? `${steps[activeStep].color}08` : 'rgba(255,255,255,0.02)',
        border: `0.5px solid ${activeStep !== null ? `${steps[activeStep].color}22` : 'rgba(255,255,255,0.06)'}`,
        borderRadius: '8px', transition: 'all 0.3s ease', marginTop: '0.5rem',
      }}>
        {activeStep !== null ? (
          <>
            <span style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.8rem', color: steps[activeStep].color, fontWeight: 600 }}>
              {steps[activeStep].icon} {steps[activeStep].name}
            </span>
            <p style={{ fontFamily: 'NeueMontreal-Light, sans-serif', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', margin: '0.3rem 0 0', lineHeight: 1.5 }}>
              {steps[activeStep].desc}
            </p>
          </>
        ) : (
          <p style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
            Hover over a step to explore the dopamine feedback loop
          </p>
        )}
      </div>
      <p style={sourceText}>Adapted from Huberman Lab & Anna Lembke, "Dopamine Nation" (2021)</p>
    </div>
  );
};

// ─── Attention Economy: Deep vs Shallow Work ─────────────────

export const DeepVsShallowChart = () => {
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

  const comparison = [
    { metric: 'Avg. Hours Per Day', deep: '1.5', shallow: '6.5', deepPct: 19, shallowPct: 81 },
    { metric: 'Value Per Hour', deep: '$450', shallow: '$35', deepPct: 93, shallowPct: 7 },
    { metric: 'Automation Risk', deep: 'Low', shallow: 'High', deepPct: 15, shallowPct: 85 },
    { metric: 'Replaceability', deep: 'Rare', shallow: 'Common', deepPct: 10, shallowPct: 90 },
  ];

  return (
    <div ref={ref} style={chartContainer}>
      <p style={chartTitle}>Figure 3 &mdash; Deep Work vs. Shallow Work: The Productivity Gap</p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {/* Deep Work Card */}
        <div
          onMouseEnter={() => setHovered('deep')}
          onMouseLeave={() => setHovered(null)}
          style={{
            flex: '1 1 220px', padding: '1.25rem',
            background: hovered === 'deep' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255,255,255,0.02)',
            border: `0.5px solid ${hovered === 'deep' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: '10px', cursor: 'default', transition: 'all 0.3s ease',
            opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(15px)',
            transitionDelay: '0.2s',
          }}
        >
          <p style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.85rem', color: '#F59E0B', margin: '0 0 0.75rem', fontWeight: 600 }}>
            Deep Work
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[
              'Original research & strategy',
              'Complex problem-solving',
              'Creative breakthroughs',
              'Architecture & system design',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B', flexShrink: 0 }} />
                <span style={{ fontFamily: 'NeueMontreal-Light, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: '1rem', padding: '0.5rem 0.75rem',
            background: 'rgba(245, 158, 11, 0.08)', borderRadius: '6px',
          }}>
            <span style={{ fontFamily: '"SF Mono", monospace', fontSize: '1.5rem', color: '#F59E0B', fontWeight: 700 }}>
              {visible ? '4' : '0'}x
            </span>
            <span style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginLeft: '0.5rem' }}>
              output multiplier
            </span>
          </div>
        </div>

        {/* Shallow Work Card */}
        <div
          onMouseEnter={() => setHovered('shallow')}
          onMouseLeave={() => setHovered(null)}
          style={{
            flex: '1 1 220px', padding: '1.25rem',
            background: hovered === 'shallow' ? 'rgba(232, 85, 74, 0.08)' : 'rgba(255,255,255,0.02)',
            border: `0.5px solid ${hovered === 'shallow' ? 'rgba(232, 85, 74, 0.25)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: '10px', cursor: 'default', transition: 'all 0.3s ease',
            opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(15px)',
            transitionDelay: '0.35s',
          }}
        >
          <p style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.85rem', color: '#E8554A', margin: '0 0 0.75rem', fontWeight: 600 }}>
            Shallow Work
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[
              'Email & messaging replies',
              'Status meetings',
              'Administrative tasks',
              'Social media checking',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#E8554A', flexShrink: 0 }} />
                <span style={{ fontFamily: 'NeueMontreal-Light, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: '1rem', padding: '0.5rem 0.75rem',
            background: 'rgba(232, 85, 74, 0.08)', borderRadius: '6px',
          }}>
            <span style={{ fontFamily: '"SF Mono", monospace', fontSize: '1.5rem', color: '#E8554A', fontWeight: 700 }}>
              {visible ? '1' : '0'}x
            </span>
            <span style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginLeft: '0.5rem' }}>
              baseline output
            </span>
          </div>
        </div>
      </div>

      {/* Comparison bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {comparison.map((c, i) => (
          <div key={c.metric} style={{
            opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(8px)',
            transition: 'all 0.5s', transitionDelay: `${i * 0.1 + 0.6}s`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
              <span style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>{c.metric}</span>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <span style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.7rem', color: '#F59E0B' }}>{c.deep}</span>
                <span style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.7rem', color: '#E8554A' }}>{c.shallow}</span>
              </div>
            </div>
            <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', background: 'rgba(255,255,255,0.04)' }}>
              <div style={{
                width: `${c.deepPct}%`, background: 'rgba(245, 158, 11, 0.5)',
                transition: 'width 1s', transitionDelay: `${i * 0.1 + 0.8}s`,
              }} />
              <div style={{
                width: `${c.shallowPct}%`, background: 'rgba(232, 85, 74, 0.3)',
                transition: 'width 1s', transitionDelay: `${i * 0.1 + 0.8}s`,
              }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '1rem', padding: '0.6rem 0.8rem',
        background: 'rgba(245, 158, 11, 0.06)',
        border: '0.5px solid rgba(245, 158, 11, 0.12)',
        borderRadius: '6px',
      }}>
        <p style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
          The average knowledge worker spends <strong style={{ color: '#E8554A' }}>81%</strong> of their day on shallow work. The <strong style={{ color: '#F59E0B' }}>19%</strong> spent in deep focus produces the majority of their economic value.
        </p>
      </div>
      <p style={sourceText}>Source: Cal Newport, "Deep Work" (2016); Gloria Mark, UC Irvine research (2023)</p>
    </div>
  );
};

// ─── Attention Economy: Focus Advantage Over Time ────────────

export const FocusAdvantageChart = () => {
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

  const years = Array.from({ length: 21 }, (_, i) => i);
  const focused = years.map(y => 100 * Math.pow(1.15, y));       // 15% annual growth from deep work
  const distracted = years.map(y => 100 * Math.pow(1.03, y));    // 3% from shallow
  const maxVal = focused[20];

  const w = 580, h = 210;
  const pL = 50, pR = 60, pT = 15, pB = 30;
  const cW = w - pL - pR, cH = h - pT - pB;

  const toY = (v: number) => {
    const logV = Math.log(Math.max(v, 50));
    const logMax = Math.log(maxVal * 1.2);
    const logMin = Math.log(80);
    return pT + cH - ((logV - logMin) / (logMax - logMin)) * cH;
  };
  const toX = (yr: number) => pL + (yr / 20) * cW;

  const focusedPath = years.map((y, i) => `${i === 0 ? 'M' : 'L'} ${toX(y)} ${toY(focused[y])}`).join(' ');
  const distractedPath = years.map((y, i) => `${i === 0 ? 'M' : 'L'} ${toX(y)} ${toY(distracted[y])}`).join(' ');

  const nearYear = hoveredYear ?? 20;
  const ratio = (focused[nearYear] / distracted[nearYear]).toFixed(1);

  return (
    <div ref={ref} style={chartContainer}>
      <p style={chartTitle}>Figure 4 &mdash; The Competitive Advantage of Focus (Career Output Over 20 Years)</p>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        style={{ width: '100%', height: 'auto' }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * w;
          const year = Math.round(Math.max(0, Math.min(20, ((x - pL) / cW) * 20)));
          setHoveredYear(year);
        }}
        onMouseLeave={() => setHoveredYear(null)}
      >
        {/* Grid */}
        <line x1={pL} y1={toY(100)} x2={w - pR} y2={toY(100)} stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" strokeDasharray="4 4" />

        {/* Gap fill between curves */}
        {visible && (
          <path
            d={`${focusedPath} L ${toX(20)} ${toY(distracted[20])} ${years.slice().reverse().map((y, i) => `L ${toX(y)} ${toY(distracted[y])}`).join(' ')} Z`}
            fill="rgba(245, 158, 11, 0.04)"
          />
        )}

        {/* Focused line */}
        <path d={focusedPath} fill="none" stroke="#F59E0B" strokeWidth="2.5"
          strokeDasharray={visible ? '0' : '2000'} strokeDashoffset={visible ? '0' : '2000'}
          style={{ transition: 'stroke-dashoffset 2.5s ease-out' }} />

        {/* Distracted line */}
        <path d={distractedPath} fill="none" stroke="#E8554A" strokeWidth="2" opacity="0.7"
          strokeDasharray={visible ? '0' : '2000'} strokeDashoffset={visible ? '0' : '2000'}
          style={{ transition: 'stroke-dashoffset 2.5s ease-out 0.3s' }} />

        {/* End labels */}
        <text x={w - pR + 5} y={toY(focused[20]) + 4} fill="#F59E0B" fontSize="8" fontFamily="monospace" fontWeight="bold">
          {(focused[20] / 100).toFixed(0)}x
        </text>
        <text x={w - pR + 5} y={toY(distracted[20]) + 4} fill="#E8554A" fontSize="8" fontFamily="monospace">
          {(distracted[20] / 100).toFixed(1)}x
        </text>

        {/* Year labels */}
        {[0, 5, 10, 15, 20].map(y => (
          <text key={y} x={toX(y)} y={h - 5} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="7" fontFamily="monospace">
            Yr {y}
          </text>
        ))}

        {/* Hover */}
        {hoveredYear !== null && (
          <>
            <line x1={toX(hoveredYear)} y1={pT} x2={toX(hoveredYear)} y2={h - pB}
              stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" strokeDasharray="3 3" />
            <circle cx={toX(hoveredYear)} cy={toY(focused[hoveredYear])} r="4" fill="#F59E0B" />
            <circle cx={toX(hoveredYear)} cy={toY(distracted[hoveredYear])} r="4" fill="#E8554A" />
          </>
        )}
      </svg>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }} />
          <span style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
            Deep Focus: <strong style={{ color: '#F59E0B' }}>{(focused[nearYear] / 100).toFixed(1)}x</strong>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#E8554A' }} />
          <span style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
            Distracted: <strong style={{ color: '#E8554A' }}>{(distracted[nearYear] / 100).toFixed(1)}x</strong>
          </span>
        </div>
        <span style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
          Year {nearYear} &mdash; {ratio}x gap
        </span>
      </div>

      <div style={{
        marginTop: '1rem', padding: '0.75rem 1rem',
        background: 'rgba(245, 158, 11, 0.06)',
        border: '0.5px solid rgba(245, 158, 11, 0.15)',
        borderRadius: '8px',
      }}>
        <p style={{ fontFamily: '"SF Mono", monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
          After 20 years, the focused individual has produced <strong style={{ color: '#F59E0B' }}>{(focused[20] / distracted[20]).toFixed(0)}x</strong> more cumulative output than the chronically distracted one. Same talent. Same hours. Different attention management.
        </p>
      </div>
      <p style={sourceText}>Model based on Newport (2016) deep work productivity research and compound skill growth</p>
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
  'enterprise-cost-breakdown': EnterpriseCostBreakdownChart,
  'switching-cost': SwitchingCostChart,
  'process-complexity': ProcessComplexityChart,
  'enterprise-market-size': EnterpriseMarketSizeChart,
  'attention-span': AttentionSpanChart,
  'dopamine-feedback': DopamineFeedbackChart,
  'deep-vs-shallow': DeepVsShallowChart,
  'focus-advantage': FocusAdvantageChart,
};
