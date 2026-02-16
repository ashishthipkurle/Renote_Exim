export default function ExporterDashboard() {
  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-gradient-to-br from-[#0a0c12] via-[#0d1017] to-[#0a0c12]">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-white/5">
        <h2 className="text-3xl font-black tracking-tight text-white">Exporter Overview</h2>
        <p className="text-slate-400 mt-1">Exporter workspace — listings, inventory, and orders.</p>
      </header>

      <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { k: "Active Listings", v: "24", sub: "+3 this week" },
            { k: "Pending Orders", v: "6", sub: "2 need confirmation" },
            { k: "Inventory Items", v: "112", sub: "8 low stock" },
            { k: "Messages", v: "11", sub: "4 unread" },
          ].map((s) => (
            <div
              key={s.k}
              className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl p-6 rounded-2xl"
            >
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{s.k}</div>
              <div className="mt-3 text-3xl font-black text-white tracking-tight">{s.v}</div>
              <div className="mt-2 text-sm text-primary font-semibold">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-8">
          <h3 className="text-2xl font-black text-white tracking-tight">Grow sales</h3>
          <p className="text-slate-400 mt-2">Manage inventory and respond to new orders quickly.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="/dashboard/exporter/inventory"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-[#0f49bd]"
            >
              Manage inventory
            </a>
            <a
              href="/dashboard/exporter/orders"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-slate-200 hover:bg-white/10"
            >
              View orders
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
