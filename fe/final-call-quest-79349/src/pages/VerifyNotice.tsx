// src/pages/VerifyNotice.tsx
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { authLocalApi } from "../api/authLocal";

export default function VerifyNotice() {
  const location = useLocation();
  const email = location.state?.email;
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (!email) {
    return <p>Missing email</p>;
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
    <div style={{ maxWidth: 400 }}>
      <h2>Verify your email</h2>

      <p>
        Email <b>{email}</b> chưa được xác thực.  
        Vui lòng kiểm tra inbox và spam.
      </p>

      <button onClick={handleResend} disabled={loading}>
        {loading ? "Sending..." : "Resend verification email"}
      </button>

      {sent && <p>✅ Verification email đã được gửi lại</p>}
    </div>
  );
}
