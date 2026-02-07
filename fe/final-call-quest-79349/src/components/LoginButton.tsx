import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "./ui/use-toast";

interface LoginButtonProps {
  email: string;
  password: string;
}

export const LocalLoginButton = ({
  email,
  password,
}: LoginButtonProps) => {
  const { loginLocal } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please enter email and password",
        variant: "destructive",
      });
      return;
    }

    try {
      await loginLocal(email, password);
      navigate("/dashboard");
    } catch (error) {
      console.error("Local login error:", error);
      toast({
        title: "Login failed",
        description: "Email or password is incorrect",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      size="lg"
      variant="outline"
      className="w-full sm:w-auto text-lg px-8"
      onClick={handleLogin}
    >
      Login
    </Button>
  );
};
