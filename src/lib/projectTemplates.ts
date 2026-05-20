export type ProjectTemplateColumn = {
  name: string;
  color: string;
};

export type ProjectTemplate = {
  id: string;
  name: string;
  description: string;
  color: string;
  columns: ProjectTemplateColumn[];
};

const SLATE  = 'rgba(100, 116, 139, 0.15)';
const BLUE   = 'rgba(59, 130, 246, 0.15)';
const VIOLET = 'rgba(139, 92, 246, 0.15)';
const AMBER  = 'rgba(245, 158, 11, 0.15)';
const GREEN  = 'rgba(34, 197, 94, 0.15)';
const PINK   = 'rgba(236, 72, 153, 0.15)';

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'personal',
    name: 'Personal Tasks',
    description: 'A lightweight setup for your own to-dos.',
    color: '#a5d8f3',
    columns: [
      { name: 'Today',     color: AMBER, },
      { name: 'This Week', color: BLUE,  },
      { name: 'Done',      color: GREEN, },
    ],
  },
  {
    id: 'kanban',
    name: 'Kanban Board',
    description: 'Classic four-stage workflow for team work.',
    color: '#c4b5fd',
    columns: [
      { name: 'Backlog',     color: SLATE,  },
      { name: 'In Progress', color: BLUE,   },
      { name: 'Review',      color: VIOLET, },
      { name: 'Done',        color: GREEN,  },
    ],
  },
  {
    id: 'sprint',
    name: 'Sprint Planning',
    description: 'Run iterations with backlog, sprint, and review.',
    color: '#fbcfe8',
    columns: [
      { name: 'Backlog',   color: SLATE,  },
      { name: 'Sprint 1',  color: PINK,   },
      { name: 'In Review', color: VIOLET, },
      { name: 'Done',      color: GREEN,  },
    ],
  },
];

export function getProjectTemplate(id: string): ProjectTemplate | null {
  return PROJECT_TEMPLATES.find((t) => t.id === id) ?? null;
}
