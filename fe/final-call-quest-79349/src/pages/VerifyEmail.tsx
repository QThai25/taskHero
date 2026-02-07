import { CSSProperties, useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

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
    <div style={wrapper}>
      <div style={card}>
        {status === "loading" && <p>Verifying email...</p>}
        {status === "success" && <p style={{ color: "green" }}>Email verified 🎉</p>}
        {status === "error" && <p style={{ color: "red" }}>Verify failed ❌</p>}
      </div>
    </div>
  );
}

const wrapper: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f9fafb",
};

const card: CSSProperties = {
  background: "#fff",
  padding: 32,
  borderRadius: 12,
  width: 360,
  textAlign: "center",
};
