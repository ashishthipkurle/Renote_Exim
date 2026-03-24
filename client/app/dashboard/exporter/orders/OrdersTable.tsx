"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Package, ArrowRight, Clock, CheckCircle2, XCircle, Truck, Search } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    PENDING: { label: "Pending", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20", icon: Clock },
    CONFIRMED: { label: "Confirmed", color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: CheckCircle2 },
    PROCESSING: { label: "Processing", color: "text-purple-400 bg-purple-400/10 border-purple-400/20", icon: Package },
    SHIPPED: { label: "Shipped", color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20", icon: Truck },
    DELIVERED: { label: "Delivered", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", icon: CheckCircle2 },
    CANCELLED: { label: "Cancelled", color: "text-red-400 bg-red-400/10 border-red-400/20", icon: XCircle },
};

function formatDate(d: Date | string) {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(d));
}

interface OrdersTableProps {
    orders: any[];
    counts: {
        all: number;
        pending: number;
        processing: number;
        shipped: number;
        delivered: number;
    };
}

export default function OrdersTable({ orders, counts }: OrdersTableProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
    const currentStatus = searchParams.get("status") || "ALL";

    const updateFilters = (newStatus?: string, newSearch?: string) => {
        const params = new URLSearchParams(searchParams);

        if (newSearch !== undefined) {
            if (newSearch) params.set("search", newSearch);
            else params.delete("search");
        } else if (searchQuery) {
            params.set("search", searchQuery);
        }

        if (newStatus !== undefined) {
            if (newStatus !== "ALL") params.set("status", newStatus);
            else params.delete("status");
        }

        // Reset to page 1 on filter change
        params.delete("page");

        startTransition(() => {
            router.push(`?${params.toString()}`);
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        updateFilters();
    };

    const statusPills = [
        { id: "ALL", label: "All", count: counts.all, color: "text-slate-400 bg-slate-400/10 border-slate-400/20" },
        { id: "PENDING", label: "Pending", count: counts.pending, color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" },
        { id: "PROCESSING", label: "Processing", count: counts.processing, color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
        { id: "SHIPPED", label: "Shipped", count: counts.shipped, color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20" },
        { id: "DELIVERED", label: "Delivered", count: counts.delivered, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
    ];

    return (
        <div className="space-y-6">
            {/* Header with quick stats & search */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex flex-wrap gap-2">
                    {statusPills.map((pill) => (
                        <button
                            key={pill.id}
                            onClick={() => updateFilters(pill.id)}
                            className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all ${currentStatus === pill.id
                                    ? pill.color.replace("/10", "/20").replace("border-", "border-opacity-100 ") + " border-primary ring-1 ring-primary/30"
                                    : "text-muted-foreground bg-muted/50 border-border hover:bg-muted"
                                }`}
                        >
                            {pill.label} <span className="opacity-50 ml-1">{pill.count}</span>
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSearch} className="relative w-full lg:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by product, buyer, or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                    />
                </form>
            </div>

            {/* Orders List */}
            <div className="space-y-4 relative">
                {isPending && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                )}

                {orders.length === 0 ? (
                    <div className="bg-card backdrop-blur-xl border border-border shadow-md dark:shadow-xl rounded-2xl p-12 text-center">
                        <Package className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-foreground mb-2">No orders found</h2>
                        <p className="text-muted-foreground text-sm">
                            Try adjusting your filters or search query.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Header */}
                        <div className="hidden lg:grid grid-cols-12 gap-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            <div className="col-span-4">Product & Buyer</div>
                            <div className="col-span-2">Amount</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-2">Date</div>
                            <div className="col-span-2 text-right">Action</div>
                        </div>

                        {orders.map((order) => {
                            const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
                            const StatusIcon = cfg.icon;
                            return (
                                <div
                                    key={order.id}
                                    className="bg-card backdrop-blur-xl border border-border hover:border-primary/30 transition-colors shadow-sm dark:shadow-xl rounded-2xl p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center"
                                >
                                    <div className="lg:col-span-4 flex items-center gap-4">
                                        <div className="size-12 rounded-xl bg-muted border border-border flex-shrink-0 flex items-center justify-center overflow-hidden">
                                            {order.product.images?.[0] ? (
                                                <img src={order.product.images[0]} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <Package className="w-5 h-5 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-foreground line-clamp-1">{order.product.name}</div>
                                            <div className="text-xs text-muted-foreground mt-0.5 truncate">
                                                {order.importer.companyName || order.importer.name} ({order.importer.country ?? "N/A"})
                                            </div>
                                            <div className="text-[10px] text-muted-foreground/60 mt-0.5">
                                                Qty: {order.quantity} · {order.product.category}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-2">
                                        <div className="text-foreground font-bold">{formatCurrency(order.totalPrice)}</div>
                                        <div className="text-[10px] text-muted-foreground capitalize">{order.paymentStatus.toLowerCase()}</div>
                                    </div>

                                    <div className="lg:col-span-2">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide ${cfg.color}`}>
                                            <StatusIcon className="w-3 h-3" />
                                            {cfg.label}
                                        </span>
                                    </div>

                                    <div className="lg:col-span-2">
                                        <div className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</div>
                                    </div>

                                    <div className="lg:col-span-2 flex justify-end">
                                        <Link
                                            href={`/dashboard/exporter/orders/${order.id}`}
                                            className="inline-flex items-center gap-1 text-primary text-xs font-bold hover:bg-primary/10 px-3 py-2 rounded-lg transition-colors"
                                        >
                                            View <ArrowRight className="w-3 h-3" />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </>
                )}
            </div>
        </div>
    );
}
