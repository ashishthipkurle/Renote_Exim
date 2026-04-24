"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Boxes,
  Search,
  Package,
  Truck,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  Building2,
  Filter,
  ArrowUpRight,
  Globe2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/api-utils";

type OrderStatus =
  | "QUOTE_REQUESTED" | "QUOTE_CONFIRMED" | "PO_RAISED" | "CART" | "CHECKOUT"
  | "PAYMENT_CONFIRMED" | "PAYMENT_FAILED" | "PROCESSING" | "SHIPPED"
  | "DELIVERED" | "COMPLETED" | "CANCELLED";

type ShipmentStatus = "PREPARING" | "IN_TRANSIT" | "CUSTOMS" | "OUT_FOR_DELIVERY" | "DELIVERED";

interface InventoryOrder {
  id: string;
  orderNumber: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  orderStatus: OrderStatus;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  product: {
    id: string;
    name: string;
    category: string;
    images: string[];
    unit: string;
    exporter: { name: string | null; businessName: string | null; country: string | null };
  } | null;
  shipment: {
    id: string;
    trackingNumber: string | null;
    currentStatus: ShipmentStatus;
    origin: string | null;
    destination: string | null;
    estimatedDelivery: string | null;
    actualDelivery: string | null;
    courierId: string | null;
  } | null;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: any }> = {
  QUOTE_REQUESTED: { label: "Quote Requested", color: "text-amber-500 bg-amber-500/10 border-amber-500/20", icon: Clock },
  QUOTE_CONFIRMED: { label: "Quote Confirmed", color: "text-blue-500 bg-blue-500/10 border-blue-500/20", icon: CheckCircle2 },
  PO_RAISED: { label: "PO Raised", color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20", icon: Package },
  CART: { label: "In Cart", color: "text-slate-400 bg-slate-400/10 border-slate-400/20", icon: Package },
  CHECKOUT: { label: "Checkout", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20", icon: Clock },
  PAYMENT_CONFIRMED: { label: "Payment Confirmed", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
  PAYMENT_FAILED: { label: "Payment Failed", color: "text-red-500 bg-red-500/10 border-red-500/20", icon: XCircle },
  PROCESSING: { label: "Processing", color: "text-blue-500 bg-blue-500/10 border-blue-500/20", icon: Clock },
  SHIPPED: { label: "Shipped", color: "text-sky-500 bg-sky-500/10 border-sky-500/20", icon: Truck },
  DELIVERED: { label: "Delivered", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
  COMPLETED: { label: "Completed", color: "text-green-600 bg-green-600/10 border-green-600/20", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", color: "text-red-500 bg-red-500/10 border-red-500/20", icon: XCircle },
};

const SHIPMENT_STEPS: ShipmentStatus[] = ["PREPARING", "IN_TRANSIT", "CUSTOMS", "OUT_FOR_DELIVERY", "DELIVERED"];
const SHIPMENT_LABELS: Record<ShipmentStatus, string> = {
  PREPARING: "Preparing",
  IN_TRANSIT: "In Transit",
  CUSTOMS: "Customs",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
};

const TAB_FILTERS = [
  { key: "ALL", label: "All Items" },
  { key: "ACTIVE", label: "Active" },
  { key: "SHIPPED", label: "In Transit" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "CANCELLED", label: "Cancelled" },
];

export default function ImporterInventoryClient({ initialOrders }: { initialOrders: InventoryOrder[] }) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");

  const filtered = useMemo(() => {
    let items = initialOrders;

    // Exclude cart/checkout — those aren't real inventory
    items = items.filter(o => !["CART", "CHECKOUT"].includes(o.orderStatus));

    if (activeTab === "ACTIVE") {
      items = items.filter(o => ["QUOTE_REQUESTED", "QUOTE_CONFIRMED", "PO_RAISED", "PAYMENT_CONFIRMED", "PROCESSING"].includes(o.orderStatus));
    } else if (activeTab === "SHIPPED") {
      items = items.filter(o => o.orderStatus === "SHIPPED");
    } else if (activeTab === "DELIVERED") {
      items = items.filter(o => ["DELIVERED", "COMPLETED"].includes(o.orderStatus));
    } else if (activeTab === "CANCELLED") {
      items = items.filter(o => ["CANCELLED", "PAYMENT_FAILED"].includes(o.orderStatus));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(o =>
        o.product?.name?.toLowerCase().includes(q) ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.product?.exporter?.businessName?.toLowerCase().includes(q) ||
        o.shipment?.trackingNumber?.toLowerCase().includes(q)
      );
    }

    return items;
  }, [initialOrders, activeTab, search]);

  const stats = useMemo(() => {
    const real = initialOrders.filter(o => !["CART", "CHECKOUT"].includes(o.orderStatus));
    return {
      total: real.length,
      active: real.filter(o => ["QUOTE_REQUESTED", "QUOTE_CONFIRMED", "PO_RAISED", "PAYMENT_CONFIRMED", "PROCESSING"].includes(o.orderStatus)).length,
      shipped: real.filter(o => o.orderStatus === "SHIPPED").length,
      delivered: real.filter(o => ["DELIVERED", "COMPLETED"].includes(o.orderStatus)).length,
      totalValue: real.filter(o => o.paymentStatus === "PAID" || o.paymentStatus === "PARTIAL").reduce((a, o) => a + o.totalPrice, 0),
    };
  }, [initialOrders]);

  return (
    <div className="h-full overflow-hidden flex flex-col bg-background selection:bg-primary selection:text-primary-foreground">
      {/* Header */}
      <header className="flex-shrink-0 px-8 py-8 border-b border-border dark:border-white/5 bg-background/40 backdrop-blur-3xl z-40">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
          <div className="flex items-center gap-5">
            <div className="p-3.5 rounded-lg bg-muted border border-border">
              <Boxes className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-foreground dark:text-white uppercase">Ordered Inventory</h1>
              <p className="text-muted-foreground mt-1 text-[10px] font-black uppercase tracking-[0.3em]">
                {stats.total} Items · {stats.active} Active · {stats.shipped} In Transit · {formatCurrency(stats.totalValue)} Total Value
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative group/search">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within/search:text-foreground" />
              <input
                type="text"
                placeholder="Search products, orders, tracking..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-80 bg-muted border border-border rounded-lg py-3 pl-12 pr-4 text-sm text-foreground font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground shadow-inner"
              />
            </div>

            {/* Tabs */}
            <div className="flex bg-muted border border-border p-1 rounded-lg">
              {TAB_FILTERS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab.key ? "bg-primary text-primary-foreground shadow-lg shadow-primary/10" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="max-w-[1700px] mx-auto space-y-6">
          {filtered.length === 0 ? (
            <div className="bg-card/40 dark:bg-white/5 backdrop-blur-3xl border border-border dark:border-white/5 shadow-xl rounded-lg p-24 text-center">
              <div className="flex flex-col items-center gap-8 opacity-40">
                <div className="p-10 rounded-lg bg-muted border border-border">
                  <Package className="w-16 h-16 text-foreground dark:text-white" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-2xl font-black text-foreground dark:text-white uppercase tracking-tighter">No Inventory Items</h2>
                  <p className="text-[10px] text-foreground dark:text-white font-black uppercase tracking-[0.2em] max-w-sm mx-auto leading-relaxed">
                    {activeTab === "ALL"
                      ? "Place orders through the marketplace to start building your inventory."
                      : `No items match the "${activeTab.toLowerCase()}" filter.`}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            filtered.map((order) => (
              <InventoryCard key={order.id} order={order} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function InventoryCard({ order }: { order: InventoryOrder }) {
  const config = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.PROCESSING;
  const StatusIcon = config.icon;
  const shipment = order.shipment;
  const product = order.product;
  const shipmentStepIndex = shipment ? SHIPMENT_STEPS.indexOf(shipment.currentStatus) : -1;

  return (
    <div className="group bg-card/40 dark:bg-white/[0.03] backdrop-blur-xl border border-border dark:border-white/5 hover:border-primary/20 dark:hover:border-white/15 rounded-lg overflow-hidden transition-all duration-500 shadow-lg hover:shadow-xl">
      <div className="flex flex-col lg:flex-row">
        {/* Product Image */}
        <div className="relative w-full lg:w-48 h-48 lg:h-auto bg-muted/30 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-border dark:border-white/5">
          {product?.images?.[0] ? (
            <Image src={product.images[0]} alt={product.name} fill className="object-contain p-3" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20">
              <Package className="w-12 h-12" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 p-6 lg:p-8 space-y-5">
          {/* Top Row */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${config.color}`}>
                  <StatusIcon className="w-3 h-3" />
                  {config.label}
                </span>
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                  #{order.orderNumber}
                </span>
              </div>
              <h3 className="text-lg font-black text-foreground dark:text-white uppercase tracking-tighter group-hover:text-primary transition-colors">
                {product?.name || "Unknown Product"}
              </h3>
              <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                {product?.exporter && (
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                    <Building2 className="w-3 h-3 text-primary" />
                    {product.exporter.businessName || product.exporter.name}
                  </span>
                )}
                {product?.exporter?.country && (
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                    <Globe2 className="w-3 h-3" />
                    {product.exporter.country}
                  </span>
                )}
              </div>
            </div>

            {/* Price / Quantity */}
            <div className="text-right flex-shrink-0">
              <p className="text-xl font-black text-foreground dark:text-white tracking-tighter">{formatCurrency(order.totalPrice)}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                {order.quantity} × {formatCurrency(order.unitPrice)} / {product?.unit || "unit"}
              </p>
              <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest mt-1">
                Ordered {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>

          {/* Shipment Tracking Bar */}
          {shipment && order.orderStatus !== "CANCELLED" && (
            <div className="pt-5 border-t border-border dark:border-white/5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">Shipment Tracking</span>
                {shipment.trackingNumber && (
                  <span className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    {shipment.trackingNumber}
                  </span>
                )}
              </div>

              {/* Progress Steps */}
              <div className="flex items-center gap-0">
                {SHIPMENT_STEPS.map((step, i) => {
                  const isCompleted = i <= shipmentStepIndex;
                  const isCurrent = i === shipmentStepIndex;
                  return (
                    <div key={step} className="flex-1 flex items-center">
                      <div className="flex flex-col items-center flex-1">
                        <div className={`w-3 h-3 rounded-full border-2 transition-all ${isCompleted ? "bg-primary border-primary" : "bg-muted border-border"} ${isCurrent ? "ring-4 ring-primary/20" : ""}`} />
                        <span className={`text-[8px] font-black uppercase tracking-widest mt-2 text-center leading-tight ${isCompleted ? "text-primary" : "text-muted-foreground/40"}`}>
                          {SHIPMENT_LABELS[step]}
                        </span>
                      </div>
                      {i < SHIPMENT_STEPS.length - 1 && (
                        <div className={`h-0.5 flex-1 -mt-5 ${i < shipmentStepIndex ? "bg-primary" : "bg-border dark:bg-white/10"}`} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Shipment Details Row */}
              <div className="flex flex-wrap items-center gap-6 mt-4 pt-3">
                {shipment.origin && (
                  <span className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                    <MapPin className="w-3 h-3 text-blue-400" /> From: {shipment.origin}
                  </span>
                )}
                {shipment.destination && (
                  <span className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                    <MapPin className="w-3 h-3 text-emerald-400" /> To: {shipment.destination}
                  </span>
                )}
                {shipment.estimatedDelivery && (
                  <span className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                    <Clock className="w-3 h-3" /> ETA: {new Date(shipment.estimatedDelivery).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* No shipment yet but order is active */}
          {!shipment && !["CANCELLED", "PAYMENT_FAILED", "DELIVERED", "COMPLETED"].includes(order.orderStatus) && (
            <div className="pt-4 border-t border-border dark:border-white/5">
              <div className="flex items-center gap-3 text-muted-foreground/50">
                <AlertCircle className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Shipment not yet created. Awaiting processing from the exporter.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
