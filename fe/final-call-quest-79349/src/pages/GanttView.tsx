import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { taskApi } from "@/api/tasks";
import { GanttChart } from "@/components/GanttChart";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, subDays, addWeeks, subWeeks, format, startOfWeek } from "date-fns";
import { Task } from "@/types/task";

type ZoomLevel = "day" | "week";

export const GanttView: React.FC = () => {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [zoom, setZoom] = useState<ZoomLevel>("week");

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: () => taskApi.getTasks(),
  });

  const nav = {
    day: { next: (d: Date) => addDays(d, 1), prev: (d: Date) => subDays(d, 1) },
    week: { 
      next: (d: Date) => addWeeks(startOfWeek(d), 1),
      prev: (d: Date) => subWeeks(startOfWeek(d), 1)
    },
  };

  if (isLoading) return <div className="p-10 text-center">Đang tải dữ liệu...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-full mx-auto">
        <div className="bg-white rounded-xl border shadow-sm p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => setStartDate(nav[zoom].prev(startDate))}>
              <ChevronLeft size={18} />
            </Button>
            <div className="text-sm font-bold min-w-[200px] text-center uppercase tracking-wider text-slate-700">
              {zoom === "day" 
                ? format(startDate, "EEEE, dd MMMM yyyy")
                : `${format(startDate, "dd MMM")} - ${format(addDays(startDate, 6), "dd MMM yyyy")}`
              }
            </div>
            <Button variant="outline" size="icon" onClick={() => setStartDate(nav[zoom].next(startDate))}>
              <ChevronRight size={18} />
            </Button>
          </div>

          <div className="flex gap-2">
            {(["day", "week"] as ZoomLevel[]).map((z) => (
              <Button
                key={z}
                size="sm"
                variant={zoom === z ? "default" : "outline"}
                onClick={() => setZoom(z)}
                className="capitalize w-20"
              >
                {z}
              </Button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border shadow-lg overflow-hidden">
          <GanttChart tasks={tasks} startDate={startDate} zoom={zoom} onTaskChange={() => {}} />
        </div>
      </div>
    </div>
  );
};