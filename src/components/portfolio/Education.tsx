import { useState, useEffect, useRef } from 'react';
import ExperienceCard from './ExperienceCard';
import type { EducationDetail, DetailContent, PitchDeck } from './DetailPanel';

interface EducationProps {
  onCardClick?: (detail: DetailContent) => void;
}

const Education = ({ onCardClick }: EducationProps) => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const educationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, 2600);

    return () => clearTimeout(timer);
  }, []);

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
        marginTop: '80px',
        marginLeft: 'auto',
        marginRight: 'auto',
        zIndex: 10,
        width: '90%',
        maxWidth: '1200px',
        minWidth: '320px',
        opacity: hasAnimated ? 1 : 0,
        transform: hasAnimated ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out'
      }}
    >
      <h2 style={{
        fontSize: '1.5rem',
        color: 'rgba(255, 255, 255, 0.75)',
        fontFamily: 'NeueMontreal-MediumItalic, sans-serif',
        fontStyle: 'italic',
        margin: '0 0 1rem 0',
        fontWeight: '500'
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
