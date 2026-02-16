export default function ImporterAnalyticsPage() {
  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-gradient-to-br from-[#0a0c12] via-[#0d1017] to-[#0a0c12]">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Advanced Global Trade Analytics</h1>
            <p className="text-slate-400 mt-1">Deep insights into market performance and supply chain metrics.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/10 text-slate-200 font-bold py-2.5 px-4 rounded-xl hover:bg-white/5 transition-colors"
            >
              Last 30 Days
            </button>
            <button
              type="button"
              className="bg-primary hover:bg-[#0f49bd] text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-primary/20 transition-colors"
            >
              Export Report
            </button>
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { k: "Total Revenue", v: "$4,289,102", tag: "+12.5%" },
              { k: "Shipments", v: "1,892", tag: "+5.2%" },
              { k: "Active Regions", v: "42", tag: "Stable" },
              { k: "Customs Holds", v: "3", tag: "Action" },
            ].map((s) => (
              <div
                key={s.k}
                className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl p-6 rounded-2xl relative overflow-hidden"
              >
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{s.k}</div>
                <div className="mt-2 text-2xl font-black text-white">{s.v}</div>
                <div className="mt-3 inline-flex text-xs font-bold px-2 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
                  {s.tag}
                </div>
                <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[60%]" />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6 min-h-[360px]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-bold tracking-tight">Trade Performance</div>
                  <div className="text-xs text-slate-400">Revenue trends across top sectors</div>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="px-3 py-1 rounded-xl bg-primary/20 border border-primary/30 text-primary text-xs font-bold">
                    Monthly
                  </button>
                  <button type="button" className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-xs font-bold">
                    Weekly
                  </button>
                </div>
              </div>
              <div className="mt-8 h-56 rounded-2xl bg-slate-900/40 border border-white/5" />
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6">
                <div className="text-white font-bold tracking-tight">Highlights</div>
                <div className="mt-4 space-y-3 text-sm text-slate-300">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">Top demand rising in textiles.</div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">Sea route ETAs improving week-over-week.</div>
                </div>
              </div>
              <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6">
                <div className="text-white font-bold tracking-tight">Actions</div>
                <div className="mt-4 space-y-2">
                  <button type="button" className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white hover:bg-[#0f49bd]">
                    Export report
                  </button>
                  <button type="button" className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-bold text-slate-200 hover:bg-white/10">
                    Share dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
