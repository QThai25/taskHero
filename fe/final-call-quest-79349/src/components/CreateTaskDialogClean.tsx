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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { taskApi, Task as ApiTask } from "@/api/tasks";
import {
  TaskPriority,
  TaskStatus,
  CreateTaskInput,
  UpdateTaskInput,
} from "@/types/task";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: ApiTask | null;
  onSaved?: (task: ApiTask) => void;
}

type ReminderOption = {
  enabled: boolean;
  browser: boolean;
  email: boolean;
};
type RemindersSelection = {
  threeDays: ReminderOption;
  oneDay: ReminderOption;
  oneHour: ReminderOption;
};
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
  priority: "medium",
  status: "todo",
  tags: [],
  points: 0,
  reminders: {
    threeDays: { enabled: false, browser: false, email: false },
    oneDay: { enabled: false, browser: false, email: false },
    oneHour: { enabled: false, browser: false, email: false },
  },
};

/**
 * 🔥 Core rule:
 * - UI dùng LOCAL TIME (VN)
 * - Gửi BE: ISO UTC
 * - Nhận từ BE: ISO UTC → convert LOCAL
 */

export const CreateTaskDialogClean: React.FC<Props> = ({
  open,
  onOpenChange,
  task,
  onSaved,
}) => {
  const [form, setForm] = useState<FormState>(initialForm);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [hour, setHour] = useState<number>(9);
  const [minute, setMinute] = useState<number>(0);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const combineDateTime = (date: Date, time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const d = new Date(date);
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

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
        const nodes = document.querySelectorAll(
          '[class*="allow-interactivity-"]',
        );
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
      const d = task.dueDate ? new Date(task.dueDate) : undefined;

      setForm({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "medium",
        status: task.status || "todo",
        tags: task.tags || [],
        points: task.points || 0,
        reminders: {
          threeDays: { enabled: false, browser: false, email: false },
          oneDay: { enabled: false, browser: false, email: false },
          oneHour: { enabled: false, browser: false, email: false },
        },
      });

      if (d) {
        setDate(d);
        setHour(d.getHours());
        setMinute(d.getMinutes());
      }
    } else {
      setForm(initialForm);
      setDate(undefined);
      setHour(9);
      setMinute(0);
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
          const updated = existing.map((t) =>
            t._id === returned._id ? returned : t,
          );
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

    if (!form.title || !date || hour === undefined || minute === undefined) {
      toast.error("Please fill title, due date and time");
      return;
    }

    const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    const dueAt = combineDateTime(date, time);
    const payload: CreateTaskInput = {
      title: form.title,
      description: form.description || "",
      dueDate: dueAt.toISOString(), // ✅ CÓ GIỜ
      priority: form.priority,
      status: form.status,
      tags: form.tags,
      points: form.points,
    };
    // attach reminders with notify times calculated from due date
    const r = form.reminders;
    const reminders: Array<{
      notifyTime: string;
      methods: ("browser" | "email")[];
    }> = [];

    // 3 days before
    if (r.threeDays.enabled) {
      const t = new Date(dueAt);
      t.setDate(t.getDate() - 3);

      const methods: ("browser" | "email")[] = ["browser"];
      if (r.threeDays.email) methods.push("email");

      reminders.push({
        notifyTime: t.toISOString(),
        methods,
      });
    }

    // 1 day before
    if (r.oneDay.enabled) {
      const t = new Date(dueAt);
      t.setDate(t.getDate() - 1);

      const methods: ("browser" | "email")[] = ["browser"];
      if (r.oneDay.email) methods.push("email");

      reminders.push({
        notifyTime: t.toISOString(),
        methods,
      });
    }

    // 1 hour before
    if (r.oneHour.enabled) {
      const t = new Date(dueAt);
      t.setHours(t.getHours() - 1);

      const methods: ("browser" | "email")[] = ["browser"];
      if (r.oneHour.email) methods.push("email");

      reminders.push({
        notifyTime: t.toISOString(),
        methods,
      });
    }

    payload.reminders = reminders;

    if (isEdit) {
      mutate(payload as UpdateTaskInput, {
        onSuccess: () => {
          toast.success("Task updated", {
            description: `${form.title} updated.`,
          });
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
          toast.success("Task created", {
            description: `${form.title} added.`,
          });
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
  const ReminderBlock = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: ReminderOption;
    onChange: (v: ReminderOption) => void;
  }) => {
    return (
      <div className="space-y-1">
        {/* Parent */}
        <label className="flex items-center gap-2 font-medium">
          <input
            type="checkbox"
            checked={value.enabled}
            onChange={(e) =>
              onChange({
                enabled: e.target.checked,
                browser: e.target.checked,
                email: e.target.checked ? value.email : false,
              })
            }
          />
          {label}
        </label>

        {/* Children */}
        {value.enabled && (
          <div className="ml-6 flex gap-4 text-sm text-muted-foreground">
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={value.browser}
                onChange={(e) =>
                  onChange({ ...value, browser: e.target.checked })
                }
              />
              Browser
            </label>

            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={value.email}
                onChange={(e) =>
                  onChange({ ...value, email: e.target.checked })
                }
              />
              Email
            </label>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Task" : "Create New Task"}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Add a new task with deadline and priority to stay on track.
          </DialogDescription>
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
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v: TaskPriority) =>
                    setForm({ ...form, priority: v })
                  }
                >
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
                <Select
                  value={form.status}
                  onValueChange={(v: TaskStatus) =>
                    setForm({ ...form, status: v })
                  }
                >
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
                      className={cn(
                        "justify-start text-left font-normal",
                        !date && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent
                    className="w-auto p-0 z-[9999] overflow-visible pointer-events-auto"
                    side="bottom"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(d: Date | undefined) => setDate(d)}
                      disabled={(d) =>
                        d < new Date(new Date().setHours(0, 0, 0, 0))
                      }
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
              <Label>Due Time *</Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  min={0}
                  max={23}
                  value={hour}
                  onChange={(e) =>
                    setHour(Math.min(23, Math.max(0, Number(e.target.value))))
                  }
                  className="w-20"
                />
                :
                <Input
                  type="number"
                  min={0}
                  max={59}
                  value={minute}
                  onChange={(e) =>
                    setMinute(Math.min(59, Math.max(0, Number(e.target.value))))
                  }
                  className="w-20"
                />
              </div>
            </div>

            <div className="justify-start gap-3">
              <Label>Reminders</Label>

              <ReminderBlock
                label="3 days before"
                value={form.reminders.threeDays}
                onChange={(v) =>
                  setForm({
                    ...form,
                    reminders: { ...form.reminders, threeDays: v },
                  })
                }
              />

              <ReminderBlock
                label="1 day before"
                value={form.reminders.oneDay}
                onChange={(v) =>
                  setForm({
                    ...form,
                    reminders: { ...form.reminders, oneDay: v },
                  })
                }
              />

              <ReminderBlock
                label="1 hour before"
                value={form.reminders.oneHour}
                onChange={(v) =>
                  setForm({
                    ...form,
                    reminders: { ...form.reminders, oneHour: v },
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
              disabled={isLoading}
            >
              {isLoading
                ? isEdit
                  ? "Saving..."
                  : "Creating..."
                : isEdit
                  ? "Save"
                  : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskDialogClean;
