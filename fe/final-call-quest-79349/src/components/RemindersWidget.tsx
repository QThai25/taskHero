// src/components/RemindersWidget.tsx
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { remindersApi, ReminderItem } from "@/api/reminders";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bell } from "lucide-react";

export const RemindersWidget: React.FC = () => {
  const { user } = useAuth();
  const [granted, setGranted] = useState<boolean>(false);
  const shownRef = useRef<Record<string, boolean>>({});

  // Tạo rõ generic cho useQuery; không dùng `cacheTime` vì TS báo lỗi với version bạn có
  const { data, refetch } = useQuery<ReminderItem[], unknown, ReminderItem[]>({
    queryKey: ["reminders", user?.id],
    queryFn: () => remindersApi.getUpcoming(60),
    enabled: !!user,
    refetchInterval: 60_000,
    staleTime: 0,
    // cacheTime: 0, // <-- BỎ nếu phiên bản react-query của bạn không hỗ trợ
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
  });

  const reminders: ReminderItem[] = data ?? [];

  // DEBUG
   
  console.log("RemindersWidget - reminders:", reminders);

  useEffect(() => {
    shownRef.current = {};
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    if (Notification.permission === "granted") setGranted(true);
    else if (Notification.permission === "default") {
      Notification.requestPermission().then((p) => setGranted(p === "granted"));
    }
  }, [user]);

  useEffect(() => {
    if (!granted) return;
    const now = Date.now();
    for (const r of reminders) {
      if (shownRef.current[r.id]) continue;
      const notify = new Date(r.notifyTime).getTime();
      if (notify <= now + 60_000) {
        const title = r.taskTitle ? `Deadline: ${r.taskTitle}` : "Upcoming task";
        try {
          new Notification(title, { body: `Due at ${new Date(r.notifyTime).toLocaleString()}` });
        } catch (err) {
           
          console.warn("Notification failed", err);
        }
        shownRef.current[r.id] = true;
      }
    }
  }, [granted, reminders]);

  useEffect(() => {
    if (user) refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-foreground" />
          Upcoming Reminders
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reminders.length === 0 ? (
          <div className="text-sm text-muted-foreground">No upcoming reminders</div>
        ) : (
          <div className="space-y-3">
            {reminders.slice(0, 5).map((r) => (
              <div key={r.id} className="flex items-center justify-between">
                <div className="text-sm">
                  <div className="font-medium">{r.taskTitle || "Untitled task"}</div>
                  <div className="text-xs text-muted-foreground">{new Date(r.notifyTime).toLocaleString()}</div>
                </div>
                <div className="text-xs text-muted-foreground">{r.method}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RemindersWidget;
