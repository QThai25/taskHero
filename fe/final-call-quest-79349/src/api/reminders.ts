// src/api/reminders.ts
import api from "./axios";

export interface ReminderItem {
  id: string;
  taskId: string;
  taskTitle?: string | null;
  notifyTime: string;
  methods: ("browser" | "email")[];
}

export const remindersApi = {
  async getUpcoming(windowMinutes = 60) {
    const response = await api.get("/reminders", {
      params: { windowMinutes, _: Date.now() },
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
    return response.data as ReminderItem[];
  },

  async runOnce() {
    const response = await api.post("/reminders/run-once");
    return response.data;
  },
};

export default remindersApi;
