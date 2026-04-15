"use client";

import { useEffect, useState, useRef, useCallback, useLayoutEffect } from "react";
import { useTheme } from "next-themes";
import { authFetch, formatCurrency } from "@/lib/api-utils";
import {
 Download,
 History,
 TrendingUp,
 DollarSign,
 Clock,
 CheckCircle2,
 Package,
 FileText,
 Search,
 Globe,
 ArrowRight,
 ArrowLeft,
 ShieldCheck,
 ShoppingCart,
 Layers,
 Circle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Safe useLayoutEffect that falls back to useEffect on the server
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Invoice {
 id: string;
 orderNumber: string;
 amount: number;
 status: string;
 paidAt: string | null;
 buyer: string;
}

interface FinanceData {
 role: string;
 available: number;
 pending: number;
 lastPayout: number;
 recentInvoices: Invoice[];
}

interface MonthlyPoint {
 month: string;
 revenue: number;
 orderCount: number;
}

interface AnalyticsData {
 monthlyRevenue: MonthlyPoint[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmtDate(iso: string | null) {
 if (!iso) return "—";
 const d = new Date(iso);
 return `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function statusCfg(status: string) {
 const s = status.toUpperCase();
 if (s === "PAID") return { label: "DELIVERED", icon: CheckCircle2, color: "text-foreground dark:text-white bg-black/10 dark:bg-white/15 border-border dark:border-white/20" };
 if (s === "PENDING") return { label: "IN_TRANSIT", icon: Clock, color: "text-muted-foreground/40 bg-black/5 dark:bg-white/10 border-border dark:border-white/5" };
 if (s === "PARTIAL") return { label: "PARTIAL_SIG", icon: Layers, color: "text-muted-foreground/20 bg-black/5 dark:bg-white/10 border-border dark:border-white/5" };
 return { label: s, icon: Circle, color: "text-muted-foreground/10 bg-black/5 dark:bg-white/10 border-border dark:border-white/5" };
}

function fmtUSD(amount: number): string {
 return new Intl.NumberFormat("en-US", {
 style: "currency",
 currency: "USD",
 maximumFractionDigits: 0
 }).format(amount);
}

// ─── Statement Generation (HTML for PDF) ───────────────────────────────────

function downloadAsFile(html: string, filename: string) {
 const blob = new Blob([html], { type: "text/html;charset=utf-8" });
 const url = URL.createObjectURL(blob);
 const a = document.createElement("a");
 a.href = url;
 a.download = filename;
 a.style.display = "none";
 document.body.appendChild(a);
 a.click();
 setTimeout(() => {
 document.body.removeChild(a);
 URL.revokeObjectURL(url);
 }, 200);
}

function buildStatementHTML(invoices: Invoice[], totalRevenue: number): string {
 const generatedDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
 const currentYear = new Date().getFullYear();

 return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Financial_Report</title>
 <style>
 @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&display=swap');
 body{font-family:'IBM Plex Mono',monospace;background:#000;color:#fff;padding:60px;max-width:1000px;margin:0 auto;line-height:1.6}
 .header{display:flex;justify-content:space-between;border-bottom:1px solid #333;margin-bottom:60px;padding-bottom:30px}
 .logo{font-size:24px;font-weight:700;letter-spacing:-0.05em}
 .title{font-size:40px;font-weight:700;letter-spacing:-0.05em;text-transform:uppercase;margin:0 0 40px}
 .stats{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-bottom:60px}
 .stat-card{background:#111;padding:30px;border:1px solid #222;border-radius:20px}
 .stat-label{font-size:10px;color:#666;text-transform:uppercase;letter-spacing:0.3em;margin-bottom:10px}
 .stat-value{font-size:32px;font-weight:700}
 table{width:100%;border-collapse:collapse;font-size:12px}
 th{text-align:left;color:#444;text-transform:uppercase;letter-spacing:0.2em;padding:15px;border-bottom:1px solid #333}
 td{padding:15px;border-bottom:1px solid #111}
 .right{text-align:right}
 .footer{margin-top:80px;color:#333;font-size:10px;text-align:center;text-transform:uppercase;letter-spacing:0.3em}
 </style></head><body>
 <div class="header">
 <div class="logo">RANOTE_EXIM // INTEL</div>
 <div style="text-align:right;color:#666;font-size:10px;letter-spacing:0.2em">GENERATED: ${generatedDate}</div>
 </div>
 <h1 class="title">Account Intelligence Report</h1>
 <div class="stats">
 <div class="stat-card"><div class="stat-label">Total_Capital_Inflow</div><div class="stat-value">${fmtUSD(totalRevenue)}</div></div>
 <div class="stat-card"><div class="stat-label">Verified_Nodes</div><div class="stat-value">${invoices.length}</div></div>
 </div>
 <table><thead><tr><th>Node_ID</th><th>Buyer_Node</th><th>Date</th><th class="right">Value_USD</th></tr></thead><tbody>
 ${invoices.map(inv => `<tr><td>${inv.orderNumber}</td><td>${inv.buyer}</td><td>${fmtDate(inv.paidAt)}</td><td class="right">${fmtUSD(inv.amount)}</td></tr>`).join('')}
 </tbody></table>
 <div class="footer">SECURE_TRANSMISSION_PROTOCOL // RANOTE_EXIM // ${currentYear}</div>
 </body></html>`;
}

// ─── Chart Component ──────────────────────────────────────────────────────────

function FinancialChart({ data, dark }: { data: MonthlyPoint[]; dark: boolean }) {
 const [tooltip, setTooltip] = useState<{ x: number; y: number; point: MonthlyPoint } | null>(null);
 const [drawn, setDrawn] = useState(false);

 useEffect(() => { const t = setTimeout(() => setDrawn(true), 50); return () => clearTimeout(t); }, [data]);

 if (!data.length) return (
 <div className="h-[250px] flex items-center justify-center opacity-20 text-[10px] uppercase font-black tracking-[0.3em] text-foreground dark:text-white">
 Null_Financial_Telemetry
 </div>
 );

 const W = 1000, H = 300, padL = 80, padR = 40, padT = 40, padB = 60;
 const cW = W - padL - padR, cH = H - padT - padB;
 const maxV = Math.max(...data.map(d => d.revenue), 1);

 const xs = (i: number) => (i / Math.max(data.length - 1, 1)) * cW;
 const ys = (v: number) => cH - (v / maxV) * cH;

 const pts = data.map((d, i) => ({ x: xs(i), y: ys(d.revenue), d }));

 const smooth = pts.map((p, i) => {
 if (i === 0) return `M${p.x},${p.y}`;
 const prev = pts[i - 1];
 const cpx = (prev.x + p.x) / 2;
 return `C${cpx},${prev.y} ${cpx},${p.y} ${p.x},${p.y}`;
 }).join(" ");

 const linePath = smooth;
 const areaPath = `${smooth} L${pts[pts.length - 1].x},${cH} L0,${cH} Z`;

 return (
 <div className="relative w-full group/chart">
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block overflow-visible">
 <defs>
 <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
 <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
 </linearGradient>
 <filter id="glow">
 <feGaussianBlur stdDeviation="5" result="blur" />
 <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
 </filter>
 </defs>

 <g transform={`translate(${padL},${padT})`}>
 {/* Y-Axis Grid */}
 {[0, 0.5, 1].map((t, i) => {
 const y = cH * (1 - t);
 const v = maxV * t;
 return (
 <g key={i}>
 <line x1={0} y1={y} x2={cW} y2={y} stroke="#ffffff" strokeOpacity="0.03" strokeWidth="1" />
 <text x={-20} y={y + 4} textAnchor="end" fill="#ffffff" fillOpacity="0.2" fontSize="10" fontWeight="bold">
 {v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v.toFixed(0)}
 </text>
 </g>
 );
 })}

 <motion.path
 initial={{ opacity: 0 }}
 animate={{ opacity: drawn ? 1 : 0 }}
 d={areaPath}
 fill="url(#areaGrad)"
 />

 <motion.path
 initial={{ pathLength: 0 }}
 animate={{ pathLength: drawn ? 1 : 0 }}
 transition={{ duration: 1.5, ease: "easeInOut" }}
 d={linePath}
 stroke="#ffffff"
 strokeWidth="3"
 fill="none"
 filter="url(#glow)"
 />

 {pts.map((p, i) => (
 <g key={i}>
 <text x={p.x} y={cH + 30} textAnchor="middle" fill="#ffffff" fillOpacity="0.2" fontSize="9" fontWeight="black" className="uppercase tracking-widest ">
 {MONTH_SHORT[new Date(p.d.month).getMonth()]}
 </text>
 <circle cx={p.x} cy={p.y} r="25" fill="transparent" className="cursor-crosshair"
 onMouseEnter={() => setTooltip({ x: p.x + padL, y: p.y + padT, point: p.d })}
 onMouseLeave={() => setTooltip(null)}
 />
 <motion.circle
 initial={{ r: 0 }}
 animate={{ r: 4 }}
 cx={p.x} cy={p.y} fill="#ffffff" stroke="#000" strokeWidth="2"
 />
 </g>
 ))}
 </g>
 </svg>

 {tooltip && (
 <div
 className="absolute pointer-events-none bg-primary text-primary-foreground p-4 rounded-lg shadow-xl dark:shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200"
 style={{
 left: `${(tooltip.x / W) * 100}%`,
 top: `${(tooltip.y / H) * 100}%`,
 transform: "translate(-50%, -120%)"
 }}
 >
 <div className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1 ">
 {MONTH_SHORT[new Date(tooltip.point.month).getMonth()]} Telemetry
 </div>
 <div className="text-xl font-black tracking-tighter uppercase whitespace-nowrap">
 {fmtUSD(tooltip.point.revenue)}
 </div>
 <div className="text-[8px] font-black uppercase tracking-tighter opacity-20 mt-2">
 SIG_COUNT: {tooltip.point.orderCount}
 </div>
 </div>
 )}
 </div>
 );
}

// ─── Main Exporter Finance Page ───────────────────────────────────────────────

export default function ExporterFinancePage() {
 const [data, setData] = useState<FinanceData | null>(null);
 const [chartData, setChartData] = useState<MonthlyPoint[]>([]);
 const [loading, setLoading] = useState(true);
 const [statusFilter, setStatusFilter] = useState("ALL");
 const [downloading, setDownloading] = useState(false);

 useEffect(() => {
 Promise.all([
 authFetch<FinanceData>("/api/dashboard/finance").catch(() => null),
 authFetch<AnalyticsData>("/api/dashboard/analytics").catch(() => null),
 ]).then(([fin, ana]) => {
 if (fin) setData(fin);
 if (ana?.monthlyRevenue) setChartData(ana.monthlyRevenue);
 }).finally(() => setLoading(false));
 }, []);

 const completedTotal = data?.recentInvoices?.filter(i => i.status.toUpperCase() === "PAID").reduce((s, i) => s + i.amount, 0) ?? 0;

 const filteredInvoices = (data?.recentInvoices ?? []).filter(inv => {
 if (statusFilter === "ALL") return true;
 return inv.status.toUpperCase() === statusFilter;
 });

 if (loading) return (
 <div className="h-screen flex flex-col items-center justify-center bg-card dark:bg-[#0a0a0a]">
 <div className="flex flex-col items-center gap-6 opacity-40">
 <div className="p-8 rounded-lg bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 animate-pulse">
 <Globe className="w-12 h-12 text-foreground dark:text-white animate-spin-slow" />
 </div>
 <p className="text-[10px] font-black text-foreground dark:text-white uppercase tracking-[0.4em] ">Indexing Capital Nodes...</p>
 </div>
 </div>
 );

 return (
 <div className="h-full overflow-hidden flex flex-col bg-background selection:bg-primary selection:text-primary-foreground">
 {/* ── Header ── */}
 <header className="flex-shrink-0 px-10 py-10 border-b border-border dark:border-white/5 bg-background/40 backdrop-blur-3xl z-40">
 <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10">
 <div>
 <h1 className="text-5xl font-black tracking-tighter text-foreground dark:text-white uppercase ">Capital Intel</h1>
 <p className="text-muted-foreground/40 mt-3 text-[10px] font-black uppercase tracking-[0.3em] ">
 Registry Node Index: SECURE_CAPITAL_FEED // {filteredInvoices.length} Verified Signatures
 </p>
 </div>
 <button
 onClick={() => {
 setDownloading(true);
 try {
 const paidInvoices = (data?.recentInvoices ?? []).filter(i => i.status.toUpperCase() === "PAID");
 if (!paidInvoices.length) {
 alert("Null_Registry_History: No completed node signatures identified.");
 return;
 }
 const html = buildStatementHTML(paidInvoices, completedTotal);
 downloadAsFile(html, `RANOTE_REPORT_${new Date().toISOString().slice(0, 10)}.html`);
 } finally {
 setTimeout(() => setDownloading(false), 1500);
 }
 }}
 disabled={downloading}
 className="inline-flex items-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-[10px] uppercase tracking-[0.2em] py-4 px-10 rounded-lg shadow-2xl shadow-white/5 transition-all active:scale-95 group"
 >
 {downloading ? <Globe className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" />}
 Compile Statement
 </button>
 </div>
 </header>

 <div className="flex-1 overflow-y-auto p-10 space-y-16 custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-1000">
 {/* ── KPI Cards ── */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-[1700px] mx-auto">
 {[
 { k: "Total Registry Capital", v: fmtUSD(data?.available || 0), sub: "Verified Asset Pool", icon: DollarSign },
 { k: "Pending Node Payout", v: fmtUSD(data?.pending || 0), sub: "In-Transit Telemetry", icon: Clock },
 { k: "Completed Signatures", v: fmtUSD(completedTotal), sub: "Registry Exit Point", icon: ShieldCheck },
 ].map((s) => (
 <div key={s.k} className="bg-card/40 dark:bg-white/5 backdrop-blur-3xl border border-border dark:border-white/5 p-10 relative overflow-hidden group rounded-lg transition-all hover:border-border dark:border-white/10 shadow-xl dark:shadow-2xl">
 <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 dark:bg-white/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-black/10 dark:bg-white/15 transition-colors pointer-events-none" />
 <div className="flex items-start justify-between relative z-10 mb-8">
 <div>
 <div className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] ">{s.k}</div>
 <div className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-widest mt-1">{s.sub}</div>
 </div>
 <div className="p-4 rounded-lg bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 text-foreground dark:text-white transition-all group-hover:scale-110">
 <s.icon className="w-6 h-6" />
 </div>
 </div>
 <div className="text-4xl font-black text-foreground dark:text-white tracking-tighter uppercase group-hover:translate-x-1 transition-transform">{s.v}</div>
 <div className="mt-8 h-1 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
 <div className="h-full bg-primary w-2/3 dark:shadow-md shadow-none transition-all duration-1000 delay-300" />
 </div>
 </div>
 ))}
 </div>

 {/* ── Revenue Intel Grid ── */}
 <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 max-w-[1700px] mx-auto items-start">
 {/* Revenue Chart Section */}
 <div className="xl:col-span-8 bg-card/40 dark:bg-white/5 backdrop-blur-3xl border border-border dark:border-white/5 rounded-lg p-12 shadow-xl dark:shadow-2xl relative overflow-hidden group">
 <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
 <TrendingUp className="w-80 h-80 text-foreground dark:text-white" />
 </div>
 <div className="flex items-center justify-between mb-12 relative z-10">
 <div>
 <h2 className="text-[10px] font-black text-foreground dark:text-white uppercase tracking-[0.4em] mb-2">Revenue Telemetry</h2>
 <p className="text-[9px] text-muted-foreground/20 font-black uppercase tracking-widest ">Signal Index: Alpha_Node_Growth</p>
 </div>
 <div className="px-6 py-2 rounded-lg bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 text-foreground dark:text-white text-[9px] font-black uppercase tracking-widest shadow-xl dark:shadow-2xl">
 Live Feed: Stable
 </div>
 </div>
 <FinancialChart data={chartData} dark={true} />
 </div>

 {/* Quick Registry Summary */}
 <div className="xl:col-span-4 space-y-8">
 <div className="p-10 bg-card/40 dark:bg-white/5 border border-border dark:border-white/5 rounded-lg shadow-xl dark:shadow-2xl backdrop-blur-3xl space-y-10">
 <h3 className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] ">Yield_Breakdown</h3>
 <div className="space-y-6">
 {[
 { l: 'Max System Yield', v: fmtUSD(completedTotal + (data?.pending || 0)), i: TrendingUp },
 { l: 'Node Integrity', v: '99.98% SIG', i: ShieldCheck },
 { l: 'Last Payout Seq', v: fmtDate(data?.recentInvoices?.[0]?.paidAt || null), i: Clock },
 ].map(item => (
 <div key={item.l} className="flex items-center gap-6 p-6 rounded-lg bg-white/[0.02] border border-border dark:border-white/5 group hover:border-border dark:border-white/20 transition-all">
 <div className="size-12 rounded-lg bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all">
 <item.i className="w-5 h-5" />
 </div>
 <div>
 <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] ">{item.l}</p>
 <p className="text-foreground dark:text-white font-black text-sm uppercase tracking-widest mt-1">{item.v}</p>
 </div>
 </div>
 ))}
 </div>
 <button className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-lg text-[10px] uppercase tracking-[0.3em] shadow-xl dark:shadow-2xl transition-all active:scale-95">
 Override Payout Strategy
 </button>
 </div>
 <div className="p-8 rounded-lg bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 flex items-center justify-between group cursor-default">
 <div className="flex items-center gap-5">
 <ShieldCheck className="w-6 h-6 text-foreground dark:text-white group-hover:animate-pulse" />
 <p className="text-[9px] font-black text-foreground dark:text-white uppercase tracking-[0.2em] ">Encryption_AES_256</p>
 </div>
 <div className="text-[8px] font-black text-white/20 uppercase tracking-[0.1em]">NODE_SECURED</div>
 </div>
 </div>
 </div>

 {/* ── Signature History Grid ── */}
 <div className="max-w-[1700px] mx-auto space-y-10 pb-20">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-border dark:border-white/5 pb-8">
 <div className="flex items-center gap-5">
 <ShoppingCart className="w-5 h-5 text-foreground dark:text-white" />
 <h2 className="text-[10px] font-black text-foreground dark:text-white uppercase tracking-[0.4em] ">
 Signature History Grid
 </h2>
 </div>
 <div className="flex items-center gap-3">
 {["ALL", "PAID", "PENDING"].map(s => (
 <button
 key={s}
 onClick={() => setStatusFilter(s)}
 className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${statusFilter === s
 ? "bg-primary text-primary-foreground border-transparent shadow-xl dark:shadow-2xl"
 : "bg-black/5 dark:bg-white/10 text-muted-foreground/20 border-border dark:border-white/5 hover:bg-black/10 dark:bg-white/15 hover:text-foreground dark:text-white"
 }`}
 >
 {s}
 </button>
 ))}
 </div>
 </div>

 {filteredInvoices.length === 0 ? (
 <div className="bg-card/40 dark:bg-white/5 backdrop-blur-3xl border border-border dark:border-white/5 shadow-xl dark:shadow-2xl rounded-lg p-24 text-center">
 <div className="flex flex-col items-center gap-8 opacity-40">
 <FileText className="w-16 h-16 text-foreground dark:text-white" />
 <p className="text-[10px] font-black uppercase tracking-[0.3em] ">Null_Signature_Feed</p>
 </div>
 </div>
 ) : (
 <div className="space-y-4">
 {filteredInvoices.map((inv) => {
 const cfg = statusCfg(inv.status);
 const IsPaid = inv.status.toUpperCase() === "PAID";
 return (
 <div key={inv.id} className="bg-card/40 dark:bg-white/5 backdrop-blur-3xl border border-border dark:border-white/5 hover:border-border dark:border-white/20 transition-all duration-700 shadow-xl dark:shadow-2xl rounded-lg p-8 flex flex-col xl:flex-row gap-10 items-center group hover:-translate-y-1">
 <div className="flex items-center gap-8 flex-1 min-w-0">
 <div className="size-16 rounded-lg bg-black/5 dark:bg-white/10 border border-border dark:border-white/5 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-700">
 <ShoppingCart className="w-6 h-6" />
 </div>
 <div className="min-w-0">
 <div className="text-xl font-black text-foreground dark:text-white truncate tracking-tighter uppercase group-hover:translate-x-1 transition-transform">
 {inv.orderNumber} // NODE_ID
 </div>
 <div className="text-[9px] text-muted-foreground/20 mt-2 font-black uppercase tracking-widest group-hover:text-muted-foreground/60 transition-colors">
 BUYER_LINK: {inv.buyer}
 </div>
 </div>
 </div>

 <div className="grid grid-cols-2 xl:flex xl:items-center gap-12 w-full xl:w-auto">
 <div className="text-left xl:text-right">
 <div className="text-muted-foreground/10 text-[8px] uppercase tracking-[0.3em] font-black mb-2">Timestamp</div>
 <div className="text-foreground dark:text-white font-black text-[10px] tracking-widest uppercase">{fmtDate(inv.paidAt)}</div>
 </div>
 <div className="text-left xl:text-right">
 <div className="text-muted-foreground/10 text-[8px] uppercase tracking-[0.3em] font-black mb-2">Total_Value</div>
 <div className="text-foreground dark:text-white font-black text-2xl tracking-tighter">{fmtUSD(inv.amount)}</div>
 </div>
 <div className="flex items-center gap-4">
 <span className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-3 border shadow-xl dark:shadow-2xl transition-all ${cfg.color}`}>
 <cfg.icon className={`w-3.5 h-3.5 ${!IsPaid ? 'animate-pulse' : ''}`} />
 {cfg.label}
 </span>
 <button
 onClick={() => {
 if (!IsPaid) return;
 const html = buildStatementHTML([inv], inv.amount);
 downloadAsFile(html, `INVOICE_${inv.orderNumber}.html`);
 }}
 disabled={!IsPaid}
 className={`size-14 rounded-lg border flex items-center justify-center transition-all duration-500 shadow-xl dark:shadow-2xl ${IsPaid
 ? "bg-black/5 dark:bg-white/10 border-border dark:border-white/10 text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-transparent active:scale-90"
 : "bg-white/[0.02] border-border dark:border-white/5 text-muted-foreground/10 cursor-not-allowed opacity-20"
 }`}
 >
 <Download className="w-6 h-6" />
 </button>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
