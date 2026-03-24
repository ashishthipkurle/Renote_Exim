"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/api-utils";
import {
    Search,
    Filter,
    MapPin,
    Star,
    ShoppingBag,
    ArrowUpRight,
    Verified,
    Globe,
    Users,
    MessageSquare,
    ShieldCheck,
    ChevronRight,
    TrendingUp
} from "lucide-react";
import { toast } from "sonner";

interface Exporter {
    id: string;
    name: string;
    companyName: string;
    image: string | null;
    description: string | null;
    rating: string;
    tradeVolume: number;
    categories: string[];
    joinedAt: string;
    _count: { products: number };
}

export default function ImporterDirectoryPage() {
    const [exporters, setExporters] = useState<Exporter[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");

    const fetchExporters = async () => {
        setLoading(true);
        try {
            const res = await authFetch<{ exporters: Exporter[] }>(`/api/directory?q=${search}&category=${category}`);
            setExporters(res.exporters);
        } catch {
            toast.error("Failed to load supplier directory");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchExporters();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, category]);

    return (
        <div className="h-dvh overflow-hidden flex flex-col bg-slate-50 dark:bg-[#0a0c12] transition-colors duration-300">
            <header className="flex-shrink-0 p-6 lg:p-8 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-gradient-to-b dark:from-[#0d1017] dark:to-transparent transition-colors duration-300">
                <div className="max-w-[1600px] mx-auto flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white flex items-center gap-4">
                            Supply Chain Directory
                            <ShieldCheck className="w-10 h-10 text-primary" />
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium max-w-lg">
                            Verified global exporters and manufacturing partners curated for your procurement needs.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                        <div className="relative group/search">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 transition-colors group-focus-within/search:text-primary" />
                            <input
                                type="text"
                                placeholder="Search by company or name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-6 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-primary/40 outline-none w-full sm:w-80 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-inner dark:shadow-none"
                            />
                        </div>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-6 text-slate-900 dark:text-white font-black text-xs focus:ring-2 focus:ring-primary/40 outline-none transition-all cursor-pointer uppercase tracking-widest shadow-sm dark:shadow-none"
                        >
                            <option value="all">All Specialties</option>
                            <option value="CHEMICALS">Chemicals</option>
                            <option value="MACHINES">Machines</option>
                            <option value="ELECTRONICS">Electronics</option>
                            <option value="TEXTILES">Textiles</option>
                        </select>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                <div className="max-w-[1600px] mx-auto">
                    {loading && exporters.length === 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="h-96 bg-white dark:bg-[#151c2a]/40 rounded-[2.5rem] animate-pulse border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none" />
                            ))}
                        </div>
                    ) : exporters.length === 0 ? (
                        <div className="py-40 text-center opacity-40">
                            <Globe className="w-16 h-16 mx-auto mb-6 text-slate-400 dark:text-slate-700" />
                            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest italic">No Partners Found</h2>
                            <p className="text-slate-500 mt-2">Adjust your search parameters to discover other global suppliers.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                            {exporters.map((exporter) => (
                                <ExporterCard key={exporter.id} exporter={exporter} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ExporterCard({ exporter }: { exporter: Exporter }) {
    return (
        <div className="group relative bg-white dark:bg-[#151c2a]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-2xl rounded-[2.5rem] overflow-hidden transition-all hover:scale-[1.02] hover:border-primary/30 dark:hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
            {/* Visual Header */}
            <div className="h-24 bg-gradient-to-r from-primary/10 to-indigo-500/10 relative">
                <div className="absolute -bottom-10 left-8">
                    <div className="size-20 rounded-3xl bg-slate-100 dark:bg-slate-900 border-4 border-white dark:border-[#0a0c12] flex items-center justify-center text-3xl overflow-hidden shadow-xl">
                        {exporter.image ? (
                            <img src={exporter.image} alt={exporter.name} className="w-full h-full object-cover" />
                        ) : (
                            <Users className="w-10 h-10 text-slate-700" />
                        )}
                    </div>
                </div>
            </div>

            <div className="pt-14 p-8 px-10 space-y-6">
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight truncate group-hover:text-primary transition-colors">
                            {exporter.companyName || exporter.name}
                        </h3>
                        <Verified className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-slate-500 text-sm font-medium line-clamp-1">{exporter.description || "Leading global exporter in marketplace hub."}</p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Reliability</span>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 font-black text-xs">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            {exporter.rating}
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Trades</span>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary font-black text-xs">
                            <TrendingUp className="w-3.5 h-3.5" />
                            {exporter.tradeVolume}
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Core Verticals</span>
                    <div className="flex flex-wrap gap-2">
                        {exporter.categories.slice(0, 3).map((cat) => (
                            <span key={cat} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-[10px] font-bold text-slate-600 dark:text-slate-400 capitalize">
                                {cat.toLowerCase()}
                            </span>
                        ))}
                        {exporter.categories.length > 3 && (
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-[10px] font-bold text-slate-500">
                                +{exporter.categories.length - 3}
                            </span>
                        )}
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-white/5 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">Products</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">{exporter._count.products} Fixed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-3 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm dark:shadow-none">
                            <MessageSquare className="w-5 h-5" />
                        </button>
                        <button className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary hover:bg-[#0f49bd] text-white font-black text-xs shadow-xl shadow-primary/20 transition-all active:scale-95">
                            Profile
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
