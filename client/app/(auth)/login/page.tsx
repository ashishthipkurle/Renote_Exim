"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Lock,
  Mail,
  ShieldCheck,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

function getApiErrorMessage(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;
  const response = (error as { response?: unknown }).response;
  if (!response || typeof response !== "object") return null;
  const data = (response as { data?: unknown }).data;
  if (!data || typeof data !== "object") return null;
  const message = (data as { error?: unknown }).error;
  return typeof message === "string" ? message : null;
}

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post("/api/auth/login", formData);

      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(response.data.user));

      toast.success("Login successful!");

      // Redirect based on role
      const role = response.data.user.role.toLowerCase();
      router.push(`/dashboard/${role}`);
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error) ?? "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh w-full overflow-x-hidden">
      <div className="flex min-h-dvh w-full flex-col lg:flex-row">
        {/* Left: cinematic panel */}
        <div className="relative hidden lg:flex lg:w-7/12 xl:w-8/12 overflow-hidden items-center justify-center border-r border-border bg-muted">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(var(--primary)/0.18)_0%,_transparent_65%)]" />
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative z-10 px-16 xl:px-20 text-left max-w-3xl">
            <div className="mb-8 inline-flex items-center gap-3 px-4 py-2 rounded-full bg-background/60 border border-border backdrop-blur">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary/40 animate-ping" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
              </span>
              <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
                Network Live: 14.2ms latency
              </span>
            </div>

            <h1 className="text-5xl xl:text-7xl font-black tracking-tight leading-none mb-6">
              Trade with <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                institutional speed.
              </span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl font-light leading-relaxed mb-10">
              Secure authentication, verified counterparties, and real-time trade operations — all in one terminal.
            </p>

            <div className="flex gap-12 mt-14">
              <div>
                <div className="text-3xl font-bold">$4.2B+</div>
                <div className="text-sm text-muted-foreground uppercase tracking-widest font-semibold mt-1">
                  Volume 24H
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold">99.99%</div>
                <div className="text-sm text-muted-foreground uppercase tracking-widest font-semibold mt-1">
                  Uptime SLA
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold">256-bit</div>
                <div className="text-sm text-muted-foreground uppercase tracking-widest font-semibold mt-1">
                  Encryption
                </div>
              </div>
            </div>

            <div className="absolute bottom-10 right-10 opacity-70">
              <div className="p-5 rounded-xl bg-background/60 backdrop-blur border border-border shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">FX / USD</div>
                    <div className="font-bold text-lg">Realtime Feed</div>
                  </div>
                </div>
                <div className="h-2 w-36 bg-primary/10 rounded-full relative overflow-hidden">
                  <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-primary to-primary/60 opacity-70" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-16 relative bg-background">
          <div className="absolute top-6 right-6">
            <ThemeToggle />
          </div>

          <div className="w-full max-w-[440px]">
            {/* Brand */}
            <div className="flex items-center justify-between mb-10">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-sm">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="text-2xl font-black tracking-tight">
                  Renote<span className="text-primary">Exim</span>
                </span>
              </Link>

              <div className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Secured
              </div>
            </div>

            {/* Toggle */}
            <div className="flex p-1 bg-muted rounded-xl mb-8 w-fit border border-border">
              <Link
                href="/login"
                className="px-6 py-2 rounded-lg text-sm font-bold bg-background shadow-sm"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-6 py-2 rounded-lg text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign Up
              </Link>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight">Access Terminal</h1>
                <p className="text-muted-foreground">
                  Welcome back. Enter your credentials to continue.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground ml-1">
                    Email
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-5 h-5" />
                    <input
                      className="w-full pl-12 pr-4 py-4 bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all placeholder:text-muted-foreground"
                      placeholder="you@company.com"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-sm font-semibold text-muted-foreground">
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      Lost key?
                    </Link>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-5 h-5" />
                    <input
                      className="w-full pl-12 pr-4 py-4 bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all placeholder:text-muted-foreground"
                      placeholder="••••••••"
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 py-1">
                  <input
                    className="w-5 h-5 rounded border-input bg-background text-primary focus:ring-ring/30"
                    id="remember"
                    type="checkbox"
                  />
                  <label
                    className="text-sm text-muted-foreground select-none cursor-pointer"
                    htmlFor="remember"
                  >
                    Stay signed in on this device
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  size="lg"
                  className="w-full group"
                >
                  {isLoading ? (
                    "Signing in..."
                  ) : (
                    <>
                      Join the Network
                      <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                    </>
                  )}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                New here?{" "}
                <Link href="/register" className="text-primary font-semibold hover:underline">
                  Create an account
                </Link>
                .
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
