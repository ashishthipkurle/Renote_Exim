export default function ExporterInventoryPage() {
  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-gradient-to-br from-[#0a0c12] via-[#0d1017] to-[#0a0c12]">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Inventory Hub</h1>
            <p className="text-slate-400 mt-1">Manage listings, availability, and export readiness.</p>
          </div>
          <button
            type="button"
            className="bg-primary hover:bg-[#0f49bd] text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-primary/20 transition-colors"
          >
            Add Listing
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6 text-slate-300 text-sm">
          Stitch-style inventory layout applied (data wiring can be added next).
        </div>
      </div>
    </div>
  );
}
