"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Send,
  Users,
  ShieldAlert,
  Mail,
  Search,
  CheckCircle2,
  Clock,
  MoreVertical,
  Trash2,
  Zap,
  Volume2
} from "lucide-react";
import { useAuthFetch } from "@/lib/hooks/useAuthFetch";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import clsx from "clsx";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  user?: { name: string; email: string };
};

export default function AdminNotificationsPage() {
  const authFetch = useAuthFetch();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [broadcasting, setBroadcasting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    message: "",
    targetRole: "",
    type: "GENERAL"
  });

  const fetchNotifications = async () => {
    try {
      const data = await authFetch("/api/admin/notifications");
      setNotifications(data.notifications || []);
    } catch (error) {
      toast.error("Failed to fetch notification history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.message) return;

    setBroadcasting(true);
    try {
      await authFetch("/api/admin/notifications", {
        method: "POST",
        body: JSON.stringify(form)
      });
      toast.success("Broadcast successfully dispatched.");
      setForm({ title: "", message: "", targetRole: "", type: "GENERAL" });
      fetchNotifications();
    } catch (error) {
      toast.error("Failed to dispatch broadcast.");
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <div className="h-dvh flex flex-col bg-[#0b1019] relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[length:40px_40px] opacity-[0.03] pointer-events-none" />

      {/* Header */}
      <header className="flex-shrink-0 h-20 px-8 flex items-center justify-between border-b border-white/5 bg-[#0b1019]/30 backdrop-blur-md z-30">
        <div>
          <h1 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-2">
            Signal Broadcaster
            <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded">
              NODE_COMMS
            </span>
          </h1>
          <p className="text-slate-500 text-xs font-medium italic">Broadcast high-priority alerts and system updates to target sectors.</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-8">

          {/* Dispatch Center */}
          <div className="space-y-6">
            <div className="bg-[#151c2a]/40 backdrop-blur-xl border border-white/5 p-8 rounded-3xl relative overflow-hidden shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Send className="w-5 h-5" />
                </div>
                <h2 className="text-white font-black text-lg uppercase tracking-widest">Global Dispatch</h2>
              </div>

              <form onSubmit={handleBroadcast} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Signal Title</label>
                  <input
                    type="text"
                    placeholder="Enter urgent title..."
                    className="w-full bg-[#0b1019]/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Transmission Message</label>
                  <textarea
                    rows={4}
                    placeholder="Compose system announcement..."
                    className="w-full bg-[#0b1019]/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all resize-none"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Target Sector</label>
                    <select
                      className="w-full bg-[#0b1019]/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-300 outline-none focus:border-primary/50"
                      value={form.targetRole}
                      onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                    >
                      <option value="">ALL ENTITIES</option>
                      <option value="EXPORTER">EXPORTERS</option>
                      <option value="IMPORTER">IMPORTERS</option>
                      <option value="ADMIN">ADMINS</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Signal Protocol</label>
                    <select
                      className="w-full bg-[#0b1019]/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-300 outline-none focus:border-primary/50"
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                    >
                      <option value="GENERAL">STANDARD SIGNAL</option>
                      <option value="ALERT">URGENT ALERT</option>
                      <option value="SUCCESS">SYSTEM SUCCESS</option>
                      <option value="WARNING">MAINTENANCE WARNING</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={broadcasting || !form.title || !form.message}
                  className="w-full bg-primary text-white py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {broadcasting ? <Zap className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
                  {broadcasting ? "DISPATCHING..." : "DISPATCH BROADCAST"}
                </button>
              </form>
            </div>
          </div>

          {/* Historical Logs */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-white font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Transmission Log
              </h2>
              <span className="text-[9px] text-slate-600 font-mono tracking-widest">RE-SYS // COMMS_v2.0</span>
            </div>

            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
                ))
              ) : notifications.length === 0 ? (
                <div className="h-64 flex items-center justify-center border border-dashed border-white/10 rounded-3xl text-slate-500 italic text-xs">
                  No historical transmissions detected.
                </div>
              ) : (
                notifications.map((n, i) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-[#151c2a]/40 backdrop-blur-xl border border-white/5 p-5 rounded-2xl group hover:border-primary/20 transition-all shadow-xl"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex gap-3">
                        <div className={clsx(
                          "size-8 rounded-lg flex items-center justify-center border",
                          n.type === "ALERT" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                            n.type === "SUCCESS" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                              "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        )}>
                          <Bell className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white group-hover:text-primary transition-colors">{n.title}</div>
                          <div className="text-[9px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                      <span className="text-[8px] font-black tracking-widest bg-white/5 text-slate-400 px-2 py-0.5 rounded border border-white/10 uppercase">
                        {n.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed pl-11">
                      {n.message}
                    </p>
                  </motion.div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
