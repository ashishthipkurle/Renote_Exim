import Link from "next/link";
import {
  TrendingUp,
  AlertTriangle,
  Search,
  CalendarDays,
  Plus,
  Star,
} from "lucide-react";

const stats = [
  {
    label: "Active Shipments",
    value: "1,248",
    trend: "+12.5%",
    trendUp: true,
    bar: 75,
    color: "blue",
    gradFrom: "from-blue-600",
    gradTo: "to-primary",
    bgTint: "bg-blue-500/10",
    textTint: "text-blue-400",
    borderTint: "border-blue-500/20",
    glowHover: "hover:border-primary/30",
    shadow: "shadow-[0_0_10px_rgba(37,99,235,0.5)]",
    neon: true,
  },
  {
    label: "Total Trade Value",
    value: "$42.8M",
    trend: "+8.2%",
    trendUp: true,
    bar: 60,
    color: "purple",
    gradFrom: "from-purple-600",
    gradTo: "to-[#bc13ec]",
    bgTint: "bg-[#bc13ec]/10",
    textTint: "text-[#bc13ec]",
    borderTint: "border-[#bc13ec]/20",
    glowHover: "hover:border-[#bc13ec]/30",
    shadow: "shadow-[0_0_10px_rgba(188,19,236,0.5)]",
  },
  {
    label: "New Leads",
    value: "384",
    trend: "+24.1%",
    trendUp: true,
    bar: 85,
    color: "green",
    gradFrom: "from-green-600",
    gradTo: "to-[#00ff9d]",
    bgTint: "bg-[#00ff9d]/10",
    textTint: "text-[#00ff9d]",
    borderTint: "border-[#00ff9d]/20",
    glowHover: "hover:border-[#00ff9d]/30",
    shadow: "shadow-[0_0_10px_rgba(0,255,157,0.5)]",
  },
  {
    label: "Pending Actions",
    value: "12",
    trend: "3 Critical",
    trendUp: false,
    bar: 30,
    color: "orange",
    gradFrom: "from-orange-600",
    gradTo: "to-orange-400",
    bgTint: "bg-orange-500/10",
    textTint: "text-orange-500",
    borderTint: "border-orange-500/20",
    glowHover: "hover:border-orange-500/30",
    shadow: "shadow-[0_0_10px_rgba(249,115,22,0.5)]",
  },
];

const transactions = [
  {
    name: "Green Coffee Beans",
    detail: "Export to Germany • Just now",
    amount: "$12,450",
    status: "Processing",
    statusColor: "text-yellow-500",
    initials: "CB",
    bgColor: "bg-amber-500/20",
    txtColor: "text-amber-400",
  },
  {
    name: "Robotic Arms Batch",
    detail: "Import from Japan • 24m ago",
    amount: "$125,000",
    status: "Completed",
    statusColor: "text-green-400",
    initials: "RA",
    bgColor: "bg-blue-500/20",
    txtColor: "text-blue-400",
  },
  {
    name: "Steel Pipes",
    detail: "Quote Request • 1h ago",
    amount: "$45,200",
    status: "Reviewing",
    statusColor: "text-blue-400",
    initials: "SP",
    bgColor: "bg-slate-500/20",
    txtColor: "text-slate-400",
  },
  {
    name: "Audio Equipment",
    detail: "Bulk Order • 2h ago",
    amount: "$8,900",
    status: "Shipped",
    statusColor: "text-green-400",
    initials: "AE",
    bgColor: "bg-purple-500/20",
    txtColor: "text-purple-400",
  },
];

const categories = [
  { name: "Electronics", value: "$2.4M", width: "85%", color: "bg-blue-500", shadow: "shadow-[0_0_8px_rgba(59,130,246,0.5)]" },
  { name: "Industrial Machinery", value: "$1.8M", width: "65%", color: "bg-teal-500", shadow: "shadow-[0_0_8px_rgba(20,184,166,0.5)]" },
  { name: "Raw Materials", value: "$1.2M", width: "45%", color: "bg-purple-500", shadow: "shadow-[0_0_8px_rgba(168,85,247,0.5)]" },
  { name: "Textiles", value: "$800K", width: "30%", color: "bg-orange-500", shadow: "shadow-[0_0_8px_rgba(249,115,22,0.5)]" },
];

const suppliers = [
  { name: "TechSolutions Ltd", region: "Shenzhen, CN", orders: "1,204", rating: "4.9", initials: "TS", bgColor: "bg-blue-500/20", txtColor: "text-blue-400" },
  { name: "Global Exports Inc", region: "Hamburg, DE", orders: "892", rating: "4.8", initials: "GE", bgColor: "bg-purple-500/20", txtColor: "text-purple-400" },
  { name: "Vietnam Industrial", region: "Hanoi, VN", orders: "654", rating: "4.7", initials: "VI", bgColor: "bg-green-500/20", txtColor: "text-green-400" },
];

