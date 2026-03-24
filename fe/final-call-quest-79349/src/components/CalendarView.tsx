import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { taskApi } from "@/api/tasks";
import { useAuth } from "@/contexts/AuthContext";
import { CreateTaskFromCalendarModal } from "./CreateTaskFromCalendarModal";
import { Plus } from "lucide-react";

export const CalendarView = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useAuth();

  // Fetch all tasks
  const { data: allTasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => taskApi.getTasks(),
    enabled: !!user,
  });

  // Filter tasks for the selected date
  const tasksForDate = allTasks.filter((task) => {
    if (!date) return false;

    const selected = new Date(date);

    const start = task.startDate
      ? new Date(task.startDate)
      : new Date(task.dueDate);

    const end = task.endDate ? new Date(task.endDate) : start;

    return selected >= start && selected <= end;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium":
        return "bg-warning/10 text-warning border-warning/20";
      case "low":
        return "bg-success/10 text-success border-success/20";
      default:
        return "bg-secondary/10 text-secondary border-secondary/20";
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Calendar Card */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border border-border"
          />
        </CardContent>
      </Card>

      {/* Tasks for Selected Date Card */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tasks for {date?.toLocaleDateString()}</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowCreateModal(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tasksForDate.length > 0 ? (
              tasksForDate.map((task) => (
                <div
                  key={task._id}
                  className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">
                      {task.title}
                    </span>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                  {task.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {task.description}
                    </p>
                  )}
                  {/* Status badge */}
                  <div className="flex gap-2">
                    <Badge variant="secondary">
                      {task.status === "completed"
                        ? "✓ Completed"
                        : task.status === "in-progress"
                          ? "⏳ In Progress"
                          : "○ To Do"}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No tasks scheduled for this day
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Task Modal */}
      <CreateTaskFromCalendarModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        selectedDate={date}
        onTaskCreated={() => {
          // Refresh tasks list (handled by React Query)
        }}
      />
    </div>
  );
};
