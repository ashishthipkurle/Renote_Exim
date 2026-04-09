"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import type { StoredUser } from "@/lib/auth-client";

type AuthContextType = {
  user: StoredUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
  logout: async () => {},
});

/**
 * Helper: read the sb_access_token cookie value from document.cookie.
 */
function getAccessTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)sb_access_token=([^;]*)/);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]) || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);

  const clearMiddlewareTokenCookie = () => {
    if (typeof document === "undefined") return;
    document.cookie = "sb_access_token=; Path=/; Max-Age=0; SameSite=Lax";
  };

  const fetchUser = useCallback(async (token?: string) => {
    try {
      console.log("[Auth Trace] Attempting session discovery...");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get("/api/auth/me", { headers });
      
      if (res.data.user) {
        console.log("[Auth Trace] Session found:", res.data.user.email, "(Role:", res.data.user.role, ")");
        setUser(res.data.user);
      } else {
        console.log("[Auth Trace] No active session found.");
        setUser(null);
      }
    } catch (error) {
      console.warn("[Auth Trace] Session fetch failed or unauthorized.");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    console.log("[Auth Trace] Force refreshing session state...");
    setLoading(true);
    await fetchUser();
  }, [fetchUser]);

  const logout = async () => {
    try {
      setLoading(true);
      await axios.post("/api/auth/logout").catch(() => {});

      if (typeof window !== "undefined") {
        window.localStorage.removeItem("user");
      }

      clearMiddlewareTokenCookie();
      setUser(null);
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // On mount, check if there's an existing session.
    // Since we use HTTP-Only cookies, we attempt a blind fetch.
    fetchUser();
  }, [fetchUser]);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
