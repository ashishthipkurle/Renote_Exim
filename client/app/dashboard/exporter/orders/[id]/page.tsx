import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
    Package,
    ChevronLeft,
    Clock,
    CheckCircle2,
    XCircle,
    Truck,
    User,
    Building2,
    Globe,
    Calendar,
    CreditCard,
    Hash,
    ShoppingBag
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getServerAuth } from "@/lib/supabase/server";
import { OrderActions } from "../OrderActions";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Package }> = {
    PENDING: { label: "Pending", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20", icon: Clock },
    CONFIRMED: { label: "Confirmed", color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: CheckCircle2 },
    PROCESSING: { label: "Processing", color: "text-purple-400 bg-purple-400/10 border-purple-400/20", icon: Package },
    SHIPPED: { label: "Shipped", color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20", icon: Truck },
    DELIVERED: { label: "Delivered", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", icon: CheckCircle2 },
    CANCELLED: { label: "Cancelled", color: "text-red-400 bg-red-400/10 border-red-400/20", icon: XCircle },
    DISPUTED: { label: "Disputed", color: "text-orange-400 bg-orange-400/10 border-orange-400/20", icon: XCircle },
};

function formatMoney(n: number) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function formatDate(d: Date) {
    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }).format(d);
}

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
    const auth = await getServerAuth();
    if (!auth) redirect("/login");
    if (auth.role !== "EXPORTER" && auth.role !== "ADMIN") redirect("/dashboard");

    const order = await prisma.order.findUnique({
        where: { id: params.id },
        include: {
            product: {
                select: { name: true, category: true, images: true, price: true, hsCode: true, exporterId: true }
            },
            importer: {
                select: { name: true, companyName: true, country: true, email: true }
            },
            shipment: true
        }
    });

    if (!order) notFound();

    // Type assertion or check to satisfy TS for relations
    const orderWithRel = order as any;

    // Security: only the exporter who owns the product can see this order
    if (auth.role === "EXPORTER" && orderWithRel.product.exporterId !== auth.userId) {
        redirect("/dashboard/exporter/orders");
    }

    const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
    const StatusIcon = cfg.icon;

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 lg:p-8">
            {/* Header & Back Action */}
            <div className="max-w-6xl mx-auto mb-8">
                <Link
                    href="/dashboard/exporter/orders"
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Orders
                </Link>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-black tracking-tight underline decoration-primary/40 underline-offset-8">
                                Order Detail
                            </h1>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wide ${cfg.color}`}>
                                <StatusIcon className="w-3.5 h-3.5" />
                                {cfg.label}
                            </span>
                        </div>
                        <p className="text-slate-400 font-mono text-sm">
                            ID: {order.orderNumber}
                        </p>
                    </div>

                    <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 p-4 rounded-2xl flex items-center gap-6">
                        <div className="text-right">
                            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Total Amount</div>
                            <div className="text-2xl font-black text-primary">{formatMoney(order.totalPrice)}</div>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <div>
                            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Payment Status</div>
                            <div className="font-bold text-sm bg-primary/10 text-primary px-2 py-0.5 rounded-lg border border-primary/20 mt-1">
                                {order.paymentStatus}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Col: Product & Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Status Control Actions */}
                    <section className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 p-6 rounded-3xl shadow-2xl shadow-primary/5">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                            Progress Actions
                        </h3>
                        <OrderActions
                            orderId={order.id}
                            orderNumber={order.orderNumber}
                            currentStatus={order.status}
                            importerCountry={orderWithRel.importer.country}
                        />
                    </section>

                    {/* Product Info */}
                    <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-slate-400" />
                            <h3 className="font-bold text-lg">Product Details</h3>
                        </div>
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="w-full md:w-48 h-48 rounded-2xl bg-slate-800 border border-white/5 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
                                    {orderWithRel.product.images?.[0] ? (
                                        <img src={orderWithRel.product.images[0]} alt={orderWithRel.product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Package className="w-12 h-12 text-slate-700" />
                                    )}
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-1">{orderWithRel.product.name}</h2>
                                        <div className="flex gap-2">
                                            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-white/5">
                                                {orderWithRel.product.category}
                                            </span>
                                            {orderWithRel.product.hsCode && (
                                                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-white/5 font-mono">
                                                    HS Code: {orderWithRel.product.hsCode}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Quantity</div>
                                            <div className="text-lg font-bold">{order.quantity} units</div>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Unit Price</div>
                                            <div className="text-lg font-bold">{formatMoney(orderWithRel.product.price)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Notes */}
                    {order.notes && (
                        <div className="bg-[#151c2a]/60 border border-white/5 p-6 rounded-3xl">
                            <h3 className="font-bold mb-3 text-slate-300">Importer Notes</h3>
                            <p className="text-slate-400 text-sm leading-relaxed p-4 bg-slate-900/50 rounded-2xl italic border border-white/5">
                                &quot;{order.notes}&quot;
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Col: Buyer & Meta */}
                <div className="space-y-8">
                    {/* Buyer Info */}
                    <div className="bg-[#151c2a]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-xl">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" />
                            Importer Information
                        </h3>

                        <div className="space-y-6">
                            <div className="flex items-start gap-3">
                                <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-tight mb-0.5">Company</div>
                                    <div className="font-bold text-white leading-tight">
                                        {orderWithRel.importer.companyName || orderWithRel.importer.name}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                                    <Globe className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-tight mb-0.5">Region</div>
                                    <div className="font-bold text-white capitalize">
                                        {orderWithRel.importer.country || "International Merchant"}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-tight mb-0.5">Contact</div>
                                    <div className="font-bold text-white">{orderWithRel.importer.name}</div>
                                    <div className="text-[10px] text-slate-500 mt-0.5 font-mono">{orderWithRel.importer.email}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline / Meta */}
                    <div className="bg-[#151c2a]/40 border border-white/5 rounded-3xl p-6">
                        <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-[0.2em]">Activity Log</h3>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="relative">
                                    <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_rgba(19,91,236,0.6)]" />
                                    <div className="absolute top-3 left-1.5 w-[2px] h-8 bg-white/5" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-white">Order Placed</div>
                                    <div className="text-[10px] text-slate-500 mt-0.5 underline underline-offset-2">
                                        {formatDate(order.createdAt)}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4 opacity-50">
                                <div className="w-3 h-3 rounded-full border-2 border-slate-700" />
                                <div>
                                    <div className="text-xs font-bold text-slate-400">Processing Started</div>
                                    <div className="text-[10px] text-slate-600 mt-0.5 italic">Awaiting action...</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
