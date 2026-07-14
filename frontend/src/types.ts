export type TaskStatus = string;

export const TASK_PRIORITIES = ["P0", "P1", "P2", "P3"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  P0: "P0 · Urgent",
  P1: "P1 · High",
  P2: "P2 · Medium",
  P3: "P3 · Low",
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  P0: "#ef4444",
  P1: "#f59e0b",
  P2: "#3b82f6",
  P3: "#94a3b8",
};

export interface Column {
  _id: string;
  key: string;
  label: string;
  order: number;
  color: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  frontendTech: string;
  backendTech: string;
  assignedAt: string;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}
