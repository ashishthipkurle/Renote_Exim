"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/api-utils";
import { useAuth } from "@/components/auth/AuthProvider";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  companyName: string | null;
  country: string | null;
  phone: string | null;
  website: string | null;
  avatar: string | null;
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
  });

  useEffect(() => {
    authFetch<ProfileData>("/api/user/profile")
      .then((d) => {
        setProfile(d);
        setForm({
          name: d.name || "",
          companyName: d.companyName || "",
          country: d.country || "",
          phone: d.phone || "",
          website: d.website || "",
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await authFetch<ProfileData>("/api/user/profile", {
        method: "PATCH",
        body: JSON.stringify(form),
      });
      setProfile(res);
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
  ];

  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-gradient-to-br from-[#0a0c12] via-[#0d1017] to-[#0a0c12]">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Account Settings</h1>
          <p className="text-slate-400 mt-1">Manage your profile information.</p>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-[700px] mx-auto space-y-6">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-[#151c2a]/60 rounded-xl animate-pulse border border-white/5" />
              ))}
            </div>
          ) : (
            <>
              {/* Avatar + Email header */}
              <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 flex items-center gap-5">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-xl">
                  {form.name ? form.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "?"}
                </div>
                <div>
                  <div className="text-white font-bold text-lg">{profile?.name || "—"}</div>
                  <div className="text-slate-400 text-sm">{profile?.email}</div>
                  <div className="text-xs text-primary font-bold mt-0.5 uppercase">{profile?.role}</div>
                </div>
              </div>

              {/* Form */}
              <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 space-y-5">
                {fields.map((f) => (
                  <div key={f.key}>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{f.label}</label>
                    <input
                      type={f.type || "text"}
                      value={form[f.key]}
                      onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                ))}

                {msg && (
                  <div className={`text-sm font-bold px-4 py-2.5 rounded-lg ${msg.type === "ok" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                    {msg.text}
                  </div>
                )}

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-primary hover:bg-[#0f49bd] disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-primary/20 transition-colors"
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
