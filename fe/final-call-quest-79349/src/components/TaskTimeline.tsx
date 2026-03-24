import { cn } from "@/lib/utils";

interface TaskTimelineProps {
  startDate?: string;
  endDate?: string;
  progress?: number;
  dueDate?: string;
  compact?: boolean;
}

export const TaskTimeline: React.FC<TaskTimelineProps> = ({
  startDate,
  endDate,
  progress = 0,
  dueDate,
  compact = false,
}) => {
  // Use endDate if provided, otherwise fallback to dueDate
  const effectiveEndDate = endDate || dueDate;

  if (!startDate || !effectiveEndDate) {
    return null;
  }

  const start = new Date(startDate).getTime();
  const end = new Date(effectiveEndDate).getTime();
  const totalDuration = end - start;

  if (totalDuration <= 0) {
    return null;
  }

  // Clamp progress between 0-100
  const progressPercent = Math.min(Math.max(progress || 0, 0), 100);

  // Format date display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.toLocaleString("en-US", { month: "short" });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  return (
    <div className={cn("space-y-2", compact && "space-y-1")}> 
      {/* Modern Progress Bar */}
      <div className="relative w-full h-4 bg-gray-200 dark:bg-gray-800 rounded-full overflow-visible shadow-inner">
        {/* Progress fill with gradient and animated stripes */}
        <div
          className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-blue-400 via-green-400 to-yellow-400 animate-progress-stripes shadow-lg"
          style={{ width: `${progressPercent}%`, minWidth: progressPercent > 0 ? 24 : 0 }}
        >
          {/* Progress label */}
          <span
            className="absolute right-0 -top-7 text-xs font-semibold text-blue-600 dark:text-blue-300 bg-white dark:bg-gray-900 px-2 py-0.5 rounded shadow"
            style={{ left: `calc(${progressPercent}% - 24px)` }}
          >
            {progressPercent}%
          </span>
        </div>
        {/* Marker for 1 day if duration is 1 day */}
        {totalDuration <= 1000 * 60 * 60 * 24 && (
          <div className="absolute top-0 left-0 w-full h-full border-2 border-dashed border-blue-400 rounded-full pointer-events-none animate-pulse" />
        )}
      </div>

      {/* Metadata row */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
        <span className="flex gap-2">
          <span>{formatDate(startDate)}</span>
          <span>→</span>
          <span>{formatDate(effectiveEndDate)}</span>
        </span>
        {/* Only show % here on mobile/compact */}
        {compact && <span className="font-medium text-foreground">{progressPercent}%</span>}
      </div>
      {/* Custom CSS for animated stripes: chuyển sang global hoặc tailwind */}
      {/* Nếu dùng tailwind, thêm vào file global css:
        @keyframes progress-stripes {
          0% { background-position: 0 0; }
          100% { background-position: 40px 0; }
        }
        .animate-progress-stripes {
          background-image: repeating-linear-gradient(135deg,rgba(255,255,255,0.15) 0 10px,transparent 10px 20px);
          background-size: 40px 40px;
          animation: progress-stripes 1s linear infinite;
        }
      */}
    </div>
  );
};
