export interface DemoTask {
  id: string;
  title: string;
  description?: string | null;
  label: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string | null;
  isCompleted: boolean;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  notion_content: any;
  userId: string;
  creator: { id: string; email: string; name: string };
  assignees: any[];
}

export interface DemoColumn {
  id: string;
  title: string;
  cards: DemoTask[];
}

const DEFAULT_COLUMNS: DemoColumn[] = [
  {
    id: "col-1",
    title: "🎯 Cần làm",
    cards: [
      {
        id: "demo-1",
        title: "Khám phá giao diện SkyTodo mới",
        description: "Chào mừng bạn đến với SkyTodo! Hãy trải nghiệm kéo thả thẻ, chỉnh sửa tài liệu chi tiết và chuyển đổi giữa các góc nhìn khác nhau.",
        label: "Chào mừng",
        priority: 'high',
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // 2 days from now
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
        description: "Dự án đã được tích hợp đầy đủ khả năng sao lưu ngoại tuyến, giúp bạn thao tác trơn tru ngay cả khi không có kết nối cơ sở dữ liệu.",
        label: "Kỹ thuật",
        priority: 'medium',
        dueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], // yesterday
        isCompleted: true,
        status: 'DONE',
        notion_content: null,
        userId: "system",
        creator: { id: "system", email: "system@skytodo.com", name: "SkyTodo Bot" },
        assignees: []
      }
    ]
  },
  {
    id: "col-2",
    title: "⚡ Đang làm",
    cards: []
  },
  {
    id: "col-3",
    title: "✅ Đã xong",
    cards: []
  }
];

export function getDemoColumns(): DemoColumn[] {
  if (typeof window === "undefined") return DEFAULT_COLUMNS;
  const saved = localStorage.getItem("skytodo_demo_columns");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse demo columns from localStorage", e);
    }
  }
  // Initialize
  localStorage.setItem("skytodo_demo_columns", JSON.stringify(DEFAULT_COLUMNS));
  return DEFAULT_COLUMNS;
}

export function saveDemoColumns(columns: DemoColumn[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("skytodo_demo_columns", JSON.stringify(columns));
}
