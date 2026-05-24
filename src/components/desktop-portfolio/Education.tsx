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
      company: "american international school in riyadh",
      role: "2025-present",
      location: "riyadh, saudi arabia",
      description: "self-studying ap precalc, ap psych, and ap compsci a while building across robotics, ai, and products.",
      logo: "/images/logosicons/aisr.png",
      logoRound: false,
      logoSize: 55,
      detail: {
        type: 'education' as const,
        id: 1,
        institution: "american international school in riyadh",
        logo: "/images/logosicons/aisr.png",
        gpa: "",
        academics: [],
        activities: [
          "self-studying ap precalc, ap psych, and ap compsci a",
          "highest achievable level of maths; one year of aa sl in 10th grade, 1 of 4 students in grade level",
          "aspiring doctors' club: promoted to leader within first year; 14 recurring members",
          "jv boys' badminton",
          "#2 seed on varsity boys' tennis; season cancelled due to geopolitical conflict"
        ],
        achievements: [
          "building products while keeping school as the operating base"
        ],
        reflection: "current school chapter: harder academics, more responsibility, and more room to build."
      } satisfies EducationDetail
    }
  ];

  const pastEducation = [
    {
      id: 2,
      company: "the pingry school",
      role: "2021-2025",
      location: "basking ridge, nj",
      description: "debate, engineering, affinity leadership, tennis, swim, and early cs self-study.",
      logo: "/images/logosicons/pingry.png",
      logoRound: false,
      logoSize: 55,
      detail: {
        type: 'education' as const,
        id: 2,
        institution: "the pingry school",
        logo: "/images/logosicons/pingry.png",
        gpa: "",
        academics: [],
        activities: [
          "self-studied ap compsci principles; scored 5/5",
          "public forum debate club: 1st place w/ undefeated 5-0 record at horace mann juniors invitational",
          "muslim affinity group: leader; 8 recurring members; weekly meetings",
          "pingry research and innovation in modern engineering: 12 recurring members; 2 speaker sessions w/ local engineering professors",
          "f1 club",
          "jv boys' tennis",
          "jv boys' swim: 1st place in exhibition 50 at lawrenceville state championships"
        ],
        achievements: [
          "built the habit of joining technical, academic, and community work early"
        ],
        reflection: "pingry was where school became more than classes: debate, engineering, community, and competition."
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
              education
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
                education
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
            education
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
