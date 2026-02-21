import Link from "next/link";

const stats = [
  {
    label: "Active Shipments",
    value: "142",
    trend: "+8",
    trendUp: true,
    bar: 94,
    icon: "local_shipping",
    accentColor: "text-[#00f0ff]",
    barColor: "bg-[#00f0ff]",
    barShadow: "shadow-[0_0_10px_rgba(0,240,255,0.5)]",
    hoverBorder: "hover:border-[#00f0ff]/30",
    sub1: "Target: 150",
    sub2: "94% Capacity",
  },
  {
    label: "Daily Gross Revenue",
    value: "$842k",
    trend: "12.4%",
    trendUp: true,
    bar: 78,
    icon: "monetization_on",
    accentColor: "text-[#d4af37]",
    barColor: "bg-[#d4af37]",
    barShadow: "shadow-[0_0_10px_rgba(212,175,55,0.5)]",
    hoverBorder: "hover:border-[#d4af37]/30",
    sub1: "Prev: $749k",
    sub2: "+93k Today",
  },
  {
    label: "Pending Customs",
    value: "18",
    trend: "3 Urgent",
    trendUp: false,
    bar: 35,
    icon: "gavel",
    accentColor: "text-purple-400",
    barColor: "bg-purple-500",
    barShadow: "shadow-[0_0_10px_rgba(168,85,247,0.5)]",
    hoverBorder: "hover:border-purple-500/30",
    sub1: "Avg Time: 4h",
    sub2: "Clearance Rate",
  },
  {
    label: "New Inquiries",
    value: "56",
    trend: "Stable",
    trendUp: null,
    bar: 55,
    icon: "mark_chat_unread",
    accentColor: "text-primary",
    barColor: "bg-primary",
    barShadow: "shadow-[0_0_10px_rgba(19,91,236,0.5)]",
    hoverBorder: "hover:border-primary/30",
    sub1: "B2B: 42",
    sub2: "B2C: 14",
  },
];

const insights = [
  { type: "OPPORTUNITY", color: "text-[#00f0ff]", bg: "bg-[#00f0ff]/10", border: "hover:border-[#00f0ff]/30", time: "2h ago", text: "Currency fluctuation in EU suggests increasing B2B exports now to maximize margins." },
  { type: "WARNING", color: "text-[#d4af37]", bg: "bg-[#d4af37]/10", border: "hover:border-[#d4af37]/30", time: "5h ago", text: "Predicted logistics congestion in Port of Long Beach - consider alternative West Coast routes." },
  { type: "TREND", color: "text-purple-400", bg: "bg-purple-400/10", border: "hover:border-purple-400/30", time: "1d ago", text: "Surge in demand for electronics in SE Asia region. Recommend inventory reallocation." },
  { type: "ADVICE", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "hover:border-emerald-400/30", time: "1d ago", text: "Lower shipping rates on Atlantic routes available for next 48 hours." },
];

const feedItems = [
  { color: "bg-[#d4af37]", title: "Order #8821 Confirmed", desc: "Electronics shipment to Hamburg initiated.", time: "2 mins ago" },
  { color: "bg-emerald-500", title: "Payment Received", desc: "$12,450 from Global Logistics Co.", time: "15 mins ago" },
  { color: "bg-purple-500", title: "Customs Update", desc: "Shipment #992 cleared at Port of LA.", time: "42 mins ago" },
  { color: "bg-primary", title: "New Supplier Added", desc: "Shenzhen Tech Manufacturing Ltd.", time: "1h ago" },
];

const bubbles = [
  { label: "Asia\nPac", value: "+18%", size: 100, top: "20%", left: "55%", color: "bg-[#00f0ff]/20", border: "border-[#00f0ff]/40", text: "text-[#00f0ff]" },
  { label: "North\nAm", value: "+12%", size: 120, top: "15%", left: "25%", color: "bg-[#d4af37]/20", border: "border-[#d4af37]/40", text: "text-[#d4af37]" },
  { label: "Europe", value: "+5%", size: 90, top: "55%", left: "42%", color: "bg-purple-500/20", border: "border-purple-500/40", text: "text-purple-300" },
  { label: "MENA", value: "+22%", size: 70, top: "60%", left: "72%", color: "bg-[#00f0ff]/20", border: "border-[#00f0ff]/40", text: "text-[#00f0ff]" },
  { label: "LATAM", value: "+9%", size: 60, top: "75%", left: "12%", color: "bg-emerald-500/20", border: "border-emerald-500/40", text: "text-emerald-300" },
  { label: "Africa", value: "+15%", size: 50, top: "40%", left: "8%", color: "bg-primary/20", border: "border-primary/40", text: "text-primary" },
];

