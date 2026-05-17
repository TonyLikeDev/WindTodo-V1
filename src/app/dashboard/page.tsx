import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import GamificationBar from "@/components/GamificationBar";
import { getWorkspacesWithProjects, createProject, getBoardLists } from "@/app/actions/projectActions";
import { getTasks } from "@/app/actions/taskActions";
import { ColumnData } from "@/components/dashboard/types";
import { syncUser } from "@/app/actions/userActions";

export default async function DashboardPage() {

  let user = await syncUser().catch(() => null);
  
  let columns: ColumnData[] = [];
  let projectId = "demo-project";
  let projectName = "Dự án Demo";
  let isDemoMode = false;

  try {
    if (!user) throw new Error("Unauthorized");

    // 1. Fetch real project data
    const workspaces = await getWorkspacesWithProjects();
    let targetProject = workspaces[0]?.projects[0];

    // 2. If no project exists, create a default "Team Board"
    if (!targetProject) {
      const defaultWorkspace = workspaces[0] || { id: undefined };
      const newProj = await createProject("SkyTodo Workspace", "#5D9CEC", defaultWorkspace.id);
      targetProject = {
        ...newProj,
        _count: { lists: 3 }
      };
    }

    projectId = targetProject.id;
    projectName = targetProject.name;

    // 3. Fetch lists and tasks
    const lists = await getBoardLists(targetProject.id);
    if (lists.length === 0) throw new Error("No lists found");

    columns = await Promise.all(lists.map(async (list) => {
      const dbTasks = await getTasks(list.id);
      
      return {
        id: list.id,
        title: list.name,
        cards: dbTasks.map(t => ({
          id: t.id,
          title: t.title,
          description: t.description,
          label: (t.labels as any)?.text || "General",
          priority: (t.labels as any)?.priority || 'low',
          dueDate: t.dueDate ? t.dueDate.toISOString().split('T')[0] : null,
          isCompleted: t.isCompleted,
          status: t.status as any,
          notion_content: t.contentJson,
          userId: t.userId,
          creator: t.creator,
          assignees: t.assignees || []
        }))
      };
    }));
  } catch (error) {
    console.warn("Falling back to demo mode:", (error as Error).message);
    isDemoMode = true;
    columns = [
      {
        id: "col-1",
        title: "🎯 Cần làm",
        cards: [
          {
            id: "demo-1",
            title: "Khám phá giao diện SkyTodo mới",
            label: "Chào mừng",
            priority: 'high',
            dueDate: "2024-12-31",
            isCompleted: false,
            status: 'TODO',
            notion_content: null,
            userId: "system",
            creator: { id: "system", email: "system@skytodo.com", name: "SkyTodo Bot" },
            assignees: []
          },
          {
            id: "demo-2",
            title: "Tối ưu hóa hiệu năng và UX",
            label: "Kỹ thuật",
            priority: 'medium',
            dueDate: "2024-12-25",
            isCompleted: true,
            status: 'DONE',
            notion_content: null,
            userId: "system",
            creator: { id: "system", email: "system@skytodo.com", name: "SkyTodo Bot" },
            assignees: []
          }
        ]
      },
      { id: "col-2", title: "⚡ Đang làm", cards: [] },
      { id: "col-3", title: "✅ Đã xong", cards: [] }
    ];
  }

  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <GamificationBar />
      <main className="flex-1 px-4 lg:px-12 py-8">
        <DashboardLayout 
          initialData={columns} 
          projectId={projectId}
          projectName={projectName}
          isDemoMode={isDemoMode}
        />
      </main>
    </div>
  );
}
