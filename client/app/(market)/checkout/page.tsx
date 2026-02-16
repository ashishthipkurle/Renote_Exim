"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { toast } from "sonner";
import { CreditCard, Landmark, Lock, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { clearCart, getCart, type CartItem } from "@/lib/cart";
import { getAuthToken, getStoredUser } from "@/lib/auth-client";

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
  minOrderQty: number;
  unit: string;
  images?: string[];
};

function formatMoney(amount: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [productsById, setProductsById] = useState<Record<string, Product>>({});
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "wallet" | "bank">("card");

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
    void load();
  }, [items]);

  const rows = useMemo(() => {
    return items
      .map((i) => ({ item: i, product: productsById[i.productId] ?? null }))
      .filter((r) => r.product);
  }, [items, productsById]);

  const total = rows.reduce((sum, r) => sum + (r.product?.price ?? 0) * r.item.quantity, 0);

  const placeOrders = async () => {
    const token = await getAuthToken();
    const user = getStoredUser();

    if (!token || !user) {
      toast.error("Please login to place an order");
      return;
    }

    if (user.role !== "IMPORTER") {
      toast.error("Only IMPORTER accounts can place orders");
      return;
    }

    setSubmitting(true);
    try {
      for (const row of rows) {
        const product = row.product!;
        const quantity = Math.max(row.item.quantity, product.minOrderQty);
        await axios.post(
          "/api/orders",
          { productId: product.id, quantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      clearCart();
      setItems([]);
      toast.success("Order placed successfully");
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error) ?? "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100dvh-5rem)] bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-6 lg:py-8 space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Secure Payment</h1>
            <p className="text-sm text-muted-foreground">
              Select your preferred terminal for encrypted asset transfer.
            </p>
          </div>
          <Link href="/cart" className="text-sm font-black text-primary hover:underline">
            Back to cart
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <div className="text-lg font-bold">No items to checkout</div>
            <p className="text-sm text-muted-foreground mt-2">Add products to your cart first.</p>
            <Link
              href="/products"
              className="inline-flex mt-6 h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-black text-primary-foreground"
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
                    { label: "Shipping", icon: "🚚" },
                    { label: "Payment", icon: "💳" },
                    { label: "Review", icon: "✅" },
                  ].map((s, idx) => (
                    <div key={s.label} className="relative z-10 flex flex-col items-center gap-2">
                      <div
                        className={
                          "w-10 h-10 rounded-full flex items-center justify-center text-white font-black " +
                          (idx < 2
                            ? "bg-primary shadow-[0_0_15px_rgba(19,91,236,0.35)]"
                            : "bg-muted border border-border text-muted-foreground")
                        }
                      >
                        <span aria-hidden>{s.icon}</span>
                      </div>
                      <span
                        className={
                          "text-xs font-black tracking-wider uppercase " +
                          (idx < 2 ? "text-primary" : "text-muted-foreground")
                        }
                      >
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>

                <section className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-extrabold tracking-tight">Secure Payment</h2>
                    <p className="text-muted-foreground">
                      Select your preferred terminal for encrypted asset transfer.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={
                        "rounded-2xl border p-6 flex flex-col items-start gap-4 transition-all " +
                        (paymentMethod === "card"
                          ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(19,91,236,0.2)]"
                          : "border-border bg-card/80 hover:border-border/70")
                      }
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-extrabold">Credit Card</p>
                        <p className="text-xs text-muted-foreground mt-1">Stripe Gateway</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("wallet")}
                      className="rounded-2xl border border-border bg-card/80 p-6 flex flex-col items-start gap-4 transition-all hover:border-border/70"
                    >
                      <div className="w-10 h-10 rounded-xl bg-muted/40 flex items-center justify-center text-muted-foreground">
                        <Wallet className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-extrabold">Web3 Wallet</p>
                        <p className="text-xs text-muted-foreground mt-1">Connect Wallet</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("bank")}
                      className="rounded-2xl border border-border bg-card/80 p-6 flex flex-col items-start gap-4 transition-all hover:border-border/70"
                    >
                      <div className="w-10 h-10 rounded-xl bg-muted/40 flex items-center justify-center text-muted-foreground">
                        <Landmark className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-extrabold">Bank Transfer</p>
                        <p className="text-xs text-muted-foreground mt-1">Direct Wire</p>
                      </div>
                    </button>
                  </div>

                  <div className="rounded-3xl border border-border bg-background/40 backdrop-blur-sm p-8 relative overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/15 rounded-full blur-[100px]" />
                    <div className="relative z-10 space-y-6">
                      <div className="flex justify-between items-start">
                        <div className="w-12 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-md opacity-80" />
                        <div className="text-foreground/40 text-4xl">⌁</div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black">
                          Card Number
                        </label>
                        <input
                          className="w-full bg-transparent border-none p-0 text-xl md:text-2xl text-foreground font-mono tracking-widest focus:ring-0"
                          defaultValue="4242 4242 4242 4242"
                        />
                      </div>

                      <div className="flex gap-12">
                        <div className="space-y-2">
                          <label className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black">
                            Expires
                          </label>
                          <input
                            className="bg-transparent border-none p-0 text-foreground font-mono tracking-widest focus:ring-0 w-20"
                            placeholder="MM/YY"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black">
                            CVC
                          </label>
                          <input
                            className="bg-transparent border-none p-0 text-foreground font-mono tracking-widest focus:ring-0 w-12"
                            defaultValue="***"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-card/80 dark:bg-card/40 backdrop-blur-sm p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-black text-muted-foreground uppercase tracking-wider mb-2">
                        Cardholder Name
                      </label>
                      <input
                        className="w-full bg-background/40 border border-border rounded-xl px-4 py-3 text-foreground"
                        placeholder="AXEL VANCE"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-muted-foreground uppercase tracking-wider mb-2">
                        Billing Postal Code
                      </label>
                      <input
                        className="w-full bg-background/40 border border-border rounded-xl px-4 py-3 text-foreground"
                        placeholder="10001"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-muted-foreground uppercase tracking-wider mb-2">
                        Region/City
                      </label>
                      <input
                        className="w-full bg-background/40 border border-border rounded-xl px-4 py-3 text-foreground"
                        placeholder="New York City"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-6 items-center py-2 px-2">
                    <div className="flex items-center gap-2 text-emerald-500">
                      <Lock className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">256-bit Encrypted</span>
                    </div>
                    <div className="flex items-center gap-2 text-primary">
                      <Lock className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Verified Merchant</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Lock className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">PCI-DSS Compliant</span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-muted/40 p-4 text-xs text-muted-foreground">
                    Payment capture is UI-only; submitting will create Orders via `/api/orders` (token required).
                  </div>
                </section>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="sticky top-24 rounded-3xl border border-border bg-card/80 dark:bg-card/40 backdrop-blur-sm p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
                <h3 className="text-xl font-extrabold mb-6 flex items-center gap-2">
                  Trade Summary
                  <Lock className="h-4 w-4 text-primary" />
                </h3>

                <div className="flex flex-col gap-4 mb-8">
                  {rows.map(({ item, product }) => {
                    const img = product?.images?.[0] ?? null;
                    return (
                      <div key={item.productId} className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-muted border border-border flex-shrink-0 overflow-hidden relative">
                          {img ? (
                            <Image src={img} alt={product?.name ?? "Product"} fill className="object-cover" />
                          ) : (
                            <div className="absolute inset-0 grid place-items-center text-xs text-muted-foreground">—</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-extrabold truncate">{product?.name ?? item.productId}</p>
                          <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                        </div>
                        <p className="text-sm font-extrabold">
                          {formatMoney((product?.price ?? 0) * item.quantity)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-3 py-6 border-y border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">{formatMoney(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Secure Shipping</span>
                    <span className="text-foreground">FREE</span>
                  </div>
                </div>

                <div className="flex justify-between items-end pt-6">
                  <div>
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">
                      Total Trade Value
                    </p>
                    <p className="text-4xl font-extrabold text-foreground">{formatMoney(total)}</p>
                  </div>
                </div>

                <Button className="w-full mt-6" size="lg" disabled={submitting} onClick={placeOrders}>
                  {submitting ? "Submitting..." : "Confirm & Place Order"}
                </Button>

                <p className="mt-4 text-xs text-muted-foreground">
                  If you’re not logged in as an IMPORTER, you’ll be prompted to login.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
