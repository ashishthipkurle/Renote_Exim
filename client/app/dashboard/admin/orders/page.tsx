"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Search,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Hash,
  DollarSign,
  Briefcase
} from "lucide-react";
import { useAuthFetch } from "@/lib/hooks/useAuthFetch";
import { format } from "date-fns";
import { toast } from "sonner";
import clsx from "clsx";

type Order = {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  user: {
    name: string;
    companyName: string;
  };
};

export default function AdminOrdersPage() {
  const authFetch = useAuthFetch();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const url = `/api/admin/orders?page=${page}&q=${encodeURIComponent(search)}&status=${statusFilter}`;
      const data = await authFetch<{ orders: Order[], total: number, totalPages: number }>(url);
      setOrders(data.orders || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchOrders, 300);
    return () => clearTimeout(timer);
  }, [page, search, statusFilter]);

  return (
    <div className="h-dvh flex flex-col bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)] bg-[length:40px_40px] opacity-[0.03] pointer-events-none" />

      {/* Header */}
      <header className="flex-shrink-0 h-20 px-8 flex items-center justify-between border-b border-border bg-background/30 backdrop-blur-md z-30">
        <div>
          <h1 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-2">
            Transaction Logistics
            <span className="text-[10px] bg-white/20 text-white border border-white/30 px-2 py-0.5 rounded">
              {total} OPERATIONS
            </span>
          </h1>
          <p className="text-slate-500 text-xs font-medium italic font-mono uppercase tracking-tighter">Monitoring platform-wide commerce activity.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-white transition-colors" />
            <input
              type="text"
              placeholder="Search Order ID, Company..."
              className="bg-muted/50 border border-border rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-white/20 focus:border-white/50 outline-none w-64 transition-all"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <select
            className="bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-white/50"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            {["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Table Area */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="bg-muted/40 backdrop-blur-xl border border-border rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Operation ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Client Entity</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Fiscal Value</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status Vector</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Time Log</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-8"><div className="h-4 bg-white/5 rounded w-full" /></td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm font-medium italic">No transactions detected in current sector.</td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="group hover:bg-white/[0.02] transition-colors cursor-pointer">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white">
                          <Hash className="w-4 h-4" />
                        </div>
                        <div className="text-xs font-mono font-black text-white group-hover:text-white transition-colors">
                          {o.id.substring(0, 12).toUpperCase()}...
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <div className="text-sm font-bold text-slate-300 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-500" />
                          {o.user?.companyName || o.user?.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1 text-white font-black text-sm">
                        <DollarSign className="w-3.5 h-3.5" />
                        {o.total.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <span className={clsx(
                          "text-[9px] font-black tracking-[0.2em] px-3 py-1 rounded border uppercase",
                          o.status === "DELIVERED" ? "bg-white/10 text-white border-white/20" :
                            o.status === "PENDING" ? "bg-neutral-800 text-neutral-400 border-white/10" :
                              o.status === "CANCELLED" ? "bg-neutral-900 text-neutral-500 border-white/5" :
                                "bg-neutral-800/50 text-neutral-300 border-white/10"
                        )}>
                          {o.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex flex-col items-end">
                        <div className="text-[10px] text-white font-bold">{format(new Date(o.createdAt), "dd MMM yyyy")}</div>
                        <div className="text-[9px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {format(new Date(o.createdAt), "HH:mm")}
                        </div>
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
          <p className="text-[10px] text-slate-500 font-mono font-black uppercase tracking-widest">
            Scan range: <span className="text-white">{(page - 1) * 20 + 1}</span> - <span className="text-white">{Math.min(page * 20, total)}</span> / <span className="text-white">{total}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted/60 border border-border text-slate-400 hover:text-white hover:border-white/50 transition-all disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="h-10 px-4 flex items-center rounded-xl bg-white text-black text-[10px] font-black shadow-lg shadow-white/5">
              {page}
            </div>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted/60 border border-border text-slate-400 hover:text-white hover:border-white/50 transition-all disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
