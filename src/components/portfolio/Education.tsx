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
