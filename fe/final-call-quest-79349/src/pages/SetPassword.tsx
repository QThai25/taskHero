import { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { useAuth } from "@/contexts/AuthContext";
import { AxiosError } from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">Set your password</CardTitle>
          <p className="text-center text-sm text-gray-600 mt-2">
            Bạn đăng nhập bằng Google, hãy tạo password để dùng đăng nhập
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              className="w-full"
            />
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className="w-full"
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Saving..." : "Save password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SetPassword;