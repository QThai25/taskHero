// src/components/UpcomingTasksWidget.tsx
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { taskApi, Task } from "@/api/tasks";

const WINDOW_MINUTES = 1440; // 24h

export const UpcomingTasksWidget: React.FC = () => {
  const { user } = useAuth();

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["upcomingTasks", user?.id],
    queryFn: () => taskApi.getUpcomingTasks(WINDOW_MINUTES),
    enabled: !!user,
    refetchOnWindowFocus: true,
  });

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-foreground" />
          Upcoming Tasks (Next 24h)
        </CardTitle>
      </CardHeader>

      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No tasks due in the next 24 hours
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.slice(0, 5).map((t) => (
              <div key={t._id} className="flex items-center justify-between">
                <div className="text-sm">
                  <div className="font-medium">{t.title}</div>
                  <div className="text-xs text-muted-foreground">
                    Due {new Date(t.dueDate).toLocaleString()}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground capitalize">
                  {t.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingTasksWidget;
