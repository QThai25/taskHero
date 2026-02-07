import api from "./axios";

export const authLocalApi = {
  async login(email: string, password: string) {
    const res = await api.post("/auth/login", { email, password });
    return res.data;
  },
  register(name: string, email: string, password: string) {
    return api.post("/auth/register", { name, email, password });
  },
  resendVerify: async (email: string) => {
    return api.post("/auth/resend-verify-email", { email });
  },

  verifyEmail: async (token: string) => {
    return api.post(`/auth/verify-email?token=${token}`);
  },

  getCurrentUser: async () => {
    return api.get("/auth/me");
  },
};
