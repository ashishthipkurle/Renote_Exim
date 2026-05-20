"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  Building2,
  MapPin,
  Globe,
  Phone,
  Mail,
  Camera,
  ShieldCheck,
  Lock,
  Save,
  CheckCircle2,
  ChevronLeft,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
  Clock,
  XCircle,
  BadgeCheck,
  FileText,
  Upload,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import { authFetch } from "@/lib/api-utils";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import GifLoader from "@/components/ui/GifLoader";
import axios from "axios";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  businessName: string | null;
  country: string | null;
  phone: string | null;
  phoneVerified?: boolean;
  address: string | null;
  avatar: string | null;
  role: string;
  verificationStatus: string;
  preferredCurrency: string;
  b2bActive: boolean;
  b2cActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const KYC_STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: any; description: string }> = {
  PENDING: {
    label: "Pending Verification",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20",
    icon: Clock,
    description: "Your KYC verification is pending review. Please submit the required documents.",
  },
  VERIFIED: {
    label: "Verified",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20",
    icon: BadgeCheck,
    description: "Your identity has been verified. You have full access to the platform.",
  },
  REJECTED: {
    label: "Rejected",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20",
    icon: XCircle,
    description: "Your verification was rejected. Please resubmit your documents with correct information.",
  },
  SUSPENDED: {
    label: "Suspended",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20",
    icon: AlertTriangle,
    description: "Your account has been suspended. Contact support for assistance.",
  },
};

const ROLE_LABELS: Record<string, string> = {
  USER: "User",
  CONSUMER: "Consumer",
  IMPORTER: "Importer",
  EXPORTER: "Exporter",
  SUPPLIER: "Supplier",
  ADMIN: "Administrator",
};

