import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "./auth-api";
import * as api from "./auth-api";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Try to populate an optimistic user from the token payload so the UI
  // doesn't flash signed-out on page refresh. We still call `fetchMe` to
  // verify the token and fetch fresh user info.
  useEffect(() => {
    let mounted = true;
    const token = api.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        // JWT standard: sub -> user id, and we include name/email in token
        if (mounted) setUser({ id: payload.sub, email: payload.email, name: payload.name });
      } catch {
        // ignore
      }
    }

    api
      .fetchMe()
      .then((u) => {
        if (mounted) setUser(u);
      })
      .catch(() => setUser(null))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const u = await api.signIn(email, password);
    setUser(u);
  };
  const signUp = async (name: string, email: string, password: string) => {
    const u = await api.signUp(name, email, password);
    setUser(u);
  };
  const signOut = () => {
    api.clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
