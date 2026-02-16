"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function AdminTrendsPage() {
  return (
    <div className="h-dvh flex flex-col overflow-hidden">
      <header className="flex-shrink-0 px-8 py-6 border-b border-white/5 bg-[#0b1019]/30 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Trends Analysis</h1>
            <p className="text-sm text-slate-400">Signals, demand shifts, and price movement.</p>
          </div>
          <Link
            href="/dashboard/admin/analytics"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#151c2a]/50 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/5"
          >
            Open Analytics
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8 bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6">
            <div className="text-white font-bold tracking-tight">Top movers</div>
            <div className="mt-4 space-y-3">
              {[
                { k: "Cotton yarn", v: "+6.1%" },
                { k: "Solar panels", v: "+3.4%" },
                { k: "Industrial valves", v: "-1.2%" },
                { k: "Rice exports", v: "+2.7%" },
              ].map((x) => (
                <div key={x.k} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="text-slate-200 font-semibold">{x.k}</div>
                  <div className="text-primary font-bold">{x.v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="xl:col-span-4 space-y-4">
            <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6">
              <div className="text-white font-bold tracking-tight">Alerts & notes</div>
              <div className="mt-4 space-y-2 text-sm text-slate-300">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  Port congestion affecting East Asia routes.
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  Higher demand for textiles in EU this week.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
