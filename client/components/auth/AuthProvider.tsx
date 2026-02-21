"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async (token?: string) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get("/api/auth/me", { headers });
      setUser(res.data.user);
    } catch (error) {
      console.error("Failed to fetch user profile", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    setLoading(true);
    const supabase = getSupabaseBrowserClient();
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) {
      await fetchUser(data.session.access_token);
    } else {
      setUser(null);
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
      
      // Attempt to hit logout route to clear HTTP-only cookies if present
      await axios.post("/api/auth/logout").catch(() => {});
      
      // Clean up legacy localStorage if it exists
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("user");
      }
      
      setUser(null);
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    
    // Initial fetch
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.access_token) {
        fetchUser(data.session.access_token);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          setUser(null);
          setLoading(false);
        } else if (session?.access_token) {
          fetchUser(session.access_token);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