export default function ProfilePage() {
  const { refreshUser } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "kyc" | "security">("profile");
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  
  const [showOTP, setShowOTP] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const [form, setForm] = useState({
    name: "",
    businessName: "",
    country: "",
    phone: "",
    address: "",
  });

  // Password change state
  const [passwordForm, setPasswordForm] = useState({ newPassword: "", confirmPassword: "" });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    authFetch<{ user: ProfileData }>("/api/user/profile")
      .then(({ user }) => {
        setProfile(user);
        setForm({
          name: user.name || "",
          businessName: user.businessName || "",
          country: user.country || "",
          phone: user.phone || "",
          address: user.address || "",
        });
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        ...(profile?.phone && form.phone !== profile.phone ? { phoneVerified: false } : {}),
      };
      const res = await authFetch<{ user: ProfileData }>("/api/user/profile", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      setProfile(res.user);
      toast.success("Profile updated successfully");
      refreshUser();
    } catch {
      toast.error("Update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const requestPhoneOTP = async () => {
    if (!form.phone) {
      toast.error("Please enter a phone number first.");
      return;
    }
    try {
      setSaving(true);
      const res = await axios.post("/api/auth/send-otp", {
        email: form.phone, // using the email field for phone number for now, as our API currently supports single contact identifier
        purpose: "PHONE_VERIFY",
      });
      setShowOTP(true);
      toast.success("Verification code sent to your phone!");
      if (res.data.devCode) {
        console.log("[Dev] Phone OTP Code:", res.data.devCode);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to send verification code");
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyOTP = async () => {
    setVerifyingOtp(true);
    try {
      // 1. Verify OTP
      const verifyRes = await axios.post("/api/auth/verify-otp", {
        email: form.phone,
        code: otpValue,
        purpose: "PHONE_VERIFY",
      });

      if (!verifyRes.data.verified) {
        toast.error("Invalid verification code.");
        setVerifyingOtp(false);
        return;
      }

      // 2. Mark phone as verified in DB
      const response = await authFetch<{ user: ProfileData }>("/api/user/profile", {
        method: "PATCH",
        body: JSON.stringify({ phoneVerified: true, phone: form.phone }),
      });
      setProfile(response.user);
      setShowOTP(false);
      setOtpValue("");
      toast.success("Phone number verified successfully!");
    } catch (error: any) {
      toast.error("Failed to verify phone number");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setChangingPassword(true);
    try {
      await authFetch("/api/user/change-password", {
        method: "POST",
        body: JSON.stringify({ newPassword: passwordForm.newPassword }),
      });
      toast.success("Password changed successfully");
      setPasswordForm({ newPassword: "", confirmPassword: "" });
    } catch {
      toast.error("Failed to change password. Please try again.");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex flex-col min-h-[100dvh] w-full bg-background">
          <DashboardHeader />
          <div className="flex-1 flex items-center justify-center">
            <GifLoader />
          </div>
        </div>
      </SidebarProvider>
    );
  }

  const kyc = KYC_STATUS_MAP[profile?.verificationStatus || "PENDING"] || KYC_STATUS_MAP.PENDING;
  const KycIcon = kyc.icon;

  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-[100dvh] w-full bg-background">
        <DashboardHeader />
        <div className="flex-1 overflow-y-auto bg-background">
          <div className="mx-auto w-full max-w-5xl px-4 md:px-8 py-8">
            {/* Back link */}
            <div className="mb-6">
              <Link
                href="/products"
                className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back to Marketplace
              </Link>
            </div>

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-foreground">My Profile</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your account details, verification, and security settings.
                </p>
              </div>
              {activeTab === "profile" && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              )}
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 p-1 bg-muted/50 rounded-xl border border-border mb-8 w-fit">
              {(
                [
                  { key: "profile", label: "Profile", icon: User },
                  { key: "kyc", label: "KYC Verification", icon: ShieldCheck },
                  { key: "security", label: "Security", icon: Lock },
                ] as const
              ).map(({ key, label, icon: TabIcon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === key
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* ─── PROFILE TAB ─── */}
            {activeTab === "profile" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                {/* Avatar + Basic Info */}
                <div className="flex flex-col sm:flex-row items-start gap-8 p-6 rounded-xl border border-border bg-card">
                  <div className="relative group flex-shrink-0">
                    <div className="size-28 rounded-2xl bg-muted/40 border-2 border-border flex items-center justify-center text-4xl overflow-hidden">
                      {profile?.avatar ? (
                        <Image
                          src={profile.avatar}
                          alt="Avatar"
                          width={112}
                          height={112}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <span className="font-black text-foreground">
                          {form.name?.[0]?.toUpperCase() || "U"}
                        </span>
                      )}
                    </div>
                    <button className="absolute -bottom-2 -right-2 size-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg border-2 border-background group-hover:scale-110 transition-transform">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-foreground">{profile?.name || "User"}</h2>
                    <p className="text-sm text-muted-foreground">{profile?.email}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
                        {ROLE_LABELS[profile?.role || "USER"] || profile?.role}
                      </span>
                      <span className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 ${kyc.bg} ${kyc.color}`}>
                        <KycIcon className="w-3 h-3" />
                        {kyc.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Member since {new Date(profile?.createdAt || "").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>

                {/* Personal Details */}
                <div className="p-6 rounded-xl border border-border bg-card space-y-6">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" /> Personal Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputField label="Full Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} icon={User} placeholder="Your full name" />
                    <InputField label="Email Address" value={profile?.email || ""} readOnly icon={Mail} />
                    <div className="relative">
                      <InputField label="Phone Number" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} icon={Phone} placeholder="+91 12345 67890" />
                      {profile?.phone && profile.phone === form.phone && (
                        <div className="absolute right-3 top-[34px] flex items-center">
                          {profile?.phoneVerified ? (
                            <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded text-xs font-bold">
                              <BadgeCheck className="w-3 h-3" /> Verified
                            </div>
                          ) : (
                            <button onClick={requestPhoneOTP} type="button" className="text-primary hover:text-primary/80 text-xs font-bold bg-primary/10 px-2 py-0.5 rounded transition-colors">
                              Verify OTP
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <InputField label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} icon={Globe} placeholder="India" />
                  </div>
                </div>

                {/* Business Details */}
                <div className="p-6 rounded-xl border border-border bg-card space-y-6">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" /> Business Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <InputField label="Business Name" value={form.businessName} onChange={(v) => setForm({ ...form, businessName: v })} icon={Building2} placeholder="Your company name" />
                    </div>
                    <div className="md:col-span-2">
                      <InputField label="Business Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} icon={MapPin} placeholder="Full business address" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── KYC TAB ─── */}
            {activeTab === "kyc" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                {/* KYC Status Card */}
                <div className={`p-6 rounded-xl border ${kyc.bg}`}>
                  <div className="flex items-start gap-4">
                    <div className={`size-12 rounded-xl flex items-center justify-center ${kyc.color} bg-background/60`}>
                      <KycIcon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-bold ${kyc.color}`}>{kyc.label}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{kyc.description}</p>
                    </div>
                  </div>
                </div>

                {/* KYC Steps */}
                <div className="p-6 rounded-xl border border-border bg-card space-y-6">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" /> Verification Steps
                  </h3>

                  <div className="space-y-4">
                    {[
                      {
                        step: 1,
                        title: "Personal Information",
                        description: "Complete your profile with your full name, phone number, country and address.",
                        done: !!(profile?.name && profile?.phone && profile?.address && profile?.country && profile?.phoneVerified),
                        content: (
                          <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                             <InputField label="Full Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} icon={User} placeholder="Your full name" />
                             <InputField label="Email Address" value={profile?.email || ""} readOnly icon={Mail} />
                             
                             <div className="relative">
                               <InputField label="Phone Number" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} icon={Phone} placeholder="+91 12345 67890" />
                               {profile?.phone && profile.phone === form.phone && (
                                  <div className="absolute right-3 top-[34px] flex items-center">
                                    {profile?.phoneVerified ? (
                                      <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded text-xs font-bold">
                                        <BadgeCheck className="w-3 h-3" /> Verified
                                      </div>
                                    ) : (
                                      <button onClick={requestPhoneOTP} type="button" className="text-primary hover:text-primary/80 text-xs font-bold bg-primary/10 px-2 py-0.5 rounded transition-colors">
                                        Verify OTP
                                      </button>
                                    )}
                                  </div>
                               )}
                             </div>
                             <InputField label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} icon={Globe} placeholder="India" />

                             <div className="md:col-span-2">
                               <InputField label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} icon={MapPin} placeholder="Full address" />
                             </div>
                             <div className="md:col-span-2 flex justify-end mt-2">
                               <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl shadow-md hover:opacity-90 transition-all disabled:opacity-50 inline-flex items-center gap-2">
                                 {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                 {saving ? "Saving..." : "Save & Continue"}
                               </button>
                             </div>
                          </div>
                        )
                      },
                      {
                        step: 2,
                        title: "Business Details",
                        description: "Add your business name and address for B2B trade verification.",
                        done: !!(profile?.businessName && profile?.address),
                        content: (
                          <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                              <InputField label="Business Name" value={form.businessName} onChange={(v) => setForm({ ...form, businessName: v })} icon={Building2} placeholder="Your company name" />
                            </div>
                            <div className="md:col-span-2">
                              <InputField label="Business Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} icon={MapPin} placeholder="Full business address" />
                            </div>
                            <InputField label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} icon={Globe} placeholder="India" />
                            <div className="md:col-span-2 flex justify-end mt-2">
                               <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl shadow-md hover:opacity-90 transition-all disabled:opacity-50 inline-flex items-center gap-2">
                                 {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                 {saving ? "Saving..." : "Save & Continue"}
                               </button>
                             </div>
                          </div>
                        )
                      },
                      {
                        step: 3,
                        title: "Document Submission",
                        description: "Upload government-issued ID and proof of business registration.",
                        done: profile?.verificationStatus === "VERIFIED",
                        content: (
                          <div className="mt-4 pt-4 border-t border-border/50">
                            <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-border rounded-xl bg-muted/10">
                              <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                                <Upload className="w-6 h-6 text-primary" />
                              </div>
                              <p className="text-base font-bold text-foreground">Upload Documents</p>
                              <p className="text-sm text-muted-foreground mt-1 max-w-sm">Accepted formats: PDF, JPG, PNG · Max size: 10 MB each</p>
                              <button className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-bold hover:bg-secondary/80 transition-all shadow-sm border border-border/50">
                                <Upload className="w-4 h-4" /> Select Files
                              </button>
                            </div>
                          </div>
                        )
                      },
                      {
                        step: 4,
                        title: "Review & Approval",
                        description: "Our compliance team will review your documents within 2-3 business days.",
                        done: profile?.verificationStatus === "VERIFIED",
                        content: (
                          <div className="mt-4 pt-4 border-t border-border/50 space-y-4">
                             {profile?.verificationStatus === "VERIFIED" ? (
                               <div className="p-5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-start gap-4">
                                 <div className="size-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                   <BadgeCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                 </div>
                                 <div>
                                   <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Verification Approved</h4>
                                   <p className="text-sm text-emerald-600/80 dark:text-emerald-400/70 mt-1">Your documents have been reviewed and approved by our compliance team. You now have full platform access.</p>
                                 </div>
                               </div>
                             ) : profile?.verificationStatus === "REJECTED" ? (
                               <div className="p-5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-start gap-4">
                                 <div className="size-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                   <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                 </div>
                                 <div>
                                   <h4 className="text-sm font-bold text-red-700 dark:text-red-300">Verification Rejected</h4>
                                   <p className="text-sm text-red-600/80 dark:text-red-400/70 mt-1">Your documents were not approved. Please re-upload valid documents in Step 3 and re-submit for review. Check your notifications for details.</p>
                                 </div>
                               </div>
                             ) : (
                               <div className="p-5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-start gap-4">
                                 <div className="size-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                                   <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                 </div>
                                 <div>
                                   <h4 className="text-sm font-bold text-amber-700 dark:text-amber-300">Pending Review</h4>
                                   <p className="text-sm text-amber-600/80 dark:text-amber-400/70 mt-1">Your profile will be reviewed by our compliance team once all previous steps are completed and documents are submitted. You will receive a notification when verification is complete.</p>
                                 </div>
                               </div>
                             )}
                          </div>
                        )
                      },
                    ].map(({ step, title, description, done, content }) => (
                      <div
                        key={step}
                        onClick={() => setExpandedStep(expandedStep === step ? null : step)}
                        className={`flex flex-col p-5 rounded-2xl border transition-all cursor-pointer select-none ${
                          done ? "border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-500/5 hover:bg-emerald-50/80 dark:hover:bg-emerald-500/10" : 
                          expandedStep === step ? "border-primary/40 bg-primary/5 shadow-sm" : 
                          "border-border bg-card hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`size-10 rounded-full flex items-center justify-center flex-shrink-0 text-base font-black shadow-sm ${
                              done ? "bg-emerald-500 text-white" : 
                              expandedStep === step ? "bg-primary text-primary-foreground" : 
                              "bg-muted text-muted-foreground border border-border"
                            }`}
                          >
                            {done ? <CheckCircle2 className="w-5 h-5" /> : step}
                          </div>
                          <div className="flex-1 mt-0.5">
                            <h4 className={`text-base font-bold ${expandedStep === step ? "text-primary" : "text-foreground"}`}>{title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{description}</p>
                          </div>
                          <div className="text-muted-foreground mt-2 ml-2">
                            <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${expandedStep === step ? "rotate-180 text-primary" : ""}`} />
                          </div>
                        </div>
                        {expandedStep === step && (
                           <div onClick={(e) => e.stopPropagation()} className="cursor-default animate-in slide-in-from-top-2 fade-in duration-300">
                             {content}
                           </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ─── SECURITY TAB ─── */}
            {activeTab === "security" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                {/* Change Password */}
                <div className="p-6 rounded-xl border border-border bg-card space-y-6">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Lock className="w-5 h-5 text-primary" /> Change Password
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Update your password to keep your account secure. Your new password must be at least 8 characters.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-1">
                        New Password
                      </label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          placeholder="••••••••"
                          className="w-full bg-muted/30 border border-border rounded-xl py-3.5 pl-12 pr-12 text-foreground text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/30"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-1">
                        Confirm New Password
                      </label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          placeholder="••••••••"
                          className="w-full bg-muted/30 border border-border rounded-xl py-3.5 pl-12 pr-12 text-foreground text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/30"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Password strength indicators */}
                  {passwordForm.newPassword.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((level) => {
                          const strength =
                            (passwordForm.newPassword.length >= 8 ? 1 : 0) +
                            (/[A-Z]/.test(passwordForm.newPassword) ? 1 : 0) +
                            (/[0-9]/.test(passwordForm.newPassword) ? 1 : 0) +
                            (/[^A-Za-z0-9]/.test(passwordForm.newPassword) ? 1 : 0);
                          return (
                            <div
                              key={level}
                              className={`h-1.5 flex-1 rounded-full transition-colors ${
                                level <= strength
                                  ? strength <= 1
                                    ? "bg-red-500"
                                    : strength <= 2
                                    ? "bg-amber-500"
                                    : strength <= 3
                                    ? "bg-blue-500"
                                    : "bg-emerald-500"
                                  : "bg-muted"
                              }`}
                            />
                          );
                        })}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Use 8+ characters with uppercase, numbers, and symbols for a strong password.
                      </p>
                    </div>
                  )}

                  {passwordForm.newPassword.length > 0 &&
                    passwordForm.confirmPassword.length > 0 &&
                    passwordForm.newPassword !== passwordForm.confirmPassword && (
                      <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Passwords do not match
                      </p>
                    )}

                  <button
                    onClick={handleChangePassword}
                    disabled={
                      changingPassword ||
                      passwordForm.newPassword.length < 8 ||
                      passwordForm.newPassword !== passwordForm.confirmPassword
                    }
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    Update Password
                  </button>
                </div>

                {/* Account Info */}
                <div className="p-6 rounded-xl border border-border bg-card space-y-4">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" /> Account Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/30 border border-border">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Account ID</p>
                      <p className="text-sm font-mono text-foreground mt-1 truncate">{profile?.id}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 border border-border">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Role</p>
                      <p className="text-sm font-semibold text-foreground mt-1">{ROLE_LABELS[profile?.role || "USER"]}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 border border-border">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Created</p>
                      <p className="text-sm font-semibold text-foreground mt-1">
                        {new Date(profile?.createdAt || "").toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 border border-border">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Last Updated</p>
                      <p className="text-sm font-semibold text-foreground mt-1">
                        {new Date(profile?.updatedAt || "").toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mock OTP Modal */}
      {showOTP && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
          <div className="bg-card w-full max-w-sm rounded-2xl shadow-xl border border-border overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-2">Verify Phone Number</h3>
              <p className="text-sm text-muted-foreground mb-6">Enter the 6-digit OTP sent to {form.phone}.</p>
              
              <div className="space-y-4">
                <div>
                  <input 
                    type="text" 
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456" 
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background text-center text-xl tracking-widest font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowOTP(false)} className="flex-1 py-3 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
                    Cancel
                  </button>
                  <button 
                    onClick={handleVerifyOTP} 
                    disabled={otpValue.length !== 6 || verifyingOtp}
                    className="flex-1 py-3 bg-primary text-primary-foreground text-sm font-bold rounded-xl shadow-md hover:bg-primary/90 transition-all disabled:opacity-50"
                  >
                    {verifyingOtp ? "Verifying..." : "Verify OTP"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </SidebarProvider>
  );
}

/* ─── Reusable Input Field ─── */
function InputField({
  label,
  value,
  onChange,
  icon: Icon,
  placeholder,
  readOnly,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  icon: any;
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-1">
        {label}
      </label>
      <div className="relative group">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          value={value}
          readOnly={readOnly}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-muted/30 border border-border rounded-xl py-3.5 pl-12 pr-5 text-foreground text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/30 ${
            readOnly ? "opacity-50 cursor-not-allowed bg-muted/10" : "hover:border-primary/30"
          }`}
        />
      </div>
    </div>
  );
}
