"use client";

import React, { useEffect, useState } from "react";
import { 
    Handshake, 
    Boxes, 
    FolderTree, 
    TrendingUp, 
    ArrowUpRight,
    Clock,
    ShieldCheck,
    Globe,
    Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/api-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SupplierStats {
    totalExporters: number;
    totalProducts: number;
    activeOrders: number;
    revenue: number;
    revenueChange: number;
}

export default function SupplierDashboard() {
    const [stats, setStats] = useState<SupplierStats | null>(null);

    useEffect(() => {
        // Mocking stats for now until API is built
        setTimeout(() => {
            setStats({
                totalExporters: 12,
                totalProducts: 48,
                activeOrders: 5,
                revenue: 128500,
                revenueChange: 12.5
            });
        }, 1000);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };



    return (
        <div className="space-y-10 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-2"
                >
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                        <Zap className="w-8 h-8 text-[#D4AF37]" />
                        Supplier Console
                    </h1>
                    <div className="flex items-center gap-2">
                        <div className="px-2 py-0.5 rounded-md bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-[10px] font-black uppercase tracking-widest">
                            Intelligence Node Active
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-50">/ Distribution & Supply Metrics</span>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3"
                >
                    <Button variant="outline" className="rounded-xl border-[#D4AF37]/20 bg-[#D4AF37]/5 text-[#D4AF37] hover:bg-[#D4AF37]/10 font-bold uppercase text-[10px] tracking-widest h-12 px-6">
                        Export Report
                    </Button>
                    <Button className="rounded-xl bg-[#D4AF37] hover:bg-[#B8962E] text-black font-bold uppercase text-[10px] tracking-widest h-12 px-6 shadow-lg shadow-[#D4AF37]/20">
                        New Supply Batch
                    </Button>
                </motion.div>
            </div>

            {/* Stats Grid */}
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                <Card className="bg-card/30 border-white/5 shadow-2xl rounded-[2rem] overflow-hidden group">
                    <CardContent className="p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <Handshake className="w-7 h-7" />
                            </div>
                            <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs">
                                <ArrowUpRight className="w-4 h-4" />
                                +2
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-50 mb-1">Active Exporters</p>
                            <h2 className="text-3xl font-black italic tracking-tighter tabular-nums">{stats?.totalExporters || 0}</h2>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/30 border-white/5 shadow-2xl rounded-[2rem] overflow-hidden group">
                    <CardContent className="p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="size-14 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] group-hover:scale-110 transition-transform">
                                <Boxes className="w-7 h-7" />
                            </div>
                            <div className="text-muted-foreground font-bold text-xs italic opacity-40">
                                Global Stock
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-50 mb-1">Total Products</p>
                            <h2 className="text-3xl font-black italic tracking-tighter tabular-nums">{stats?.totalProducts || 0}</h2>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/30 border-white/5 shadow-2xl rounded-[2rem] overflow-hidden group">
                    <CardContent className="p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="size-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                <FolderTree className="w-7 h-7" />
                            </div>
                            <div className="flex items-center gap-1 text-blue-400 font-bold text-[10px] uppercase tracking-widest italic animate-pulse">
                                <Clock className="w-3 h-3" />
                                Live
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-50 mb-1">Active Orders</p>
                            <h2 className="text-3xl font-black italic tracking-tighter tabular-nums">{stats?.activeOrders || 0}</h2>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/30 border-white/5 shadow-2xl rounded-[2rem] overflow-hidden group">
                    <CardContent className="p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="size-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-7 h-7" />
                            </div>
                            <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs">
                                <ArrowUpRight className="w-4 h-4" />
                                {stats?.revenueChange}%
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-50 mb-1">Supply Revenue</p>
                            <h2 className="text-3xl font-black italic tracking-tighter tabular-nums">
                                {formatCurrency(stats?.revenue || 0)}
                            </h2>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-card/10 border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[400px]">
                    <CardHeader className="p-10 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                                <Clock className="w-5 h-5 text-primary" />
                                Supply Logistics
                            </CardTitle>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mt-2 opacity-50">Real-time supply chain status</p>
                        </div>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5">
                            <ArrowUpRight className="w-4 h-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-10 pt-0">
                        <div className="flex flex-col items-center justify-center h-[250px] space-y-6 opacity-30">
                            <div className="size-20 rounded-[2rem] bg-muted/20 border border-white/5 flex items-center justify-center">
                                <Globe className="w-10 h-10 grayscale" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.5em]">Network Synchronization Pending</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/10 border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[400px]">
                    <CardHeader className="p-10 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                                <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                                Network Overview
                            </CardTitle>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mt-2 opacity-50">Distribution Node Performance</p>
                        </div>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5">
                            <ArrowUpRight className="w-4 h-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-10 pt-0">
                        <div className="flex flex-col items-center justify-center h-[250px] space-y-6 opacity-30">
                            <div className="size-20 rounded-[2rem] bg-muted/20 border border-white/5 flex items-center justify-center">
                                <Handshake className="w-10 h-10 grayscale" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.5em]">No active nodes connected</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
