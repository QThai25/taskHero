/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "@/api/auth";
import { authLocalApi } from "@/api/authLocal";
import api from "@/api/axios";
import { CredentialResponse } from "@react-oauth/google";
interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  providers: ("local" | "google")[];
  needsSetPassword: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: (response: CredentialResponse) => Promise<User>;
  loginLocal: (email: string, password: string) => Promise<void>;
  registerLocal: (
    name: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ load session từ cookie
  const loadUser = async () => {
    try {
      const { data } = await api.get("/auth/me");
      if (data?.user) {
        setUser(data.user);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  // ===== GOOGLE LOGIN =====
  const loginWithGoogle = async (
    response: CredentialResponse,
  ): Promise<User> => {
    if (!response.credential) {
      throw new Error("No credential received from Google");
    }

    const { user: userData } = await authApi.googleLogin(response.credential);

    setUser(userData);

    return userData; // ⭐ BẮT BUỘC
  };

  // ===== LOCAL LOGIN =====
  const loginLocal = async (email: string, password: string) => {
    const { user } = await authLocalApi.login(email, password);
    setUser(user);
  };

  // ===== REGISTER LOCAL =====
  const registerLocal = async (
    name: string,
    email: string,
    password: string,
  ) => {
    try {
      await authLocalApi.register(name, email, password);
    } catch (error) {
      console.error("Register failed:", error);
      throw error;
    }
  };
  // ===== LOGOUT =====
  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGoogle,
        loginLocal,
        registerLocal,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
