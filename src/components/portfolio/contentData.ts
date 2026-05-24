import type { ContentViewData } from './ContentViewer';

export const contentMap: Record<string, ContentViewData> = {
  'abdullah-notes': {
    type: 'blog',
    slug: 'abdullah-notes',
    title: 'Abdullah Notes',
    publishedAt: '2026-01-01',
    tags: ['Placeholder', 'Ideas'],
    readingTime: 2,
    summary: 'Placeholder notes for Abdullah Sultan.',
    markdown: `This is a static placeholder for Abdullah Sultan's future writing.

Topics may include startups, quant finance, robotics, AI, and creative hardware projects.

Final writing will be added in a later stage.`
  },

  'project-log': {
    type: 'blog',
    slug: 'project-log',
    title: 'Project Log',
    publishedAt: '2026-01-02',
    tags: ['Placeholder', 'Builds'],
    readingTime: 2,
    summary: 'A temporary build-log shell.',
    markdown: `This is a placeholder project log.

It will eventually hold short notes about experiments, prototypes, and AbdullahOS updates.`
  },
};
