import { useState, useEffect, useRef } from 'react';
import ExperienceCard from './ExperienceCard';
import type { ExperienceDetail, DetailContent } from './DetailPanel';

interface ExperienceProps {
  onCardClick?: (detail: DetailContent) => void;
}

const Experience = ({ onCardClick }: ExperienceProps) => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const experienceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, 2700);

    return () => clearTimeout(timer);
  }, []);

  const experiences = [
    {
      id: 0,
      company: "AbdullahOS",
      role: "Main project shell",
      date: "Current",
      location: "Riyadh, Saudi Arabia",
      description: "Primary Abdullah-focused project shell for this static portfolio stage.",
      logo: "/terminal.png",
      detail: {
        type: 'experience' as const,
        id: 0,
        company: "AbdullahOS",
        role: "Main project shell",
        date: "Current",
        location: "Riyadh, Saudi Arabia",
        logo: "/terminal.png",
        timeline: [
          { month: "Stage 1", description: "Static AbdullahOS placeholder shell. Final project details will be added later." }
        ],
        reflection: "AbdullahOS is the main custom project/app shell for Abdullah Sultan's portfolio.",
        skillsLearned: ["AI", "Desktop UI", "Creative hardware", "Product thinking"],
        techStack: ["Astro", "React", "TypeScript"]
      } satisfies ExperienceDetail
    },
    {
      id: 1,
      company: "Startup Project Shell",
      role: "Placeholder experience",
      date: "TBD",
      location: "Riyadh, Saudi Arabia",
      description: "Static placeholder for future startup-related experience or projects.",
      logo: "/icons/folder.png",
      detail: {
        type: 'experience' as const,
        id: 1,
        company: "Startup Project Shell",
        role: "Placeholder experience",
        date: "TBD",
        location: "Riyadh, Saudi Arabia",
        logo: "/icons/folder.png",
        timeline: [
          { month: "Placeholder", description: "Future startup experience copy goes here." }
        ],
        reflection: "Placeholder copy for Abdullah's future startup-focused work.",
        skillsLearned: ["Startups", "Product", "Operations"],
        techStack: ["Placeholder"]
      } satisfies ExperienceDetail
    },
    {
      id: 2,
      company: "Robotics Project Shell",
      role: "Placeholder experience",
      date: "TBD",
      location: "Riyadh, Saudi Arabia",
      description: "Static placeholder for future robotics and creative hardware work.",
      logo: "/icons/folder.png",
      detail: {
        type: 'experience' as const,
        id: 2,
        company: "Robotics Project Shell",
        role: "Placeholder experience",
        date: "TBD",
        location: "Riyadh, Saudi Arabia",
        logo: "/icons/folder.png",
        timeline: [
          { month: "Placeholder", description: "Future robotics and hardware experience copy goes here." }
        ],
        reflection: "Placeholder copy for Abdullah's future robotics and hardware work.",
        skillsLearned: ["Robotics", "Hardware", "Prototyping"],
        techStack: ["Placeholder"]
      } satisfies ExperienceDetail
    }
  ];

  return (
    <div
      ref={experienceRef}
      id="experience"
      className="experience-container"
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
        Experience
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
        {experiences.map((experience) => (
          <ExperienceCard
            key={experience.id}
            experience={experience}
            clickable={true}
            onDetailClick={onCardClick ? () => onCardClick(experience.detail) : undefined}
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
          .experience-container { width: 95% !important; min-width: 300px !important; padding: 0 20px !important; }
        }
        @media (max-width: 768px) {
          .experience-container { width: calc(95% - 40px) !important; min-width: 300px !important; padding: 0 20px !important; }
        }
      `}</style>
    </div>
  );
};

export default Experience;
