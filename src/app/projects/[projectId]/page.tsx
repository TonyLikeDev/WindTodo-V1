'use client';

import { use } from 'react';
import ProjectViewSwitcher from '@/components/ProjectViewSwitcher';

export default function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  return <ProjectViewSwitcher projectId={projectId} />;
}
