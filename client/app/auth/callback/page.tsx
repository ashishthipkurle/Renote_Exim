"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "sonner";
import axios from "axios";
import { Loader2, Zap } from "lucide-react";

/**
 * OAuth Callback Page - Simplified & Robust
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [message, setMessage] = useState("Completing sign-in...");
  const processed = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      if (processed.current) return;

      try {
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        const urlParams = new URLSearchParams(window.location.search);

        const refreshToken = hashParams.get("refreshToken") || urlParams.get("refreshToken");
        const type = hashParams.get("type") || urlParams.get("type");

        if (!refreshToken) {
          // Check if we are already logged in (e.g. cookies exist)
          await refreshUser();
          router.push("/dashboard");
          return;
        }

        processed.current = true;
        setMessage("Authenticating...");

        // Exchange token
        const subdomain = process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN;
        const region = process.env.NEXT_PUBLIC_NHOST_REGION;

        const tokenRes = await fetch(
          `https://${subdomain}.auth.${region}.nhost.run/v1/token`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          }
        );

        if (!tokenRes.ok) {
           // If exchange fails, we might still have a valid session from a previous run
           await refreshUser();
           router.push("/dashboard");
           return;
        }

        const tokenData = await tokenRes.json();
        const accessToken = tokenData.accessToken || tokenData.session?.accessToken || tokenData.jwt_token;
        const newRefreshToken = tokenData.refreshToken || tokenData.session?.refreshToken;
        const user = tokenData.user || tokenData.session?.user;

        if (!accessToken) throw new Error("No access token");

        // Sync to server
        await axios.post("/api/auth/sync", {
          accessToken,
          refreshToken: newRefreshToken || refreshToken,
          user,
        });

        // Sync to Local DB
        if (user) {
          // Save to localStorage so the AuthProvider sees it immediately on the next page mount
          if (typeof window !== "undefined") {
            window.localStorage.setItem("user_profile", JSON.stringify(user));
          }

          await axios.post("/api/auth/oauth/sync-user", {
            id: user.id,
            email: user.email,
            displayName: user.displayName || user.email?.split("@")[0] || "User",
            avatarUrl: user.avatarUrl || null,
          }).catch(() => {});
        }

        setStatus("success");
        setMessage("Welcome! Redirecting...");
        
        await new Promise(r => setTimeout(r, 800));
        await refreshUser();
        
        toast.success("Login successful!");
        
        // Use full window redirect for maximum reliability with cookies/state
        window.location.href = "/dashboard";

      } catch (error: any) {
        console.error("Auth Error:", error);
        // Final attempt to see if we're actually logged in
        await refreshUser();
        window.location.href = "/dashboard";
      }
    };

    handleCallback();
  }, [router, refreshUser]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 text-center max-w-md px-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-sm">
            <Zap className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black tracking-tight">
            Renote<span className="text-primary">Exim</span>
          </span>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-muted flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <div className="absolute -inset-2 rounded-full border-2 border-primary/20 animate-ping" />
          </div>
          <p className="text-muted-foreground font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
}
