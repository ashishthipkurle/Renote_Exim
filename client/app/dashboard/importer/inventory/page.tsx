export default function ImporterInventoryPage() {
  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-gradient-to-br from-[#0a0c12] via-[#0d1017] to-[#0a0c12]">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Global Stock Overview</h1>
            <p className="text-slate-400 mt-1">Manage cross-border inventory across all warehouse nodes.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/10 text-slate-200 font-bold py-2.5 px-4 rounded-xl hover:bg-white/5 transition-colors"
            >
              Export Report
            </button>
            <button
              type="button"
              className="bg-primary hover:bg-[#0f49bd] text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-primary/20 transition-colors"
            >
              Add Product
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
        <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <input
              className="w-full pl-4 pr-4 py-2 bg-slate-800/50 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
              placeholder="Search by SKU, Product Name..."
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <button
              type="button"
              className="px-3 py-1.5 rounded-xl bg-primary/20 border border-primary/40 text-primary text-xs font-bold whitespace-nowrap"
            >
              All Locations
            </button>
            <button
              type="button"
              className="px-3 py-1.5 rounded-xl bg-[#151c2a]/60 border border-white/10 text-slate-400 hover:text-white text-xs font-bold whitespace-nowrap transition-colors"
            >
              Electronics
            </button>
            <button
              type="button"
              className="px-3 py-1.5 rounded-xl bg-[#151c2a]/60 border border-white/10 text-slate-400 hover:text-white text-xs font-bold whitespace-nowrap transition-colors"
            >
              More Filters
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="hidden md:grid grid-cols-12 gap-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div className="col-span-5">Product Details</div>
            <div className="col-span-2">Pricing</div>
            <div className="col-span-3">Stock Level</div>
            <div className="col-span-2 text-right">Status</div>
          </div>

          {[
            {
              name: "AI Security Camera Pro",
              sku: "CAM-AI-9002",
              cat: "Electronics",
              loc: "Warehouse A (US)",
              b2b: "$125.00",
              b2c: "$189.99",
              stock: "1,240 units",
              target: "1,500",
              bar: "w-[82%]",
              pill: "In Stock",
              pillClass: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
            },
            {
              name: "SonicPure NC Headphones",
              sku: "AUD-NC-2201",
              cat: "Audio",
              loc: "Warehouse C (EU)",
              b2b: "$79.00",
              b2c: "$129.99",
              stock: "240 units",
              target: "800",
              bar: "w-[30%]",
              pill: "Low",
              pillClass: "text-amber-400 bg-amber-400/10 border-amber-400/20",
            },
          ].map((p) => (
            <div
              key={p.sku}
              className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 hover:border-primary/30 transition-colors shadow-xl rounded-2xl p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
            >
              <div className="md:col-span-5 flex items-center gap-4">
                <div className="size-16 rounded-xl bg-slate-800 border border-white/5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-bold text-white">{p.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">SKU: {p.sku}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded-lg bg-slate-800 border border-white/5 text-[10px] text-slate-400 font-medium">
                      {p.cat}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-slate-800 border border-white/5 text-[10px] text-slate-400 font-medium">
                      {p.loc}
                    </span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-slate-400">
                    B2B: <span className="text-white font-bold">{p.b2b}</span>
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    B2C: <span className="text-white font-bold">{p.b2c}</span>
                  </span>
                </div>
              </div>

              <div className="md:col-span-3">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-emerald-400 font-bold">{p.stock}</span>
                  <span className="text-slate-500">Target: {p.target}</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className={`bg-primary h-full ${p.bar} shadow-[0_0_10px_rgba(19,91,236,0.3)]`} />
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end">
                <span
                  className={
                    "inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide " +
                    p.pillClass
                  }
                >
                  <span className="size-1.5 rounded-full bg-current opacity-80" />
                  {p.pill}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
