"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Building2,
  Mail,
  Phone,
  Globe,
  CheckCircle2,
  XCircle,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  FileText,
  Download
} from "lucide-react";
import { useAuthFetch } from "@/lib/hooks/useAuthFetch";
import { toast } from "sonner";
import clsx from "clsx";

type DirectoryMember = {
  name: string;
  companyName: string;
  country: string;
  role: string;
  email: string;
  phone: string;
  verified: boolean;
};

export default function AdminDirectoryPage() {
  const authFetch = useAuthFetch();
  const [members, setMembers] = useState<DirectoryMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchDirectory = async () => {
    setLoading(true);
    try {
      const data = await authFetch<{ users: DirectoryMember[] }>(`/api/admin/directory?q=${encodeURIComponent(search)}`);
      setMembers(data.users || []);
    } catch (error) {
      toast.error("Failed to fetch platform census.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchDirectory, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="h-dvh flex flex-col bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.05)_0%,transparent_50%)] pointer-events-none" />

      {/* Header */}
      <header className="flex-shrink-0 h-20 px-8 flex items-center justify-between border-b border-border bg-background/30 backdrop-blur-md z-30">
        <div>
          <h1 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-2">
            Platform Directory
            <span className="text-[10px] bg-white/20 text-white border border-white/30 px-2 py-0.5 rounded">
              {members.length} PARTNERS
            </span>
          </h1>
          <p className="text-slate-500 text-xs font-medium italic">Global network census and verified partner lookup.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-white transition-colors" />
            <input
              type="text"
              placeholder="Query Network..."
              className="bg-muted/50 border border-border rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-white/20 focus:border-white/50 outline-none w-64 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 bg-muted/50 border border-border px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-colors">
            <Download className="w-4 h-4" />
            Export Census
          </button>
        </div>
      </header>

      {/* Grid Area */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-56 bg-white/5 rounded-2xl animate-pulse" />
            ))
          ) : members.length === 0 ? (
            <div className="col-span-full h-64 flex items-center justify-center border border-dashed border-white/10 rounded-3xl text-slate-500 uppercase tracking-widest text-[10px] font-black">
              No matching partners detected in platform sector.
            </div>
          ) : (
            members.map((m, i) => (
              <motion.div
                key={m.email}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group bg-muted/40 backdrop-blur-xl border border-border p-6 rounded-2xl hover:border-white/30 transition-all shadow-xl overflow-hidden relative"
              >
                {/* Visual Identity */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="size-14 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-border flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:scale-110 transition-transform">
                    {m.companyName?.[0] || m.name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-black text-sm truncate group-hover:text-white transition-colors">
                      {m.companyName || m.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={clsx(
                        "text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-widest",
                        m.role === "EXPORTER" ? "bg-white/10 text-white border-white/20" : "bg-neutral-800 text-neutral-400 border-white/10"
                      )}>
                        {m.role}
                      </span>
                      {m.verified && (
                        <div className="text-white flex items-center" title="Verified Partner">
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Data */}
                <div className="space-y-3 pt-6 border-t border-white/5">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Mail className="w-3.5 h-3.5 text-slate-600" />
                    <span className="truncate">{m.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Phone className="w-3.5 h-3.5 text-slate-600" />
                    <span>{m.phone || "HIDDEN"}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-black uppercase">
                      <Globe className="w-3 h-3" />
                      {m.country || "GLOBAL"}
                    </div>
                    <button className="text-[10px] font-black text-white hover:opacity-70 uppercase tracking-widest flex items-center gap-1 transition-all">
                      Profile
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Action Decor */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-500 hover:text-white">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
