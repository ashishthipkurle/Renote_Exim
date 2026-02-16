export default function ImporterFinancePage() {
  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-gradient-to-br from-[#0a0c12] via-[#0d1017] to-[#0a0c12]">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Finance Hub</h1>
            <p className="text-slate-400 mt-1">Manage global payments, cash flow, and tax estimates.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 font-bold py-2.5 px-6 rounded-xl transition-colors"
            >
              Export Report
            </button>
            <button
              type="button"
              className="bg-primary hover:bg-[#0f49bd] text-white font-bold py-2.5 px-6 rounded-xl shadow-[0_0_20px_rgba(19,91,236,0.35)] transition-colors"
            >
              Add Funds
            </button>
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { k: "Total Balance", v: "$2,845,920.00" },
              { k: "Pending Payouts", v: "$142,300.50" },
              { k: "Est. Tax Liability", v: "$84,120.00" },
            ].map((s) => (
              <div
                key={s.k}
                className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6 relative overflow-hidden"
              >
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">{s.k}</div>
                <div className="text-3xl font-black text-white mt-2">{s.v}</div>
                <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[55%]" />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <section className="lg:col-span-8 bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6 min-h-[360px]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-lg font-bold text-white">Cash Flow Analysis</div>
                  <div className="text-xs text-slate-400">Income vs Expenses (Current Year)</div>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="px-3 py-1 rounded-xl bg-white/10 text-white text-xs font-bold">
                    1M
                  </button>
                  <button type="button" className="px-3 py-1 rounded-xl bg-primary text-white text-xs font-bold shadow-lg shadow-primary/30">
                    6M
                  </button>
                  <button type="button" className="px-3 py-1 rounded-xl bg-white/10 text-white text-xs font-bold">
                    1Y
                  </button>
                </div>
              </div>
              <div className="h-56 rounded-2xl bg-slate-900/40 border border-white/5" />
            </section>

            <section className="lg:col-span-4 space-y-6">
              <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6">
                <div className="text-white font-bold tracking-tight">Recent invoices</div>
                <div className="mt-4 space-y-3">
                  {[
                    { id: "INV-1031", amt: "$12,400", status: "Processing" },
                    { id: "INV-1030", amt: "$8,920", status: "Paid" },
                    { id: "INV-1029", amt: "$2,150", status: "Pending" },
                  ].map((x) => (
                    <div key={x.id} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 flex items-center justify-between">
                      <div>
                        <div className="text-white text-sm font-bold">{x.id}</div>
                        <div className="text-slate-400 text-xs">{x.status}</div>
                      </div>
                      <div className="text-white font-black text-sm">{x.amt}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
