import { useState, useEffect, useRef } from 'react';
import ExperienceCard from './ExperienceCard';
import { EducationContent } from './DetailPanel';
import type { EducationDetail, DetailContent, PitchDeck } from './DetailPanel';

interface EducationProps {
  onCardClick?: (detail: DetailContent) => void;
  windowMode?: boolean;
}

const Education = ({ onCardClick, windowMode }: EducationProps) => {
  const [hasAnimated, setHasAnimated] = useState(windowMode ?? false);
  const [selectedDetail, setSelectedDetail] = useState<EducationDetail | null>(null);
  const [viewState, setViewState] = useState<'list' | 'fading-out' | 'detail' | 'fading-back'>('list');
  const [selectedCert, setSelectedCert] = useState<{ title: string; issuer: string; date: string; pdfUrl: string; logo: string; reflection: string } | null>(null);
  const educationRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (windowMode) return;
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, 2600);

    return () => clearTimeout(timer);
  }, [windowMode]);

  const currentEducation = [
    {
      id: 1,
      company: "Abdullah Education Placeholder",
      role: "Student builder",
      location: "Riyadh, Saudi Arabia",
      description: "Static education placeholder for Abdullah Sultan. Final education details will be added later.",
      logo: "/icons/folder.png",
      logoRound: true,
      logoSize: 55,
      detail: {
        type: 'education' as const,
        id: 1,
        institution: "Abdullah Education Placeholder",
        logo: "/icons/folder.png",
        gpa: "",
        courses: [
          { code: "AI 101", name: "AI project exploration" },
          { code: "ROB 101", name: "Robotics project exploration" },
          { code: "QF 101", name: "Quant finance project exploration" },
          { code: "HW 101", name: "Creative hardware prototyping" }
        ],
        activities: [
          "Startup idea exploration",
          "Robotics and hardware experiments",
          "AbdullahOS planning"
        ],
        achievements: [
          "Placeholder achievement"
        ],
        reflection: "Placeholder education copy for Abdullah Sultan. This will be replaced with real education details in a later stage."
      } satisfies EducationDetail
    }
  ];

  const pastEducation = [
    {
      id: 2,
      company: "Learning Track Placeholder",
      role: "Startups, robotics, AI, and quant finance",
      location: "Riyadh, Saudi Arabia",
      description: "Static learning-history placeholder for Abdullah's portfolio shell.",
      logo: "/icons/folder.png",
      logoRound: true,
      logoSize: 55,
      detail: {
        type: 'education' as const,
        id: 2,
        institution: "Learning Track Placeholder",
        logo: "/icons/folder.png",
        gpa: "",
        courses: [
          { code: "STARTUP", name: "Startup project shell" },
          { code: "QUANT", name: "Quant project shell" },
          { code: "ROBOT", name: "Robotics project shell" },
          { code: "HARDWARE", name: "Creative hardware project shell" }
        ],
        activities: [
          "Project Shell 01",
          "Project Shell 02",
          "Project Shell 03"
        ],
        achievements: [
          "Placeholder milestone"
        ],
        reflection: "Placeholder learning copy for Abdullah Sultan. Final writing will be added later."
      } satisfies EducationDetail
    }
  ];

  return (
    <div
      ref={educationRef}
      id="education"
      className="education-container"
      style={{
        position: 'relative',
        marginTop: windowMode ? '0' : '80px',
        marginLeft: 'auto',
        marginRight: 'auto',
        zIndex: 10,
        width: windowMode ? '100%' : '90%',
        maxWidth: windowMode ? 'none' : '1200px',
        minWidth: windowMode ? 'auto' : '320px',
        padding: windowMode ? '0' : undefined,
        height: windowMode ? '100%' : undefined,
        opacity: hasAnimated ? 1 : 0,
        transform: hasAnimated ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out'
      }}
    >
      {windowMode ? (
        /* Window mode: inline page transitions */
        <div ref={scrollRef} style={{
          height: '100%',
          overflowY: 'auto',
          position: 'relative',
        }}>
          {/* ── LIST VIEW ── */}
          <div style={{
            padding: 'clamp(0.75rem, 1.5vw, 1rem) clamp(1.25rem, 2.5vw, 2rem) clamp(0.5rem, 1vw, 0.75rem)',
            opacity: viewState === 'list' ? 1 : viewState === 'fading-out' ? 0 : 0,
            transform: viewState === 'list' ? 'scale(1)' : 'scale(0.97)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            pointerEvents: (viewState === 'list') ? 'auto' : 'none',
            position: (viewState === 'detail' || viewState === 'fading-back') ? 'absolute' : 'relative',
            inset: 0,
          }}>
            <h2 style={{
              fontSize: '1.2rem',
              color: 'rgba(255, 255, 255, 0.9)',
              fontFamily: '-apple-system, BlinkMacSystemFont, NeueMontreal-MediumItalic, sans-serif',
              fontStyle: 'italic',
              margin: '0 0 0.75rem 0',
              fontWeight: '600'
            }}>
              Education
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
              {currentEducation.map((edu) => (
                <ExperienceCard
                  key={edu.id}
                  experience={edu}
                  clickable={true}
                  onDetailClick={() => {
                    setSelectedDetail(edu.detail);
                    setViewState('fading-out');
                    setTimeout(() => {
                      setViewState('detail');
                      scrollRef.current?.scrollTo({ top: 0 });
                    }, 300);
                  }}
                  darkMode
                />
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', marginTop: '1rem' }}>
              {pastEducation.map((edu) => (
                <ExperienceCard
                  key={edu.id}
                  experience={edu}
                  clickable={true}
                  onDetailClick={() => {
                    setSelectedDetail(edu.detail);
                    setViewState('fading-out');
                    setTimeout(() => {
                      setViewState('detail');
                      scrollRef.current?.scrollTo({ top: 0 });
                    }, 300);
                  }}
                  darkMode
                />
              ))}
            </div>

            {/* ── Certifications ── */}
            <h3 style={{
              fontSize: '1.2rem',
              color: 'rgba(255, 255, 255, 0.9)',
              fontFamily: '-apple-system, BlinkMacSystemFont, NeueMontreal-MediumItalic, sans-serif',
              fontStyle: 'italic',
              margin: '1.25rem 0 0.75rem 0',
              fontWeight: '600',
            }}>
              Certifications
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
              {[
                {
                  title: 'Machine Learning for Trading Specialization',
                  issuer: 'Google Cloud Skills Boost',
                  date: 'Dec 2024',
                  credentialId: 'ERAU8H0QLX7N',
                  pdfUrl: '/google trading cloud .pdf',
                  logo: '/google_cloud_logo_icon_171058-1.png',
                  reflection: 'This specialization deepened my understanding of applying ML models to financial markets — from time series forecasting to reinforcement learning for portfolio optimization. It bridged the gap between my CS fundamentals and my interest in quantitative finance.',
                },
                {
                  title: 'Finance & Quantitative Modeling for Analysts',
                  issuer: 'Wharton Online',
                  date: 'Dec 2024',
                  credentialId: 'S2XHA24WPFWY',
                  pdfUrl: '/wharton certicate.pdf',
                  logo: '/wharton-shield.png',
                  reflection: 'Wharton\'s quantitative modeling program gave me a rigorous foundation in financial analysis — from valuation frameworks to risk modeling. It reinforced how to think about markets systematically, which directly informs how I build data-driven tools.',
                },
              ].map((cert) => (
                <div
                  key={cert.credentialId}
                  onClick={() => {
                    setSelectedCert(cert);
                    setSelectedDetail(null);
                    setViewState('fading-out');
                    setTimeout(() => {
                      setViewState('detail');
                      scrollRef.current?.scrollTo({ top: 0 });
                    }, 300);
                  }}
                  className="dark-experience-card"
                  style={{
                    width: '100%',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <img
                      src={cert.logo}
                      alt={cert.issuer}
                      style={{ width: 55, height: 55, objectFit: 'contain', borderRadius: 8, flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 'clamp(1rem, 2.5vw, 1.3rem)', fontWeight: 600, color: 'rgba(255, 255, 255, 0.95)', fontFamily: '-apple-system, BlinkMacSystemFont, NeueMontreal-Medium, sans-serif', lineHeight: 1.3 }}>
                        {cert.title}
                      </div>
                      <div style={{ fontSize: 'clamp(0.9rem, 2.2vw, 1rem)', color: 'rgba(255,255,255,0.7)', fontFamily: '-apple-system, BlinkMacSystemFont, NeueMontreal-Light, sans-serif', marginTop: '4px' }}>
                        {cert.issuer} · {cert.date}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── DETAIL VIEW ── */}
          {(selectedDetail || selectedCert) && (viewState === 'detail' || viewState === 'fading-back') && (
            <div style={{
              padding: 'clamp(0.75rem, 1.5vw, 1rem) clamp(1.5rem, 3vw, 2.5rem) clamp(1.5rem, 3vw, 2.5rem)',
              opacity: viewState === 'detail' ? 1 : 0,
              transform: viewState === 'detail' ? 'translateY(0)' : 'translateY(12px)',
              transition: 'opacity 0.35s ease, transform 0.35s ease',
            }}>
              {/* Back button */}
              <button
                onClick={() => {
                  setViewState('fading-back');
                  setTimeout(() => {
                    setSelectedDetail(null);
                    setSelectedCert(null);
                    setViewState('list');
                  }, 300);
                }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.5)', fontSize: '13px',
                  fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                  padding: '4px 0', marginBottom: '1.25rem',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Education
              </button>

              {selectedDetail ? (
                <EducationContent detail={selectedDetail} />
              ) : selectedCert ? (
                <div>
                  {/* Cert header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '1.25rem' }}>
                    <img
                      src={selectedCert.logo}
                      alt={selectedCert.issuer}
                      style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 8 }}
                    />
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff', fontFamily: "'SF Pro Display', -apple-system, sans-serif", lineHeight: 1.3 }}>
                        {selectedCert.title}
                      </div>
                      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontFamily: "'SF Pro Text', -apple-system, sans-serif", marginTop: '3px' }}>
                        {selectedCert.issuer} · {selectedCert.date}
                      </div>
                    </div>
                  </div>

                  {/* Reflection */}
                  <div style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '0.5px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    padding: '16px 18px',
                    marginBottom: '1.25rem',
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', fontFamily: "'SF Pro Text', -apple-system, sans-serif", marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      Reflection
                    </div>
                    <div style={{
                      fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                      lineHeight: 1.65, fontStyle: 'italic',
                    }}>
                      {selectedCert.reflection}
                    </div>
                  </div>

                  {/* Embedded PDF */}
                  <div style={{
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: '0.5px solid rgba(255,255,255,0.1)',
                  }}>
                    <iframe
                      src={selectedCert.pdfUrl}
                      style={{ width: '100%', height: '600px', border: 'none', background: '#fff' }}
                      title={selectedCert.title}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      ) : (
        /* Non-window mode: original light layout */
        <>
          <h2 style={{
            fontSize: '1.2rem',
            color: '#1d1d1f',
            fontFamily: '-apple-system, BlinkMacSystemFont, NeueMontreal-MediumItalic, sans-serif',
            fontStyle: 'italic',
            margin: '0 0 1rem 0',
            fontWeight: '600'
          }}>
            Education
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
            {currentEducation.map((edu) => (
              <ExperienceCard
                key={edu.id}
                experience={edu}
                clickable={true}
                onDetailClick={onCardClick ? () => onCardClick(edu.detail) : undefined}
              />
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', marginTop: '1.5rem' }}>
            {pastEducation.map((edu) => (
              <ExperienceCard
                key={edu.id}
                experience={edu}
                clickable={true}
                onDetailClick={onCardClick ? () => onCardClick(edu.detail) : undefined}
              />
            ))}
          </div>
        </>
      )}

      <style>{`
        @font-face {
          font-family: 'NeueMontreal-MediumItalic';
          src: url('/NeueMontreal-MediumItalic.otf') format('opentype');
          font-weight: 500;
          font-style: italic;
        }
        @media (max-width: 1200px) {
          .education-container { width: 95% !important; min-width: 300px !important; padding: 0 20px !important; }
        }
        @media (max-width: 768px) {
          .education-container { width: calc(95% - 40px) !important; min-width: 300px !important; padding: 0 20px !important; }
        }
      `}</style>
    </div>
  );
};

export default Education;
