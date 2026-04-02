"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/api-utils";
import {
    Search,
    Star,
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
        <div className="h-dvh overflow-hidden flex flex-col bg-background transition-colors duration-300">
            <header className="flex-shrink-0 p-6 lg:p-8 border-b border-border bg-header backdrop-blur-xl z-20">
                <div className="max-w-[1600px] mx-auto flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-foreground flex items-center gap-4 uppercase italic">
                            Supply Chain Directory
                            <ShieldCheck className="w-10 h-10 text-foreground" />
                        </h1>
                        <p className="text-muted-foreground mt-2 font-black text-[10px] uppercase tracking-widest leading-none max-w-lg">
                            Verified global exporters and manufacturing partners curated for your procurement needs.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                        <div className="relative group/search">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within/search:text-foreground" />
                            <input
                                type="text"
                                placeholder="Search by company or name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-muted border border-border rounded-2xl py-4 pl-12 pr-6 text-foreground font-bold text-sm focus:ring-2 focus:ring-white/20 outline-none w-full sm:w-80 transition-all placeholder:text-muted-foreground shadow-inner"
                            />
                        </div>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="bg-muted border border-border rounded-2xl py-4 px-6 text-foreground font-black text-xs focus:ring-2 focus:ring-white/20 outline-none transition-all cursor-pointer uppercase tracking-widest shadow-sm"
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
                                <div key={i} className="h-96 bg-muted/40 rounded-[2.5rem] animate-pulse border border-border shadow-xl" />
                            ))}
                        </div>
                    ) : exporters.length === 0 ? (
                        <div className="py-40 text-center opacity-40">
                            <Globe className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
                            <h2 className="text-xl font-black text-foreground uppercase tracking-widest italic">Global Node Vacancy</h2>
                            <p className="text-muted-foreground mt-2 font-medium">Refine parameters to establish new trade connections.</p>
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
        <div className="group relative bg-muted/20 backdrop-blur-xl border border-border shadow-2xl rounded-[2.5rem] overflow-hidden transition-all hover:scale-[1.02] hover:border-border hover:shadow-primary/5">
            {/* Visual Header */}
            <div className="h-24 bg-gradient-to-r from-white/5 to-white/10 relative">
                <div className="absolute -bottom-10 left-8">
                    <div className="size-20 rounded-3xl bg-muted border-4 border-background flex items-center justify-center text-3xl overflow-hidden shadow-xl">
                        {exporter.image ? (
                            <img src={exporter.image} alt={exporter.name} className="w-full h-full object-cover" />
                        ) : (
                            <Users className="w-10 h-10 text-muted-foreground/40" />
                        )}
                    </div>
                </div>
            </div>

            <div className="pt-14 p-8 px-10 space-y-6">
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="text-xl font-black text-foreground tracking-tight truncate group-hover:text-foreground/80 transition-colors uppercase italic">
                            {exporter.companyName || exporter.name}
                        </h3>
                        <Verified className="w-5 h-5 text-foreground" />
                    </div>
                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest line-clamp-1">{exporter.description || "Established global trade node - verified merchant status."}</p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Stability</span>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/30 border border-border text-foreground font-black text-[10px] uppercase tracking-widest">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            {exporter.rating}
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Volume</span>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-muted-foreground font-black text-[10px] uppercase tracking-widest">
                            <TrendingUp className="w-3.5 h-3.5" />
                            {exporter.tradeVolume}
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Core Verticals</span>
                    <div className="flex flex-wrap gap-2">
                        {exporter.categories.slice(0, 3).map((cat) => (
                            <span key={cat} className="px-2.5 py-1 rounded-lg bg-muted/20 border border-border text-[9px] font-black text-foreground uppercase tracking-widest">
                                {cat}
                            </span>
                        ))}
                        {exporter.categories.length > 3 && (
                            <span className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                                +{exporter.categories.length - 3}
                            </span>
                        )}
                    </div>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Assets</span>
                        <span className="text-sm font-black text-foreground">{exporter._count.products} Registered</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-3 rounded-2xl bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-all shadow-xl">
                            <MessageSquare className="w-5 h-5" />
                        </button>
                        <button className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground border-transparent font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/5 active:scale-95 transition-all">
                            Profile
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
