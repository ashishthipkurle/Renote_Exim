"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/api-utils";
import { useAuth } from "@/components/auth/AuthProvider";
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
  BellRing,
  CreditCard,
  Briefcase,
  FileText,
  Save,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  companyName: string | null;
  country: string | null;
  phone: string | null;
  website: string | null;
  businessType: string | null;
  taxId: string | null;
  address: string | null;
  avatar: string | null;
  role: string;
}

export default function ImporterSettingsPage() {
  const { refreshUser } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "business" | "security">("profile");

  const [form, setForm] = useState({
    name: "",
    companyName: "",
    country: "",
    phone: "",
    website: "",
    businessType: "",
    taxId: "",
    address: "",
  });

  useEffect(() => {
    authFetch<{ user: ProfileData }>("/api/user/profile")
      .then(({ user }) => {
        setProfile(user);
        setForm({
          name: user.name || "",
          companyName: user.companyName || "",
          country: user.country || "",
          phone: user.phone || "",
          website: user.website || "",
          businessType: user.businessType || "",
          taxId: user.taxId || "",
          address: user.address || "",
        });
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await authFetch<{ user: ProfileData }>("/api/user/profile", {
        method: "PATCH",
        body: JSON.stringify(form),
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

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-[#0a0c12]">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white italic">OPERATIONAL SETTINGS</h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Configure your global procurement identity</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary hover:bg-[#0f49bd] disabled:opacity-50 text-white font-black px-8 py-3.5 rounded-2xl flex items-center gap-2 transition-all shadow-xl shadow-primary/20 active:scale-95"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Manifest
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Nav Sidebar */}
        <aside className="w-72 border-r border-white/5 p-6 space-y-2 overflow-y-auto hidden lg:block">
          <TabButton active={activeTab === "profile"} onClick={() => setActiveTab("profile")} icon={User} label="Profile Persona" />
          <TabButton active={activeTab === "business"} onClick={() => setActiveTab("business")} icon={Building2} label="Entity Details" />
          <TabButton active={activeTab === "security"} onClick={() => setActiveTab("security")} icon={Lock} label="Security Core" />
        </aside>

        <main className="flex-1 overflow-y-auto p-6 lg:p-12">
          <div className="max-w-[800px] mx-auto space-y-12 pb-20">

            {activeTab === "profile" && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
                {/* Header Section */}
                <div className="flex items-center gap-8">
                  <div className="relative group">
                    <div className="size-32 rounded-[2.5rem] bg-gradient-to-br from-primary/20 to-indigo-500/10 border-2 border-white/5 flex items-center justify-center text-4xl shadow-2xl relative overflow-hidden">
                      {profile?.avatar ? (
                        <img src={profile.avatar} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-black text-white">{form.name?.[0]?.toUpperCase() || "I"}</span>
                      )}
                    </div>
                    <button className="absolute -bottom-2 -right-2 size-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl border-4 border-[#0a0c12] group-hover:scale-110 transition-transform">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white px-1">Institutional Profile</h2>
                    <p className="text-slate-500 text-sm mt-1 px-1">How your entity appears to global exporters.</p>
                    <div className="flex items-center gap-3 mt-4">
                      <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">Importer</span>
                      <span className="flex items-center gap-1.5 text-slate-500 text-[10px] font-black uppercase tracking-widest italic">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Verified Node
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup label="Display Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} icon={User} placeholder="Operations Lead" />
                  <InputGroup label="Institutional Email" value={profile?.email || ""} readOnly icon={Mail} />
                  <InputGroup label="Direct Link (Website)" value={form.website} onChange={(v) => setForm({ ...form, website: v })} icon={Globe} placeholder="https://imports.global" />
                  <InputGroup label="Phone Sequence" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} icon={Phone} placeholder="+1 (555) 000-0000" />
                </div>
              </section>
            )}

            {activeTab === "business" && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
                <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                  <Building2 className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-black text-white uppercase tracking-tighter">Corporate Identity</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <InputGroup label="Legal Entity Name" value={form.companyName} onChange={(v) => setForm({ ...form, companyName: v })} icon={Building2} placeholder="Acme Logistics International" />
                  </div>
                  <InputGroup label="Business Classification" value={form.businessType} onChange={(v) => setForm({ ...form, businessType: v })} icon={Briefcase} placeholder="Wholesale / Distribution" />
                  <InputGroup label="Tax Identification Number" value={form.taxId} onChange={(v) => setForm({ ...form, taxId: v })} icon={FileText} placeholder="TAX-990-2211" />
                  <div className="md:col-span-2">
                    <InputGroup label="Global Headquarter Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} icon={MapPin} placeholder="123 Trade Circle, Port Elizabeth" />
                  </div>
                  <InputGroup label="Operational Region" value={form.country} onChange={(v) => setForm({ ...form, country: v })} icon={Globe} placeholder="Select Country" />
                </div>
              </section>
            )}

            {activeTab === "security" && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
                <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-black text-white uppercase tracking-tighter">Security Protocols</h2>
                </div>

                <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 border-dashed text-center space-y-4">
                  <Lock className="w-12 h-12 text-slate-700 mx-auto" />
                  <h3 className="text-white font-black uppercase tracking-widest text-sm">Access Credential Management</h3>
                  <p className="text-slate-500 text-xs max-w-sm mx-auto">Update your security passcodes to maintain integrity within the global marketplace network.</p>
                  <button className="px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest transition-all">
                    Initialize Password Reset
                  </button>
                </div>
              </section>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${active
          ? "bg-primary text-white shadow-xl shadow-primary/20"
          : "text-slate-500 hover:bg-white/5 hover:text-slate-200"
        }`}
    >
      <Icon className={`w-4 h-4 ${active ? "animate-pulse" : ""}`} />
      <span className="text-xs font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}

function InputGroup({ label, value, onChange, icon: Icon, placeholder, readOnly }: { label: string; value: string; onChange?: (v: string) => void; icon: any; placeholder?: string; readOnly?: boolean }) {
  return (
    <div className="space-y-2.5">
      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group/input">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 transition-colors group-focus-within/input:text-primary" />
        <input
          type="text"
          value={value}
          readOnly={readOnly}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white font-bold text-sm focus:ring-2 focus:ring-primary/40 outline-none transition-all placeholder:text-slate-700 ${readOnly ? "opacity-60 cursor-not-allowed" : "hover:border-white/10"}`}
        />
      </div>
    </div>
  );
}
