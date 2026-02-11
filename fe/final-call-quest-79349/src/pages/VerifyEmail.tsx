import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Card, CardContent } from "@/components/ui/card"; // Giả sử bạn dùng shadcn/ui

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasVerified = useRef(false);

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token || hasVerified.current) return;
    hasVerified.current = true;

    api
      .post(`/auth/verify-email?token=${token}`)
      .then(() => {
        setStatus("success");
        setTimeout(() => navigate("/login"), 2000);
      })
      .catch(() => setStatus("error"));
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-8 text-center">
          {status === "loading" && (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
              <p className="text-gray-700">Verifying email...</p>
            </div>
          )}
          {status === "success" && (
            <div className="flex flex-col items-center">
              <div className="text-green-500 text-4xl mb-4">🎉</div>
              <p className="text-green-600 font-semibold">Email verified successfully!</p>
              <p className="text-sm text-gray-500 mt-2">Redirecting to login...</p>
            </div>
          )}
          {status === "error" && (
            <div className="flex flex-col items-center">
              <div className="text-red-500 text-4xl mb-4">❌</div>
              <p className="text-red-600 font-semibold">Verification failed</p>
              <p className="text-sm text-gray-500 mt-2">Please try again or contact support.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}