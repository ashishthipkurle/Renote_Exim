"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { toast } from "sonner";
import { ArrowRight, Filter, Package, Search, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getAuthToken } from "@/lib/auth-client";
import { useAuth } from "@/components/auth/AuthProvider";

function getApiErrorMessage(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;
  const response = (error as { response?: unknown }).response;
  if (!response || typeof response !== "object") return null;
  const data = (response as { data?: unknown }).data;
  if (!data || typeof data !== "object") return null;
  const message = (data as { error?: unknown }).error;
  return typeof message === "string" ? message : null;
}

type Order = {
  id: string;
  orderNumber: string;
  quantity: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    originCountry: string;
    images?: string[];
  };
  shipment: {
    trackingNumber: string;
    status: string;
    carrier: string;
    estimatedDelivery: string;
  } | null;
};

function formatMoney(amount: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const token = await getAuthToken();
        if (!token || !user) {
          setOrders([]);
          return;
        }

        const res = await axios.get("/api/orders?limit=25", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data.orders as Order[]);
      } catch (error: unknown) {
        toast.error(getApiErrorMessage(error) ?? "Failed to load orders");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [user]);

  const active = orders.find((o) => Boolean(o.shipment)) ?? orders[0] ?? null;
  const activeShipment = active?.shipment ?? null;

  return (
    <div className="min-h-[calc(100dvh-5rem)] bg-background">
      <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-10 py-6 lg:py-8 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Logistics Control</h1>
            <p className="text-muted-foreground mt-1">
              Real-time oversight for your orders and shipments.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-background/60 px-5 py-2.5 text-sm font-black text-foreground hover:bg-accent transition-colors"
            >
              Continue shopping
            </Link>
          </div>
        </header>

        {!user && (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <div className="text-lg font-bold">Login required</div>
            <p className="text-sm text-muted-foreground mt-2">Sign in to view your orders.</p>
            <Link
              href="/login"
              className="inline-flex mt-6 h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-black text-primary-foreground"
            >
              Go to Login
            </Link>
          </div>
        )}

        {user && loading && (
          <div className="rounded-2xl border border-border bg-card p-8 text-muted-foreground">
            Loading orders...
          </div>
        )}

        {user && !loading && orders.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <div className="text-lg font-bold">No orders yet</div>
            <p className="text-sm text-muted-foreground mt-2">
              Place your first order from the marketplace.
            </p>
            <Link
              href="/products"
              className="inline-flex mt-6 h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-black text-primary-foreground"
            >
              Browse products
            </Link>
          </div>
        )}

        {user && !loading && orders.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            <section className="lg:col-span-7 flex flex-col gap-6">
              <div className="rounded-2xl border border-border bg-card/80 dark:bg-card/40 backdrop-blur-sm overflow-hidden shadow-2xl">
                <div className="p-6 flex items-center justify-between border-b border-border/60">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold tracking-tight">
                        Active: {active?.orderNumber ?? "—"}
                      </h3>
                      <p className="text-xs text-primary font-black uppercase tracking-widest">
                        {activeShipment ? activeShipment.status : "Awaiting shipment"}
                      </p>
                    </div>
                  </div>

                  <div className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black flex items-center gap-2">
                    <span className="size-2 rounded-full bg-primary animate-ping" />
                    LIVE
                  </div>
                </div>

                <div className="h-72 w-full relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-muted/40 to-background flex items-center justify-center overflow-hidden">
                    <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 1000 400">
                      <path
                        d="M100,200 Q300,50 500,200 T900,150"
                        fill="none"
                        opacity="0.35"
                        stroke="hsl(var(--primary))"
                        strokeDasharray="8 4"
                        strokeWidth="2"
                      />
                      <circle cx="580" cy="180" r="6" fill="hsl(var(--primary))" />
                      <text x="595" y="185" fill="hsl(var(--foreground))" fontSize="12" fontWeight="700">
                        Live Route
                      </text>
                    </svg>
                  </div>

                  <div className="absolute bottom-6 right-6 p-4 rounded-2xl border border-border bg-background/60 backdrop-blur-sm max-w-[240px]">
                    <p className="text-[10px] text-muted-foreground uppercase font-black mb-1 tracking-widest">
                      Estimated Arrival
                    </p>
                    <p className="text-lg font-black">
                      {activeShipment?.estimatedDelivery
                        ? new Date(activeShipment.estimatedDelivery).toLocaleDateString()
                        : "TBD"}
                    </p>
                    <div className="mt-2 w-full bg-muted h-1 rounded-full overflow-hidden">
                      <div className="bg-primary h-full w-[72%]" />
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {["Order Processed", "In Transit", "Customs Clearance", "Final Delivery"].map(
                    (label, idx) => {
                      const done = idx < 2;
                      const pending = idx >= 2;
                      return (
                        <div
                          key={label}
                          className={
                            "flex gap-4 rounded-xl border border-border/60 bg-background/30 px-4 py-3 " +
                            (pending ? "opacity-60" : "")
                          }
                        >
                          <div
                            className={
                              "size-8 rounded-full flex items-center justify-center " +
                              (done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")
                            }
                          >
                            <Package className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <div className="font-extrabold">{label}</div>
                              <div className="text-xs text-muted-foreground">
                                {idx === 0 && active ? new Date(active.createdAt).toLocaleString() : pending ? "Pending" : ""}
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {idx === 1 && activeShipment
                                ? `${activeShipment.carrier} • ${activeShipment.trackingNumber}`
                                : idx === 0
                                  ? "Order accepted and queued for dispatch."
                                  : idx === 2
                                    ? "Estimated processing time: 24-48 hours upon arrival."
                                    : "Delivery scheduled after clearance."}
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}

                  {!activeShipment && (
                    <div className="rounded-xl border border-border bg-muted/30 p-4 flex items-center justify-between gap-3">
                      <div className="text-sm text-muted-foreground">Shipment not created yet.</div>
                      <Button variant="ghost" className="text-primary" asChild>
                        <Link href="/dashboard/importer/shipments">
                          View shipments <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-extrabold tracking-tight">Order Archive</h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="size-10 rounded-xl border border-border bg-background/60 backdrop-blur-sm flex items-center justify-center hover:bg-accent transition-colors"
                    aria-label="Filter"
                  >
                    <Filter className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button
                    type="button"
                    className="size-10 rounded-xl border border-border bg-background/60 backdrop-blur-sm flex items-center justify-center hover:bg-accent transition-colors"
                    aria-label="Search"
                  >
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {orders.map((o, idx) => {
                  const img = o.product.images?.[0] ?? null;
                  const status = String(o.status || "").toUpperCase();
                  const delivered = status === "DELIVERED";
                  return (
                    <div
                      key={o.id}
                      className="rounded-2xl border border-border bg-card/80 dark:bg-card/40 backdrop-blur-sm p-4 hover:border-primary/30 transition-colors flex items-center gap-4"
                      style={{ animationDelay: `${(idx + 1) * 0.08}s` }}
                    >
                      <div className="size-16 rounded-xl bg-muted flex-shrink-0 overflow-hidden relative">
                        {img ? (
                          <Image src={img} alt={o.product.name} fill className="object-cover" />
                        ) : (
                          <div className="absolute inset-0 grid place-items-center text-xs text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-3">
                          <p className="text-sm font-extrabold truncate">{o.orderNumber}</p>
                          <span
                            className={
                              "text-[10px] font-black px-2 py-0.5 rounded-full border " +
                              (delivered
                                ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                                : "text-primary bg-primary/10 border-primary/20")
                            }
                          >
                            {status || "PENDING"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(o.createdAt).toLocaleDateString()} • Qty {o.quantity}
                        </p>
                        <div className="flex items-center justify-between mt-2 gap-3">
                          <p className="text-sm font-black text-foreground">{formatMoney(o.totalPrice)}</p>
                          <Link
                            href={`/products/${o.product.id}`}
                            className="text-[10px] font-black text-primary hover:underline"
                          >
                            REORDER
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
