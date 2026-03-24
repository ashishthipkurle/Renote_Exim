"use client";

import { Package, Truck, CheckCircle2, Globe2, Building2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { formatCurrency, formatDate } from "@/lib/api-utils";

interface OrderDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: any; // Using any for brevity, should ideally be typed
}

export default function OrderDetailsModal({
    isOpen,
    onClose,
    order,
}: OrderDetailsModalProps) {
    if (!order) return null;

    const steps = [
        { label: "Ordered", date: formatDate(order.createdAt), status: "COMPLETED" },
        { label: "Payment", status: order.paymentStatus === "PAID" ? "COMPLETED" : "PENDING" },
        { label: "Processing", status: ["PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status) ? "COMPLETED" : "PENDING" },
        { label: "Shipped", status: ["SHIPPED", "DELIVERED"].includes(order.status) ? "COMPLETED" : "PENDING" },
        { label: "Delivered", status: order.status === "DELIVERED" ? "COMPLETED" : "PENDING" },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Order #${order.id.slice(0, 8).toUpperCase()}`} maxWidth="max-w-3xl">
            <div className="space-y-8">
                {/* Status Tracker */}
                <div className="flex justify-between relative px-2">
                    <div className="absolute top-4 left-10 right-10 h-0.5 bg-slate-800 -z-10" />
                    {steps.map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${step.status === "COMPLETED"
                                    ? "bg-primary border-primary text-white"
                                    : "bg-slate-100 dark:bg-[#151c2a] border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500"
                                }`}>
                                {step.status === "COMPLETED" ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                    <span className="text-[10px] font-black">{idx + 1}</span>
                                )}
                            </div>
                            <div className="text-center">
                                <div className={`text-[10px] font-bold uppercase tracking-wider ${step.status === "COMPLETED" ? "text-slate-900 dark:text-white" : "text-slate-500"}`}>
                                    {step.label}
                                </div>
                                {step.date && <div className="text-[8px] text-slate-400 dark:text-slate-600 mt-0.5">{step.date}</div>}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left: Product & Exporter */}
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Product Details</h4>
                            <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                                <div className="size-20 rounded-xl bg-slate-200 dark:bg-slate-800 flex-shrink-0 overflow-hidden border border-slate-300 dark:border-white/5">
                                    {order.product.images?.[0] ? (
                                        <img src={order.product.images[0]} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-700">
                                            <Package className="w-8 h-8" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{order.product.name}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 capitalize">{order.product.category.toLowerCase()}</div>
                                    <div className="mt-3 text-sm font-black text-primary">
                                        {formatCurrency(order.totalPrice)}
                                    </div>
                                    <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                                        Qty: {order.quantity} units
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Exporter Information</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                    <Building2 className="w-4 h-4 text-primary" />
                                    <span className="text-sm">{order.product.exporter.companyName || order.product.exporter.name}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                    <Globe2 className="w-4 h-4 text-primary" />
                                    <span className="text-sm">{order.product.exporter.country || "Global"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Payment & Shipping */}
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Order Summary</h4>
                            <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 p-5 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">Status</span>
                                    <span className="text-slate-900 dark:text-white font-bold">{order.status}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">Payment Status</span>
                                    <span className="text-slate-900 dark:text-white font-bold capitalize">{order.paymentStatus.toLowerCase()}</span>
                                </div>
                                <div className="border-t border-slate-200 dark:border-white/5 pt-3 flex justify-between">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">Total Price</span>
                                    <span className="text-lg font-black text-slate-900 dark:text-white">{formatCurrency(order.totalPrice)}</span>
                                </div>
                            </div>
                        </div>

                        {order.status === "SHIPPED" && (
                            <div>
                                <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Shipping Info</h4>
                                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Truck className="w-5 h-5 text-primary" />
                                        <div>
                                            <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Tracking Number</div>
                                            <div className="text-sm font-mono text-primary mt-0.5">TRK-{(order.id.slice(0, 10)).toUpperCase()}</div>
                                        </div>
                                    </div>
                                    <button className="text-[10px] font-black text-primary uppercase hover:underline">Track Link</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="pt-6 border-t border-slate-200 dark:border-white/5 flex gap-3">
                    <button className="flex-1 bg-primary hover:bg-[#0f49bd] text-white font-bold py-3 rounded-2xl shadow-lg shadow-primary/20 transition-all">
                        Reorder Now
                    </button>
                    <button className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-2xl border border-slate-300 dark:border-white/10 transition-all">
                        Download Invoice
                    </button>
                </div>
            </div>
        </Modal>
    );
}
