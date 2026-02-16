"use client";

import Link from "next/link";
import { Plus, Search } from "lucide-react";

export default function AdminCategoriesPage() {
  return (
    <div className="h-dvh flex flex-col overflow-hidden">
      <header className="flex-shrink-0 px-8 py-6 border-b border-white/5 bg-[#0b1019]/30 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">All Categories</h1>
            <p className="text-sm text-slate-400">Manage categories for global product discovery.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <input
                className="pl-10 pr-4 py-2 bg-[#151c2a]/50 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:ring-1 focus:ring-primary focus:border-primary w-64"
                placeholder="Search categories..."
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-[#0f49bd]"
            >
              <Plus className="h-4 w-4" />
              New Category
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[
              { name: "Textiles", items: 248 },
              { name: "Electronics", items: 512 },
              { name: "Agriculture", items: 190 },
              { name: "Machinery", items: 141 },
              { name: "Chemicals", items: 88 },
              { name: "FMCG", items: 230 },
            ].map((c) => (
              <div
                key={c.name}
                className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl p-6 rounded-2xl hover:border-primary/30 transition-colors"
              >
                <div className="text-white font-bold text-lg tracking-tight">{c.name}</div>
                <div className="text-slate-400 text-sm mt-1">{c.items} items</div>
                <div className="mt-5 flex items-center gap-3">
                  <Link
                    href="/dashboard/admin/inventory"
                    className="text-sm font-bold text-primary hover:underline"
                  >
                    View inventory
                  </Link>
                  <button
                    type="button"
                    className="text-sm font-bold text-slate-300 hover:text-white"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
