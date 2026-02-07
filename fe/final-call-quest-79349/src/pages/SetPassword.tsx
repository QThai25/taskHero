import { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { useAuth } from "@/contexts/AuthContext";
import { AxiosError } from "axios";

interface ApiErrorResponse {
  message: string;
}

const SetPassword = () => {
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  // 🔒 Guard route
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    } else if (!user.needsSetPassword) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password.length < 6) {
      alert("Password phải ít nhất 6 ký tự");
      return;
    }

    if (password !== confirmPassword) {
      alert("Password nhập lại không khớp");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/set-password", { password });
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      alert(err.response?.data.message || "Set password failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <form
        onSubmit={handleSubmit}
        className="w-[380px] p-6 rounded-xl shadow-lg bg-white"
      >
        <h2 className="text-xl font-semibold mb-2 text-center">
          Set your password
        </h2>

        <p className="text-sm text-muted-foreground mb-4 text-center">
          Bạn đăng nhập bằng Google, hãy tạo password để dùng đăng nhập
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded mb-3"
          placeholder="New password"
        />

        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full border p-2 rounded mb-4"
          placeholder="Confirm password"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save password"}
        </button>
      </form>
    </div>
  );
};

export default SetPassword;
