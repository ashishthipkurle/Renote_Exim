"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, Truck, Clock, CheckCircle2, XCircle, ShoppingCart, Info, ShieldAlert } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/api-utils";
import OrderDetailsModal from "./OrderDetailsModal";
import DisputeModal from "./DisputeModal";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    PENDING: { label: "Pending", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20", icon: Clock },
    CONFIRMED: { label: "Confirmed", color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: CheckCircle2 },
    PROCESSING: { label: "Processing", color: "text-purple-400 bg-purple-400/10 border-purple-400/20", icon: Package },
    SHIPPED: { label: "Shipped", color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20", icon: Truck },
    DELIVERED: { label: "Delivered", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", icon: CheckCircle2 },
    CANCELLED: { label: "Cancelled", color: "text-red-400 bg-red-400/10 border-red-400/20", icon: XCircle },
};

export default function OrdersList({ initialOrders }: { initialOrders: any[] }) {
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [disputeOpen, setDisputeOpen] = useState(false);

    const openDetails = (order: any) => {
        setSelectedOrder(order);
        setDetailsOpen(true);
    };

    const openDispute = (e: React.MouseEvent, order: any) => {
        e.stopPropagation();
        setSelectedOrder(order);
        setDisputeOpen(true);
    };

    if (initialOrders.length === 0) {
        return (
            <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-12 text-center">
                <ShoppingCart className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">No orders yet</h2>
                <p className="text-slate-400 text-sm mb-4">Browse the marketplace and place your first order.</p>
                <Link href="/products" className="inline-flex items-center gap-2 bg-primary hover:bg-[#0f49bd] text-white font-bold py-2 px-4 rounded-xl text-sm">
                    Browse Products
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <div className="col-span-4">Product & Seller</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2 text-right">Actions</div>
            </div>

            <div className="space-y-4">
                {initialOrders.map((order) => {
                    const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
                    const StatusIcon = cfg.icon;
                    return (
                        <div
                            key={order.id}
                            onClick={() => openDetails(order)}
                            className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 hover:border-primary/30 transition-all cursor-pointer shadow-xl rounded-2xl p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center group"
                        >
                            <div className="lg:col-span-4 flex items-center gap-4">
                                <div className="size-12 rounded-xl bg-slate-800 border border-white/5 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                    {order.product.images?.[0] ? (
                                        <img src={order.product.images[0]} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <Package className="w-5 h-5 text-slate-500" />
                                    )}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white group-hover:text-primary transition-colors">{order.product.name}</div>
                                    <div className="text-xs text-slate-400 mt-0.5">by {order.product.exporter.companyName || order.product.exporter.name}</div>
                                </div>
                            </div>

                            <div className="lg:col-span-2">
                                <div className="text-white font-bold">{formatCurrency(order.totalPrice)}</div>
                                <div className="text-[10px] text-slate-500 capitalize">{order.paymentStatus.toLowerCase()}</div>
                            </div>

                            <div className="lg:col-span-2">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide ${cfg.color}`}>
                                    <StatusIcon className="w-3 h-3" />
                                    {cfg.label}
                                </span>
                            </div>

                            <div className="lg:col-span-2">
                                <div className="text-sm text-slate-300">{formatDate(order.createdAt)}</div>
                            </div>

                            <div className="lg:col-span-2 flex justify-end gap-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); openDetails(order); }}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                    title="Order Details"
                                >
                                    <Info className="w-4 h-4" />
                                </button>
                                {["SHIPPED", "DELIVERED"].includes(order.status) && (
                                    <button
                                        onClick={(e) => openDispute(e, order)}
                                        className="p-2 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 transition-colors"
                                        title="Raise Dispute"
                                    >
                                        <ShieldAlert className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <OrderDetailsModal isOpen={detailsOpen} onClose={() => setDetailsOpen(false)} order={selectedOrder} />
            <DisputeModal isOpen={disputeOpen} onClose={() => setDisputeOpen(false)} order={selectedOrder} />
        </>
    );
}
