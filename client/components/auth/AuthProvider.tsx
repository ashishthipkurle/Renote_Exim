"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { nhost } from "@/lib/nhost";
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
  refreshUser: async () => { },
  logout: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(() => {
    // Synchronous initialization from localStorage to prevent flicker
    if (typeof window !== "undefined") {
      const cached = window.localStorage.getItem("user_profile");
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  /**
   * Syncs the Nhost session to server-side cookies via our sync API.
   */
  const syncSession = useCallback(async (session: any) => {
    try {
      await axios.post("/api/auth/sync", {
        accessToken: session?.accessToken || null,
        refreshToken: session?.refreshToken || null,
        user: session?.user || null,
      });
      console.log("[AuthProvider] Session synced to cookies.");
    } catch (error) {
      console.error("[AuthProvider] Failed to sync session:", error);
    }
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      // Add cache buster to ensure we get fresh data after redirect
      const res = await axios.get(`/api/auth/me?t=${Date.now()}`);
      console.log("[AuthProvider] User fetch result:", !!res.data.user);
      
      if (res.data.user) {
        setUser(res.data.user);
        // Persist to localStorage for fast re-mount
        if (typeof window !== "undefined") {
          window.localStorage.setItem("user_profile", JSON.stringify(res.data.user));
        }
        
        // If the server-side refreshed the token, sync it back
        if (res.data.newAccessToken) {
          console.log("[AuthProvider] Server refresh detected.");
          await syncSession({
            accessToken: res.data.newAccessToken,
            refreshToken: res.data.newRefreshToken,
            user: res.data.user
          });
          
          try {
            // @ts-ignore
            nhost.auth.setSession({
              accessToken: res.data.newAccessToken,
              refreshToken: res.data.newRefreshToken,
            });
          } catch (e) {}
        }
      } else {
        setUser(null);
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("user_profile");
        }
      }
    } catch (error: any) {
      console.error("[AuthProvider] User fetch error:", error.response?.status || error.message);
      // Only clear if it's a 401
      if (error.response?.status === 401) {
        setUser(null);
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("user_profile");
        }
      }
    } finally {
      setLoading(false);
    }
  }, [syncSession]);

  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  const logout = async () => {
    try {
      setLoading(true);
      
      // 1. ALWAYS clear server cookies first. If this fails, we still want to try to clear client state.
      await axios.post("/api/auth/logout").catch(() => { });
      
      // 2. Clear local storage immediately so the UI updates
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("user_profile");
        window.localStorage.removeItem("user");
      }
      setUser(null);

      // 3. Finally, tell Nhost to sign out. This might throw if the session has already expired 
      // locally, which is why it's carefully wrapped in a catch to avoid breaking the function.
      await nhost.auth.signOut().catch((e) => console.log("Nhost signout skipped:", e.message));
      
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("[AuthProvider] Provider mounted. Current user state:", !!user);
    // 1. Initial Discovery
    fetchUser();
    
    // No client-side SDK event listener is required.
    // Our entire authentication system uses a robust server-side cookie pattern
    // where `/api/auth/me` governs the state on mount and explicit `/api/auth/sync` is used when needed.
  }, [fetchUser, syncSession]);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
