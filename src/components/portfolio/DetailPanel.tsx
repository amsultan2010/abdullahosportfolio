import { useEffect, useRef } from 'react';

// ─── Type Definitions ───────────────────────────────────────

interface DetailCourse {
  code: string;
  name: string;
  grade?: string;
}

export interface EducationDetail {
  type: 'education';
  id: number;
  institution: string;
  logo?: string;
  logo2?: string;
  gpa?: string;
  courses: DetailCourse[];
  activities: string[];
  achievements: string[];
}

export interface TimelineEntry {
  month: string;
  description: string;
}

export interface ExperienceDetail {
  type: 'experience';
  id: number;
  company: string;
  role: string;
  logo?: string;
  timeline: TimelineEntry[];
  reflection: string;
  skillsLearned: string[];
  techStack: string[];
}

export interface ProjectDetail {
  type: 'project';
  id: number;
  title: string;
  gradient: string;
  architecture?: string;
  technicalChallenges: string[];
  lessonsLearned: string[];
  techStack: string[];
  repoUrl?: string;
}

export type DetailContent = EducationDetail | ExperienceDetail | ProjectDetail;

// ─── Component ──────────────────────────────────────────────

interface DetailPanelProps {
  detail: DetailContent;
  onClose: () => void;
}

const DetailPanel = ({ detail, onClose }: DetailPanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Escape key + body scroll lock
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  // Focus panel on mount
  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 200,
          animation: 'detailFadeIn 0.3s ease-out forwards'
        }}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100%',
          overflowY: 'auto',
          zIndex: 201,
          background: 'rgba(30, 30, 30, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderLeft: '0.5px solid rgba(255, 255, 255, 0.15)',
          animation: 'detailSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          outline: 'none'
        }}
        className="detail-panel"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close panel"
          style={{
            position: 'sticky',
            top: '1.5rem',
            float: 'right',
            marginRight: '1.5rem',
            zIndex: 10,
            background: 'rgba(255, 255, 255, 0.1)',
            border: '0.5px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '18px',
            fontFamily: 'NeueMontreal-Light, sans-serif',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
          }}
        >
          ✕
        </button>

        {/* Content */}
        <div style={{ padding: '2rem 2.5rem 3rem', clear: 'both' }}>
          {detail.type === 'education' && <EducationContent detail={detail} />}
          {detail.type === 'experience' && <ExperienceContent detail={detail} />}
          {detail.type === 'project' && <ProjectContent detail={detail} />}
        </div>
      </div>

      {/* Animations + Responsive */}
      <style>{`
        @keyframes detailSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes detailFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .detail-panel {
          width: 50%;
          max-width: 700px;
          min-width: 400px;
        }
        @media (max-width: 768px) {
          .detail-panel {
            width: 100% !important;
            min-width: unset !important;
            max-width: unset !important;
          }
        }
      `}</style>
    </>
  );
};

// ─── Education Detail ───────────────────────────────────────

