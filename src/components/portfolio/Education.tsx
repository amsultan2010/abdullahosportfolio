import { useState, useEffect, useRef } from 'react';
import ExperienceCard from './ExperienceCard';
import type { EducationDetail, DetailContent } from './DetailPanel';

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
      company: "Wilfrid Laurier University",
      role: "Computer Science",
      location: "Waterloo, ON",
      description: "Bachelor of Science in Computer Science (Management Option). Currently enrolled.",
      logo: "/laurier-seal.png",
      detail: {
        type: 'education' as const,
        id: 1,
        institution: "Wilfrid Laurier University",
        logo: "/laurier-seal.png",
        gpa: "",
        courses: [
          { code: "CP104", name: "Introduction to Programming" },
          { code: "CP164", name: "Data Structures" },
          { code: "CP264", name: "Data Structures & Algorithms II" },
          { code: "CP317", name: "Software Engineering" },
          { code: "CP363", name: "Database Systems" },
          { code: "CP372", name: "Computer Networks" },
          { code: "MA103", name: "Calculus I" },
          { code: "MA122", name: "Linear Algebra" },
          { code: "ST230", name: "Probability & Statistics" }
        ],
        activities: [
          "Laurier Computing Society",
          "Laurier Entrepreneurship Club"
        ],
        achievements: []
      } satisfies EducationDetail
    }
  ];

  const pastEducation = [
    {
      id: 2,
      company: "Waterloo + Laurier",
      role: "CS & Business Double Degree",
      location: "Waterloo, ON",
      description: "Enrolled in University of Waterloo Computer Science & Wilfrid Laurier BBA double degree program. Sep 2023 – 2025.",
      logo: "/waterloo-logo.png",
      logo2: "/laurier-seal.png",
      detail: {
        type: 'education' as const,
        id: 2,
        institution: "Waterloo + Laurier Double Degree",
        logo: "/waterloo-logo.png",
        logo2: "/laurier-seal.png",
        gpa: "",
        courses: [
          { code: "CS135", name: "Designing Functional Programs" },
          { code: "CS136", name: "Elementary Algorithm Design" },
          { code: "MATH135", name: "Algebra for Honours Mathematics" },
          { code: "MATH136", name: "Linear Algebra 1" },
          { code: "MATH137", name: "Calculus 1" },
          { code: "MATH138", name: "Calculus 2" },
          { code: "BU111", name: "Introduction to Business Organization" },
          { code: "BU121", name: "Functional Areas of the Organization" },
          { code: "EC120", name: "Introduction to Microeconomics" },
          { code: "EC140", name: "Introduction to Macroeconomics" }
        ],
        activities: [
          "University of Waterloo Computer Science Club",
          "Waterloo FinTech Club",
          "Laurier Entrepreneurs"
        ],
        achievements: [
          "Completed double degree program spanning two universities"
        ]
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
