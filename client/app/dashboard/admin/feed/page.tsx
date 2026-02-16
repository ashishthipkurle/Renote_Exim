"use client";

import Link from "next/link";
import { ArrowUpRight, RefreshCcw } from "lucide-react";

export default function AdminFeedPage() {
  return (
    <div className="h-dvh flex flex-col overflow-hidden">
      <header className="flex-shrink-0 px-8 py-6 border-b border-white/5 bg-[#0b1019]/30 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Dynamic Marketplace Feed</h1>
            <p className="text-sm text-slate-400">Monitor listings and discovery performance.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#151c2a]/50 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/5"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-[#0f49bd]"
            >
              Open Client View
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8 bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6">
            <div className="text-white font-bold tracking-tight">Live feed</div>
            <div className="mt-4 space-y-3">
              {[
                { t: "New listing", d: "Cotton fabric roll — MOQ updated" },
                { t: "Price change", d: "Solar inverter components — -2.1%" },
                { t: "High intent", d: "Industrial valves — increased search demand" },
                { t: "Compliance", d: "Certificate required for electronics shipment" },
              ].map((x, i) => (
                <div
                  key={`${x.t}-${i}`}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 hover:border-primary/30 transition-colors"
                >
                  <div className="text-slate-200 font-semibold">{x.t}</div>
                  <div className="text-slate-400 text-xs mt-1">{x.d}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="xl:col-span-4 space-y-4">
            <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6">
              <div className="text-white font-bold tracking-tight">Controls</div>
              <div className="mt-4 space-y-2">
                {[
                  "Auto-refresh: On",
                  "Signal threshold: Medium",
                  "Region: Global",
                  "Category: All",
                ].map((x) => (
                  <div key={x} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                    {x}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
