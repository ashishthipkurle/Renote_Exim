export default function ImporterDashboard() {
  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-gradient-to-br from-[#0a0c12] via-[#0d1017] to-[#0a0c12]">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-white/5">
        <h2 className="text-3xl font-black tracking-tight text-white">Global Trade Overview</h2>
        <p className="text-slate-400 mt-1">Importer workspace — quick actions and status.</p>
      </header>

      <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { k: "Active Orders", v: "8", sub: "2 awaiting confirmation" },
            { k: "Total Spent", v: "$32.4K", sub: "This year" },
            { k: "Saved Products", v: "15", sub: "In wishlist" },
            { k: "Messages", v: "5", sub: "3 unread" },
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
          <h3 className="text-2xl font-black text-white tracking-tight">Start importing</h3>
          <p className="text-slate-400 mt-2">Browse verified products and place orders in minutes.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="/products"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-[#0f49bd]"
            >
              Browse products
            </a>
            <a
              href="/dashboard/importer/orders"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-slate-200 hover:bg-white/10"
            >
              View orders
            </a>
          </div>
        </div>

        <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <div className="text-white font-bold tracking-tight">Recent orders</div>
              <div className="text-slate-400 text-xs">Connected to the Orders page</div>
            </div>
            <a className="text-primary text-sm font-bold hover:underline" href="/orders">
              Open full list
            </a>
          </div>
          <div className="px-6 py-10 text-center text-slate-400">
            <div className="text-white font-semibold">No orders yet</div>
            <div className="text-sm mt-2">Go to Products to place your first order.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

