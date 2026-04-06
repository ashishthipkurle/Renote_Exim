"use client";

import { useState, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Edit2,
  Trash2,
  Building2,
  Globe,
  Users,
  Activity,
  X,
} from "lucide-react";
import { useAuthFetch } from "@/lib/hooks/useAuthFetch";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "sonner";
import clsx from "clsx";
import Link from "next/link";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  businessName: string | null;
  country: string | null;
  phone: string | null;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED" | "SUSPENDED";
  createdAt: string;
};

export default function ExporterUsersPage() {
  const { user, loading: authLoading } = useAuth();
  const authFetch = useAuthFetch();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("");

  const fetchUsers = async () => {
    if (user?.email !== "exporter@gmail.com") return;
    setLoading(true);
    try {
      // Reusing the admin API for role and user management
      const url = `/api/admin/users?page=${page}&q=${encodeURIComponent(search)}&role=${roleFilter}&verified=${verifiedFilter}`;
      const data = await authFetch<{ users: User[], total: number, totalPages: number }>(url);
      setUsers(data.users || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error: any) {
      console.error("Registry fetch error:", error);
      toast.error(error?.message || "Failed to fetch registry data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email !== "exporter@gmail.com") return;
    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [page, search, roleFilter, verifiedFilter, user]);

  if (authLoading) return <div className="h-full flex items-center justify-center"><Activity className="w-8 h-8 animate-spin text-muted-foreground" /></div>;

  if (user?.email !== "exporter@gmail.com") {
    return (
      <main className="flex-1 flex flex-col h-full items-center justify-center bg-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "linear-gradient(to right,#1f2937 1px,transparent 1px),linear-gradient(to bottom,#1f2937 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative z-10 flex flex-col items-center text-center p-12 bg-card/40 backdrop-blur-3xl border border-border dark:border-white/5 rounded-[3rem] max-w-lg shadow-2xl">
          <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-8 animate-pulse">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-foreground dark:text-white uppercase italic tracking-tighter mb-4">Protocol Breach</h2>
          <p className="text-muted-foreground text-sm font-medium leading-relaxed mb-8">Your identification does not possess the required clearance for 'Global Registry' access. This attempt has been logged for security audit.</p>
          <Link href="/dashboard/exporter" className="px-10 py-4 bg-primary text-primary-foreground rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.05] transition-all duration-300">
            Return to Safe Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const handleAction = async (userId: string, action: string, extra?: any) => {
    try {
      await authFetch("/api/admin/users", {
        method: "POST",
        body: JSON.stringify({ userId, action, ...extra }),
      });
      toast.success(`Protocol updated successfully`);
      fetchUsers();
    } catch (error) {
      toast.error(`Protocol update failed`);
    }
  };

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-background relative">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "linear-gradient(to right,#1f2937 1px,transparent 1px),linear-gradient(to bottom,#1f2937 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

      <header className="flex-shrink-0 h-24 px-10 flex items-center justify-between border-b border-border dark:border-white/5 bg-background/40 backdrop-blur-xl z-40">
        <div>
          <h1 className="text-3xl font-black text-foreground dark:text-white tracking-tighter flex items-center gap-4 uppercase italic">
            Global Registry
            <span className="px-3 py-1 rounded-full text-[9px] font-black bg-black/5 dark:bg-white/10 text-foreground dark:text-white border border-border dark:border-white/10 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
              {total} ACTIVE ENTITIES
            </span>
          </h1>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mt-1.5 opacity-40 italic">
            Hierarchy Control / Master Identity Management
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-[#D4AF37] transition-colors" />
            <input
              type="text"
              placeholder="Search ID, Email, Phone..."
              className="pl-12 pr-10 py-3 bg-muted/50 dark:bg-white/5 border border-border dark:border-white/10 rounded-2xl text-xs text-foreground dark:text-white placeholder:text-muted-foreground/20 w-80 outline-none focus:border-[#D4AF37]/50 transition-all font-medium italic"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
            {search && <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground dark:text-white transition-colors"><X className="w-4 h-4" /></button>}
          </div>

          <div className="flex gap-2">
            <select
              className="bg-muted/50 dark:bg-white/5 border border-border dark:border-white/10 rounded-2xl px-5 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground outline-none focus:border-[#D4AF37]/50 transition-all cursor-pointer"
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Roles</option>
              <option value="EXPORTER">Exporter</option>
              <option value="IMPORTER">Importer</option>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>

            <select
              className="bg-muted/50 dark:bg-white/5 border border-border dark:border-white/10 rounded-2xl px-5 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground outline-none focus:border-[#D4AF37]/50 transition-all cursor-pointer"
              value={verifiedFilter}
              onChange={(e) => { setVerifiedFilter(e.target.value); setPage(1); }}
            >
              <option value="">Status</option>
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </select>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
        <div className="max-w-[1920px] mx-auto">
          <div className="bg-card/40 dark:bg-white/5 backdrop-blur-3xl border border-border dark:border-white/5 shadow-2xl rounded-[2.5rem] overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 blur-[120px] rounded-full pointer-events-none" />

            <table className="w-full text-left border-collapse relative z-10">
              <thead>
                <tr className="border-b border-border dark:border-white/10 bg-black/5 dark:bg-white/5">
                  <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] italic">Identified Subject</th>
                  <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] italic">Sector Hub</th>
                  <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] italic text-center">Protocol Role</th>
                  <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] italic">Signal Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] italic text-right">Overrides</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-white/5">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-8 py-10"><div className="h-6 bg-black/5 dark:bg-white/10 rounded-xl w-full" /></td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center flex flex-col items-center gap-4 opacity-40">
                      <Users className="w-12 h-12 text-muted-foreground" />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]">Zero subject matches in current registry scan.</p>
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="group hover:bg-black/5 dark:hover:bg-white/[0.03] transition-all duration-300">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="size-12 rounded-2xl bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 flex items-center justify-center text-foreground dark:text-white font-black text-xs shadow-inner group-hover:scale-110 transition-transform">
                            {u.name?.charAt(0) || u.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-black text-foreground dark:text-white italic uppercase tracking-wider">{u.name || "UNNAMED ENTITY"}</div>
                            <div className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-1 opacity-60">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1.5">
                          <div className="text-[10px] font-black text-foreground dark:text-white italic flex items-center gap-2 opacity-80 uppercase">
                            <Building2 className="w-3 h-3 text-[#D4AF37]" />
                            {u.businessName || "NOT INITIALIZED"}
                          </div>
                          <div className="text-[9px] text-muted-foreground font-black flex items-center gap-2 uppercase tracking-widest opacity-40">
                            <Globe className="w-3 h-3" />
                            {u.country || "PLANETARY"}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-center">
                          <span className={clsx(
                            "text-[8px] font-black tracking-[0.2em] px-3 py-1 rounded-full border uppercase italic",
                            u.role === "ADMIN" ? "bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/40 shadow-[0_0_15px_rgba(212,175,55,0.2)]" :
                              u.role === "EXPORTER" ? "bg-white/10 text-white border-white/20" :
                                u.role === "IMPORTER" ? "bg-white/5 text-muted-foreground border-white/10" :
                                  "bg-black/10 text-muted-foreground/60 border-black/10"
                          )}>
                            {u.role}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          {u.verificationStatus === "VERIFIED" ? (
                            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-xl">
                              <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                              <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">AUTHENTICATED</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 bg-neutral-500/5 border border-white/5 px-3 py-1.5 rounded-xl opacity-40">
                              <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{u.verificationStatus}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-3 translate-x-2 group-hover:translate-x-0 transition-transform opacity-0 group-hover:opacity-100 duration-300">
                          <button
                            title={u.verificationStatus === "VERIFIED" ? "Revoke Protocol" : "Authorize Subject"}
                            onClick={() => handleAction(u.id, u.verificationStatus === "VERIFIED" ? "unverify" : "verify")}
                            className={clsx(
                              "w-10 h-10 flex items-center justify-center rounded-xl border transition-all duration-300 shadow-xl",
                              u.verificationStatus === "VERIFIED" ? "bg-background border-border text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white" : "bg-black/5 dark:bg-white/5 border-border text-muted-foreground hover:border-[#D4AF37] hover:text-[#D4AF37]"
                            )}
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>

                          <button
                            title="Alter Permissions"
                            onClick={() => {
                              const newRole = prompt("Enter Protocol Authorization (EXPORTER, IMPORTER, USER, ADMIN):", u.role);
                              if (newRole && ["EXPORTER", "IMPORTER", "USER", "ADMIN"].includes(newRole.toUpperCase())) {
                                handleAction(u.id, "changeRole", { role: newRole.toUpperCase() });
                              }
                            }}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 border border-border text-muted-foreground hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all duration-300 shadow-xl"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            title="Terminate Subject"
                            onClick={() => {
                              if (confirm("Terminate identified entity from registry? This action is absolute.")) {
                                handleAction(u.id, "delete");
                              }
                            }}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 border border-border text-muted-foreground hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/40 transition-all duration-300 shadow-xl"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-12 flex items-center justify-between px-10">
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] italic opacity-40">
              Displaing <span className="text-foreground dark:text-white">{(page - 1) * 20 + 1}—{Math.min(page * 20, total)}</span> of <span className="text-foreground dark:text-white">{total}</span> registry records
            </p>
            <div className="flex items-center gap-4">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-black/5 dark:bg-white/5 border border-border text-muted-foreground hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-all disabled:opacity-10 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-[#D4AF37] text-white text-[12px] font-black shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                {page}
              </div>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-black/5 dark:bg-white/5 border border-border text-muted-foreground hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-all disabled:opacity-10 disabled:pointer-events-none"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
