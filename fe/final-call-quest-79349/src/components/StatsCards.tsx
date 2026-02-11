import { Card, CardContent } from "@/components/ui/card";
import { Target, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { taskApi, Task } from "@/api/tasks";
import { statsApi } from "@/api/stats";
import { useAuth } from "@/contexts/AuthContext";

export const StatsCards = () => {
  const { user } = useAuth();

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: () => taskApi.getTasks(),
    enabled: !!user,
  });

  const { data: userStats } = useQuery({
    queryKey: ["stats"],
    queryFn: statsApi.getStats,
    enabled: !!user,
  });

  const now = new Date();
  const in3Days = new Date();
  in3Days.setDate(now.getDate() + 3);

  const active = tasks.filter((t) => t.status !== "completed").length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const dueSoon = tasks.filter(
    (t) => new Date(t.dueDate) >= now && new Date(t.dueDate) <= in3Days,
  ).length;

  const stats = [
    { title: "Active Tasks", value: active, icon: Target },
    { title: "Completed", value: completed, icon: CheckCircle2 },
    { title: "Due Soon", value: dueSoon, icon: Clock },
    {
      title: "Total Points",
      value: userStats?.points ?? 0,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((s, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <s.icon className="h-6 w-6 mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">{s.title}</p>
            <p className="text-3xl font-bold">{s.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
