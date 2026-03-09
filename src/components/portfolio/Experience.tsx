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
      location: "New York / Remote",
      description: "",
      logo: "/augmentor-dark.svg",
      roles: [
        { role: "Software Engineer, Growth Team", date: "Jan 2026 – Current", location: "New York / Remote", description: "Building user acquisition and engagement features, running growth experiments, and driving platform adoption and retention metrics." },
        { role: "Software Engineering Intern, Cloud Infrastructure", date: "Jan – Apr 2025", location: "Palo Alto, CA", description: "Built webhook integrations, designed event schemas for the ingestion pipeline, and reduced p95 ingestion latency by 35% through observability and optimization work." }
      ],
      detail: {
        type: 'experience' as const,
        id: 0,
        company: "Augmentor Labs",
        role: "Software Engineer, Growth Team",
        logo: "/augmentor-dark.svg",
        timeline: [],
        reflection: "",
        skillsLearned: [],
        techStack: [],
        roles: [
          {
            role: "Software Engineer, Growth Team",
            date: "Jan 2026 – Current",
            location: "New York / Remote",
            timeline: [
              { month: "Month 1", description: "Joined the growth team. Ramping up on the product, growth metrics, and experimentation framework. Contributing to user acquisition features." },
              { month: "Month 2", description: "Building engagement features and running experiments to drive platform adoption and retention." }
            ],
            reflection: "",
            skillsLearned: ["Growth Engineering", "Experimentation", "Product Analytics"],
            techStack: ["TypeScript", "React", "Python", "FastAPI"]
          },
          {
            role: "Software Engineering Intern, Cloud Infrastructure",
            date: "Jan – Apr 2025",
            location: "Palo Alto, CA",
            timeline: [
              { month: "Month 1", description: "Onboarded to the cloud infrastructure team. Learned internal tooling, AWS architecture patterns, and the event-driven ingestion pipeline. Set up local development environment and completed first small PRs." },
              { month: "Month 2", description: "Built webhook integrations for GitHub, Jira, and Salesforce. Designed event schema and implemented validation layer. Integrated with the S3/DynamoDB ingestion pipeline." },
              { month: "Month 3", description: "Developed observability dashboards and alerting system. Worked on reducing p95 ingestion latency — identified bottlenecks in serialization and batch processing. Achieved 35% reduction." },
              { month: "Month 4", description: "Focused on reliability improvements and documentation. Reduced mean-time-to-detect by 42% through better alert routing. Presented final project to engineering leadership." }
            ],
            reflection: "Augmentor Labs was my first real exposure to startup culture. The core idea behind the company was trying to bring a set of professional tools that usually live in separate platforms into one unified application. Instead of juggling multiple workflows across different software, the goal was to create a system where teams could manage and operate from a single place. Being part of that environment showed me how messy and iterative early stage products actually are. Features change quickly, priorities shift often, and a lot of the work is figuring out what the product should be before worrying about perfect implementation.\n\nMore recently, Augmentor has been exploring investment opportunities and focusing more heavily on growth engineering. That shift has pushed me to spend more time building internal tools, experimenting with lead generation systems, and understanding how startups actually expand in competitive spaces. It has been a good introduction to the operational side of building a company. Instead of just writing code, you start thinking about distribution, product positioning, and what actually moves the needle when you are trying to grow a young technology company.",
            skillsLearned: ["System Design", "Observability", "Event-Driven Architecture", "Technical Writing", "On-Call Practices"],
            techStack: ["AWS (S3, DynamoDB, Lambda, CloudWatch)", "Python", "Terraform", "GitHub Actions", "Datadog"]
          }
        ]
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
      logoSize: 65,
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
        reflection: "CIBC was my first experience working inside a massive corporate environment, and it gave me a clear look at how large institutions actually operate. Banks move very differently from startups or smaller tech companies. Every change touches multiple teams, every system has layers of oversight, and decisions pass through a lot of structure before anything moves forward. It was the first time I really saw how scale, risk management, and bureaucracy shape the way technology gets built inside major organizations.\n\nIt was also where I started to understand the intersection between technology and compliance. In banking, reliability, auditability, and regulatory requirements are just as important as the technical solution itself. That environment showed me why banks rarely jump quickly onto new technology trends. There are too many systems, too many rules, and too much risk involved. Learning how engineers operate within those constraints gave me a much better understanding of how real world systems are built and maintained in highly regulated industries.",
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
