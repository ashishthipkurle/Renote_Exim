"use client";

import React, { useState } from "react";
import { 
    Boxes, 
    Plus, 
    Search, 
    Filter, 
    MoreVertical, 
    Package, 
    ArrowRight,
    TrendingUp,
    ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SupplyProduct {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    status: "ACTIVE" | "PENDING" | "FULFILLED";
    lastSupplyDate: string;
    exporterName: string;
}

export default function SupplierProductsPage() {
    const [search, setSearch] = useState("");
    
    // Mock data
    const [products] = useState<SupplyProduct[]>([
        { id: "1", name: "Premium Raw Silicon", category: "RawMaterials", quantity: 5000, unit: "kg", status: "ACTIVE", lastSupplyDate: "2024-03-15", exporterName: "Tech-Ex General" },
        { id: "2", name: "Industrial Grade Copper", category: "RawMaterials", quantity: 12000, unit: "kg", status: "FULFILLED", lastSupplyDate: "2024-02-10", exporterName: "Global Trade Corp" },
        { id: "3", name: "Grade-A Textile Fiber", category: "Textiles", quantity: 8000, unit: "meters", status: "PENDING", lastSupplyDate: "2024-03-20", exporterName: "SilkWay Exporters" },
    ]);

    const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                        <Boxes className="w-8 h-8 text-[#D4AF37]" />
                        Supply Items
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mt-2 opacity-50">Distribution Node Inventory</p>
                </div>

                <div className="flex items-center gap-3">
                    <Button className="rounded-xl bg-[#D4AF37] hover:bg-[#B8962E] text-black font-bold uppercase text-[10px] tracking-widest h-12 px-6 shadow-lg shadow-[#D4AF37]/20">
                        <Plus className="w-4 h-4 mr-2" />
                        Register Supply
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group/search">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/search:text-[#D4AF37] transition-colors" />
                    <input
                        type="text"
                        placeholder="Search supply items..."
                        className="w-full bg-card/30 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all font-bold placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="h-14 px-6 rounded-2xl border-white/5 bg-card/30 font-bold uppercase text-[10px] tracking-widest gap-3">
                    <Filter className="w-4 h-4" />
                    Category
                </Button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map((product) => (
                    <motion.div
                        key={product.id}
                        whileHover={{ y: -5 }}
                        className="group"
                    >
                        <Card className="bg-card/20 border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500 group-hover:border-[#D4AF37]/30">
                            <CardContent className="p-0">
                                <div className="p-8 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="size-16 rounded-2xl bg-muted/20 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                            <Package className="w-8 h-8 text-primary/40 group-hover:text-primary transition-colors" />
                                        </div>
                                        <Badge className={`rounded-lg uppercase text-[8px] font-black tracking-widest px-3 py-1 ${
                                            product.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                            product.status === "FULFILLED" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                            "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                        }`}>
                                            {product.status}
                                        </Badge>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-black italic uppercase tracking-tighter mb-2 group-hover:text-[#D4AF37] transition-colors">{product.name}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">{product.category}</span>
                                            <span className="w-1 h-1 rounded-full bg-border" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">{product.quantity} {product.unit} Available</span>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Recipient Node</p>
                                            <p className="text-[10px] font-black uppercase tracking-tighter">{product.exporterName}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="rounded-full group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
                                            <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
