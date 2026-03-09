"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Boxes,
  Search,
  Plus,
  Eye,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Activity,
  BarChart2,
  Tag,
  FolderTree,
  Edit3,
  CheckCircle2
} from "lucide-react";
import { useAuthFetch } from "@/lib/hooks/useAuthFetch";
import { toast } from "sonner";
import clsx from "clsx";

type Category = {
  name: string;
  count: number;
};

export default function AdminCategoriesPage() {
  const authFetch = useAuthFetch();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCategories = async () => {
    try {
      const data = await authFetch("/api/admin/categories");
      setCategories(data.categories || []);
    } catch (error) {
      toast.error("Failed to fetch taxonomy data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-dvh flex flex-col bg-[#0b1019] relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[length:40px_40px] opacity-[0.03] pointer-events-none" />

      {/* Header */}
      <header className="flex-shrink-0 h-20 px-8 flex items-center justify-between border-b border-white/5 bg-[#0b1019]/30 backdrop-blur-md z-30">
        <div>
          <h1 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-2">
            Taxonomy Core
            <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded">
              {categories.length} SECTORS
            </span>
          </h1>
          <p className="text-slate-500 text-xs font-medium italic">Manage industrial sectors and product classification hierarchy.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Filter Sectors..."
              className="bg-[#151c2a]/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none w-64 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
            <Plus className="w-4 h-4" />
            Append Hub
          </button>
        </div>
      </header>

      {/* Grid Area */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />
            ))
          ) : filteredCategories.length === 0 ? (
            <div className="col-span-full h-64 flex items-center justify-center border border-dashed border-white/10 rounded-3xl">
              <span className="text-slate-500 font-black uppercase text-[10px] tracking-widest">No matching sectors detected.</span>
            </div>
          ) : (
            filteredCategories.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="group relative bg-[#151c2a]/40 backdrop-blur-xl border border-white/5 p-6 rounded-2xl hover:border-primary/30 transition-all shadow-xl overflow-hidden"
              >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                  <FolderTree className="w-24 h-24" />
                </div>

                <div className="relative space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      <Tag className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest shadow-[0_0_10px_rgba(52,211,153,0.1)]">
                      <Activity className="w-3 h-3" />
                      Active
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white font-black text-sm uppercase tracking-widest group-hover:text-primary transition-colors">
                      {c.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-tighter">Sector Classification Matrix</p>
                  </div>

                  <div className="flex items-end justify-between pt-4 border-t border-white/5">
                    <div>
                      <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1.5">Asset Density</div>
                      <div className="flex items-center gap-1.5 font-mono text-xs font-black text-white">
                        <BarChart2 className="w-3.5 h-3.5 text-primary" />
                        {c.count.toLocaleString()} <span className="text-slate-500 text-[10px] font-medium">SKUs</span>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-primary transition-all">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-red-500 hover:border-red-500 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Bar Indicator */}
                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-transparent w-0 group-hover:w-full transition-all duration-500" />
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Quick Action Footer */}
      <div className="px-8 py-4 bg-[#0b1019]/50 border-t border-white/5 backdrop-blur-md flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-slate-500">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            Neural Cloud In-Sync
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <span className="text-primary font-black">{categories.length}</span> Total Sectors Optimized
          </div>
        </div>
        <div className="text-slate-600 font-mono">RE-SYS // TAXONOMY_v4.2.1</div>
      </div>
    </div>
  );
}
