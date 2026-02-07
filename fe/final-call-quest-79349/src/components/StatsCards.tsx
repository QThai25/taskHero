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
    queryFn: () => statsApi.getStats(),
    enabled: !!user,
  });

  const now = new Date();
  const inThreeDays = new Date();
  inThreeDays.setDate(now.getDate() + 3);

  const activeTasks = tasks.filter((t) => t.status !== "completed").length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const dueSoon = tasks.filter((t) => new Date(t.dueDate) >= now && new Date(t.dueDate) <= inThreeDays).length;
  const totalPoints = userStats?.points ?? tasks.reduce((sum, t) => sum + (t.points || 0), 0);

  const stats = [
    { title: "Active Tasks", value: activeTasks.toString(), change: "", icon: Target, color: "text-primary", bgColor: "bg-primary/10" },
    { title: "Completed", value: completed.toString(), change: "", icon: CheckCircle2, color: "text-success", bgColor: "bg-success/10" },
    { title: "Due Soon", value: dueSoon.toString(), change: "Next 3 days", icon: Clock, color: "text-warning", bgColor: "bg-warning/10" },
    { title: "Total Points", value: (totalPoints ?? 0).toLocaleString(), change: "", icon: TrendingUp, color: "text-accent", bgColor: "bg-accent/10" },
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="border-border bg-card hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
