export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in-progress" | "completed";

export interface Task {
  _id: string;
  userId: string;
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  tags: string[];
  points: number;
  createdAt: string;
  updatedAt: string;
  reminders?: Array<{ notifyTime: string; method: "browser" | "email" }>;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  tags: string[];
  points: number;
  reminders?: Array<{
    notifyTime: string;
    method: "browser" | "email";
  }>;
}

export type UpdateTaskInput = Partial<CreateTaskInput>;