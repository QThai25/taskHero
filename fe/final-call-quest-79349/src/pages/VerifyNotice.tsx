import { useLocation } from "react-router-dom";
import { useState } from "react";
import { authLocalApi } from "../api/authLocal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VerifyNotice() {
  const location = useLocation();
  const email = location.state?.email;
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="p-8 text-center">
            <p className="text-red-600">Missing email</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleResend = async () => {
    try {
      setLoading(true);
      await authLocalApi.resendVerify(email);
      setSent(true);
    } catch (err) {
      alert(err.response?.data?.message || "Resend failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">Verify your email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Email <strong>{email}</strong> chưa được xác thực. Vui lòng kiểm tra inbox và spam.
          </p>
          <Button onClick={handleResend} disabled={loading} className="w-full">
            {loading ? "Sending..." : "Resend verification email"}
          </Button>
          {sent && (
            <p className="text-green-600 text-center font-semibold">✅ Verification email đã được gửi lại</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}