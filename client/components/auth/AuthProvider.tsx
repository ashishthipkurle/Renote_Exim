"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
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
  // Only show loading spinner if there's no cached user.
  // If we have a cached user, show them immediately and refresh silently in the background.
  const [loading, setLoading] = useState(() => {
    if (typeof window !== "undefined") {
      return !window.localStorage.getItem("user_profile");
    }
    return true;
  });

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

  // Prevent multiple concurrent fetchUser calls (e.g., visibility change + periodic timer firing together)
  const fetchInProgress = useRef(false);

  const fetchUser = useCallback(async (silent = false) => {
    if (fetchInProgress.current) {
      console.log("[AuthProvider] Fetch already in progress, skipping.");
      return;
    }
    fetchInProgress.current = true;
    try {
      if (!silent) setLoading(true);
      const res = await axios.get(`/api/auth/me?t=${Date.now()}`, { timeout: 15000 });
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
      fetchInProgress.current = false;
      setLoading(false);
    }
  }, [syncSession]);

  const refreshUser = useCallback(async () => {
    await fetchUser(true); // Silent refresh — calling component has its own loading state
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
    
    // 1. Initial Data Fetch — silent if we have a cached user (prevents profile circle flicker)
    const hasCachedUser = typeof window !== "undefined" && !!window.localStorage.getItem("user_profile");
    fetchUser(hasCachedUser);
    
    // 2. Proactive Token Refresh
    // Nhost tokens expire in 15 mins. Refresh every 10 mins.
    const REFRESH_INTERVAL_MS = 10 * 60 * 1000;
    const intervalId = setInterval(() => {
      console.log("[AuthProvider] Periodic token refresh triggered.");
      fetchUser(true); // Always silent — don't disrupt the UI
    }, REFRESH_INTERVAL_MS);

    // 3. Visibility Change Handler
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("[AuthProvider] Tab became visible. Refreshing session...");
        fetchUser(true); // Always silent — don't disrupt the UI
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchUser, syncSession]);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
