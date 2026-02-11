import { useEffect } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@/contexts/AuthContext";

const socket = io(import.meta.env.VITE_SOCKET_URL, {
  withCredentials: true,
});

export default function SocketReminderListener() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    socket.emit("join", user._id || user.id);

    socket.on("connect", () => {
      console.log("🟢 socket connected", socket.id);
    });

    socket.on("reminder", (data) => {
      console.log("🧪 SOCKET DATA:", data);

      if (Notification.permission === "granted") {
        new Notification(`⏰ ${data.title || "Task reminder"}`, {
          body: `Due at ${new Date(data.notifyTime).toLocaleString()}`,
          tag: `reminder-${data.id}`,
          requireInteraction: true,
        });
      }
    });

    return () => {
      socket.off("reminder");
    };
  }, [user]);

  return null;
}
