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
      company: "Augmentor Labs",
      role: "Software Engineer, Growth Team",
      date: "Jan 2026 – Current",
      location: "New York / Remote",
      description: "Currently working on the growth team, building user acquisition and engagement features to drive platform adoption and retention.",
      logo: "/augmentor-dark.svg",
      detail: {
        type: 'experience' as const,
        id: 0,
        company: "Augmentor Labs",
        role: "Software Engineer, Growth Team",
        date: "Jan 2026 – Current",
        location: "New York / Remote",
        logo: "/augmentor-dark.svg",
        timeline: [
          { month: "Month 1", description: "Joined the growth team. Ramping up on the product, growth metrics, and experimentation framework. Contributing to user acquisition features." },
          { month: "Month 2", description: "Building engagement features and running experiments to drive platform adoption and retention." }
        ],
        reflection: "",
        skillsLearned: ["Growth Engineering", "Experimentation", "Product Analytics"],
        techStack: ["TypeScript", "React", "Python", "FastAPI"]
      } satisfies ExperienceDetail
    },
    {
      id: 1,
      company: "Augmentor Labs",
      role: "Software Engineering Intern, Cloud Infrastructure Team",
      date: "Jan – Apr 2025",
      location: "Palo Alto, CA",
      description: "Built event ingestion pipelines to S3/DynamoDB, webhook integrations for GitHub/Jira/Salesforce, and observability systems with dashboards and alerts. Reduced p95 ingestion latency by 35% and dropped mean-time-to-detect by 42%.",
      logo: "/augmentor-dark.svg",
      detail: {
        type: 'experience' as const,
        id: 1,
        company: "Augmentor Labs",
        role: "Software Engineering Intern, Cloud Infrastructure Team",
        date: "Jan – Apr 2025",
        location: "Palo Alto, CA",
        logo: "/augmentor-dark.svg",
        timeline: [
          { month: "Month 1", description: "Onboarded to the cloud infrastructure team. Learned internal tooling, AWS architecture patterns, and the event-driven ingestion pipeline. Set up local development environment and completed first small PRs." },
          { month: "Month 2", description: "Built webhook integrations for GitHub, Jira, and Salesforce. Designed event schema and implemented validation layer. Integrated with the S3/DynamoDB ingestion pipeline." },
          { month: "Month 3", description: "Developed observability dashboards and alerting system. Worked on reducing p95 ingestion latency — identified bottlenecks in serialization and batch processing. Achieved 35% reduction." },
          { month: "Month 4", description: "Focused on reliability improvements and documentation. Reduced mean-time-to-detect by 42% through better alert routing. Presented final project to engineering leadership." }
        ],
        reflection: "Working at Augmentor Labs gave me hands-on experience with production-grade cloud infrastructure at scale. I learned how to think about system reliability, latency budgets, and the importance of observability. The team culture of thorough code reviews and design docs shaped how I approach engineering problems.",
        skillsLearned: ["System Design", "Observability", "Event-Driven Architecture", "Technical Writing", "On-Call Practices"],
        techStack: ["AWS (S3, DynamoDB, Lambda, CloudWatch)", "Python", "Terraform", "GitHub Actions", "Datadog"]
      } satisfies ExperienceDetail
    },
    {
      id: 2,
      company: "CIBC",
      role: "Data Scientist Intern, Technology Operations",
      date: "Jan – Apr 2024",
      location: "Toronto, ON",
      description: "Owned data contracts and CI/CD pipelines with GitHub Actions. Implemented feature flags, blue/green and canary rollouts. Created release/SLO dashboards for latency, error rate, and CTR impact.",
      logo: "/cibc-dark.svg",
      logoSize: 60,
      detail: {
        type: 'experience' as const,
        id: 2,
        company: "CIBC",
        role: "Data Scientist Intern, Technology Operations",
        date: "Jan – Apr 2024",
        location: "Toronto, ON",
        logo: "/cibc-dark.svg",
        timeline: [
          { month: "Month 1", description: "Onboarded to Technology Operations. Learned internal data platform, CI/CD workflows, and deployment strategies. Began owning data contracts for cross-team pipelines." },
          { month: "Month 2", description: "Implemented feature flags and blue/green deployment patterns. Built automated rollback triggers based on error rate thresholds." },
          { month: "Month 3", description: "Created release and SLO dashboards tracking latency, error rate, and CTR impact. Implemented canary rollout workflows with progressive traffic shifting." },
          { month: "Month 4", description: "Optimized CI/CD pipeline performance. Documented deployment playbooks and trained team members on the new feature flag system." }
        ],
        reflection: "At CIBC, I gained experience working in a regulated financial environment where reliability and auditability are critical. I learned how to balance speed of delivery with the rigorous testing and approval processes required in enterprise banking. The exposure to data science within operations showed me how quantitative methods can improve engineering decisions.",
        skillsLearned: ["CI/CD Design", "Feature Flags", "Release Engineering", "Data Contracts", "Enterprise Workflows"],
        techStack: ["GitHub Actions", "Python", "SQL", "Grafana", "Docker", "LaunchDarkly"]
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
