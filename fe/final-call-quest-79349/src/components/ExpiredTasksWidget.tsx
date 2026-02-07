import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ClockAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { taskApi } from "../api/tasks"
interface ExpiredTaskResponse {
  _id: string;
  title: string;
  dueDate: string;
  status: string;
}

interface ExpiredTask {
  id: string;
  title: string;
  dueDate: string;
  status: string;
  daysLate: number;
}

export const ExpiredTasksWidget: React.FC = () => {
  const { user } = useAuth();

  const { data, refetch, isLoading } = useQuery<ExpiredTask[]>({
    queryKey: ["expiredTasks", user?.id],
    queryFn: async (): Promise<ExpiredTask[]> => {
      const res = await taskApi.getExpiredTasks(3);

      const now = new Date();
      return res.map((t) => {
        const due = new Date(t.dueDate);
        const diffDays = Math.floor(
          (now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)
        );
        return {
          id: t._id,
          title: t.title,
          dueDate: t.dueDate,
          status: t.status,
          daysLate: diffDays,
        };
      });
    },
    enabled: !!user,
    refetchInterval: 120_000, // 2 phút
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (user) refetch();
  }, [user?.id, refetch]);

  const expired = data ?? [];

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClockAlert className="h-5 w-5 text-destructive" />
          Expired Tasks
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : expired.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No expired tasks in last 3 days
          </div>
        ) : (
          <div className="space-y-3">
            {expired.slice(0, 5).map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between border-b border-border/40 pb-1"
              >
                <div className="text-sm">
                  <div className="font-medium text-foreground">
                    {t.title || "Untitled task"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Due: {new Date(t.dueDate).toLocaleDateString()} (
                    {t.daysLate} days late)
                  </div>
                </div>
                <div className="text-xs text-destructive font-medium">
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

export default ExpiredTasksWidget;
