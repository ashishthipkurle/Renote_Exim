"use client";

import { useState } from "react";
import { Truck, MapPin, Clock, CheckCircle2, Package, ShieldCheck, Timer } from "lucide-react";
import { formatDate } from "@/lib/api-utils";
import { toast } from "sonner";

interface ShipmentCardProps {
 shipment: any;
}

const SHIPMENT_STATUS: Record<string, { label: string; color: string; icon: any }> = {
 PREPARING: { label: "Preparing", color: "text-neutral-400 bg-neutral-400/10 border-neutral-400/20", icon: Package },
 IN_TRANSIT: { label: "In Transit", color: "text-white bg-white/10 border-white/20", icon: Truck },
 CUSTOMS: { label: "Customs", color: "text-neutral-300 bg-neutral-300/10 border-neutral-300/20", icon: ShieldCheck },
 OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "text-white bg-white/20 border-white/30", icon: Truck },
 DELIVERED: { label: "Delivered", color: "text-neutral-400 bg-neutral-400/10 border-neutral-400/20", icon: CheckCircle2 },
 RETURNED: { label: "Returned", color: "text-neutral-500 bg-neutral-500/10 border-neutral-500/20", icon: Package },
};

export default function ShipmentCard({ shipment }: ShipmentCardProps) {
 const [loading, setLoading] = useState(false);
 const [status, setStatus] = useState(shipment.status);

 const cfg = SHIPMENT_STATUS[status] ?? SHIPMENT_STATUS.PREPARING;
 const StatusIcon = cfg.icon;

 const steps = [
 { label: "Processing", status: ["PREPARING", "IN_TRANSIT", "CUSTOMS", "OUT_FOR_DELIVERY", "DELIVERED"].includes(status) ? "COMPLETED" : "PENDING" },
 { label: "Shipped", status: ["IN_TRANSIT", "CUSTOMS", "OUT_FOR_DELIVERY", "DELIVERED"].includes(status) ? "COMPLETED" : "PENDING" },
 { label: "Customs", status: ["CUSTOMS", "OUT_FOR_DELIVERY", "DELIVERED"].includes(status) ? "COMPLETED" : "PENDING" },
 { label: "Delivered", status: status === "DELIVERED" ? "COMPLETED" : "PENDING" },
 ];

 const handleConfirmDelivery = async () => {
 setLoading(true);
 try {
 // Simulate API call to update status
 await new Promise(r => setTimeout(r, 1000));
 setStatus("DELIVERED");
 toast.success("Delivery confirmed! Thank you.");
 } catch {
 toast.error("Failed to confirm delivery");
 } finally {
 setLoading(false);
 }
 };

 const calculateDaysLeft = () => {
 if (!shipment.estimatedDelivery) return null;
 const diff = new Date(shipment.estimatedDelivery).getTime() - Date.now();
 const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
 return days > 0 ? days : 0;
 };

 const daysLeft = calculateDaysLeft();

 return (
 <div className="bg-white dark:bg-card shadow-sm dark:shadow-xl backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-lg overflow-hidden group hover:border-white/50 dark:hover:border-white/20 transition-all">
 {/* Header */}
 <div className="p-6 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div className="flex items-center gap-4">
 <div className="size-12 rounded-lg bg-slate-100 dark:bg-muted flex items-center justify-center text-white group-hover:scale-110 transition-transform">
 <StatusIcon className="w-6 h-6" />
 </div>
 <div>
 <div className="flex items-center gap-2">
 <span className="text-slate-900 dark:text-white font-black tracking-tight font-mono text-sm uppercase">
 {shipment.trackingNumber}
 </span>
 <span className={`px-2 py-0.5 rounded-md border text-[8px] font-black uppercase tracking-widest ${cfg.color}`}>
 {cfg.label}
 </span>
 </div>
 <div className="text-slate-500 dark:text-muted-foreground text-[10px] mt-1 font-bold uppercase tracking-wider">
 {shipment.order.product.name}
 </div>
 </div>
 </div>
 <div className="text-right">
 <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Carrier</div>
 <div className="text-sm font-black text-slate-900 dark:text-white">{shipment.carrier || "Global Logistics"}</div>
 </div>
 </div>

 {/* Body */}
 <div className="p-6 space-y-8">
 {/* ETA Section */}
 {status !== "DELIVERED" && daysLeft !== null && (
 <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 dark:bg-white/5 border border-white/10">
 <div className="flex items-center gap-3">
 <Timer className="w-5 h-5 text-white" />
 <div>
 <div className="text-[10px] font-bold text-slate-500 dark:text-muted-foreground uppercase tracking-widest leading-none">Estimate Arrival</div>
 <div className="text-sm font-black text-slate-900 dark:text-white mt-1">{formatDate(shipment.estimatedDelivery)}</div>
 </div>
 </div>
 <div className="text-right">
 <div className="text-2xl font-black text-white leading-none">{daysLeft}</div>
 <div className="text-[10px] font-bold text-white uppercase mt-1">Days Left</div>
 </div>
 </div>
 )}

 {/* Custom Progress Tracker */}
 <div className="relative px-2">
 <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 dark:bg-slate-800 -z-10" />
 <div className="flex justify-between">
 {steps.map((step, idx) => (
 <div key={idx} className="flex flex-col items-center gap-2 group/step">
 <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${step.status === "COMPLETED"
 ? "bg-white border-white text-black shadow-md dark:shadow-white/20"
 : "bg-slate-100 dark:bg-muted border-slate-300 dark:border-border text-muted-foreground"
 }`}>
 {step.status === "COMPLETED" ? (
 <CheckCircle2 className="w-4 h-4 animate-in fade-in zoom-in duration-500" />
 ) : (
 <span className="text-[10px] font-bold">{idx + 1}</span>
 )}
 </div>
 <div className={`text-[10px] font-black uppercase tracking-widest ${step.status === "COMPLETED" ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-600"}`}>
 {step.label}
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Status Message */}
 <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
 <MapPin className="w-4 h-4 text-white" />
 <div className="text-xs text-slate-600 dark:text-slate-300">
 {status === "CUSTOMS" ? (
 <span className="text-white font-bold opacity-80 uppercase tracking-widest text-[10px]">In Customs: Clearance documents verified.</span>
 ) : status === "IN_TRANSIT" ? (
 <span>Departure from exchange office in origin country.</span>
 ) : status === "DELIVERED" ? (
 <span className="text-white font-bold uppercase tracking-widest text-[10px]">Successfully delivered to destination hub.</span>
 ) : (
 <span>Shipment is being prepared for dispatch.</span>
 )}
 </div>
 </div>

 {/* Action Button */}
 {status !== "DELIVERED" && (
 <button
 onClick={handleConfirmDelivery}
 disabled={loading || status !== "OUT_FOR_DELIVERY"}
 className={`w-full py-3.5 rounded-lg font-bold text-sm transition-all shadow-sm dark:shadow-xl flex items-center justify-center gap-2 ${status === "OUT_FOR_DELIVERY"
 ? "bg-white hover:bg-neutral-100 text-black shadow-md shadow-white/10"
 : "bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-white/5 cursor-not-allowed opacity-50"
 }`}
 >
 {loading ? <Clock className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
 {status === "OUT_FOR_DELIVERY" ? "Confirm Delivery" : "Waiting for Final Delivery"}
 </button>
 )}
 </div>
 </div>
 );
}
