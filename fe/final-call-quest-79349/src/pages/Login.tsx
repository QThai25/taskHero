import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";
import { useAuth } from "@/contexts/AuthContext";
import { AxiosError } from "axios";
import api from "@/api/axios";
import VerifyEmail from "./VerifyEmail";
const Login = () => {
  const navigate = useNavigate();
  const { user, loginLocal } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      await loginLocal(email, password);
      navigate("/dashboard");
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string; code?: string; email?: string }>;
      const status = axiosError.response?.status;
      const data = axiosError.response?.data;

      if (status === 401) {
        setError("Email hoặc mật khẩu không đúng");
      } else if (status === 403 && data?.code === "EMAIL_NOT_VERIFIED") {
        navigate("/verify-notice", {
          state: { email: data.email },
        });
      } else {
        setError(data?.message || "Đăng nhập thất bại");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">Login</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="text-sm text-red-500 text-center bg-red-50 p-2 rounded-md border border-red-200">
              {error}
            </div>
          )}

          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full"
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}verify-notice
            onChange={(e) => setPassword(e.target.value)}
            className="w-full"
          />

          <Button className="w-full" onClick={handleLogin} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>

          <div className="text-center text-sm text-gray-600">or</div>

          <GoogleLoginButton />

          <div className="text-center text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <span
              className="text-blue-600 cursor-pointer hover:underline"
              onClick={() => navigate("/register")}
            >
              Register
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;