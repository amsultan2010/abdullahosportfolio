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

// ─── Chart Registry ───────────────────────────────────────────

export const chartRegistry: Record<string, React.FC> = {
  'return-gap': ReturnGapChart,
  'compound-growth': CompoundGrowthChart,
  'speculative-cycle': SpeculativeCycleChart,
  'spiva': SPIVAChart,
  'behavioral-biases': BehavioralBiasesChart,
};
