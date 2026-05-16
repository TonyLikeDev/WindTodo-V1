"use client";

import React from "react";
import { useParams } from "next/navigation";
import ProjectBoard from "@/components/ProjectBoard";

export default function ProjectPage() {
  const params = useParams();
  const projectId = params?.id as string;

  if (!projectId) return null;

  return (
    <div className="h-full">
      <ProjectBoard projectId={projectId} />
    </div>
  );
}
