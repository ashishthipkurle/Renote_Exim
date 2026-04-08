"use client";

import React, { useState } from "react";
import { 
    FolderTree, 
    Search, 
    Filter, 
    MoreVertical, 
    Package, 
    ArrowRight,
    TrendingUp,
    ShieldCheck,
    Clock,
    CheckCircle2,
    AlertCircle,
    Calendar,
    Handshake
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/api-utils";

interface SupplyOrder {
    id: string;
    orderNumber: string;
    productName: string;
    exporterName: string;
    quantity: number;
    totalValue: number;
    status: "PROCESSED" | "SHIPPED" | "DELIVERED" | "PENDING";
    date: string;
}

export default function SupplierOrdersPage() {
    const [search, setSearch] = useState("");
    
    // Mock data
    const [orders] = useState<SupplyOrder[]>([
        { id: "1", orderNumber: "SO-98211", productName: "Premium Raw Silicon", exporterName: "Tech-Ex General", quantity: 2000, totalValue: 45000, status: "SHIPPED", date: "2024-03-18" },
        { id: "2", orderNumber: "SO-98105", productName: "Industrial Grade Copper", exporterName: "Global Trade Corp", quantity: 5000, totalValue: 68500, status: "DELIVERED", date: "2024-02-25" },
        { id: "3", orderNumber: "SO-98442", productName: "Grade-A Textile Fiber", exporterName: "SilkWay Exporters", quantity: 3000, totalValue: 15000, status: "PENDING", date: "2024-03-22" },
    ]);

    const filtered = orders.filter(o => 
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) || 
        o.productName.toLowerCase().includes(search.toLowerCase()) ||
        o.exporterName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                        <FolderTree className="w-8 h-8 text-[#D4AF37]" />
                        Supply Orders
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mt-2 opacity-50">Distribution Node Logistics Ledger</p>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-xl border-[#D4AF37]/20 bg-[#D4AF37]/5 text-[#D4AF37] hover:bg-[#D4AF37]/10 font-bold uppercase text-[10px] tracking-widest h-12 px-6">
                        Manifest Report
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group/search">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/search:text-[#D4AF37] transition-colors" />
                    <input
                        type="text"
                        placeholder="Filter supply logs..."
                        className="w-full bg-card/30 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all font-bold placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="h-14 px-6 rounded-2xl border-white/5 bg-card/30 font-bold uppercase text-[10px] tracking-widest gap-3">
                    <Calendar className="w-4 h-4" />
                    Timeline
                </Button>
            </div>

            {/* List */}
            <div className="space-y-4">
                {filtered.map((order) => (
                    <motion.div
                        key={order.id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="group"
                    >
                        <Card className="bg-card/20 border-white/5 rounded-[2rem] overflow-hidden hover:border-[#D4AF37]/30 transition-all duration-500 shadow-xl">
                            <CardContent className="p-8">
                                <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                                    {/* Order Info */}
                                    <div className="flex items-center gap-6 lg:w-[25%] shrink-0">
                                        <div className="size-16 rounded-2xl bg-muted/20 flex items-center justify-center text-[#D4AF37]">
                                            <Package className="w-8 h-8 opacity-40 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <div>
                                            <h3 className="font-black italic uppercase tracking-tighter text-lg">{order.orderNumber}</h3>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40 italic">{order.date}</p>
                                        </div>
                                    </div>

                                    {/* Product & Exporter */}
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black uppercase tracking-widest text-[#D4AF37]/60 italic">Product Specification</p>
                                            <p className="font-bold text-sm uppercase tracking-tight">{order.productName}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black uppercase tracking-widest text-primary/60 italic">Destination Node</p>
                                            <p className="font-bold text-sm uppercase tracking-tight flex items-center gap-2">
                                                <Handshake className="w-3 h-3" />
                                                {order.exporterName}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Quant & Value */}
                                    <div className="flex items-center gap-10 lg:w-[15%] shrink-0">
                                        <div className="text-center">
                                            <p className="text-[8px] font-black tracking-widest uppercase opacity-40 mb-1">Qty</p>
                                            <p className="font-black italic tracking-tighter tabular-nums">{order.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] font-black tracking-widest uppercase opacity-40 mb-1">Value</p>
                                            <p className="font-black italic tracking-tighter tabular-nums text-emerald-500">{formatCurrency(order.totalValue)}</p>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="flex items-center justify-between lg:w-[15%] lg:justify-end gap-6">
                                        <Badge className={`rounded-lg uppercase text-[8px] font-black tracking-widest px-3 py-1 ${
                                            order.status === "DELIVERED" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                            order.status === "SHIPPED" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                            order.status === "PENDING" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                            "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
                                        }`}>
                                            {order.status}
                                        </Badge>
                                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-[#D4AF37] hover:text-black transition-all">
                                            <ArrowRight className="w-5 h-5" />
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
