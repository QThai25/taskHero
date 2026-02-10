import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { profileApi } from "@/api/profile";

export default function ChangePasswordDialog({ open, onOpenChange }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (next !== confirm) {
      setError("Passwords do not match");
      return;
    }

    await profileApi.changePassword({
      currentPassword: current,
      newPassword: next,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>

        <Input
          type="password"
          placeholder="Current password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        />
        <Input
          type="password"
          placeholder="New password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button className="w-full mt-2" onClick={handleSubmit}>
          Update Password
        </Button>
      </DialogContent>
    </Dialog>
  );
}
