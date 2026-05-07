"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { CreditCard, Landmark, Lock, Wallet, Loader2 } from "lucide-react";
import { Elements } from "@stripe/react-stripe-js";

import { Button } from "@/components/ui/button";
import { getCart, type CartItem } from "@/lib/cart";
import { getAuthToken } from "@/lib/auth-client";
import { useAuth } from "@/components/auth/AuthProvider";
import { getStripe } from "@/lib/stripe-client";
import CheckoutForm from "@/components/checkout/CheckoutForm";

function getApiErrorMessage(error: unknown): string | null {
    if (!error || typeof error !== "object") return null;
    const response = (error as { response?: unknown }).response;
    if (!response || typeof response !== "object") return null;
    const data = (response as { data?: unknown }).data;
    if (!data || typeof data !== "object") return null;
    const message = (data as { error?: unknown }).error;
    return typeof message === "string" ? message : null;
}

type Product = {
    id: string;
    name: string;
    price: number;
    b2bPrice?: number;
    b2cPrice?: number;
    minOrderQty: number;
    unit: string;
    category?: string;
    originCountry?: string;
    images?: string[];
    exporter?: {
        id: string;
        name?: string | null;
        businessName?: string | null;
        country?: string | null;
    };
};

function formatMoney(amount: number) {
    return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(amount);
}

