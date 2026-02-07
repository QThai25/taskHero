import { Task, CreateTaskInput, UpdateTaskInput, TaskStatus } from "@/types/task";

const API_BASE = (import.meta.env.VITE_API_URL as string) || "http://localhost:5000/api";

type ErrorResponse = {
  message: string;
  [key: string]: unknown;
};

async function handleJSONResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    const json = text ? JSON.parse(text) : {};
    if (!res.ok) throw json as ErrorResponse;
    return json as T;
  } catch (err) {
    // if parse fails, throw text
    if (!res.ok) throw new Error(text || res.statusText);
    return text as T;
  }
}

export async function getTasks(params?: { status?: TaskStatus; date?: string }): Promise<Task[]> {
  const url = new URL(`${API_BASE}/api/tasks`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => v && url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString(), {
    credentials: 'include' // Required for sending/receiving cookies
  });
  return handleJSONResponse<Task[]>(res);
}

export async function createTask(task: CreateTaskInput): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: 'include',
    body: JSON.stringify(task),
  });
  return handleJSONResponse<Task>(res);
}

export async function updateTask(id: string, updates: UpdateTaskInput): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: 'include',
    body: JSON.stringify(updates),
  });
  return handleJSONResponse<Task>(res);
}

export async function updateStatus(id: string, status: TaskStatus): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: 'include',
    body: JSON.stringify({ status }),
  });
  return handleJSONResponse<Task>(res);
}

export async function deleteTask(id: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: "DELETE",
    credentials: 'include',
  });
  return handleJSONResponse<{ message: string }>(res);
}

export default { getTasks, createTask, updateTask, updateStatus, deleteTask };
