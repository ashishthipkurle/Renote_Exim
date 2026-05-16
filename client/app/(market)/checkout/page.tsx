"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { CreditCard, Landmark, Lock, Wallet, Loader2, MapPin, Phone, ChevronRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Elements } from "@stripe/react-stripe-js";

import { Button } from "@/components/ui/button";
import { getCart, type CartItem } from "@/lib/cart";
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

const STEPS = [
    { label: "Shipping", icon: MapPin },
    { label: "Payment", icon: CreditCard },
    { label: "Confirm", icon: CheckCircle2 },
];

export default function CheckoutPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [items, setItems] = useState<CartItem[]>([]);
    const [productsById, setProductsById] = useState<Record<string, Product>>({});
    const [submitting, setSubmitting] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"card" | "wallet" | "bank">("card");
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [orderId, setOrderId] = useState<string | null>(null);

    // Step management: 0 = address, 1 = payment
    const [step, setStep] = useState(0);

    // Address form state
    const [shippingAddress, setShippingAddress] = useState("");
    const [shippingCity, setShippingCity] = useState("");
    const [shippingCountry, setShippingCountry] = useState("");
    const [shippingZip, setShippingZip] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    // Pre-fill from user profile
    useEffect(() => {
        if (user) {
            const u = user as any;
            if (u.address) setShippingAddress(u.address);
            if (u.country) setShippingCountry(u.country);
            if (u.phone) setPhoneNumber(u.phone);
        }
    }, [user]);

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
                } catch { /* ignore */ }
            }
            setProductsById(next);
        };
        if (items.length > 0) void load();
    }, [items]);

    const rows = useMemo(() => {
        return items
            .map((i) => ({ item: i, product: productsById[i.productId] ?? null }))
            .filter((r) => r.product);
    }, [items, productsById]);

    const total = rows.reduce((sum, r) => sum + (r.product?.price ?? 0) * r.item.quantity, 0);

    const fullAddress = [shippingAddress, shippingCity, shippingZip, shippingCountry].filter(Boolean).join(", ");

    const isAddressValid = shippingAddress.trim().length > 0 && phoneNumber.trim().length > 0;

    const saveLocalOrders = () => {
        if (typeof window === "undefined") return [] as string[];
        const storageKey = "renote_local_orders";
        const now = Date.now();
        const createdOrderIds: string[] = [];
        const existingRaw = localStorage.getItem(storageKey);
        const existing = existingRaw ? (JSON.parse(existingRaw) as any[]) : [];
        const sourceRows = items.map((item) => ({ item, product: productsById[item.productId] ?? null }));
        const newOrders = sourceRows.map((row, index) => {
            const id = `local-${now}-${index + 1}`;
            createdOrderIds.push(id);
            return {
                id,
                orderNumber: `ORD-${new Date().getFullYear()}-${String(now + index).slice(-6)}`,
                importerId: (user as any)?.id ?? "local-importer",
                totalPrice: (row.product?.price ?? 0) * row.item.quantity,
                currency: "USD",
                orderStatus: "QUOTE_REQUESTED",
                paymentStatus: "PENDING",
                quantity: row.item.quantity,
                productId: row.item.productId,
                createdAt: new Date(now + index).toISOString(),
                updatedAt: new Date(now + index).toISOString(),
                product: {
                    id: row.item.productId,
                    name: row.product?.name ?? `Product`,
                    category: row.product?.category ?? "General",
                    images: row.product?.images ?? [],
                    exporter: {
                        id: row.product?.exporter?.id ?? "local-exporter",
                        name: row.product?.exporter?.name ?? "Exporter",
                        businessName: row.product?.exporter?.businessName ?? "Seller",
                        country: row.product?.exporter?.country ?? "N/A",
                    },
                },
                _local: true,
            };
        });
        if (newOrders.length === 0) return createdOrderIds;
        localStorage.setItem(storageKey, JSON.stringify([...newOrders, ...existing].slice(0, 200)));
        window.dispatchEvent(new Event("renote-orders-updated"));
        return createdOrderIds;
    };

    const startPayment = async () => {
        setSubmitting(true);
        try {
            if (!user) {
                toast.error("Please login to place an order");
                return;
            }
            const orderItems = rows.map(r => ({
                productId: r.item.productId,
                quantity: r.item.quantity
            }));
            const res = await fetch("/api/checkout/create-intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    items: orderItems,
                    shippingAddress: fullAddress,
                    phone: phoneNumber,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || "Failed to initialize payment");
                return;
            }
            setClientSecret(data.clientSecret);
            setOrderId(data.orderId);
            toast.success("Payment session ready");
        } catch (error: unknown) {
            toast.error(getApiErrorMessage(error) ?? "Failed to initialize payment");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-[calc(100dvh-5rem)] bg-background">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-6 lg:py-8 space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Complete your order in a few simple steps.
                        </p>
                    </div>
                    <Link href="/cart" className="text-sm text-primary hover:underline flex items-center gap-1">
                        <ArrowLeft className="w-4 h-4" /> Back to cart
                    </Link>
                </div>

                {items.length === 0 ? (
                    <div className="rounded-xl border border-border bg-card p-10 text-center">
                        <p className="text-lg font-semibold">Your cart is empty</p>
                        <p className="text-sm text-muted-foreground mt-1">Add products to your cart first.</p>
                        <Link
                            href="/products"
                            className="inline-flex mt-4 items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
                        >
                            Go to Marketplace
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-8 space-y-6">
                            {/* Step Indicator */}
                            <div className="flex items-center justify-between relative px-4 py-4">
                                <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-border -translate-y-1/2 z-0" />
                                <div className="absolute top-1/2 left-4 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-500"
                                     style={{ width: step === 0 ? '0%' : step === 1 ? '45%' : '90%' }} />
                                {STEPS.map((s, idx) => (
                                    <div key={s.label} className="relative z-10 flex flex-col items-center gap-2">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border-2 ${
                                            idx <= step
                                                ? "bg-primary border-primary text-primary-foreground shadow-lg"
                                                : "bg-card border-border text-muted-foreground"
                                        }`}>
                                            <s.icon className="w-4 h-4" />
                                        </div>
                                        <span className={`text-xs font-medium ${idx <= step ? "text-primary" : "text-muted-foreground"}`}>
                                            {s.label}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Step 0: Shipping Address */}
                            {step === 0 && (
                                <section className="bg-card border border-border rounded-xl p-6 sm:p-8 space-y-6">
                                    <div>
                                        <h2 className="text-xl font-bold">Shipping Address</h2>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Where should we deliver your order?
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="sm:col-span-2">
                                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Street Address *</label>
                                            <input
                                                type="text"
                                                value={shippingAddress}
                                                onChange={(e) => setShippingAddress(e.target.value)}
                                                placeholder="123 Main Street, Apt 4B"
                                                className="mt-1.5 w-full px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">City</label>
                                            <input
                                                type="text"
                                                value={shippingCity}
                                                onChange={(e) => setShippingCity(e.target.value)}
                                                placeholder="Mumbai"
                                                className="mt-1.5 w-full px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">ZIP / Postal Code</label>
                                            <input
                                                type="text"
                                                value={shippingZip}
                                                onChange={(e) => setShippingZip(e.target.value)}
                                                placeholder="400001"
                                                className="mt-1.5 w-full px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Country</label>
                                            <input
                                                type="text"
                                                value={shippingCountry}
                                                onChange={(e) => setShippingCountry(e.target.value)}
                                                placeholder="India"
                                                className="mt-1.5 w-full px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Phone Number *</label>
                                            <div className="relative mt-1.5">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <input
                                                    type="tel"
                                                    value={phoneNumber}
                                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                                    placeholder="+91 98765 43210"
                                                    className="w-full pl-10 pr-4 py-3 bg-muted/30 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => {
                                            if (!isAddressValid) {
                                                toast.error("Please fill in the address and phone number");
                                                return;
                                            }
                                            setStep(1);
                                        }}
                                        className="w-full h-12 rounded-lg bg-primary text-primary-foreground text-sm font-semibold transition-all hover:opacity-90"
                                    >
                                        Continue to Payment <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </section>
                            )}

                            {/* Step 1: Payment */}
                            {step === 1 && (
                                <section className="bg-card border border-border rounded-xl p-6 sm:p-8 space-y-6">
                                    {/* Shipping summary */}
                                    <div className="flex items-start justify-between p-4 bg-muted/30 rounded-lg border border-border">
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-4 h-4 text-primary mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-foreground">Delivering to</p>
                                                <p className="text-sm text-muted-foreground">{fullAddress}</p>
                                                <p className="text-sm text-muted-foreground">{phoneNumber}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setStep(0)} className="text-xs text-primary hover:underline font-medium">
                                            Change
                                        </button>
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold">Payment Method</h2>
                                        <p className="text-sm text-muted-foreground mt-1">Choose how you'd like to pay.</p>
                                    </div>

                                    {!clientSecret ? (
                                        <>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                {[
                                                    { id: "card", label: "Credit Card", sub: "Visa, Mastercard", icon: CreditCard },
                                                    { id: "wallet", label: "Digital Wallet", sub: "Apple Pay, GPay", icon: Wallet },
                                                    { id: "bank", label: "Bank Transfer", sub: "Direct Wire", icon: Landmark },
                                                ].map((method) => (
                                                    <button
                                                        key={method.id}
                                                        type="button"
                                                        onClick={() => setPaymentMethod(method.id as any)}
                                                        className={`rounded-xl border p-5 flex flex-col items-start gap-3 transition-all ${
                                                            paymentMethod === method.id
                                                                ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                                                                : "border-border bg-card hover:border-primary/30"
                                                        }`}
                                                    >
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                            paymentMethod === method.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                                        }`}>
                                                            <method.icon className="h-5 w-5" />
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="text-sm font-semibold">{method.label}</p>
                                                            <p className="text-xs text-muted-foreground mt-0.5">{method.sub}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>

                                            <Button
                                                className="w-full h-12 rounded-lg bg-primary text-primary-foreground text-sm font-semibold shadow-lg transition-all hover:opacity-90"
                                                disabled={submitting}
                                                onClick={startPayment}
                                            >
                                                {submitting ? (
                                                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing...</>
                                                ) : (
                                                    `Pay ${formatMoney(total)}`
                                                )}
                                            </Button>
                                        </>
                                    ) : clientSecret.startsWith('pi_mock_') ? (
                                        <div className="rounded-xl border border-border bg-card p-8 text-center space-y-4">
                                            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                                                <Lock className="w-7 h-7" />
                                            </div>
                                            <h3 className="text-lg font-bold">Development Mode</h3>
                                            <p className="text-sm text-muted-foreground">
                                                No Stripe key configured. Click below to simulate a successful payment.
                                            </p>
                                            <Button
                                                onClick={() => {
                                                    saveLocalOrders();
                                                    router.push('/dashboard/importer/orders');
                                                }}
                                                className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl"
                                            >
                                                Simulate Payment Success
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border border-border bg-card p-6">
                                            <Elements
                                                stripe={getStripe()}
                                                options={{ clientSecret, appearance: { theme: 'night' } }}
                                            >
                                                <CheckoutForm amount={total} orderId={orderId!} />
                                            </Elements>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-center gap-6 pt-2 text-muted-foreground/50">
                                        <div className="flex items-center gap-1.5">
                                            <Lock className="h-3 w-3" />
                                            <span className="text-xs">SSL Encrypted</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Lock className="h-3 w-3" />
                                            <span className="text-xs">Secure Payment</span>
                                        </div>
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="lg:col-span-4">
                            <div className="sticky top-24 rounded-xl border border-border bg-card p-6 space-y-5">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    Order Summary
                                    <Lock className="h-3 w-3 text-primary" />
                                </h3>

                                <div className="flex flex-col gap-4">
                                    {rows.map(({ item, product }) => {
                                        const img = product?.images?.[0] ?? null;
                                        return (
                                            <div key={item.productId} className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-lg bg-muted border border-border flex-shrink-0 overflow-hidden relative">
                                                    {img ? (
                                                        <Image src={img} alt={product?.name ?? "Product"} fill className="object-cover" />
                                                    ) : (
                                                        <div className="absolute inset-0 grid place-items-center text-xs text-muted-foreground">N/A</div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{product?.name ?? item.productId}</p>
                                                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="text-sm font-semibold">
                                                    {formatMoney((product?.price ?? 0) * item.quantity)}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="border-t border-border pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span className="font-medium">{formatMoney(total)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Shipping</span>
                                        <span className="font-medium text-emerald-500">Free</span>
                                    </div>
                                </div>

                                <div className="border-t border-border pt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Total</span>
                                        <span className="text-2xl font-bold">{formatMoney(total)}</span>
                                    </div>
                                </div>

                                <p className="text-xs text-muted-foreground text-center">
                                    Secure encrypted payment gateway.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
