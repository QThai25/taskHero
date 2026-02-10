import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profileApi } from "@/api/profile";
import { Camera } from "lucide-react";
import { toast } from "sonner";

export default function EditProfileDialog({ open, onOpenChange }) {
  const [name, setName] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const onSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!f.type.startsWith("image/")) {
      toast.error("File không phải ảnh");
      return;
    }

    if (f.size > 2 * 1024 * 1024) {
      toast.error("Ảnh tối đa 2MB");
      return;
    }

    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // 1️⃣ Upload avatar nếu có
      if (file) {
        const formData = new FormData();
        formData.append("avatar", file);

        await profileApi.uploadAvatar(file);
      }

      // 2️⃣ Update name nếu có
      if (name.trim()) {
        await profileApi.updateProfile({ name });
      }

      toast.success("Profile updated");
      onOpenChange(false);
    } catch (err) {
      toast.error("Update profile failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        {/* Avatar picker */}
        <div className="flex justify-center">
          <label className="relative cursor-pointer group">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-muted">
              {preview ? (
                <img src={preview} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">
                  👤
                </div>
              )}
            </div>

            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
              <Camera className="text-white" />
            </div>

            <input
              type="file"
              accept="image/*"
              hidden
              onChange={onSelectImage}
            />
          </label>
        </div>

        {/* Name */}
        <div className="grid gap-2 mt-4">
          <Label>Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>

        <Button className="mt-4 w-full" onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
