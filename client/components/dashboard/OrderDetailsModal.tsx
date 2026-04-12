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
 <div className="absolute top-4 left-10 right-10 h-px bg-border -z-10" />
 {steps.map((step, idx) => (
 <div key={idx} className="flex flex-col items-center gap-2">
 <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-500 shadow-2xl ${step.status === "COMPLETED"
 ? "bg-white border-white text-black scale-110 shadow-white/10"
 : "bg-muted border-border text-muted-foreground"
 }`}>
 {step.status === "COMPLETED" ? (
 <CheckCircle2 className="w-4 h-4" />
 ) : (
 <span className="text-[10px] font-black">{idx + 1}</span>
 )}
 </div>
 <div className="text-center">
 <div className={`text-[9px] font-black uppercase tracking-widest ${step.status === "COMPLETED" ? "text-white" : "text-muted-foreground/40"}`}>
 {step.label}
 </div>
 {step.date && <div className="text-[8px] text-muted-foreground/30 mt-0.5 font-black uppercase tracking-widest">{step.date}</div>}
 </div>
 </div>
 ))}
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 {/* Left: Product & Exporter */}
 <div className="space-y-8">
 <div>
 <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 ">Asset Specification</h4>
 <div className="flex gap-4 p-4 rounded-lg bg-muted/20 backdrop-blur-xl border border-border shadow-2xl">
 <div className="size-20 rounded-xl bg-card flex-shrink-0 overflow-hidden border border-border group">
 {order.product.images?.[0] ? (
 <img src={order.product.images[0]} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
 ) : (
 <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
 <Package className="w-8 h-8" />
 </div>
 )}
 </div>
 <div className="flex flex-col justify-center">
 <div className="text-sm font-black text-white uppercase tracking-tighter leading-tight">{order.product.name}</div>
 <div className="text-[10px] text-muted-foreground mt-1 font-black uppercase tracking-widest opacity-60">ID: {order.product.category.toUpperCase()}</div>
 <div className="mt-2 text-sm font-black text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]">
 {formatCurrency(order.totalPrice)}
 </div>
 <div className="text-[9px] text-muted-foreground mt-1 font-black uppercase tracking-widest opacity-40">
 BATCH SIZE: {order.quantity} UNITS
 </div>
 </div>
 </div>
 </div>

 <div>
 <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 ">Origin Node Intelligence</h4>
 <div className="space-y-4 px-1">
 <div className="flex items-center gap-3 text-muted-foreground group">
 <Building2 className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
 <span className="text-[10px] font-black uppercase tracking-widest">{order.product.exporter.businessName || order.product.exporter.name}</span>
 </div>
 <div className="flex items-center gap-3 text-muted-foreground group">
 <Globe2 className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
 <span className="text-[10px] font-black uppercase tracking-widest">{order.product.exporter.country || "Global Node"}</span>
 </div>
 </div>
 </div>
 </div>

 {/* Right: Payment & Shipping */}
 <div className="space-y-8">
 <div>
 <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 ">Procurement Telemetry</h4>
 <div className="rounded-lg border border-border bg-muted/20 backdrop-blur-xl p-5 space-y-4 shadow-2xl">
 <div className="flex justify-between items-center text-xs">
 <span className="text-muted-foreground font-black uppercase tracking-widest opacity-60">Status Log</span>
 <span className="text-white font-black uppercase tracking-widest text-[10px] px-2 py-1 bg-white/5 border border-white/10 rounded">{order.status}</span>
 </div>
 <div className="flex justify-between items-center text-xs">
 <span className="text-muted-foreground font-black uppercase tracking-widest opacity-60">Capital Status</span>
 <span className="text-white font-black uppercase tracking-widest text-[10px] px-2 py-1 bg-white/5 border border-white/10 rounded">{order.paymentStatus.toUpperCase()}</span>
 </div>
 <div className="pt-4 border-t border-border flex justify-between items-center">
 <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">Cumulative Outflow</span>
 <span className="text-xl font-black text-white tracking-widest ">{formatCurrency(order.totalPrice)}</span>
 </div>
 </div>
 </div>

 {order.status === "SHIPPED" && (
 <div>
 <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 ">Logistics Distribution Feed</h4>
 <div className="p-4 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between shadow-inner">
 <div className="flex items-center gap-3">
 <Truck className="w-5 h-5 text-white" />
 <div>
 <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Tracking Signature</div>
 <div className="text-xs font-black text-white mt-0.5 tracking-widest">SIG-{(order.id.slice(0, 10)).toUpperCase()}</div>
 </div>
 </div>
 <button className="text-[9px] font-black text-white uppercase tracking-widest hover:underline hover:scale-105 transition-all">Intercept Map</button>
 </div>
 </div>
 )}
 </div>
 </div>

 {/* Actions */}
 <div className="pt-8 border-t border-border flex gap-4">
 <button className="flex-1 bg-white hover:bg-primary/90 text-black font-black uppercase tracking-[0.2em] py-3.5 rounded-lg shadow-2xl shadow-white/10 transition-all hover:-translate-y-1 active:translate-y-0 text-[10px]">
 Re-Initialize Procurement
 </button>
 <button className="flex-1 bg-muted/40 hover:bg-muted/60 text-white font-black uppercase tracking-[0.2em] py-3.5 rounded-lg border border-border transition-all hover:-translate-y-1 active:translate-y-0 text-[10px]">
 Download Asset Log
 </button>
 </div>
 </div>
 </Modal>
 );
}
