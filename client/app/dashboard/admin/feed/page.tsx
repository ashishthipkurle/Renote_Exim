"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
 Activity,
 UserPlus,
 Package,
 ShoppingCart,
 Zap,
 Clock,
 ChevronRight,
 Filter,
 Search,
 Bell,
 RefreshCcw,
 CheckCircle2
} from "lucide-react";
import { useAuthFetch } from "@/lib/hooks/useAuthFetch";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import clsx from "clsx";

type FeedItem = {
 id: string;
 type: "USER" | "ORDER" | "PRODUCT";
 title: string;
 description: string;
 timestamp: string;
 data: any;
};

export default function AdminFeedPage() {
 const authFetch = useAuthFetch();
 const [feed, setFeed] = useState<FeedItem[]>([]);
 const [loading, setLoading] = useState(true);
 const [filter, setFilter] = useState("ALL");

 const fetchFeed = async () => {
 try {
 const data = await authFetch<{ feed: FeedItem[] }>("/api/admin/feed");
 setFeed(data.feed || []);
 } catch (error) {
 toast.error("Failed to pulse system feed.");
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchFeed();
 const interval = setInterval(fetchFeed, 30000); // 30s auto-refresh
 return () => clearInterval(interval);
 }, []);

 const filteredFeed = feed.filter(item =>
 filter === "ALL" ? true : item.type === filter
 );

 const getIcon = (type: string) => {
 switch (type) {
 case "USER": return <UserPlus className="w-5 h-5 text-white" />;
 case "ORDER": return <ShoppingCart className="w-5 h-5 text-white" />;
 case "PRODUCT": return <Package className="w-5 h-5 text-white" />;
 default: return <Zap className="w-5 h-5 text-white" />;
 }
 };

 return (
 <div className="h-dvh flex flex-col bg-background relative overflow-hidden">
 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.05)_0%,transparent_70%)] pointer-events-none" />

 {/* Header */}
 <header className="flex-shrink-0 h-20 px-8 flex items-center justify-between border-b border-border bg-background/30 backdrop-blur-md z-30">
 <div>
 <h1 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-2">
 System Operations Pulse
 <span className="text-[10px] bg-white/20 text-white border border-white/30 px-2 py-0.5 rounded animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.1)]">
 LIVE SIGNAL
 </span>
 </h1>
 <p className="text-slate-500 text-xs font-medium ">Synchronized real-time event stream from across the global infrastructure.</p>
 </div>

 <div className="flex items-center gap-4">
 <div className="flex bg-muted/50 border border-border p-1 rounded-xl">
 {["ALL", "USER", "ORDER", "PRODUCT"].map((f) => (
 <button
 key={f}
 onClick={() => setFilter(f)}
 className={clsx(
 "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
 filter === f ? "bg-white text-black shadow-lg shadow-white/5" : "text-slate-500 hover:text-slate-300"
 )}
 >
 {f}
 </button>
 ))}
 </div>
 <button
 onClick={fetchFeed}
 className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted/50 border border-border text-slate-400 hover:text-white transition-all group"
 >
 <RefreshCcw className="w-4 h-4 group-active:rotate-180 transition-transform duration-500" />
 </button>
 </div>
 </header>

 {/* Feed Container */}
 <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
 <div className="max-w-4xl mx-auto">
 <div className="space-y-4 relative">
 {/* Timeline Line */}
 <div className="absolute left-6 top-4 bottom-4 w-px bg-gradient-to-b from-primary/30 via-white/5 to-transparent pointer-events-none" />

 {loading ? (
 Array.from({ length: 6 }).map((_, i) => (
 <div key={i} className="h-24 bg-white/5 rounded-lg animate-pulse ml-12" />
 ))
 ) : filteredFeed.length === 0 ? (
 <div className="h-64 flex flex-col items-center justify-center text-slate-500 ml-12 border border-dashed border-white/10 rounded-lg space-y-4">
 <Activity className="w-8 h-8 opacity-20" />
 <span className="font-black uppercase text-[10px] tracking-widest">No operation signals detected in current segment.</span>
 </div>
 ) : (
 filteredFeed.map((item, i) => (
 <motion.div
 key={item.id}
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: i * 0.05 }}
 className="relative ml-12 group"
 >
 {/* Timeline Dot */}
 <div className="absolute -left-[30px] top-4 z-10 size-4 rounded-full bg-background border-2 border-white group-hover:scale-125 group-hover:bg-white transition-all shadow-[0_0_10px_rgba(255,255,255,0.1)]" />

 <div className="bg-muted/40 backdrop-blur-xl border border-border p-6 rounded-lg hover:border-white/20 transition-all shadow-xl flex items-center gap-6">
 <div className="size-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-white/30 transition-all">
 {getIcon(item.type)}
 </div>

 <div className="flex-1">
 <div className="flex items-center justify-between mb-1">
 <h3 className="text-white font-black text-sm uppercase tracking-widest group-hover:text-primary transition-colors">
 {item.title}
 </h3>
 <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5">
 <Clock className="w-3 h-3" />
 {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
 </div>
 </div>
 <p className="text-slate-400 text-xs font-medium leading-relaxed">
 {item.description}
 </p>
 </div>

 <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-500 hover:text-white hover:border-primary transition-all">
 <ChevronRight className="w-4 h-4" />
 </button>
 </div>
 </motion.div>
 ))
 )}
 </div>
 </div>
 </div>

 {/* Status Bar */}
 <footer className="h-12 border-t border-border bg-background/50 backdrop-blur-md px-8 flex items-center justify-between">
 <div className="flex items-center gap-4">
 <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
 <span className="size-2 rounded-full bg-white" />
 Core Synced
 </div>
 <div className="text-[10px] font-black text-slate-600 uppercase">
 Ops Velocity: <span className="text-white">High</span>
 </div>
 </div>
 <div className="text-[10px] font-mono text-slate-700">SIGNAL_INTEGRITY: 99.8%</div>
 </footer>
 </div>
 );
}
