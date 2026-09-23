"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export type UserRole = "business" | "student";

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
};

type AuthContextValue = {
  user: User | null;
  ready: boolean;
  login: (user: User, accessToken: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

useEffect(() => {
  const timer = window.setTimeout(() => {
    try {
      const savedUser = localStorage.getItem("user");
      const token = localStorage.getItem("access_token");

      if (savedUser && token) {
        setUser(JSON.parse(savedUser));
      }
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
      setUser(null);
    } finally {
      setReady(true);
    }
  }, 0);

  return () => window.clearTimeout(timer);
}, []);

  function login(user: User, accessToken: string) {
    setUser(user);

    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );

    localStorage.setItem(
      "access_token",
      accessToken
    );
  }

  function logout() {
    setUser(null);

    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        ready,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}