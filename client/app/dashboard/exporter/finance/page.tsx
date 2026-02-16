export default function ExporterFinancePage() {
  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-gradient-to-br from-[#0a0c12] via-[#0d1017] to-[#0a0c12]">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Finance & Payouts</h1>
            <p className="text-slate-400 mt-1">Payout schedule, invoices, and settlement status.</p>
          </div>
          <button
            type="button"
            className="bg-primary hover:bg-[#0f49bd] text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-primary/20 transition-colors"
          >
            Withdraw
          </button>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[
            { k: "Available", v: "$142,300" },
            { k: "Pending", v: "$28,910" },
            { k: "Last payout", v: "$18,240" },
          ].map((s) => (
            <div key={s.k} className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{s.k}</div>
              <div className="text-3xl font-black text-white mt-2">{s.v}</div>
              <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[55%]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