const EducationContent = ({ detail }: { detail: EducationDetail }) => (
  <div>
    {/* Header */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
      {detail.logo && (
        <img src={detail.logo} alt="" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
      )}
      {detail.logo2 && (
        <img src={detail.logo2} alt="" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
      )}
      <div>
        <h2 style={{ fontFamily: 'NeueMontreal-Medium, sans-serif', fontSize: '1.5rem', color: 'white', margin: 0 }}>
          {detail.institution}
        </h2>
        {detail.gpa && (
          <p style={{ fontFamily: 'NeueMontreal-Light, sans-serif', color: 'rgba(255,255,255,0.6)', margin: '0.25rem 0 0', fontSize: '0.95rem' }}>
            GPA: {detail.gpa}
          </p>
        )}
      </div>
    </div>

    {/* Courses */}
    {detail.courses.length > 0 && (
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={sectionTitleStyle}>Courses</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.75rem' }}>
          {detail.courses.map((c, i) => (
            <div key={i} style={pillCardStyle}>
              <span style={{ fontFamily: 'NeueMontreal-Medium, sans-serif', color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem' }}>
                {c.code}
              </span>
              <span style={{ fontFamily: 'NeueMontreal-Light, sans-serif', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>
                {c.name}
              </span>
              {c.grade && (
                <span style={{ fontFamily: 'NeueMontreal-Medium, sans-serif', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginLeft: 'auto' }}>
                  {c.grade}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Activities */}
    {detail.activities.length > 0 && (
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={sectionTitleStyle}>Activities</h3>
        <ul style={listStyle}>
          {detail.activities.map((a, i) => <li key={i} style={listItemStyle}>{a}</li>)}
        </ul>
      </div>
    )}

    {/* Achievements */}
    {detail.achievements.length > 0 && (
      <div>
        <h3 style={sectionTitleStyle}>Achievements</h3>
        <ul style={listStyle}>
          {detail.achievements.map((a, i) => <li key={i} style={listItemStyle}>{a}</li>)}
        </ul>
      </div>
    )}
  </div>
);

// ─── Experience Detail ──────────────────────────────────────

const ExperienceContent = ({ detail }: { detail: ExperienceDetail }) => (
  <div>
    {/* Header */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
      {detail.logo && (
        <img src={detail.logo} alt="" style={{ width: '50px', height: '50px', borderRadius: '10px', objectFit: 'contain' }} />
      )}
      <div>
        <h2 style={{ fontFamily: 'NeueMontreal-Medium, sans-serif', fontSize: '1.5rem', color: 'white', margin: 0 }}>
          {detail.company}
        </h2>
        <p style={{ fontFamily: 'NeueMontreal-Light, sans-serif', color: 'rgba(255,255,255,0.6)', margin: '0.25rem 0 0', fontSize: '0.95rem' }}>
          {detail.role}
        </p>
      </div>
    </div>

    {/* Timeline */}
    {detail.timeline.length > 0 && (
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={sectionTitleStyle}>Timeline</h3>
        <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid rgba(255,255,255,0.15)' }}>
          {detail.timeline.map((entry, i) => (
            <div key={i} style={{ marginBottom: '1.5rem', position: 'relative' }}>
              {/* Dot */}
              <div style={{
                position: 'absolute',
                left: '-1.75rem',
                top: '0.35rem',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.4)',
                border: '2px solid rgba(255,255,255,0.2)'
              }} />
              <p style={{ fontFamily: 'NeueMontreal-Medium, sans-serif', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', margin: '0 0 0.25rem' }}>
                {entry.month}
              </p>
              <p style={{ fontFamily: 'NeueMontreal-Light, sans-serif', color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem', margin: 0, lineHeight: '1.5' }}>
                {entry.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Reflection */}
    {detail.reflection && (
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={sectionTitleStyle}>Reflection</h3>
        <p style={{ fontFamily: 'NeueMontreal-Light, sans-serif', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: '1.7', margin: 0 }}>
          {detail.reflection}
        </p>
      </div>
    )}

    {/* Skills + Tech */}
    {detail.skillsLearned.length > 0 && (
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={sectionTitleStyle}>Skills Learned</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {detail.skillsLearned.map((s, i) => <span key={i} style={tagStyle}>{s}</span>)}
        </div>
      </div>
    )}
    {detail.techStack.length > 0 && (
      <div>
        <h3 style={sectionTitleStyle}>Tech Stack</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {detail.techStack.map((t, i) => <span key={i} style={tagStyle}>{t}</span>)}
        </div>
      </div>
    )}
  </div>
);

// ─── Project Detail ─────────────────────────────────────────

const ProjectContent = ({ detail }: { detail: ProjectDetail }) => (
  <div>
    {/* Gradient Header */}
    <div style={{
      width: '100%',
      height: '120px',
      borderRadius: '12px',
      background: detail.gradient,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '1.5rem'
    }}>
      <h2 style={{
        fontFamily: 'NeueMontreal-Medium, sans-serif',
        fontSize: '2rem',
        color: 'rgba(255,255,255,0.15)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase'
      }}>
        {detail.title}
      </h2>
    </div>

    <h2 style={{ fontFamily: 'NeueMontreal-Medium, sans-serif', fontSize: '1.5rem', color: 'white', margin: '0 0 1.5rem' }}>
      {detail.title}
    </h2>

    {/* Architecture */}
    {detail.architecture && (
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={sectionTitleStyle}>Architecture</h3>
        <p style={{ fontFamily: 'NeueMontreal-Light, sans-serif', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: '1.7', margin: 0 }}>
          {detail.architecture}
        </p>
      </div>
    )}

    {/* Technical Challenges */}
    {detail.technicalChallenges.length > 0 && (
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={sectionTitleStyle}>Technical Challenges</h3>
        <ol style={{ ...listStyle, paddingLeft: '1.25rem' }}>
          {detail.technicalChallenges.map((c, i) => <li key={i} style={listItemStyle}>{c}</li>)}
        </ol>
      </div>
    )}

    {/* Lessons */}
    {detail.lessonsLearned.length > 0 && (
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={sectionTitleStyle}>Lessons Learned</h3>
        <ul style={listStyle}>
          {detail.lessonsLearned.map((l, i) => <li key={i} style={listItemStyle}>{l}</li>)}
        </ul>
      </div>
    )}

    {/* Tech Stack */}
    {detail.techStack.length > 0 && (
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={sectionTitleStyle}>Tech Stack</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {detail.techStack.map((t, i) => <span key={i} style={tagStyle}>{t}</span>)}
        </div>
      </div>
    )}

    {/* Repo Link */}
    {detail.repoUrl && (
      <a
        href={detail.repoUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontFamily: 'NeueMontreal-Medium, sans-serif',
          color: 'rgba(255,255,255,0.7)',
          fontSize: '0.9rem',
          textDecoration: 'none',
          padding: '0.6rem 1.2rem',
          borderRadius: '8px',
          border: '0.5px solid rgba(255,255,255,0.2)',
          background: 'rgba(255,255,255,0.05)',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
      >
        View Repository →
      </a>
    )}
  </div>
);

// ─── Shared Styles ──────────────────────────────────────────

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: 'NeueMontreal-Medium, sans-serif',
  fontSize: '1rem',
  color: 'rgba(255, 255, 255, 0.5)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  margin: '0 0 1rem',
  fontWeight: 500
};

const pillCardStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.5rem 0.75rem',
  borderRadius: '8px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '0.5px solid rgba(255, 255, 255, 0.1)'
};

const tagStyle: React.CSSProperties = {
  fontFamily: 'NeueMontreal-Light, sans-serif',
  fontSize: '0.8rem',
  color: 'rgba(255, 255, 255, 0.65)',
  padding: '0.3rem 0.75rem',
  borderRadius: '20px',
  background: 'rgba(255, 255, 255, 0.08)',
  border: '0.5px solid rgba(255, 255, 255, 0.12)'
};

const listStyle: React.CSSProperties = {
  fontFamily: 'NeueMontreal-Light, sans-serif',
  color: 'rgba(255, 255, 255, 0.6)',
  fontSize: '0.9rem',
  lineHeight: '1.7',
  margin: 0,
  paddingLeft: '1rem'
};

const listItemStyle: React.CSSProperties = {
  marginBottom: '0.4rem'
};

export default DetailPanel;
