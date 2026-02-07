import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: Props) => {
  const { user, loading } = useAuth();

  // ⏳ đang load session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  // ❌ chưa đăng nhập
  if (!user) {
    return <Navigate to="/login" replace />;
  }


  // ✅ hợp lệ
  return children;
};

export default ProtectedRoute;
