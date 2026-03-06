import { useState, useEffect, useRef } from 'react';
import ExperienceCard from './ExperienceCard';

const Education = () => {
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
      logo: "/laurier-seal.png"
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
      logo2: "/laurier-seal.png"
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
      {/* Section Title */}
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

      {/* Current Education */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        width: '100%'
      }}>
        {currentEducation.map((edu) => (
          <ExperienceCard
            key={edu.id}
            experience={edu}
            clickable={true}
            link="https://www.wlu.ca/"
          />
        ))}
      </div>

      {/* Past Double Degree */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        width: '100%',
        marginTop: '1.5rem'
      }}>
        {pastEducation.map((edu) => (
          <ExperienceCard
            key={edu.id}
            experience={edu}
            clickable={true}
            link="https://uwaterloo.ca/"
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
          .education-container {
            width: 95% !important;
            min-width: 300px !important;
            padding: 0 20px !important;
          }
        }

        @media (max-width: 768px) {
          .education-container {
            width: calc(95% - 40px) !important;
            min-width: 300px !important;
            padding: 0 20px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Education;
