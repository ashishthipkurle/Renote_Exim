export default function ImporterShipmentsPage() {
  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-gradient-to-br from-[#0a0c12] via-[#0d1017] to-[#0a0c12]">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-white/5">
        <h1 className="text-2xl font-bold text-white tracking-tight">Order Tracking</h1>
        <p className="text-sm text-slate-400">Importer view — shipment milestones and live status.</p>
      </header>

      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6">
          <section className="xl:col-span-7 rounded-2xl bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <div className="text-white font-bold tracking-tight">Active Shipment</div>
                <div className="text-slate-400 text-xs mt-1">Connected route placeholder</div>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-bold">
                LIVE
              </div>
            </div>
            <div className="h-72 relative">
              <div className="absolute inset-0 bg-[#0c101a]" />
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 400">
                <path
                  d="M100,200 Q300,50 500,200 T900,150"
                  fill="none"
                  opacity="0.4"
                  stroke="#135bec"
                  strokeDasharray="8 4"
                  strokeWidth="2"
                />
                <circle cx="580" cy="180" r="6" fill="#135bec" />
              </svg>
              <div className="absolute bottom-6 right-6 p-4 rounded-2xl bg-[#151c2a]/70 backdrop-blur-xl border border-white/10">
                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Estimated Arrival</p>
                <p className="text-lg font-black text-white">TBD</p>
                <div className="mt-2 w-48 bg-white/10 h-1 rounded-full overflow-hidden">
                  <div className="bg-primary h-full w-[45%]" />
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {[
                "Order Processed",
                "In Transit",
                "Customs Clearance",
                "Final Delivery",
              ].map((s, idx) => (
                <div
                  key={s}
                  className={
                    "rounded-xl border border-white/10 bg-white/5 px-4 py-3 flex items-center justify-between " +
                    (idx > 1 ? "opacity-60" : "")
                  }
                >
                  <div className="text-white font-semibold">{s}</div>
                  <div className="text-xs text-slate-400">{idx > 1 ? "Pending" : "Completed"}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="xl:col-span-5 space-y-4">
            <div className="rounded-2xl bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl p-6">
              <div className="text-white font-bold tracking-tight">Archive</div>
              <div className="mt-4 space-y-3">
                {[
                  { id: "ORD-2094-ZZ", status: "DELIVERED" },
                  { id: "ORD-1882-LX", status: "DELIVERED" },
                  { id: "ORD-1722-PQ", status: "IN TRANSIT" },
                ].map((o) => (
                  <div
                    key={o.id}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-white text-sm font-bold">{o.id}</div>
                      <div className="text-slate-400 text-xs">Tap to view tracking</div>
                    </div>
                    <div className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
                      {o.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
