import api from "./axios";

export interface Task {
  _id: string;
  userId: string;
  title: string;
  description: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in-progress" | "completed";
  tags: string[];
  points: number;
  createdAt: string;
  updatedAt: string;
}
export interface CreateTaskInput {
  title: string;
  description: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in-progress" | "completed";
  tags: string[];
  points: number;
  reminders?: Array<{
    notifyTime: string;
    methods: ("browser" | "email")[];
  }>;
}


export type UpdateTaskInput = Partial<CreateTaskInput>;

export const taskApi = {
  async getTasks(status?: string, date?: string) {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (date) params.append("date", date);

    const response = await api.get(
      params.toString() ? `/tasks?${params.toString()}` : "/tasks",
    );
    return response.data;
  },

  async getTask(taskId: string) {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  },

  async getExpiredTasks(daysMax: number = 3) {
    const response = await api.get(`/tasks/expired?daysMax=${daysMax}`);
    return response.data;
  },

  async createTask(task: CreateTaskInput) {
    const response = await api.post("/tasks", task);
    return response.data;
  },

  async updateTask(taskId: string, task: UpdateTaskInput) {
    const response = await api.put(`/tasks/${taskId}`, task);
    return response.data;
  },

  async updateStatus(taskId: string, status: string) {
    const response = await api.patch(`/tasks/${taskId}/status`, { status });
    return response.data;
  },

  async deleteTask(taskId: string) {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  },
};