export default function CheckoutPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [items, setItems] = useState<CartItem[]>([]);
    const [productsById, setProductsById] = useState<Record<string, Product>>({});
    const [submitting, setSubmitting] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"card" | "wallet" | "bank">("card");
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [orderId, setOrderId] = useState<string | null>(null);

    useEffect(() => {
        setItems(getCart());
    }, []);

    useEffect(() => {
        const load = async () => {
            const next: Record<string, Product> = {};
            for (const item of items) {
                try {
                    const res = await axios.get(`/api/products/${item.productId}`);
                    next[item.productId] = res.data.product as Product;
                } catch {
                    // ignore
                }
            }
            setProductsById(next);
        };
        if (items.length > 0) {
            void load();
        }
    }, [items]);

    const rows = useMemo(() => {
        return items
            .map((i) => ({ item: i, product: productsById[i.productId] ?? null }))
            .filter((r) => r.product);
    }, [items, productsById]);

    const total = rows.reduce((sum, r) => sum + (r.product?.price ?? 0) * r.item.quantity, 0);

    const saveLocalOrders = () => {
        if (typeof window === "undefined") return [] as string[];

        const storageKey = "renote_local_orders";
        const now = Date.now();
        const createdOrderIds: string[] = [];

        const existingRaw = localStorage.getItem(storageKey);
        const existing = existingRaw ? (JSON.parse(existingRaw) as any[]) : [];

        const sourceRows = items.map((item) => ({ item, product: productsById[item.productId] ?? null }));

        const newOrders = sourceRows.map((row, index) => {
            const orderId = `local-${now}-${index + 1}`;
            createdOrderIds.push(orderId);

            return {
                id: orderId,
                orderNumber: `ORD-${new Date().getFullYear()}-${String(now + index).slice(-6)}`,
                importerId: (user as any)?.id ?? (user as any)?.userId ?? "local-importer",
                totalPrice: (row.product?.price ?? 0) * row.item.quantity,
                currency: "USD",
                status: "PENDING",
                paymentStatus: "PENDING",
                quantity: row.item.quantity,
                productId: row.item.productId,
                createdAt: new Date(now + index).toISOString(),
                updatedAt: new Date(now + index).toISOString(),
                product: {
                    id: row.item.productId,
                    name: row.product?.name ?? `Product ${row.item.productId.slice(0, 6)}`,
                    category: row.product?.category ?? "General",
                    images: row.product?.images ?? [],
                    exporter: {
                        id: row.product?.exporter?.id ?? "local-exporter",
                        name: row.product?.exporter?.name ?? "Exporter",
                        businessName: row.product?.exporter?.businessName ?? "Global Supplier",
                        country: row.product?.exporter?.country ?? row.product?.originCountry ?? "N/A",
                    },
                },
                importer: {
                    name: (user as any)?.name ?? "Importer",
                    businessName: (user as any)?.businessName ?? "Trading Co.",
                    country: (user as any)?.country ?? "N/A",
                },
                _local: true,
            };
        });

        if (newOrders.length === 0) {
            return createdOrderIds;
        }

        localStorage.setItem(storageKey, JSON.stringify([...newOrders, ...existing].slice(0, 200)));
        window.dispatchEvent(new Event("renote-orders-updated"));
        return createdOrderIds;
    };

    const startPayment = async () => {
        const BYPASS_PAYMENT_INIT = true;

        setSubmitting(true);
        try {
            if (BYPASS_PAYMENT_INIT) {
                // Sync with DB if possible
                const token = await getAuthToken();
                if (token && user) {
                    try {
                        for (const row of rows) {
                            const apiPath = user.role === 'IMPORTER' ? '/api/orders/b2b' : '/api/orders/b2c';
                            await axios.post(apiPath, {
                                productId: row.item.productId,
                                quantity: row.item.quantity
                            }, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                        }
                        toast.success("Trade sequence synchronized with registry nodes");
                    } catch (e: any) {
                        console.error("DB Sync failed during bypass:", e);
                        const errorMsg = e.response?.data?.error || e.message;
                        toast.error(`Registry sync failed: ${errorMsg}. Using local cache only.`);
                    }
                }

                const createdIds = saveLocalOrders();
                toast.success("Order initialized locally");
                const orderIdForNext = createdIds[0] ?? `BYPASS-${Date.now()}`;
                router.push(`/dashboard/importer/orders?orderId=${orderIdForNext}`);
                return;
            }

            const token = await getAuthToken();
            if (!token || !user) {
                toast.error("Please login to place an order");
                return;
            }

            if (user.role !== "IMPORTER") {
                toast.error("Only IMPORTER accounts can place orders");
                return;
            }

            const orderItems = rows.map(r => ({
                productId: r.item.productId,
                quantity: r.item.quantity
            }));

            const response = await axios.post(
                "/api/checkout/create-intent",
                { items: orderItems },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setClientSecret(response.data.clientSecret);
            setOrderId(response.data.orderId);
            toast.success("Payment session initialized");
        } catch (error: unknown) {
            toast.error(getApiErrorMessage(error) ?? "Failed to initialize payment");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-[calc(100dvh-5rem)] bg-background">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-6 lg:py-8 space-y-6">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight uppercase tracking-tighter">Secure_Payment_Node</h1>
                        <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">
                            Select your preferred terminal for encrypted asset transfer.
                        </p>
                    </div>
                    <Link href="/cart" className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">
                        [ Back_to_cart ]
                    </Link>
                </div>

                {items.length === 0 ? (
                    <div className="rounded-lg border border-border bg-card/40 backdrop-blur-3xl p-10 text-center">
                        <div className="text-lg font-black uppercase tracking-widest">Null_Cart_Registry</div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2">Add products to your cart first.</p>
                        <Link
                            href="/products"
                            className="inline-flex mt-6 h-11 items-center justify-center rounded-lg bg-primary px-8 text-[10px] font-black text-primary-foreground uppercase tracking-[0.2em] transition-all hover:scale-105"
                        >
                            Go to Marketplace
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8">
                            <div className="space-y-10">
                                <div className="flex items-center justify-between relative px-2">
                                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2" />
                                    <div className="absolute top-1/2 left-0 w-[66%] h-0.5 bg-primary -translate-y-1/2 shadow-[0_0_10px_rgba(19,91,236,0.35)]" />

                                    {[
                                        { label: "Logistics", icon: "🚚" },
                                        { label: "Protocol", icon: "💳" },
                                        { label: "Signature", icon: "✅" },
                                    ].map((s, idx) => (
                                        <div key={s.label} className="relative z-10 flex flex-col items-center gap-2">
                                            <div
                                                className={
                                                    "w-10 h-10 rounded-lg flex items-center justify-center text-white font-black transition-all " +
                                                    (idx < 2
                                                        ? "bg-primary shadow-[0_0_20px_rgba(19,91,236,0.5)] scale-110"
                                                        : "bg-muted border border-border text-muted-foreground")
                                                }
                                            >
                                                <span aria-hidden className="text-sm">{s.icon}</span>
                                            </div>
                                            <span
                                                className={
                                                    "text-[9px] font-black tracking-[0.3em] uppercase " +
                                                    (idx < 2 ? "text-primary" : "text-muted-foreground/30")
                                                }
                                            >
                                                {s.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <section className="space-y-8 bg-card/40 backdrop-blur-3xl border border-border p-10 rounded-lg">
                                    <div>
                                        <h2 className="text-2xl font-black tracking-tight uppercase tracking-tighter">Telemetry_Protocol</h2>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">
                                            Confirm order details and proceed to secure checkout.
                                        </p>
                                    </div>

                                    {!clientSecret ? (
                                        <>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                {[
                                                    { id: "card", label: "Credit Card", sub: "Stripe Gateway", icon: CreditCard },
                                                    { id: "wallet", label: "Web3 Wallet", sub: "Mock Wallet", icon: Wallet },
                                                    { id: "bank", label: "Bank Transfer", sub: "Direct Wire", icon: Landmark },
                                                ].map((method) => (
                                                    <button
                                                        key={method.id}
                                                        type="button"
                                                        onClick={() => setPaymentMethod(method.id as any)}
                                                        className={
                                                            "rounded-lg border p-6 flex flex-col items-start gap-4 transition-all " +
                                                            (paymentMethod === method.id
                                                                ? "border-primary bg-primary/10 shadow-[0_0_25px_rgba(19,91,236,0.15)] scale-[1.02]"
                                                                : "border-border bg-black/5 hover:border-primary/50 group")
                                                        }
                                                    >
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${paymentMethod === method.id ? 'bg-primary text-white' : 'bg-muted/30 text-muted-foreground group-hover:text-primary'}`}>
                                                            <method.icon className="h-5 w-5" />
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="text-[10px] font-black uppercase tracking-widest">{method.label}</p>
                                                            <p className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-widest mt-1">{method.sub}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="rounded-lg border border-border bg-black/10 backdrop-blur-sm p-12 relative overflow-hidden group">
                                                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-[100px] group-hover:bg-primary/10 transition-all duration-700" />
                                                <div className="relative z-10 space-y-6 text-center">
                                                    <div className="flex justify-center mb-4">
                                                        <div className="w-20 h-20 bg-primary/10 rounded-lg flex items-center justify-center text-primary shadow-inner">
                                                            <Lock className="h-8 w-8" />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <p className="text-xl font-black uppercase tracking-tighter">Initialize_Trade_Sequence?</p>
                                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] max-w-sm mx-auto leading-relaxed">
                                                            Secure terminal ready. Proceed to summary sidebar to finalize asset allocation.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="rounded-lg border border-border bg-card p-8">
                                            <Elements
                                                stripe={getStripe()}
                                                options={{ clientSecret, appearance: { theme: 'night' } }}
                                            >
                                                <CheckoutForm amount={total} orderId={orderId!} />
                                            </Elements>
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-10 items-center justify-center py-4 px-2 border-t border-border mt-10">
                                        <div className="flex items-center gap-3 text-emerald-500/60">
                                            <Lock className="h-3 w-3" />
                                            <span className="text-[8px] font-black uppercase tracking-[0.4em]">256_Bit_AES</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-primary/60">
                                            <Lock className="h-3 w-3" />
                                            <span className="text-[8px] font-black uppercase tracking-[0.4em]">Node_Verified</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-muted-foreground/30">
                                            <Lock className="h-3 w-3" />
                                            <span className="text-[8px] font-black uppercase tracking-[0.4em]">TLS_1.3_Active</span>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>

                        <div className="lg:col-span-4">
                            <div className="sticky top-24 rounded-lg border border-border bg-card/40 backdrop-blur-3xl p-10 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-all duration-700" />
                                <h3 className="text-lg font-black mb-8 flex items-center gap-3 uppercase tracking-tighter">
                                    Trade_Registry
                                    <Lock className="h-3 w-3 text-primary animate-pulse" />
                                </h3>

                                <div className="flex flex-col gap-6 mb-10">
                                    {rows.map(({ item, product }) => {
                                        const img = product?.images?.[0] ?? null;
                                        return (
                                            <div key={item.productId} className="flex items-center gap-5 group/item">
                                                <div className="w-16 h-16 rounded-lg bg-black/20 border border-border flex-shrink-0 overflow-hidden relative shadow-inner">
                                                    {img ? (
                                                        <Image src={img} alt={product?.name ?? "Product"} fill className="object-cover transition-transform group-hover/item:scale-110" />
                                                    ) : (
                                                        <div className="absolute inset-0 grid place-items-center text-[10px] text-muted-foreground/20 font-black uppercase tracking-widest">Null</div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] font-black uppercase tracking-widest truncate">{product?.name ?? item.productId}</p>
                                                    <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest mt-1">Sequence: {item.quantity} Units</p>
                                                </div>
                                                <p className="text-[10px] font-black uppercase tracking-widest">
                                                    {formatMoney((product?.price ?? 0) * item.quantity)}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex flex-col gap-4 py-8 border-y border-border">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.3em]">Subtotal_Valuation</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest">{formatMoney(total)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.3em]">Logistics_Tax</span>
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">0.00_FREE</span>
                                    </div>
                                </div>

                                <div className="pt-10 mb-10">
                                    <p className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.5em] mb-2">
                                        Net_Trade_Value
                                    </p>
                                    <p className="text-5xl font-black text-foreground tracking-tighter">{formatMoney(total)}</p>
                                </div>

                                {!clientSecret && (
                                    <Button
                                        className="w-full h-14 rounded-lg bg-primary hover:bg-primary/90 text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(19,91,236,0.3)] transition-all hover:scale-[1.02] active:scale-95"
                                        disabled={submitting}
                                        onClick={startPayment}
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin mr-3" />
                                                Initializing_Sequence...
                                            </>
                                        ) : (
                                            "Initialize_Payment"
                                        )}
                                    </Button>
                                )}

                                <p className="mt-6 text-[8px] font-black text-muted-foreground/20 uppercase tracking-[0.2em] text-center leading-relaxed">
                                    Secure encrypted gateway active.<br />All trade signatures are immutable.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