export default function ImporterDashboard() {
  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-8 bg-gradient-to-br from-[#0a0c12] via-[#0d1017] to-[#0a0c12]">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white">Global Trade Overview</h2>
          <p className="text-slate-400 mt-1">Welcome back. Here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#161b26]/70 backdrop-blur-xl border border-white/5 px-4 py-2 rounded-xl flex items-center gap-2">
            <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm text-white font-medium">System Online</span>
          </div>
          <div className="bg-[#161b26]/70 backdrop-blur-xl border border-white/5 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors relative">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            <span className="absolute top-2 right-2 size-2 bg-[#00f0ff] rounded-full border border-[#0a0c12]" />
          </div>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.label} className={`bg-[#161b26]/70 backdrop-blur-xl p-5 rounded-xl border border-white/5 relative overflow-hidden group ${s.hoverBorder} transition-all duration-300`}>
            <p className={`text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2`}>
              <span className={`${s.accentColor}`}>
                {s.label === "Active Shipments" && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M13 16V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1m8-1a1 1 0 0 1-1 1H9m4-1V8a1 1 0 0 1 1-1h2.586a1 1 0 0 1 .707.293l3.414 3.414a1 1 0 0 1 .293.707V16a1 1 0 0 1-1 1h-1m-6-1a1 1 0 0 0 1 1h1M5 17a2 2 0 1 0 4 0m-4 0a2 2 0 1 1 4 0m6 0a2 2 0 1 0 4 0m-4 0a2 2 0 1 1 4 0" /></svg>}
                {s.label === "Daily Gross Revenue" && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                {s.label === "Pending Customs" && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>}
                {s.label === "New Inquiries" && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
              </span>
              {s.label}
            </p>
            <div className="flex items-baseline gap-2 mt-3">
              <h3 className="text-3xl font-black text-white">{s.value}</h3>
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded flex items-center ${
                s.trendUp === true ? "text-[#00f0ff] bg-[#00f0ff]/10" :
                s.trendUp === false ? "text-rose-500 bg-rose-500/10" :
                "text-white bg-white/5"
              }`}>
                {s.trendUp === true && <svg className="w-2.5 h-2.5 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 15l7-7 7 7" /></svg>}
                {s.trendUp === false && <svg className="w-2.5 h-2.5 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                {s.trendUp === null && <svg className="w-2.5 h-2.5 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M20 12H4" /></svg>}
                {s.trend}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between text-[10px] text-slate-500">
              <span>{s.sub1}</span>
              <span>{s.sub2}</span>
            </div>
            <div className="mt-2 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full ${s.barColor} rounded-full ${s.barShadow}`} style={{ width: `${s.bar}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Market Intelligence + Insights */}
          <div className="bg-[#161b26]/70 backdrop-blur-xl rounded-xl p-6 border border-white/5 relative overflow-hidden flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-extrabold text-white">Global Market Intelligence</h3>
                  <p className="text-xs text-slate-400">Regional Performance &amp; Growth Analysis</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-[#00f0ff]" />
                    <span className="text-[10px] font-bold text-slate-400">Emerging</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-[#d4af37]" />
                    <span className="text-[10px] font-bold text-slate-400">Established</span>
                  </div>
                </div>
              </div>
              {/* Bubble chart */}
              <div className="relative w-full h-[380px] bg-[radial-gradient(circle_at_bottom_left,_#1a2333_0%,_#0d1017_100%)] rounded-xl overflow-hidden">
                {/* Grid lines */}
                <div className="absolute w-full h-px top-[25%] left-0 bg-white/5" />
                <div className="absolute w-full h-px top-[50%] left-0 bg-white/5" />
                <div className="absolute w-full h-px top-[75%] left-0 bg-white/5" />
                <div className="absolute h-full w-px top-0 left-[25%] bg-white/5" />
                <div className="absolute h-full w-px top-0 left-[50%] bg-white/5" />
                <div className="absolute h-full w-px top-0 left-[75%] bg-white/5" />
                <div className="absolute bottom-2 right-4 text-white/30 text-[0.7rem] font-semibold uppercase">Market Size →</div>
                {bubbles.map((b) => (
                  <div
                    key={b.label}
                    className={`absolute rounded-full ${b.color} backdrop-blur-sm border ${b.border} flex flex-col items-center justify-center cursor-pointer hover:scale-110 hover:z-20 hover:border-white/40 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300`}
                    style={{ width: b.size, height: b.size, top: b.top, left: b.left }}
                  >
                    <span className={`text-xs font-bold text-center leading-tight ${b.text} whitespace-pre-line`}>{b.label}</span>
                    <span className="text-[0.65rem] opacity-80 mt-0.5">{b.value}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Strategic Insights */}
            <div className="lg:w-72 flex flex-col gap-4 border-l border-white/5 pl-0 lg:pl-6 pt-6 lg:pt-0">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-[#00f0ff] animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Strategic Insights</h4>
              </div>
              <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2">
                {insights.map((i) => (
                  <div key={i.type} className={`group p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 ${i.border} transition-all cursor-pointer`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-[10px] font-bold ${i.color} ${i.bg} px-1.5 py-0.5 rounded`}>{i.type}</span>
                      <span className="text-[9px] text-slate-500">{i.time}</span>
                    </div>
                    <p className="text-xs font-semibold text-white leading-relaxed">{i.text}</p>
                  </div>
                ))}
              </div>
              <button className="mt-auto w-full py-2.5 rounded-lg border border-primary/30 text-primary text-xs font-bold hover:bg-primary/10 transition-colors flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                Generate New Report
              </button>
            </div>
          </div>

          {/* Revenue vs Projections */}
          <div className="bg-[#161b26]/70 backdrop-blur-xl rounded-xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Revenue vs. Projections</h3>
                <p className="text-xs text-slate-400">Current quarter financial performance</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-[#00f0ff]" /><span className="text-xs text-slate-400">Actual</span></div>
                <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-slate-600 border border-slate-400 border-dashed" /><span className="text-xs text-slate-400">Projected</span></div>
              </div>
            </div>
            <div className="relative w-full h-48 flex items-end px-2">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10 z-0 pb-6">
                <div className="w-full h-px bg-slate-400" />
                <div className="w-full h-px bg-slate-400" />
                <div className="w-full h-px bg-slate-400" />
                <div className="w-full h-px bg-slate-400" />
              </div>
              <svg className="absolute inset-0 w-full h-full z-10 pb-6 drop-shadow-[0_0_8px_rgba(0,240,255,0.3)]" preserveAspectRatio="none" viewBox="0 0 800 200">
                <defs>
                  <linearGradient id="areaGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "#00f0ff", stopOpacity: 0.2 }} />
                    <stop offset="100%" style={{ stopColor: "#00f0ff", stopOpacity: 0 }} />
                  </linearGradient>
                </defs>
                {/* Projected line (dashed) */}
                <path d="M0,150 C100,140 200,130 300,100 C400,70 500,80 600,50 C700,20 750,10 800,5" fill="none" stroke="#64748b" strokeDasharray="5,5" strokeWidth="2" />
                {/* Actual area fill */}
                <path d="M0,160 C100,150 200,110 300,120 C400,60 500,90 600,40 C700,30 750,15 800,20 L800,200 L0,200 Z" fill="url(#areaGrad)" />
                {/* Actual line */}
                <path d="M0,160 C100,150 200,110 300,120 C400,60 500,90 600,40 C700,30 750,15 800,20" fill="none" stroke="#00f0ff" strokeWidth="3" />
                <circle cx="300" cy="120" r="4" fill="#0a0c12" stroke="#00f0ff" strokeWidth="2" />
                <circle cx="600" cy="40" r="4" fill="#0a0c12" stroke="#00f0ff" strokeWidth="2" />
              </svg>
            </div>
            <div className="flex justify-between px-2 text-[10px] text-slate-500 font-medium uppercase tracking-wide">
              <span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span><span>Week 5</span><span>Week 6</span><span>Week 7</span><span>Week 8</span>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Actions */}
          <div className="bg-[#161b26]/70 backdrop-blur-xl p-6 rounded-xl border border-white/5">
            <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/dashboard/importer/orders" className="bg-primary hover:bg-primary/80 text-white p-4 rounded-xl transition-all flex flex-col items-center justify-center gap-2 shadow-lg shadow-primary/20 group h-28">
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 4v16m8-8H4" /></svg>
                <span className="text-xs font-bold">New Export</span>
              </Link>
              <button className="bg-[#161b26]/70 backdrop-blur-xl hover:bg-white/5 border border-white/10 text-white p-4 rounded-xl transition-all flex flex-col items-center justify-center gap-2 group h-28">
                <svg className="w-6 h-6 text-[#d4af37] group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <span className="text-xs font-bold">Request Quote</span>
              </button>
              <Link href="/dashboard/importer/inventory" className="bg-[#161b26]/70 backdrop-blur-xl hover:bg-white/5 border border-white/10 text-white p-4 rounded-xl transition-all flex flex-col items-center justify-center gap-2 group h-28">
                <svg className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                <span className="text-xs font-bold">Manage Stock</span>
              </Link>
              <button className="bg-[#161b26]/70 backdrop-blur-xl hover:bg-white/5 border border-white/10 text-white p-4 rounded-xl transition-all flex flex-col items-center justify-center gap-2 group h-28">
                <svg className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                <span className="text-xs font-bold">Support</span>
              </button>
            </div>
          </div>

          {/* Live Trade Feed */}
          <div className="bg-[#161b26]/70 backdrop-blur-xl p-6 rounded-xl border border-white/5 flex flex-col h-[400px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Live Trade Feed</h3>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f0ff] opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00f0ff]" />
              </span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {feedItems.map((f, i) => (
                <div key={i} className={`flex gap-3 items-start p-3 rounded-lg bg-white/5 border border-white/5 ${i === feedItems.length - 1 ? "opacity-60" : ""}`}>
                  <div className={`mt-1 size-2 rounded-full ${f.color} flex-shrink-0`} />
                  <div>
                    <p className="text-sm font-bold text-white">{f.title}</p>
                    <p className="text-xs text-slate-400">{f.desc}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{f.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-dashed border-slate-700">
              View All Activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

