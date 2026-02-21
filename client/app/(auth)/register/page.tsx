"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Globe as GlobeIcon,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
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

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const didInitRole = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "IMPORTER" as "IMPORTER" | "EXPORTER",
    companyName: "",
    country: "",
    phone: "",
    website: "",
  });

  useEffect(() => {
    if (didInitRole.current) return;
    const roleParam = (searchParams.get("role") ?? "").toLowerCase();
    if (roleParam === "exporter") {
      setFormData((prev) => ({ ...prev, role: "EXPORTER" }));
      didInitRole.current = true;
      return;
    }
    if (roleParam === "importer" || roleParam === "customer") {
      setFormData((prev) => ({ ...prev, role: "IMPORTER" }));
      didInitRole.current = true;
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post("/api/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        companyName: formData.companyName,
        country: formData.country,
        phone: formData.phone,
        website: formData.website,
      });

      if (response.data?.user) {
        // Refresh global auth context
        await refreshUser();

        toast.success("Registration successful! Welcome aboard!");

        // Redirect based on role
        const role = response.data.user.role.toLowerCase();
        router.push(`/dashboard/${role}`);
      } else {
        toast.success(response.data?.message ?? "Registration successful. Please log in.");
        router.push("/login");
      }
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error) ?? "Registration failed");
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
                Verified counterparties • Secure onboarding
              </span>
            </div>

            <h1 className="text-5xl xl:text-7xl font-black tracking-tight leading-none mb-6">
              Build your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                global trade identity.
              </span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl font-light leading-relaxed mb-10">
              Join exporters and importers worldwide with a secure, role-based account and enterprise-grade tooling.
            </p>
          </div>
        </div>

        {/* Right: form */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-16 relative bg-background">
          <div className="absolute top-6 right-6">
            <ThemeToggle />
          </div>

          <div className="w-full max-w-3xl">
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
                className="px-6 py-2 rounded-lg text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-6 py-2 rounded-lg text-sm font-bold bg-background shadow-sm"
              >
                Sign Up
              </Link>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm"
            >
              <div className="space-y-2 mb-6">
                <h1 className="text-3xl font-extrabold tracking-tight">Create Account</h1>
                <p className="text-muted-foreground">
                  Choose your role and set up your trade profile.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-semibold text-muted-foreground mb-3">
                    I want to
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: "IMPORTER" })}
                      className={`p-4 border rounded-xl text-left transition-colors ${formData.role === "IMPORTER"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:bg-accent"
                        }`}
                    >
                      <div className="font-semibold">Import Products</div>
                      <div className="text-sm text-muted-foreground mt-1">Buy from exporters</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: "EXPORTER" })}
                      className={`p-4 border rounded-xl text-left transition-colors ${formData.role === "EXPORTER"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:bg-accent"
                        }`}
                    >
                      <div className="font-semibold">Export Products</div>
                      <div className="text-sm text-muted-foreground mt-1">Sell to importers</div>
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-muted-foreground ml-1">Full Name *</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-5 h-5" />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all placeholder:text-muted-foreground"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-muted-foreground ml-1">Email *</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-5 h-5" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all placeholder:text-muted-foreground"
                        placeholder="you@company.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-muted-foreground ml-1">Password *</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-5 h-5" />
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all placeholder:text-muted-foreground"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-muted-foreground ml-1">Confirm Password *</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-5 h-5" />
                      <input
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all placeholder:text-muted-foreground"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-muted-foreground ml-1">Company Name</label>
                    <div className="relative group">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-5 h-5" />
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all placeholder:text-muted-foreground"
                        placeholder="Acme Corp"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-muted-foreground ml-1">Country *</label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-5 h-5" />
                      <input
                        type="text"
                        required
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all placeholder:text-muted-foreground"
                        placeholder="United States"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-muted-foreground ml-1">Phone</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-5 h-5" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all placeholder:text-muted-foreground"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-muted-foreground ml-1">Website</label>
                    <div className="relative group">
                      <GlobeIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-5 h-5" />
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all placeholder:text-muted-foreground"
                        placeholder="https://company.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    required
                    className="mt-1 w-5 h-5 rounded border-input bg-background text-primary focus:ring-ring/30"
                    id="terms"
                  />
                  <label htmlFor="terms" className="text-sm text-muted-foreground">
                    I agree to the{" "}
                    <Link href="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </label>
                </div>

                <Button type="submit" disabled={isLoading} size="lg" className="w-full group">
                  {isLoading ? (
                    "Creating your account..."
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                    </>
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary font-semibold hover:underline">
                    Sign in
                  </Link>
                  .
                </p>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
