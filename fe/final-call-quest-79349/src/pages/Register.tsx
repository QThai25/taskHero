import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const Register = () => {
  const navigate = useNavigate();
  const { registerLocal } = useAuth();

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleRegister = async (): Promise<void> => {
    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập đầy đủ",
        variant: "destructive",
      });
      return;
    }

    if (!isValidEmail(email)) {
      toast({
        title: "Email không hợp lệ",
        description: "Vui lòng nhập đúng định dạng email",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password quá ngắn",
        description: "Mật khẩu phải có ít nhất 6 ký tự",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Mật khẩu không khớp",
        description: "Vui lòng nhập lại đúng mật khẩu",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // 🔥 REGISTER – KHÔNG login
      await registerLocal(name, email, password);

      // 👉 lưu email để resend verify
      localStorage.setItem("pendingVerifyEmail", email);

      toast({
        title: "Đăng ký thành công 🎉",
        description: "Vui lòng kiểm tra email để xác thực",
      });

      // 👉 CHUYỂN SANG VERIFY EMAIL
      navigate("/verify-email");
    } catch (err) {
      let message = "Lỗi hệ thống, vui lòng thử lại";

      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || message;
      }

      toast({
        title: "Register failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Register</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Confirm password */}
          <Input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button
            className="w-full"
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Đã có tài khoản?{" "}
            <span
              className="text-primary cursor-pointer"
              onClick={() => navigate("/login")}
            >
              Login
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
