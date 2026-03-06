import { useState, useEffect, useRef } from 'react';
import ExperienceCard from './ExperienceCard';

const Experience = () => {
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
      id: 1,
      company: "Augmentor Labs",
      role: "Software Engineering Intern, Cloud Infrastructure Team",
      location: "Palo Alto, CA",
      description: "Built event ingestion pipelines to S3/DynamoDB, webhook integrations for GitHub/Jira/Salesforce, and observability systems with dashboards and alerts. Reduced p95 ingestion latency by 35% and dropped mean-time-to-detect by 42%.",
      logo: "/augmentor-dark.svg"
    },
    {
      id: 2,
      company: "CIBC",
      role: "Data Scientist Intern, Technology Operations",
      location: "Toronto, ON",
      description: "Owned data contracts and CI/CD pipelines with GitHub Actions. Implemented feature flags, blue/green and canary rollouts. Created release/SLO dashboards for latency, error rate, and CTR impact.",
      logo: "/cibc-dark.svg"
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
      {/* Section Title */}
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

      {/* Experience Cards */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        width: '100%'
      }}>
        {experiences.map((experience) => (
          <ExperienceCard
            key={experience.id}
            experience={experience}
          />
        ))}
      </div>

      {/* Responsive CSS */}
      <style>{`
        @font-face {
          font-family: 'NeueMontreal-MediumItalic';
          src: url('/NeueMontreal-MediumItalic.otf') format('opentype');
          font-weight: 500;
          font-style: italic;
        }

        @media (max-width: 1200px) {
          .experience-container {
            width: 95% !important;
            min-width: 300px !important;
            padding: 0 20px !important;
          }
        }

        @media (max-width: 768px) {
          .experience-container {
            width: calc(95% - 40px) !important;
            min-width: 300px !important;
            padding: 0 20px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Experience;
