"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/api-utils";
import { useAuth } from "@/components/auth/AuthProvider";
import { User, Globe } from "lucide-react";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  companyName: string | null;
  country: string | null;
  phone: string | null;
  website: string | null;
  avatar: string | null;
  description: string | null;
  socialLinks: Record<string, string> | null;
  businessHours: Record<string, any> | null;
  role: string;
}

export default function ExporterSettingsPage() {
  const { refreshUser } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [form, setForm] = useState({
    name: "",
    companyName: "",
    country: "",
    phone: "",
    website: "",
    description: "",
    linkedin: "",
    twitter: "",
  });

  useEffect(() => {
    authFetch<{ user: ProfileData }>("/api/user/profile")
      .then((res) => {
        const d = res.user;
        setProfile(d);
        setForm({
          name: d.name || "",
          companyName: d.companyName || "",
          country: d.country || "",
          phone: d.phone || "",
          website: d.website || "",
          description: d.description || "",
          linkedin: (d.socialLinks as any)?.linkedin || "",
          twitter: (d.socialLinks as any)?.twitter || "",
        });
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const payload = {
        ...form,
        socialLinks: {
          linkedin: form.linkedin,
          twitter: form.twitter,
        },
      };
      const res = await authFetch<{ user: ProfileData }>("/api/user/profile", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      setProfile(res.user);
      setMsg({ type: "ok", text: "Profile updated successfully" });
      refreshUser();
    } catch {
      setMsg({ type: "err", text: "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  };

  const fields: { label: string; key: keyof typeof form; type?: string; placeholder: string }[] = [
    { label: "Full Name", key: "name", placeholder: "John Doe" },
    { label: "Company Name", key: "companyName", placeholder: "Acme Exports Ltd." },
    { label: "Country", key: "country", placeholder: "India" },
    { label: "Phone Number", key: "phone", type: "tel", placeholder: "+91 9876543210" },
    { label: "Website", key: "website", type: "url", placeholder: "https://example.com" },
    { label: "LinkedIn URL", key: "linkedin", type: "url", placeholder: "https://linkedin.com/company/acme" },
    { label: "X / Twitter URL", key: "twitter", type: "url", placeholder: "https://x.com/acme" },
  ];

  return (
    <div className="h-full overflow-hidden flex flex-col bg-background">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-border bg-header/80 backdrop-blur-md">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground uppercase italic">Account Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your profile and company information.</p>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar">
        <div className="max-w-[800px] mx-auto space-y-8">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-card rounded-xl animate-pulse border border-border" />
              ))}
            </div>
          ) : (
            <>
              {/* Avatar + Email header */}
              <div className="bg-card backdrop-blur-xl border border-border rounded-2xl p-6 flex items-center gap-6">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center text-primary font-black text-2xl border border-primary/30 overflow-hidden shadow-2xl shadow-primary/20">
                    {profile?.avatar ? (
                      <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      form.name ? form.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "?"
                    )}
                  </div>
                  <button className="absolute -bottom-2 -right-2 bg-primary text-white p-1.5 rounded-lg border border-[#0b1019] shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <User className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <div className="text-foreground font-black text-xl tracking-tight uppercase italic">{profile?.name || "—"}</div>
                  <div className="text-muted-foreground text-sm flex items-center gap-2">
                    {profile?.email}
                    <span className="size-1 rounded-full bg-border" />
                    <span className="text-primary font-black text-[10px] tracking-widest uppercase">Exporter</span>
                  </div>
                  {profile?.companyName && (
                    <div className="text-xs text-muted-foreground mt-1 font-medium">{profile.companyName}</div>
                  )}
                </div>
              </div>

              {/* Form Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Basic Info */}
                <div className="bg-card border border-border rounded-3xl p-8 space-y-6">
                  <h3 className="text-sm font-black text-foreground tracking-[0.2em] uppercase opacity-50 mb-4 italic">Basic Information</h3>
                  {fields.slice(0, 5).map((f) => (
                    <div key={f.key}>
                      <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] mb-2.5 ml-1">{f.label}</label>
                      <input
                        type={f.type || "text"}
                        value={form[f.key]}
                        onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        className="w-full bg-muted border border-border focus:border-primary/50 rounded-2xl px-5 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-all shadow-inner"
                      />
                    </div>
                  ))}
                </div>

                {/* Company & Socials */}
                <div className="space-y-8">
                  <div className="bg-card border border-border rounded-3xl p-8 space-y-6">
                    <h3 className="text-sm font-black text-foreground tracking-[0.2em] uppercase opacity-50 mb-4 italic">Social & Online</h3>
                    {fields.slice(5).map((f) => (
                      <div key={f.key}>
                        <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] mb-2.5 ml-1">{f.label}</label>
                        <input
                          type={f.type || "text"}
                          value={form[f.key]}
                          onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                          placeholder={f.placeholder}
                          className="w-full bg-muted border border-border focus:border-primary/50 rounded-2xl px-5 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-all shadow-inner"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-primary/30 transition-colors" />
                    < Globe className="w-8 h-8 text-primary mx-auto mb-3 opacity-50" />
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Global Presence</p>
                    <p className="text-muted-foreground text-xs mt-2 px-4 italic">
                      Your profile is visible to verified importers across 140+ countries.
                    </p>
                  </div>
                </div>
              </div>

              {/* About Company */}
              <div className="bg-card border border-border rounded-3xl p-8 space-y-6">
                <h3 className="text-sm font-black text-foreground tracking-[0.2em] uppercase opacity-50 mb-4 italic">About Your Company</h3>
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] mb-2.5 ml-1 text-right">Company Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Tell importers about your expertise, production capacity, and values..."
                    rows={6}
                    className="w-full bg-muted border border-border focus:border-primary/50 rounded-2xl px-5 py-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-all shadow-inner resize-none"
                  />
                </div>
              </div>

              {/* Action */}
              <div className="flex flex-col items-center gap-4 py-8">
                {msg && (
                  <div className={`text-[10px] font-black uppercase tracking-[0.15em] px-6 py-3 rounded-xl shadow-2xl ${msg.type === "ok" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
                    {msg.text}
                  </div>
                )}

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="group relative px-12 py-4 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-primary/30 transition-all active:scale-95 overflow-hidden"
                >
                  <span className="relative z-10">{saving ? "Saving Changes..." : "Save Profile"}</span>
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