export default function ExporterDashboard() {
  return (
    <main className="flex-1 flex flex-col h-dvh overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0a0c12] to-[#0a0c12] relative">
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "linear-gradient(to right, #1f2937 1px, transparent 1px), linear-gradient(to bottom, #1f2937 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      {/* Header */}
      <header className="flex-shrink-0 h-20 px-8 flex items-center justify-between border-b border-white/5 bg-[#0a0c12]/30 backdrop-blur-sm z-40">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Executive Overview
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary border border-primary/30 uppercase tracking-wider">
              Live
            </span>
          </h1>
          <p className="text-slate-400 text-sm">Welcome back, Director</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-[#151c2a]/50 border border-white/5 text-sm text-slate-400">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            System Status: Operational
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                className="pl-10 pr-4 py-2 bg-[#151c2a]/50 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:ring-1 focus:ring-primary focus:border-primary w-64 transition-all"
                placeholder="Search shipments, IDs..."
                type="text"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            </div>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#151c2a]/50 border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
              <CalendarDays className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary hover:bg-[#0f49bd] text-white shadow-lg shadow-primary/20 transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-[1920px] mx-auto space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div
                key={s.label}
                className={`bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl p-6 rounded-2xl relative overflow-hidden group ${s.glowHover} transition-all duration-300`}
              >
                <div className={`absolute -right-6 -top-6 w-24 h-24 ${s.bgTint} rounded-full blur-2xl group-hover:opacity-80 transition-all`} />
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${s.bgTint} ${s.textTint} border ${s.borderTint}`}>
                    {s.label === "Active Shipments" && (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M13 16V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1m8-1a1 1 0 0 1-1 1H9m4-1V8a1 1 0 0 1 1-1h2.586a1 1 0 0 1 .707.293l3.414 3.414a1 1 0 0 1 .293.707V16a1 1 0 0 1-1 1h-1m-6-1a1 1 0 0 0 1 1h1M5 17a2 2 0 1 0 4 0m-4 0a2 2 0 1 1 4 0m6 0a2 2 0 1 0 4 0m-4 0a2 2 0 1 1 4 0" /></svg>
                    )}
                    {s.label === "Total Trade Value" && (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M17 9V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2m2 4h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm7-5a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" /></svg>
                    )}
                    {s.label === "New Leads" && (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM3 20a6 6 0 0 1 12 0v1H3v-1z" /></svg>
                    )}
                    {s.label === "Pending Actions" && (
                      <AlertTriangle className="w-6 h-6" />
                    )}
                  </div>
                  <span className={`flex items-center text-xs font-bold ${s.trendUp ? "text-green-400 bg-green-500/10 border-green-500/20" : "text-red-400 bg-red-500/10 border-red-500/20"} px-2 py-1 rounded border`}>
                    {s.trendUp ? <TrendingUp className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                    {s.trend}
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-slate-400 text-sm font-medium">{s.label}</h3>
                  <p className={`text-3xl font-bold text-white ${s.neon ? "drop-shadow-[0_0_10px_rgba(19,91,236,0.5)]" : ""}`}>{s.value}</p>
                </div>
                <div className="mt-4 h-1.5 w-full bg-[#151c2a] rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${s.gradFrom} ${s.gradTo} rounded-full ${s.shadow}`} style={{ width: `${s.bar}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Map + Transactions row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" style={{ height: "500px" }}>
            {/* Live Logistics Pulse */}
            <div className="xl:col-span-2 bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6 flex flex-col h-full relative overflow-hidden">
              <div className="flex justify-between items-center mb-6 z-10">
                <div>
                  <h2 className="text-lg font-bold text-white">Live Logistics Pulse</h2>
                  <p className="text-slate-400 text-xs">Real-time global trade routes active now</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 bg-[#151c2a] border border-white/10 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:border-primary/50 transition-colors">
                    Air Freight
                  </button>
                  <button className="px-3 py-1.5 bg-[#151c2a] border border-white/10 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:border-primary/50 transition-colors">
                    Ocean Cargo
                  </button>
                </div>
              </div>
              <div className="flex-1 relative rounded-xl bg-[#0f1521] border border-white/5 overflow-hidden group">
                {/* World map placeholder */}
                <div className="absolute inset-0 opacity-30 bg-gradient-to-r from-indigo-900/20 via-blue-900/10 to-emerald-900/20" />
                {/* Trade hubs */}
                <div className="absolute top-[35%] left-[24%]">
                  <div className="relative w-3 h-3 bg-primary rounded-full shadow-[0_0_15px_rgba(19,91,236,1)] z-10" />
                  <div className="absolute top-0 left-0 w-3 h-3 bg-primary rounded-full animate-ping z-0" />
                  <div className="absolute top-4 left-4 bg-[#151c2a]/90 backdrop-blur border border-white/10 px-2 py-1 rounded text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    New York Hub<br /><span className="text-primary font-bold">142 Active</span>
                  </div>
                </div>
                <div className="absolute top-[32%] right-[18%]">
                  <div className="relative w-3 h-3 bg-[#00ff9d] rounded-full shadow-[0_0_15px_rgba(0,255,157,1)] z-10" />
                  <div className="absolute top-0 left-0 w-3 h-3 bg-[#00ff9d] rounded-full animate-ping z-0" style={{ animationDelay: "0.5s" }} />
                  <div className="absolute top-4 left-4 bg-[#151c2a]/90 backdrop-blur border border-white/10 px-2 py-1 rounded text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Shanghai Port<br /><span className="text-[#00ff9d] font-bold">854 Active</span>
                  </div>
                </div>
                <div className="absolute top-[45%] left-[62%]">
                  <div className="relative w-3 h-3 bg-[#bc13ec] rounded-full shadow-[0_0_15px_rgba(188,19,236,1)] z-10" />
                  <div className="absolute top-0 left-0 w-3 h-3 bg-[#bc13ec] rounded-full animate-ping z-0" style={{ animationDelay: "1.2s" }} />
                  <div className="absolute top-4 left-4 bg-[#151c2a]/90 backdrop-blur border border-white/10 px-2 py-1 rounded text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Dubai Transit<br /><span className="text-[#bc13ec] font-bold">320 Active</span>
                  </div>
                </div>
                {/* Animated route lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <defs>
                    <linearGradient id="route-grad" x1="0%" x2="100%" y1="0%" y2="0%">
                      <stop offset="0%" style={{ stopColor: "#135bec", stopOpacity: 0.2 }} />
                      <stop offset="50%" style={{ stopColor: "#00f0ff", stopOpacity: 0.8 }} />
                      <stop offset="100%" style={{ stopColor: "#00ff9d", stopOpacity: 0.2 }} />
                    </linearGradient>
                  </defs>
                  <path d="M780,180 Q500,50 240,195" fill="none" stroke="url(#route-grad)" strokeDasharray="4,4" strokeWidth="1.5">
                    <animate attributeName="stroke-dashoffset" dur="5s" from="100" to="0" repeatCount="indefinite" />
                  </path>
                  <path d="M480,160 Q550,220 620,250" fill="none" stroke="url(#route-grad)" strokeDasharray="4,4" strokeWidth="1.5">
                    <animate attributeName="stroke-dashoffset" dur="4s" from="100" to="0" repeatCount="indefinite" />
                  </path>
                </svg>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6 flex flex-col h-full">
              <h2 className="text-lg font-bold text-white mb-6">Recent Transactions</h2>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {transactions.map((t) => (
                  <div key={t.name} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${t.bgColor} ${t.txtColor} flex items-center justify-center font-bold text-xs border border-white/10`}>
                        {t.initials}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{t.name}</h4>
                        <p className="text-[10px] text-slate-400">{t.detail}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">{t.amount}</p>
                      <p className={`text-[10px] ${t.statusColor}`}>{t.status}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/dashboard/exporter/analytics"
                className="mt-4 w-full py-2.5 bg-white/5 hover:bg-white/10 text-sm font-medium text-slate-300 rounded-xl transition-colors border border-white/5 text-center block"
              >
                View All Transactions
              </Link>
            </div>
          </div>

          {/* Revenue + Suppliers row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
            {/* Revenue by Category */}
            <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-white">Revenue by Category</h2>
              </div>
              <div className="space-y-6">
                {categories.map((c) => (
                  <div key={c.name}>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-slate-300">{c.name}</span>
                      <span className="text-white font-bold">{c.value}</span>
                    </div>
                    <div className="h-2 w-full bg-[#151c2a] rounded-full overflow-hidden">
                      <div className={`h-full ${c.color} rounded-full ${c.shadow}`} style={{ width: c.width }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performing Suppliers */}
            <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-white">Top Performing Suppliers</h2>
                <Link href="/dashboard/exporter/directory" className="text-primary text-xs font-medium hover:underline">
                  View Directory
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs text-slate-500 border-b border-white/5">
                      <th className="pb-3 font-medium">Supplier</th>
                      <th className="pb-3 font-medium">Region</th>
                      <th className="pb-3 font-medium">Orders</th>
                      <th className="pb-3 font-medium text-right">Rating</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {suppliers.map((s) => (
                      <tr key={s.name} className="border-b border-white/5 last:border-0 group hover:bg-white/5 transition-colors">
                        <td className="py-3 flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${s.bgColor} ${s.txtColor} flex items-center justify-center font-bold text-xs`}>
                            {s.initials}
                          </div>
                          <span className="text-slate-200 font-medium">{s.name}</span>
                        </td>
                        <td className="py-3 text-slate-400">{s.region}</td>
                        <td className="py-3 text-white">{s.orders}</td>
                        <td className="py-3 text-right text-yellow-500 font-bold">
                          <span className="flex items-center justify-end gap-1">
                            {s.rating} <Star className="w-3.5 h-3.5 fill-yellow-500" />
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
