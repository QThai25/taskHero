import api from "./axios";
import type { ProfileResponse } from "@/types/profile";

export const profileApi = {
  async getProfile(): Promise<ProfileResponse> {
    const res = await api.get<ProfileResponse>("/profile");
    return res.data;
  },

  updateProfile(data: { name: string; picture?: string }) {
    return api.put("/profile", data);
  },

  changePassword(data: { currentPassword?: string; newPassword: string }) {
    return api.post("/auth/change-password", data);
  },

  uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append("avatar", file);
    return api.put("/profile/avatar", formData);
  },
};
