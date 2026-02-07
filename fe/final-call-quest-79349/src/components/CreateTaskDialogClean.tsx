import React, { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { taskApi, Task as ApiTask } from "@/api/tasks";
import { useAuth } from "@/contexts/AuthContext";
import { TaskPriority, TaskStatus, CreateTaskInput, UpdateTaskInput } from "@/types/task";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: ApiTask | null;
  onSaved?: (task: ApiTask) => void;
}

type RemindersSelection = { threeDays: boolean; oneDay: boolean; oneHour: boolean };

interface FormState {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  tags: string[];
  points: number;
  reminders: RemindersSelection;
}

const initialForm: FormState = {
  title: "",
  description: "",
  priority: "medium" as TaskPriority,
  status: "todo" as TaskStatus,
  tags: [] as string[],
  points: 0,
  reminders: { threeDays: false, oneDay: false, oneHour: false },
};

export const CreateTaskDialogClean: React.FC<Props> = ({ open, onOpenChange, task, onSaved }) => {
  const [form, setForm] = useState<FormState>(initialForm);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isEdit = !!task;

  // Defensive cleanup: some modal helpers add temporary classes to <body>
  // like "block-interactivity-<n>" and "allow-interactivity-<n>" to manage inertness.
  // If those classes are left behind (e.g. due to an error), remove them when the dialog closes
  // so the page becomes interactive again.
  useEffect(() => {
    if (!open && typeof document !== "undefined") {
      try {
        const body = document.body;
        // remove any block-interactivity-* classes on body
        body.classList.forEach((c) => {
          if (c.startsWith("block-interactivity-")) body.classList.remove(c);
        });
        // remove allow-interactivity-* from any elements
        const nodes = document.querySelectorAll('[class*="allow-interactivity-"]');
        nodes.forEach((n) => {
          n.classList.forEach((c) => {
            if (c.startsWith("allow-interactivity-")) n.classList.remove(c);
          });
        });
      } catch (e) {
        // ignore errors — this is a best-effort cleanup
        console.warn("Failed to run interactivity cleanup", e);
      }
    }
  }, [open]);

  useEffect(() => {
    if (isEdit && task) {
      setForm({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "medium",
        status: task.status || "todo",
        tags: task.tags || [],
        points: task.points || 0,
        reminders: { threeDays: false, oneDay: false, oneHour: false },
      });
      setDate(task.dueDate ? new Date(task.dueDate) : undefined);
    } else {
      setForm(initialForm);
      setDate(undefined);
    }
  }, [task, open, isEdit]);

  const mutation = useMutation({
    mutationFn: async (payload: CreateTaskInput | UpdateTaskInput) => {
      if (isEdit && task) {
        return taskApi.updateTask(task._id, payload as UpdateTaskInput);
      }
      return taskApi.createTask(payload as CreateTaskInput);
    },
    onSuccess: (data) => {
      // Update the tasks cache immediately for a snappy UI
      const key = ["tasks"];
      try {
        const existing = queryClient.getQueryData<ApiTask[]>(key) || [];
        const returned = data as ApiTask;
        if (isEdit && task) {
          // replace the updated task in cache
          const updated = existing.map((t) => (t._id === returned._id ? returned : t));
          queryClient.setQueryData<ApiTask[]>(key, updated);
        } else {
          // prepend new task
          queryClient.setQueryData<ApiTask[]>(key, [returned, ...existing]);
        }
      } catch (e) {
        // fallback: invalidate
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      }

      if (onSaved) onSaved(data as ApiTask);
    },
  });

  const mutate = mutation.mutate;
  const isLoading = mutation.status === "pending";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !date) {
      toast.error("Please fill title and due date");
      return;
    }

      const payload: CreateTaskInput = {
      title: form.title,
      description: form.description || "",
      dueDate: date.toISOString(),
      priority: form.priority,
      status: form.status,
      tags: form.tags,
      points: form.points,
    };    // attach reminders with notify times calculated from due date
    const reminders: Array<{ notifyTime: string; method: "browser" | "email" }> = [];
    const r = form.reminders;
    const dueDate = new Date(date);

    if (r.threeDays) {
      const notifyTime = new Date(dueDate);
      notifyTime.setDate(notifyTime.getDate() - 3);
      reminders.push({ notifyTime: notifyTime.toISOString(), method: "browser" });
    }
    if (r.oneDay) {
      const notifyTime = new Date(dueDate);
      notifyTime.setDate(notifyTime.getDate() - 1);
      reminders.push({ notifyTime: notifyTime.toISOString(), method: "browser" });
    }
    if (r.oneHour) {
      const notifyTime = new Date(dueDate);
      notifyTime.setHours(notifyTime.getHours() - 1);
      reminders.push({ notifyTime: notifyTime.toISOString(), method: "browser" });
    }
    payload.reminders = reminders;

      if (isEdit) {
      mutate(payload as UpdateTaskInput, {
        onSuccess: () => {
          toast.success("Task updated", { description: `${form.title} updated.` });
          onOpenChange(false);
        },
        onError: (err) => {
          console.error(err);
          toast.error("Failed to update task");
        },
      });
    } else {
      mutate(payload as CreateTaskInput, {
        onSuccess: () => {
          toast.success("Task created", { description: `${form.title} added.` });
          setForm(initialForm);
          setDate(undefined);
          onOpenChange(false);
        },
        onError: (err) => {
          console.error(err);
          toast.error("Failed to create task");
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Task" : "Create New Task"}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">Add a new task with deadline and priority to stay on track.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                placeholder="Enter task title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Add more details about this task"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={form.priority} onValueChange={(v: TaskPriority) => setForm({ ...form, priority: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={form.status} onValueChange={(v: TaskStatus) => setForm({ ...form, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To do</SelectItem>
                    <SelectItem value="in-progress">In progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Due Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-auto p-0 z-[9999] overflow-visible pointer-events-auto" side="bottom" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(d: Date | undefined) => setDate(d)}
                      disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                      fromDate={new Date()}
                      toDate={new Date(2026, 11, 31)}
                      className="rounded-md border"
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Reminders</Label>
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={form.reminders.threeDays} onChange={(e) => setForm({ ...form, reminders: { ...form.reminders, threeDays: e.target.checked } })} />
                  <span className="text-sm text-muted-foreground">3 days before</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={form.reminders.oneDay} onChange={(e) => setForm({ ...form, reminders: { ...form.reminders, oneDay: e.target.checked } })} />
                  <span className="text-sm text-muted-foreground">1 day before</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={form.reminders.oneHour} onChange={(e) => setForm({ ...form, reminders: { ...form.reminders, oneHour: e.target.checked } })} />
                  <span className="text-sm text-muted-foreground">1 hour before</span>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-primary to-accent hover:opacity-90" disabled={isLoading}>
              {isLoading ? (isEdit ? "Saving..." : "Creating...") : (isEdit ? "Save" : "Create Task")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskDialogClean;
