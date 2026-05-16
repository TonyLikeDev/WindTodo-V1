export type Priority = 'high' | 'medium' | 'low';

export interface User {
  id: string;
  name?: string | null;
  email: string;
  avatarUrl?: string | null;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  label: string;
  priority: Priority;
  dueDate: string | null;
  isCompleted: boolean;
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
  notion_content: any; // contentJson from DB

  userId: string;
  creator: User;
  assignees: User[];
}

export interface ColumnData {
  id: string;
  title: string;
  cards: Task[];
}
