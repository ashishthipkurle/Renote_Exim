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
    ShoppingBag
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getServerAuthContext } from "@/lib/auth-server";
import { OrderActions } from "../OrderActions";
import OrderContact from "@/components/messaging/OrderContact";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Package }> = {
    PENDING: { label: "Pending", color: "text-neutral-400 bg-neutral-400/10 border-neutral-400/20", icon: Clock },
    CONFIRMED: { label: "Confirmed", color: "text-foreground dark:text-white bg-black/10 dark:bg-white/15 border-border dark:border-white/20", icon: CheckCircle2 },
    PROCESSING: { label: "Processing", color: "text-neutral-300 bg-neutral-300/10 border-neutral-300/20", icon: Package },
    SHIPPED: { label: "Shipped", color: "text-foreground dark:text-white bg-white/15 border-border dark:border-white/20", icon: Truck },
    DELIVERED: { label: "Delivered", color: "text-foreground dark:text-white bg-black/20 dark:bg-white/20 border-white/30", icon: CheckCircle2 },
    CANCELLED: { label: "Cancelled", color: "text-neutral-500 bg-neutral-500/10 border-neutral-500/20", icon: XCircle },
    DISPUTED: { label: "Disputed", color: "text-neutral-600 bg-neutral-600/10 border-neutral-600/20", icon: XCircle },
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
    const auth = await getServerAuthContext();
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
        <div className="h-full overflow-hidden flex flex-col bg-background text-foreground">
            {/* Header & Back Action */}
            <div className="flex-shrink-0 p-6 lg:p-8 border-b border-border bg-header/80 backdrop-blur-md">
                <div className="max-w-6xl mx-auto w-full">
                    <Link
                        href="/dashboard/exporter/orders"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 text-xs font-bold uppercase tracking-widest"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Orders
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-black tracking-tight uppercase italic">
                                    Order Detail
                                </h1>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide ${cfg.color}`}>
                                    <StatusIcon className="w-3.5 h-3.5" />
                                    {cfg.label}
                                </span>
                            </div>
                            <p className="text-slate-400 font-mono text-[10px] uppercase tracking-widest">
                                ID: {order.orderNumber}
                            </p>
                        </div>

                        <div className="bg-card border border-border p-4 rounded-2xl flex items-center gap-6">
                            <div className="text-right">
                                <div className="text-[9px] text-muted-foreground uppercase font-black tracking-widest px-1">Total Amount</div>
                                <div className="text-xl font-black text-foreground dark:text-white">{formatMoney(order.totalPrice)}</div>
                            </div>
                            <div className="w-px h-10 bg-border" />
                            <div>
                                <div className="text-[9px] text-muted-foreground uppercase font-black tracking-widest px-1">Payment Status</div>
                                <div className="font-black text-[10px] bg-black/10 dark:bg-white/15 text-foreground dark:text-white px-2 py-0.5 rounded border border-border dark:border-white/20 mt-1 uppercase tracking-widest text-center">
                                    {order.paymentStatus}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
                    {/* Left Col: Product & Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Status Control Actions */}
                        <section className="bg-gradient-to-br from-white/5 to-transparent border border-border dark:border-white/10 p-6 rounded-3xl shadow-2xl shadow-white/5">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-foreground dark:text-white" />
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
                        <div className="bg-card border border-border rounded-3xl overflow-hidden">
                            <div className="p-6 border-b border-border flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                                <h3 className="font-bold text-lg">Product Details</h3>
                            </div>
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="w-full md:w-48 h-48 rounded-2xl bg-muted border border-border flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
                                        {orderWithRel.product.images?.[0] ? (
                                            <img src={orderWithRel.product.images[0]} alt={orderWithRel.product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Package className="w-12 h-12 text-muted-foreground/40" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <h2 className="text-2xl font-bold text-foreground mb-1">{orderWithRel.product.name}</h2>
                                            <div className="flex gap-2">
                                                <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded border border-border">
                                                    {orderWithRel.product.category}
                                                </span>
                                                {orderWithRel.product.hsCode && (
                                                    <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded border border-border font-mono">
                                                        HS Code: {orderWithRel.product.hsCode}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div className="bg-muted/30 p-3 rounded-xl border border-border">
                                                <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Quantity</div>
                                                <div className="text-lg font-bold">{order.quantity} units</div>
                                            </div>
                                            <div className="bg-muted/30 p-3 rounded-xl border border-border">
                                                <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Unit Price</div>
                                                <div className="text-lg font-bold">{formatMoney(orderWithRel.product.price)}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Notes */}
                        {order.notes && (
                            <div className="bg-card border border-border p-6 rounded-3xl">
                                <h3 className="font-bold mb-3 text-foreground">Importer Notes</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed p-4 bg-muted/50 rounded-2xl italic border border-border">
                                    &quot;{order.notes}&quot;
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Col: Buyer & Meta */}
                    <div className="space-y-8">
                        {/* Buyer Info */}
                        <div className="bg-card border border-border rounded-3xl p-6 shadow-xl">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <User className="w-5 h-5 text-foreground dark:text-white" />
                                Importer Information
                            </h3>

                            <div className="space-y-6">
                                <div className="flex items-start gap-3">
                                    <div className="p-2.5 rounded-xl bg-black/10 dark:bg-white/15 border border-border dark:border-white/20 text-foreground dark:text-white">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-0.5">Company</div>
                                        <div className="font-bold text-foreground leading-tight">
                                            {orderWithRel.importer.companyName || orderWithRel.importer.name}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="p-2.5 rounded-xl bg-black/10 dark:bg-white/15 border border-border dark:border-white/20 text-foreground dark:text-white">
                                        <Globe className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-0.5">Region</div>
                                        <div className="font-bold text-foreground capitalize">
                                            {orderWithRel.importer.country || "International Merchant"}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="p-2.5 rounded-xl bg-black/10 dark:bg-white/15 border border-border dark:border-white/20 text-foreground dark:text-white">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-0.5">Contact</div>
                                        <div className="font-bold text-foreground">{orderWithRel.importer.name}</div>
                                        <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">{orderWithRel.importer.email}</div>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <OrderContact 
                                        orderId={order.id}
                                        receiverId={order.importerId}
                                        receiverName={orderWithRel.importer.name || "Buyer"}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Timeline / Meta */}
                        <div className="bg-muted/50 dark:bg-white/5 border border-border rounded-3xl p-6">
                            <h3 className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-[0.2em]">Activity Log</h3>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="relative">
                                        <div className="w-3 h-3 rounded-full bg-primary dark:shadow-md shadow-none" />
                                        <div className="absolute top-3 left-1.5 w-[2px] h-8 bg-border" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-foreground">Order Placed</div>
                                        <div className="text-[10px] text-muted-foreground mt-0.5 underline underline-offset-2">
                                            {formatDate(order.createdAt)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4 opacity-50">
                                    <div className="w-3 h-3 rounded-full border-2 border-border" />
                                    <div>
                                        <div className="text-xs font-bold text-muted-foreground/60">Processing Started</div>
                                        <div className="text-[10px] text-muted-foreground/40 mt-0.5 italic">Awaiting action...</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
