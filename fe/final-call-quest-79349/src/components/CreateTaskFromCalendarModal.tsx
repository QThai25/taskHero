import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { taskApi, Task as ApiTask } from "@/api/tasks";
import { TaskPriority } from "@/types/task";

interface CreateTaskFromCalendarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | undefined;
  onTaskCreated?: () => void;
}

interface FormState {
  title: string;
  description: string;
  priority: TaskPriority;
  startDate: Date | undefined;
  endDate: Date | undefined;
  progress: number;
}

interface TimeInputProps {
  h: string;
  m: string;
  setH: (value: string) => void;
  setM: (value: string) => void;
  disabled?: boolean;
}

export const CreateTaskFromCalendarModal = ({
  open,
  onOpenChange,
  selectedDate,
  onTaskCreated,
}: CreateTaskFromCalendarModalProps) => {
  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    priority: "medium",
    startDate: selectedDate || new Date(),
    endDate: selectedDate || new Date(),
    progress: 0,
  });

  // State quản lý giờ/phút
  const [startHour, setStartHour] = useState("09");
  const [startMinute, setStartMinute] = useState("00");
  const [endHour, setEndHour] = useState("17");
  const [endMinute, setEndMinute] = useState("00");

  // State kiểm soát đóng mở Popover để tránh xung đột với Dialog
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);

  const queryClient = useQueryClient();

  const combineDateTime = (date: Date, h: string, m: string): Date => {
    const d = new Date(date);
    d.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
    return d;
  };

  useEffect(() => {
    if (open && selectedDate) {
      setForm((prev) => ({
        ...prev,
        startDate: selectedDate,
        endDate: selectedDate,
      }));
    }
  }, [open, selectedDate]);

  const mutation = useMutation({
    mutationFn: async (payload: FormState) => {
      if (!payload.startDate) throw new Error("Start date is required");
      
      const fullStart = combineDateTime(payload.startDate, startHour, startMinute);
      const fullEnd = payload.endDate 
        ? combineDateTime(payload.endDate, endHour, endMinute)
        : fullStart;

      return taskApi.createTask({
        title: payload.title,
        description: payload.description,
        priority: payload.priority,
        dueDate: fullEnd.toISOString(),
        startDate: fullStart.toISOString(),
        endDate: fullEnd.toISOString(),
        progress: payload.progress,
        status: "todo",
        tags: [],
        points: 0,
      });
    },

    onSuccess: (data) => {
      const key = ["tasks"];
      queryClient.setQueryData<ApiTask[]>(key, (old) => [data as ApiTask, ...(old || [])]);
      toast.success("Task created successfully!");
      onOpenChange(false);
      onTaskCreated?.();
    },
    onError: () => toast.error("Failed to create task"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Tránh submit khi đang thao tác chọn ngày
    if (isStartOpen || isEndOpen) return;

    if (!form.title.trim()) return toast.error("Task title is required");
    if (!form.startDate || !form.endDate) return toast.error("Both dates are required");

    const fullStart = combineDateTime(form.startDate, startHour, startMinute);
    const fullEnd = combineDateTime(form.endDate, endHour, endMinute);

    if (fullEnd <= fullStart) return toast.error("End time must be after start time");

    mutation.mutate(form);
  };

  const TimeInput: React.FC<TimeInputProps> = ({ h, m, setH, setM, disabled }) => (
    <div className="flex gap-1 items-center">
      <Input
        className="w-14 h-9 text-center p-1 bg-white/50"
        value={h}
        disabled={disabled}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setH(e.target.value.replace(/\D/g, "").slice(0, 2))}
        onBlur={() => setH(String(Math.min(23, Number(h) || 0)).padStart(2, "0"))}
      />
      <span className="font-bold text-slate-400">:</span>
      <Input
        className="w-14 h-9 text-center p-1 bg-white/50"
        value={m}
        disabled={disabled}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setM(e.target.value.replace(/\D/g, "").slice(0, 2))}
        onBlur={() => setM(String(Math.min(59, Number(m) || 0)).padStart(2, "0"))}
      />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] overflow-visible">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>Schedule your work precisely by hour.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label>Task Title *</Label>
            <Input 
              value={form.title} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, title: e.target.value })} 
              placeholder="What needs to be done?"
              className="bg-white/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* START DATE */}
            <div className="grid gap-2">
              <Label className="text-blue-600 font-bold">Start Date & Time *</Label>
              <div className="flex flex-col gap-2">
                <Popover open={isStartOpen} onOpenChange={setIsStartOpen} modal={true}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      type="button"
                      className={cn("justify-start text-xs bg-white/50", !form.startDate && "text-muted-foreground")}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                      {form.startDate ? format(form.startDate, "PPP") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-auto z-[1001]" align="start">
                    <Calendar
                      mode="single"
                      selected={form.startDate}
                      onSelect={(d: Date | undefined) => {
                        setForm({ ...form, startDate: d });
                        setIsStartOpen(false);
                      }}
                      initialFocus
                      // Không dùng disabled để cho phép chọn ngày cũ
                    />
                  </PopoverContent>
                </Popover>
                <TimeInput h={startHour} m={startMinute} setH={setStartHour} setM={setStartMinute} />
              </div>
            </div>

            {/* END DATE */}
            <div className="grid gap-2">
              <Label className="text-amber-600 font-bold">End Date & Time *</Label>
              <div className="flex flex-col gap-2">
                <Popover open={isEndOpen} onOpenChange={setIsEndOpen} modal={true}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      type="button"
                      className={cn("justify-start text-xs bg-white/50", !form.endDate && "text-muted-foreground")}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                      {form.endDate ? format(form.endDate, "PPP") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-auto z-[1001]" align="start">
                    <Calendar
                      mode="single"
                      selected={form.endDate}
                      onSelect={(d: Date | undefined) => {
                        setForm({ ...form, endDate: d });
                        setIsEndOpen(false);
                      }}
                      initialFocus
                      disabled={(date: Date) => (form.startDate ? date < new Date(new Date(form.startDate).setHours(0,0,0,0)) : false)}
                    />
                  </PopoverContent>
                </Popover>
                <TimeInput h={endHour} m={endMinute} setH={setEndHour} setM={setEndMinute} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-2 border-t border-slate-100">
            <div className="grid gap-2">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v: TaskPriority) => setForm({ ...form, priority: v })}>
                    <SelectTrigger className="bg-white/50"><SelectValue /></SelectTrigger>
                    <SelectContent className="z-[1001]">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid gap-2">
                <div className="flex justify-between"><Label>Progress</Label><span className="text-xs font-mono">{form.progress}%</span></div>
                <Slider min={0} max={100} step={5} value={[form.progress]} onValueChange={(v: number[]) => setForm({ ...form, progress: v[0] })} />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={mutation.isPending}
            >
              {mutation.isPending && <Loader2 className="animate-spin mr-2" size={16} />}
              Create Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};