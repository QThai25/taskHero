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
  Tag
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
    queryFn: () => taskApi.getTasks(),
    enabled: !!user,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) => 
      taskApi.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => taskApi.deleteTask(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const toggleTaskStatus = (task: Task) => {
    const newStatus = task.status === "completed" ? "todo" : "completed";
    updateStatusMutation.mutate({ id: task._id, status: newStatus });
  };

  const handleDelete = (task: Task) => {
    deleteMutation.mutate(task._id);
  };

  const filteredTasks = (tasks as Task[]).filter(task => 
    filter === "all" ? true : task.status === filter
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium":
        return "bg-warning/10 text-warning border-warning/20";
      case "low":
        return "bg-primary/10 text-primary border-primary/20";
      default:
        return "bg-secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["all", "todo", "in-progress", "completed"].map((status) => (
          <Button
            key={status}
            variant={filter === status ? "default" : "outline"}
            onClick={() => setFilter(status as typeof filter)}
            className={cn(
              "capitalize",
              filter === status && "bg-gradient-to-r from-primary to-accent"
            )}
          >
            {status === "in-progress" ? "In Progress" : status}
          </Button>
        ))}
      </div>

      {/* Tasks */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <Card 
            key={task._id} 
            className={cn(
              "border-border bg-card hover:shadow-md transition-all",
              task.status === "completed" && "opacity-60"
            )}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                  <Checkbox
                  checked={task.status === "completed"}
                  onCheckedChange={() => toggleTaskStatus(task)}
                  className="mt-1"
                />
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className={cn(
                        "font-semibold text-foreground text-lg",
                        task.status === "completed" && "line-through"
                      )}>
                        {task.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEditTask && onEditTask(task)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(task)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority} priority
                    </Badge>
                    {task.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="gap-1">
                        <Tag className="h-3 w-3" />
                        {tag}
                      </Badge>
                    ))}
                    <div className="flex items-center gap-1 ml-auto">
                      {getStatusIcon(task.status)}
                      <span className="text-sm font-medium text-success">+{task.points} pts</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No tasks found</p>
          </div>
        )}
      </div>
    </div>
  );
};
