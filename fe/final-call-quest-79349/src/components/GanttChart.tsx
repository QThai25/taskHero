import React, { useCallback, useMemo, useState } from "react";
import {
  format,
  addDays,
  addHours,
  addMilliseconds,
  startOfDay,
  endOfDay,
  differenceInMilliseconds,
  isSameDay,
} from "date-fns";
import { Task } from "@/types/task";
import { cn } from "@/lib/utils";

interface DragState {
  taskId: string;
  startX: number;
  origStart: Date;
  origEnd: Date;
}

interface GanttChartProps {
  tasks: Task[];
  zoom: "day" | "week";
  startDate: Date;
  onTaskChange: (taskId: string, start: Date, end: Date) => void;
}

const TASK_COLUMN_WIDTH = 260;

const getColumnWidth = (zoom: "day" | "week") => zoom === "day" ? 80 : 120;
const getRowHeight = () => 85;

export const GanttChart: React.FC<GanttChartProps> = ({ tasks, zoom, startDate, onTaskChange }) => {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const COLUMN_WIDTH = getColumnWidth(zoom);
  const ROW_HEIGHT = getRowHeight();

  const { timelineStart, timelineEnd, timelineCells } = useMemo(() => {
    const start = startOfDay(startDate);
    
    if (zoom === "day") {
      const end = endOfDay(start);
      const cells = [];
      let curr = start;
      while (curr <= end) {
        cells.push({ 
          date: new Date(curr), 
          label: format(curr, "HH:mm"),
          isDayZoom: true
        });
        curr = addHours(curr, 1);
      }
      return { timelineStart: start, timelineEnd: end, timelineCells: cells };
    } else {
      const end = endOfDay(addDays(start, 6));
      const cells = [];
      let curr = start;
      while (curr <= end) {
        cells.push({ 
          date: new Date(curr), 
          label: format(curr, "dd"),
          isDayZoom: false
        });
        curr = addDays(curr, 1);
      }
      return { timelineStart: start, timelineEnd: end, timelineCells: cells };
    }
  }, [zoom, startDate]);

  const totalWidth = timelineCells.length * COLUMN_WIDTH;
  const totalMs = differenceInMilliseconds(timelineEnd, timelineStart);

  const nowPos = useMemo(() => {
    const now = new Date();
    if (now < timelineStart || now > timelineEnd) return null;
    return (differenceInMilliseconds(now, timelineStart) / totalMs) * totalWidth;
  }, [timelineStart, timelineEnd, totalMs, totalWidth]);

  const getTaskPos = (task: Task) => {
    const s = new Date(task.startDate || task.createdAt || Date.now());
    const e = new Date(task.endDate || task.dueDate || addDays(s, 1));
    
    if (e < timelineStart || s > timelineEnd) return { left: 0, width: 0, visible: false };

    const offsetMs = differenceInMilliseconds(Math.max(s.getTime(), timelineStart.getTime()), timelineStart);
    const left = (offsetMs / totalMs) * totalWidth;

    const endMs = Math.min(e.getTime(), timelineEnd.getTime());
    const durationMs = endMs - Math.max(s.getTime(), timelineStart.getTime());
    const width = (durationMs / totalMs) * totalWidth;

    return { 
      left: Math.max(0, left), 
      width: Math.max(width, 30), 
      visible: true 
    };
  };

  const calculateTimeBasedProgress = (task: Task): number => {
    const now = new Date();
    const s = new Date(task.startDate || task.createdAt || Date.now());
    const e = new Date(task.endDate || task.dueDate || addDays(s, 1));

    if (now < s) return 0;
    if (now >= e) return 100;

    const totalDuration = e.getTime() - s.getTime();
    const elapsedTime = now.getTime() - s.getTime();
    return Math.round((elapsedTime / totalDuration) * 100);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState) return;
    const deltaX = e.clientX - dragState.startX;
    const msDelta = (deltaX / totalWidth) * totalMs;
    onTaskChange(
      dragState.taskId,
      addMilliseconds(dragState.origStart, msDelta),
      addMilliseconds(dragState.origEnd, msDelta)
    );
  }, [dragState, totalWidth, totalMs, onTaskChange]);

  const handleMouseUp = useCallback(() => {
    setDragState(null);
  }, []);

  React.useEffect(() => {
    if (dragState) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => { 
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [dragState, handleMouseMove, handleMouseUp]);

  return (
    <div className="relative flex flex-col w-full bg-white overflow-hidden border-t">
      <div className="flex border-b sticky top-0 z-40 bg-slate-50 shadow-sm">
        <div style={{ width: TASK_COLUMN_WIDTH }} className="flex-shrink-0 p-4 font-bold border-r text-xs uppercase text-slate-500 bg-slate-50">Task Name</div>
        <div className="flex">
          {timelineCells.map((cell) => (
            <div 
              key={cell.date.toISOString()}
              style={{ width: COLUMN_WIDTH, minWidth: COLUMN_WIDTH }}
              className={cn(
                "h-14 flex flex-col items-center justify-center border-r transition-colors",
                isSameDay(cell.date, new Date()) ? "bg-blue-50/50 text-blue-600" : "text-slate-400"
              )}
            >
              <span className="text-sm font-bold">{cell.label}</span>
              {!cell.isDayZoom && <span className="text-[9px] uppercase font-medium opacity-70">{format(cell.date, "EEE")}</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="flex relative overflow-x-auto bg-white">
        <div className="absolute inset-0 flex pointer-events-none">
          <div style={{ width: TASK_COLUMN_WIDTH }} className="flex-shrink-0 border-r bg-slate-50/20 sticky left-0 z-10" />
          {timelineCells.map((_, i) => (
            <div key={i} style={{ width: COLUMN_WIDTH, minWidth: COLUMN_WIDTH }} className="border-r h-full border-slate-50" />
          ))}
        </div>

        {nowPos !== null && (
          <div 
            className="absolute top-0 bottom-0 w-1 bg-red-500 z-30 pointer-events-none shadow-[0_0_10px_rgba(239,68,68,0.5)]"
            style={{ left: TASK_COLUMN_WIDTH + nowPos }}
          >
            <div className="absolute top-0 -left-1.5 w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow-md" />
          </div>
        )}

        <div className="flex flex-col w-full">
          {tasks.map((task) => {
            const { left, width, visible } = getTaskPos(task);
            const progress = calculateTimeBasedProgress(task);

            return (
              <div key={task._id} className="flex border-b border-slate-50 hover:bg-slate-50/50 transition-colors group" style={{ height: ROW_HEIGHT }}>
                <div style={{ width: TASK_COLUMN_WIDTH }} className="flex-shrink-0 p-4 border-r sticky left-0 bg-white z-20 shadow-[2px_0_5px_rgba(0,0,0,0.02)] group-hover:bg-slate-50">
                  <div className="font-bold text-sm text-slate-700 truncate">{task.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter bg-blue-50 px-1.5 py-0.5 rounded">{task.status}</span>
                    <span className="text-[10px] text-slate-400">{progress}%</span>
                  </div>
                </div>

                <div className="relative flex-1">
                  {visible && (
                    <div
                      className="absolute top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing group/bar"
                      style={{ left, width, height: 40 }}
                      onMouseDown={(e) => setDragState({
                        taskId: task._id,
                        startX: e.clientX,
                        origStart: new Date(task.startDate || task.createdAt || 0),
                        origEnd: new Date(task.endDate || task.dueDate || 0)
                      })}
                    >
                      {/* Container chứa cả progress và unfilled */}
                      <div className="relative w-full h-full rounded-full overflow-hidden shadow-md border-2 border-red-500 bg-gradient-to-r from-blue-200 to-yellow-200">
                        {/* Unfilled part - đường chấm chấm */}
                        <div className="absolute inset-0 border-2 border-dashed border-slate-300 rounded-full opacity-60" />

                        {/* Filled part - gradient với stripes */}
                        <div
                          className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-green-400 to-yellow-500 animate-progress-stripes transition-all duration-700 shadow-inner"
                          style={{ width: `${progress}%` }}
                        >
                          {/* Percentage text */}
                          {progress > 8 && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-bold text-white drop-shadow-lg">
                                {progress}%
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Divider - phân định giữa đã chạy qua và chưa chạy qua */}
                        <div
                          className="absolute inset-y-0 w-1 bg-white/80 shadow-md transition-all duration-700 pointer-events-none"
                          style={{ left: `${progress}%`, transform: "translateX(-50%)" }}
                        />

                        {/* Percentage outside cho progress nhỏ */}
                        {progress <= 8 && progress > 0 && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <span className="text-xs font-bold text-slate-700">
                              {progress}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes progress-stripes {
          0% { background-position: 0 0; }
          100% { background-position: 40px 0; }
        }
        .animate-progress-stripes {
          background-image: repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 0px, rgba(255, 255, 255, 0.15) 10px, transparent 10px, transparent 20px);
          background-size: 40px 40px;
          animation: progress-stripes 1s linear infinite;
        }
      `}} />
    </div>
  );
};