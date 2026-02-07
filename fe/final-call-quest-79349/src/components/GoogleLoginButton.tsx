import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "./ui/use-toast";

export const GoogleLoginButton = () => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  return (
    <GoogleLogin
      onSuccess={async (credentialResponse) => {
        try {
          await loginWithGoogle(credentialResponse);
          const user = await loginWithGoogle(credentialResponse);

          if (user.needsSetPassword) {
            navigate("/set-password");
          } else {
            navigate("/dashboard");
          }
        } catch (error) {
          console.error("Login error:", error);
          toast({
            title: "Login failed",
            description: "Could not sign in with Google. Please try again.",
            variant: "destructive",
          });
        }
      }}
      onError={() => {
        console.error("Login failed");
        toast({
          title: "Login failed",
          description: "Could not sign in with Google. Please try again.",
          variant: "destructive",
        });
      }}
      useOneTap
    />
  );
};
