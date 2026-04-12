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
 const [user, setUser] = useState<StoredUser | null>(null);
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
 console.log("[Auth Sync] Session synchronized to cookies.");
 } catch (error) {
 console.error("[Auth Sync] Failed to synchronize session:", error);
 }
 }, []);

 const fetchUser = useCallback(async () => {
 try {
 const res = await axios.get("/api/auth/me");
 if (res.data.user) {
 setUser(res.data.user);
 } else {
 setUser(null);
 }
 } catch (error) {
 setUser(null);
 } finally {
 setLoading(false);
 }
 }, []);

 const refreshUser = useCallback(async () => {
 setLoading(true);
 await fetchUser();
 }, [fetchUser]);

 const logout = async () => {
 try {
 setLoading(true);
 await nhost.auth.signOut();
 await axios.post("/api/auth/logout").catch(() => { });
 
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
 // 1. Initial Discovery and Sync
 fetchUser();
 
 // 2. Listen for Nhost session changes (including background refreshes)
 const unsubscribe = nhost.sessionStorage.onChange((session) => {
 console.log("[AuthProvider] Session state changed. Active session:", !!session);
 
 if (session) {
 syncSession(session);
 // We could call fetchUser() here if we want to immediately get the profile from API
 } else {
 syncSession(null);
 setUser(null);
 }
 });

 return () => {
 unsubscribe();
 };
 }, [fetchUser, syncSession]);

 return (
 <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
 {children}
 </AuthContext.Provider>
 );
}

export const useAuth = () => useContext(AuthContext);

