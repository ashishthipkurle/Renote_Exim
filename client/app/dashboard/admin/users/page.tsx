import {
  Search,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Edit2,
  Trash2,
  Building2,
  Globe
} from "lucide-react";
import { useAuthFetch } from "@/lib/hooks/useAuthFetch";
import { toast } from "sonner";
import clsx from "clsx";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  companyName: string;
  country: string;
  verified: boolean;
  createdAt: string;
};

export default function AdminUsersPage() {
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
    setLoading(true);
    try {
      const url = `/api/admin/users?page=${page}&q=${encodeURIComponent(search)}&role=${roleFilter}&verified=${verifiedFilter}`;
      const data = await authFetch<{ users: User[], total: number, totalPages: number }>(url);
      setUsers(data.users || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [page, search, roleFilter, verifiedFilter]);

  const handleAction = async (userId: string, action: string, extra?: any) => {
    try {
      await authFetch("/api/admin/users", {
        method: "POST",
        body: JSON.stringify({ userId, action, ...extra }),
      });
      toast.success(`Action successful`);
      fetchUsers();
    } catch (error) {
      toast.error(`Action failed`);
    }
  };

  return (
    <div className="h-dvh flex flex-col bg-[#0b1019] relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[length:40px_40px] opacity-[0.03] pointer-events-none" />

      {/* Header */}
      <header className="flex-shrink-0 h-20 px-8 flex items-center justify-between border-b border-white/5 bg-[#0b1019]/30 backdrop-blur-md z-30">
        <div>
          <h1 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-2">
            User Authority
            <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded">
              {total} ENTITIES
            </span>
          </h1>
          <p className="text-slate-500 text-xs font-medium">Manage platform access and permissions.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search ID, Name, Company..."
              className="bg-[#151c2a]/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none w-64 transition-all"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <div className="flex gap-2">
            <select
              className="bg-[#151c2a]/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-primary/50"
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Roles</option>
              <option value="EXPORTER">Exporter</option>
              <option value="IMPORTER">Importer</option>
              <option value="ADMIN">Admin</option>
            </select>

            <select
              className="bg-[#151c2a]/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-primary/50"
              value={verifiedFilter}
              onChange={(e) => { setVerifiedFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Status</option>
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </select>
          </div>
        </div>
      </header>

      {/* Table Area */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="bg-[#151c2a]/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Identified Entity</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Organization</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Access Role</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Trust Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Rapid Response</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-8"><div className="h-4 bg-white/5 rounded w-full" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm font-medium italic">No entities found matching current scan parameters.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-gradient-to-br from-primary/10 to-blue-600/10 border border-white/5 flex items-center justify-center text-primary font-bold text-sm">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white group-hover:text-primary transition-colors">{u.name}</div>
                          <div className="text-[10px] text-slate-500 font-medium">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          <Building2 className="w-3 h-3 text-slate-500" />
                          {u.companyName || "N/A"}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-1">
                          <Globe className="w-3 h-3" />
                          {u.country || "GLOBAL"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={clsx(
                        "text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full border uppercase",
                        u.role === "ADMIN" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                          u.role === "EXPORTER" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                            "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      )}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        {u.verified ? (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-black">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              VERIFIED
                            </div>
                            <div className="flex items-center gap-1 text-[8px] font-black text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(19,91,236,0.2)]">
                              <ShieldCheck className="w-2.5 h-2.5" />
                              SEAL OF TRUST
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold">
                            <XCircle className="w-3.5 h-3.5" />
                            PENDING
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          title={u.verified ? "Revoke Verification" : "Verify User"}
                          onClick={() => handleAction(u.id, u.verified ? "unverify" : "verify")}
                          className={clsx(
                            "w-8 h-8 flex items-center justify-center rounded-lg border transition-all",
                            u.verified ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white" : "bg-white/5 border-white/10 text-slate-400 hover:border-primary hover:text-primary"
                          )}
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                        <button
                          title="Change Role"
                          onClick={() => {
                            const newRole = prompt("Enter new role (EXPORTER, IMPORTER, ADMIN):", u.role);
                            if (newRole && ["EXPORTER", "IMPORTER", "ADMIN"].includes(newRole)) {
                              handleAction(u.id, "changeRole", { role: newRole });
                            }
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          title="Delete Account"
                          onClick={() => {
                            if (confirm("Are you certain you want to delete this entity? This action is irreversible.")) {
                              handleAction(u.id, "delete");
                            }
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-lg hover:shadow-red-500/20"
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
        <div className="mt-8 flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium tracking-tight">
            Showing <span className="text-white">{(page - 1) * 20 + 1}</span> to <span className="text-white">{Math.min(page * 20, total)}</span> of <span className="text-white">{total}</span> entities
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#151c2a]/60 border border-white/5 text-slate-400 hover:text-white hover:border-primary/50 transition-all disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="h-10 px-4 flex items-center rounded-xl bg-primary text-white text-xs font-bold shadow-lg shadow-primary/20">
              {page}
            </div>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#151c2a]/60 border border-white/5 text-slate-400 hover:text-white hover:border-primary/50 transition-all disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
