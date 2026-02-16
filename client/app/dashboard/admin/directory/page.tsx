"use client";

import { Search } from "lucide-react";

export default function AdminDirectoryPage() {
  return (
    <div className="h-dvh flex flex-col overflow-hidden">
      <header className="flex-shrink-0 px-8 py-6 border-b border-white/5 bg-[#0b1019]/30 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Worldwide Partner Directory</h1>
            <p className="text-sm text-slate-400">Verified exporters, importers, brokers, and carriers.</p>
          </div>

          <div className="relative hidden md:block">
            <input
              className="pl-10 pr-4 py-2 bg-[#151c2a]/50 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:ring-1 focus:ring-primary focus:border-primary w-80"
              placeholder="Search companies, countries..."
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-3 gap-6">
          {[
            { name: "Oceanic Freight Co.", region: "US", tag: "Carrier" },
            { name: "Shenzhen TradeHub", region: "CN", tag: "Exporter" },
            { name: "EU Customs Assist", region: "EU", tag: "Broker" },
            { name: "Mumbai Textiles Ltd.", region: "IN", tag: "Exporter" },
            { name: "Dubai Import Partners", region: "AE", tag: "Importer" },
            { name: "Santos Logistics", region: "BR", tag: "Carrier" },
          ].map((p) => (
            <div
              key={p.name}
              className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl p-6 rounded-2xl hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-white font-bold text-lg tracking-tight">{p.name}</div>
                  <div className="text-slate-400 text-sm mt-1">Region: {p.region}</div>
                </div>
                <div className="text-xs font-bold px-2 py-1 rounded border border-white/10 bg-white/5 text-slate-200">
                  {p.tag}
                </div>
              </div>
              <div className="mt-5 text-sm text-slate-300">Status: Verified</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
