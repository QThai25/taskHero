import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  MoreVertical,
  Calendar,
  Tag,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskApi, Task } from "@/api/tasks";
import { useAuth } from "@/contexts/AuthContext";
import { TaskStatus } from "@/types/task";
import { toast } from "sonner";

type FilterStatus = "all" | TaskStatus;

interface TaskListProps {
  onEditTask?: (task: Task) => void;
}

export const TaskList = ({ onEditTask }: TaskListProps) => {
  const [filter, setFilter] = useState<FilterStatus>("all");
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: () => taskApi.getTasks(), // ✅ FIX
    enabled: !!user,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      taskApi.updateStatus(id, status),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });

      if (data?.points) {
        toast.success(
          data.points > 0
            ? `+${data.points} points 🎉`
            : `${data.points} points ↩️`,
        );
      }

      if (data?.awarded?.length) {
        data.awarded.forEach((b: string) =>
          toast.success(`🏅 New badge: ${b}`),
        );
      }
    },
  });
  const isOverdue = (task: Task) => {
    if (!task.dueDate) return false;
    if (task.status === "completed") return false;

    return new Date(task.dueDate) < new Date();
  };

  const deleteMutation = useMutation({
    mutationFn: taskApi.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });

  const toggleTaskStatus = (task: Task) => {
    const newStatus: TaskStatus =
      task.status === "completed" ? "todo" : "completed";

    updateStatusMutation.mutate({ id: task._id, status: newStatus });
  };

  const filteredTasks = tasks.filter((t) =>
    filter === "all" ? true : t.status === filter,
  );

  const getStatusIcon = (status: TaskStatus) => {
    if (status === "completed")
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    if (status === "in-progress")
      return <Clock className="h-4 w-4 text-warning" />;
    return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["all", "todo", "in-progress", "completed"].map((s) => (
          <Button
            key={s}
            variant={filter === s ? "default" : "outline"}
            onClick={() => setFilter(s as FilterStatus)}
            className={cn(
              filter === s && "bg-gradient-to-r from-primary to-accent",
            )}
          >
            {s === "in-progress" ? "In Progress" : s}
          </Button>
        ))}
      </div>

      {/* Tasks */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <Card
            key={task._id}
            className={cn(
              "border-border bg-card",
              task.status === "completed" && "opacity-60",
              isOverdue(task) && "border-destructive/50 bg-destructive/5",
            )}
          >
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Checkbox
                  checked={task.status === "completed"}
                  disabled={updateStatusMutation.isPending || isOverdue(task)}
                  onCheckedChange={() => toggleTaskStatus(task)}
                />

                <div className="flex-1 space-y-3">
                  <div className="flex justify-between">
                    <h3
                      className={cn(
                        "font-semibold text-lg",
                        task.status === "completed" && "line-through",
                      )}
                    >
                      {task.title}
                    </h3>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          disabled={isOverdue(task)}
                          onClick={() => onEditTask?.(task)}
                        >
                          Edit
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          disabled={isOverdue(task)}
                          className={cn(
                            "text-destructive",
                            isOverdue(task) && "opacity-50 cursor-not-allowed",
                          )}
                          onClick={() => deleteMutation.mutate(task._id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                    {isOverdue(task) && (
                      <div className="flex items-center gap-1 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        Task đã trễ hạn
                      </div>
                    )}
                    <Badge variant="outline">{task.priority}</Badge>

                    {task.status === "completed" && (
                      <span className="ml-auto flex items-center gap-1 text-success text-sm">
                        {getStatusIcon(task.status)}
                        Done
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
