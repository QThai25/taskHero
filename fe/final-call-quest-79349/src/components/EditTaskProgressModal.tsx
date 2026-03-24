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
import { Slider } from "@/components/ui/slider";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { taskApi, Task } from "@/api/tasks";

interface EditTaskProgressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onTaskUpdated?: () => void;
}

interface FormState {
  title: string;
  progress: number;
  endDate: Date | undefined;
}

export const EditTaskProgressModal = ({
  open,
  onOpenChange,
  task,
  onTaskUpdated,
}: EditTaskProgressModalProps) => {
  const [form, setForm] = useState<FormState>({
    title: "",
    progress: 0,
    endDate: undefined,
  });

  const queryClient = useQueryClient();

  // Initialize form when task changes
  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        progress: task.progress || 0,
        endDate: task.endDate ? new Date(task.endDate) : new Date(task.dueDate),
      });
    }
  }, [task, open]);

  const mutation = useMutation({
    mutationFn: async (payload: FormState) => {
      if (!task) throw new Error("No task selected");
      return taskApi.updateTask(task._id, {
        title: payload.title,
        progress: payload.progress,
        endDate: payload.endDate?.toISOString(),
        dueDate: payload.endDate?.toISOString(),
      });
    },
    onSuccess: (data) => {
      // Update cache
      const key = ["tasks"];
      try {
        const existing = queryClient.getQueryData<Task[]>(key) || [];
        const updated = existing.map((t) =>
          t._id === (data as Task)._id ? (data as Task) : t
        );
        queryClient.setQueryData<Task[]>(key, updated);
      } catch (e) {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      }

      toast.success("Task updated successfully!", {
        description: form.title,
      });

      onOpenChange(false);
      onTaskUpdated?.();
    },
    onError: (err: Error | null) => {
      console.error("Update task error:", err);
      const errorMessage =
        err && "response" in err 
          ? (err.response as Record<string, Record<string, string>>)?.data?.message
          : "An error occurred while updating the task";
      toast.error("Failed to update task", {
        description: errorMessage || "An error occurred while updating the task",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    if (!form.endDate) {
      toast.error("End date is required");
      return;
    }

    mutation.mutate(form);
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Task Progress</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Update the task title, progress, and end date.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Title */}
          <div className="grid gap-2">
            <Label htmlFor="title" className="font-semibold">
              Task Title *
            </Label>
            <Input
              id="title"
              placeholder="Enter task title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              disabled={mutation.isPending}
            />
          </div>

          {/* Progress Slider */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label className="font-semibold">Progress</Label>
              <span className="text-sm font-medium text-primary">
                {form.progress}%
              </span>
            </div>
            <Slider
              min={0}
              max={100}
              step={1}
              value={[form.progress]}
              onValueChange={(value) =>
                setForm({ ...form, progress: value[0] })
              }
              disabled={mutation.isPending}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground pt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* End Date */}
          <div className="grid gap-2">
            <Label htmlFor="endDate" className="font-semibold">
              End Date *
            </Label>
            <Input
              id="endDate"
              type="date"
              value={form.endDate ? format(form.endDate, "yyyy-MM-dd") : ""}
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value) : undefined;
                if (date) {
                  setForm({ ...form, endDate: date });
                }
              }}
              disabled={mutation.isPending}
            />
          </div>

          {/* Info */}
          <div className="rounded-lg bg-secondary/50 p-3 text-sm text-muted-foreground">
            <p>
              <strong>Current Status:</strong> {task.status}
            </p>
            <p>
              <strong>Created:</strong> {new Date(task.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Submit Button */}
          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Task"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
