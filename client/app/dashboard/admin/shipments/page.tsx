"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  Search,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Hash,
  Activity,
  Navigation,
  Box
} from "lucide-react";
import { useAuthFetch } from "@/lib/hooks/useAuthFetch";
import { format } from "date-fns";
import { toast } from "sonner";
import clsx from "clsx";

type Shipment = {
  id: string;
  trackingNumber: string;
  status: string;
  carrier: string;
  source: string;
  destination: string;
  shippedAt: string;
  deliveredAt: string;
};

export default function AdminShipmentsPage() {
  const authFetch = useAuthFetch();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const url = `/api/admin/shipments?page=${page}&q=${encodeURIComponent(search)}&status=${statusFilter}`;
      const data = await authFetch<{ shipments: Shipment[], total: number, totalPages: number }>(url);
      setShipments(data.shipments || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      toast.error("Failed to fetch shipments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchShipments, 300);
    return () => clearTimeout(timer);
  }, [page, search, statusFilter]);

  return (
    <div className="h-dvh flex flex-col bg-[#0b1019] relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[length:40px_40px] opacity-[0.03] pointer-events-none" />

      {/* Header */}
      <header className="flex-shrink-0 h-20 px-8 flex items-center justify-between border-b border-white/5 bg-[#0b1019]/30 backdrop-blur-md z-30">
        <div>
          <h1 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-2">
            Logistics Command
            <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded">
              {total} ACTIVE TRAJECTORIES
            </span>
          </h1>
          <p className="text-slate-500 text-xs font-medium italic">Global transit monitoring and carrier coordination.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search Tracking ID, Carrier..."
              className="bg-[#151c2a]/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none w-64 transition-all"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <select
            className="bg-[#151c2a]/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-primary/50"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Phases</option>
            {["PREPARING", "SHIPPED", "IN_TRANSIT", "DELIVERED", "HELD_AT_CUSTOMS"].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Grid Area */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-white/5 rounded-2xl" />
            ))}
          </div>
        ) : shipments.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-500 font-medium italic border border-dashed border-white/10 rounded-3xl uppercase tracking-widest text-[10px]">
            No logistics data retrieved for current temporal window.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
            {shipments.map((s) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group bg-[#151c2a]/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden hover:border-primary/30 transition-all shadow-xl"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                        <Box className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Shipment ID</div>
                        <div className="text-xs font-mono font-black text-white">{s.id.substring(0, 16).toUpperCase()}</div>
                      </div>
                    </div>
                    <span className={clsx(
                      "text-[8px] font-black tracking-widest px-2.5 py-1 rounded-full border uppercase",
                      s.status === "DELIVERED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]" :
                        s.status === "IN_TRANSIT" ? "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]" :
                          "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    )}>
                      {s.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                    <div>
                      <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1.5 flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-red-500/50" />
                        Source Origin
                      </div>
                      <div className="text-xs font-bold text-slate-300">{s.source || "CENTRAL HUB"}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1.5 flex items-center gap-1 justify-end">
                        <Navigation className="w-2.5 h-2.5 text-emerald-500/50" />
                        Target Destination
                      </div>
                      <div className="text-xs font-bold text-slate-300">{s.destination || "GLOBAL PORT"}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Carrier Protocol</div>
                      <div className="text-xs font-black text-white flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-primary" />
                        {s.carrier || "STANDARD EXIM"}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Tracking Matrix</div>
                      <div className="text-xs font-mono text-primary font-black">{s.trackingNumber || "X-000-RE-SYS"}</div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <div className="text-[9px] text-slate-500 flex items-center gap-1 font-medium font-mono">
                      <Clock className="w-3 h-3 text-slate-600" />
                      {s.shippedAt ? format(new Date(s.shippedAt), "yyyy.MM.dd | HH:mm") : "PENDING_DISPATCH"}
                    </div>
                    <button className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-white flex items-center gap-1.5 group/btn transition-colors">
                      Detailed Telemetry
                      <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-8 flex items-center justify-between">
          <p className="text-[10px] text-slate-500 font-mono font-black uppercase tracking-widest">
            Temporal Segment: <span className="text-white">{(page - 1) * 20 + 1}</span> - <span className="text-white">{Math.min(page * 20, total)}</span> / <span className="text-white">{total}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#151c2a]/60 border border-white/5 text-slate-400 hover:text-white hover:border-primary/50 transition-all disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="h-10 px-4 flex items-center rounded-xl bg-primary text-white text-[10px] font-black shadow-lg shadow-primary/20">
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
