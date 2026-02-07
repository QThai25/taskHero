import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export const CalendarView = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Mock tasks for calendar
  const tasksForDate = [
    { id: "1", title: "Complete project proposal", priority: "high" },
    { id: "2", title: "Team meeting", priority: "medium" },
  ];
  return (
    <div className="grid md:grid-cols-2 gap-6">
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

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>
            Tasks for {date?.toLocaleDateString()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tasksForDate.length > 0 ? (
              tasksForDate.map((task) => (
                <div 
                  key={task.id}
                  className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{task.title}</span>
                    <Badge 
                      className={
                        task.priority === "high" 
                          ? "bg-destructive/10 text-destructive border-destructive/20" 
                          : "bg-warning/10 text-warning border-warning/20"
                      }
                    >
                      {task.priority}
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
    </div>
  );
};
