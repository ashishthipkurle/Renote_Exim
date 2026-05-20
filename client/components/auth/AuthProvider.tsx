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
  // Track consecutive failures to avoid logout on temporary blips
  const consecutiveFailures = useRef(0);
  const MAX_FAILURES_BEFORE_LOGOUT = 3;

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
        // Reset failure counter on success
        consecutiveFailures.current = 0;
        setUser(res.data.user);
        // Persist to localStorage for fast re-mount
        if (typeof window !== "undefined") {
          window.localStorage.setItem("user_profile", JSON.stringify(res.data.user));
          // Also store the last successful auth timestamp
          window.localStorage.setItem("last_auth_success", Date.now().toString());
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
        // Server returned no user — but only logout if we've had multiple consecutive failures
        consecutiveFailures.current++;
        console.warn(`[AuthProvider] No user returned. Failure count: ${consecutiveFailures.current}/${MAX_FAILURES_BEFORE_LOGOUT}`);
        if (consecutiveFailures.current >= MAX_FAILURES_BEFORE_LOGOUT) {
          setUser(null);
          if (typeof window !== "undefined") {
            window.localStorage.removeItem("user_profile");
            window.localStorage.removeItem("last_auth_success");
          }
        }
      }
    } catch (error: any) {
      const status = error.response?.status;
      console.error("[AuthProvider] User fetch error:", status || error.message);
      
      // Only clear user on explicit 401 (unauthorized) — NOT on network errors, timeouts, or 503
      if (status === 401) {
        consecutiveFailures.current++;
        console.warn(`[AuthProvider] 401 received. Failure count: ${consecutiveFailures.current}/${MAX_FAILURES_BEFORE_LOGOUT}`);
        // Require multiple consecutive 401s before actually logging out
        // This prevents a single flaky response from killing the session
        if (consecutiveFailures.current >= MAX_FAILURES_BEFORE_LOGOUT) {
          setUser(null);
          if (typeof window !== "undefined") {
            window.localStorage.removeItem("user_profile");
            window.localStorage.removeItem("last_auth_success");
          }
        }
      } else {
        // Network error, timeout, 503, etc. — keep the cached user, don't logout
        console.log("[AuthProvider] Non-auth error, keeping cached user.");
      }
    } finally {
      fetchInProgress.current = false;
      setLoading(false);
    }
  }, [syncSession]);

  const refreshUser = useCallback(async () => {
    await fetchUser(true);
  }, [fetchUser]);

  const logout = async () => {
    try {
      setLoading(true);
      await axios.post("/api/auth/logout").catch(() => { });
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("user_profile");
        window.localStorage.removeItem("user");
        window.localStorage.removeItem("last_auth_success");
      }
      setUser(null);
      await nhost.auth.signOut().catch((e) => console.log("Nhost signout skipped:", e.message));
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("[AuthProvider] Provider mounted. Current user state:", !!user);
    const hasCachedUser = typeof window !== "undefined" && !!window.localStorage.getItem("user_profile");
    fetchUser(hasCachedUser);
    
    const REFRESH_INTERVAL_MS = 10 * 60 * 1000;
    const intervalId = setInterval(() => {
      if (document.hidden) {
        console.log("[AuthProvider] Periodic token refresh skipped because tab is hidden.");
        return;
      }
      console.log("[AuthProvider] Periodic token refresh triggered.");
      fetchUser(true);
    }, REFRESH_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("[AuthProvider] Tab became visible. Refreshing session...");
        fetchUser(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchUser, user]);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
