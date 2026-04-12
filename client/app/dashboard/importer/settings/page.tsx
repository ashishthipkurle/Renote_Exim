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
 <div className="h-full flex items-center justify-center bg-background">
 <Loader2 className="w-10 h-10 text-foreground animate-spin" />
 </div>
 );
 }

 return (
 <div className="h-dvh overflow-hidden flex flex-col bg-background transition-colors duration-300">
 <header className="flex-shrink-0 p-6 lg:p-8 border-b border-border bg-header backdrop-blur-xl z-20">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-black tracking-tight text-foreground uppercase ">Management Console</h1>
 <p className="text-muted-foreground font-black text-[10px] uppercase tracking-widest mt-1">Configure your global procurement identity and node protocols</p>
 </div>
 <button
 onClick={handleSave}
 disabled={saving}
 className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground border-transparent font-black px-8 py-3.5 rounded-lg flex items-center gap-3 transition-all shadow-xl shadow-primary/5 active:scale-95 text-[10px] uppercase tracking-[0.2em]"
 >
 {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
 Save Manifest
 </button>
 </div>
 </header>

 <div className="flex-1 flex overflow-hidden">
 {/* Nav Sidebar */}
 <aside className="w-72 border-r border-border bg-header backdrop-blur-xl p-6 space-y-3 overflow-y-auto hidden lg:block transition-all">
 <TabButton active={activeTab === "profile"} onClick={() => setActiveTab("profile")} icon={User} label="Profile Persona" />
 <TabButton active={activeTab === "business"} onClick={() => setActiveTab("business")} icon={Building2} label="Entity Details" />
 <TabButton active={activeTab === "security"} onClick={() => setActiveTab("security")} icon={Lock} label="Security Core" />
 </aside>

 <main className="flex-1 overflow-y-auto p-6 lg:p-12">
 <div className="max-w-[800px] mx-auto space-y-12 pb-20">

 {activeTab === "profile" && (
 <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
 {/* Header Section */}
 <div className="flex items-center gap-10">
 <div className="relative group">
 <div className="size-36 rounded-lg bg-muted/40 border border-border flex items-center justify-center text-5xl shadow-2xl relative overflow-hidden backdrop-blur-xl group-hover:border-border transition-all">
 {profile?.avatar ? (
 <img src={profile.avatar} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
 ) : (
 <span className="font-black text-foreground ">{form.name?.[0]?.toUpperCase() || "I"}</span>
 )}
 </div>
 <button className="absolute -bottom-3 -right-3 size-12 rounded-lg bg-primary text-primary-foreground border-transparent flex items-center justify-center shadow-2xl border-4 border-background group-hover:scale-110 transition-transform active:scale-90">
 <Camera className="w-5 h-5" />
 </button>
 </div>
 <div>
 <h2 className="text-3xl font-black text-foreground uppercase tracking-tighter">Institutional Profile</h2>
 <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mt-2">How your entity appears to global resource nodes.</p>
 <div className="flex items-center gap-4 mt-6">
 <span className="px-4 py-1.5 rounded-full bg-muted/20 border border-border text-foreground text-[9px] font-black uppercase tracking-widest shadow-xl">Importer Node</span>
 <span className="flex items-center gap-2 text-muted-foreground text-[9px] font-black uppercase tracking-widest ">
 <CheckCircle2 className="w-3.5 h-3.5 text-foreground/40" /> Verified Protocol
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
 <div className="flex items-center gap-5 border-b border-white/5 pb-8">
 <Building2 className="w-7 h-7 text-foreground" />
 <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter">Corporate Identity</h2>
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
 <div className="flex items-center gap-5 border-b border-white/5 pb-8">
 <ShieldCheck className="w-7 h-7 text-foreground" />
 <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter">Security Protocols</h2>
 </div>

 <div className="p-12 rounded-lg bg-muted/20 border border-border border-dashed text-center space-y-6 shadow-2xl backdrop-blur-xl">
 <Lock className="w-16 h-16 text-muted-foreground/20 mx-auto" />
 <h3 className="text-foreground font-black uppercase tracking-[0.2em] text-sm ">Access Credential Management</h3>
 <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest max-w-sm mx-auto leading-relaxed">Update your security passcodes to maintain integrity within the global marketplace network.</p>
 <button className="px-8 py-4 rounded-lg bg-primary text-primary-foreground border-transparent hover:bg-primary/90 font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95">
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
 className={`w-full flex items-center gap-4 p-5 rounded-lg transition-all group ${active
 ? "bg-primary text-primary-foreground border-transparent shadow-2xl shadow-primary/5 scale-105 z-10"
 : "text-muted-foreground hover:bg-muted/20 hover:text-foreground"
 }`}
 >
 <Icon className={`w-4 h-4 ${active ? "animate-pulse" : "opacity-30 group-hover:opacity-100 transition-opacity"}`} />
 <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
 </button>
 );
}

function InputGroup({ label, value, onChange, icon: Icon, placeholder, readOnly }: { label: string; value: string; onChange?: (v: string) => void; icon: any; placeholder?: string; readOnly?: boolean }) {
 return (
 <div className="space-y-3">
 <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">{label}</label>
 <div className="relative group/input">
 <Icon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 transition-all group-focus-within/input:text-foreground group-focus-within/input:scale-110" />
 <input
 type="text"
 value={value}
 readOnly={readOnly}
 onChange={(e) => onChange?.(e.target.value)}
 placeholder={placeholder}
 className={`w-full bg-muted/40 border border-border rounded-lg py-5 pl-14 pr-6 text-foreground shadow-2xl font-black text-sm focus:ring-1 focus:ring-white/20 outline-none transition-all placeholder:text-muted-foreground/20 uppercase tracking-widest ${readOnly ? "opacity-40 cursor-not-allowed bg-muted/20" : "hover:border-border"}`}
 />
 </div>
 </div>
 );
}
