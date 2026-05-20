"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { ChevronLeft, ShoppingCart, Trash2, HeartCrack } from "lucide-react";
import { toast } from "sonner";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getWishlist, toggleWishlist } from "@/lib/wishlist";
import { addToCart } from "@/lib/cart";
import { useAuth } from "@/components/auth/AuthProvider";

type Product = {
  id: string;
  name: string;
  price: number;
  b2bPrice?: number;
  b2cPrice?: number;
  regularPrice?: number;
  images: string[];
  originCountry?: string;
  minOrderQty?: number;
  unit?: string;
  category?: string;
  stockQty?: number;
  exporter?: {
    name?: string;
    businessName?: string;
  };
};

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function WishlistPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<string[]>([]);
  const [productsById, setProductsById] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setItems(getWishlist());
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const next: Record<string, Product> = {};
        for (const productId of items) {
          try {
            const res = await axios.get(`/api/products/${productId}`);
            next[productId] = res.data.product as Product;
          } catch {
            // ignore missing
          }
        }
        setProductsById(next);
      } finally {
        setLoading(false);
      }
    };

    if (items.length > 0) {
        void load();
    } else {
        setLoading(false);
    }
  }, [items]);

  const products = items
    .map((id) => productsById[id])
    .filter((p) => p !== undefined && p !== null);

  const getPrice = (product: Product) => {
    const isImporter = (user as any)?.defaultRole === "importer" || (user as any)?.role === "IMPORTER";
    return isImporter ? (product.b2bPrice ?? product.price) : (product.regularPrice ?? product.price);
  };

  const handleRemove = (productId: string) => {
    toggleWishlist(productId);
    setItems(getWishlist());
    toast.success("Removed from wishlist");
  };

  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-[100dvh] w-full bg-background">
        <DashboardHeader />
        <div className="flex-1 overflow-y-auto bg-background">
          <div className="mx-auto w-full max-w-7xl px-4 md:px-8 py-8">
            <div className="mb-6">
              <Link href="/products" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  <ChevronLeft className="w-4 h-4" /> Back to Marketplace
              </Link>
            </div>

            <div className="flex items-center justify-between mb-8 border-b border-border">
              <div className="flex gap-8">
                <button
                  type="button"
                  className="relative pb-4 text-lg font-extrabold border-b-2 border-primary text-foreground"
                >
                  My Wishlist
                  <span className="ml-2 px-2 py-0.5 text-xs bg-primary/15 text-primary rounded-full border border-primary/20">
                    {items.length}
                  </span>
                </button>
              </div>
            </div>

            {loading && (
              <div className="rounded-lg border border-border bg-card p-8 text-muted-foreground">
                Loading wishlist...
              </div>
            )}

            {!loading && items.length === 0 && (
              <div className="rounded-lg border border-border bg-card p-10 text-center flex flex-col items-center justify-center">
                <HeartCrack className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <div className="text-lg font-bold">Your wishlist is empty</div>
                <p className="text-sm text-muted-foreground mt-2">Browse the marketplace and save items you like.</p>
                <Link
                  href="/products"
                  className="inline-flex mt-6 h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-black text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Explore Marketplace
                </Link>
              </div>
            )}

            {!loading && products.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => {
                  const image = product.images?.[0] ?? null;
                  const isInStock = (product.stockQty ?? 0) > 0;

                  return (
                    <div key={product.id} className="group relative border border-border p-4 rounded-xl bg-card/40 hover:shadow-lg transition-all">
                      <Link href={`/products/${product.id}`} className="block">
                        {/* Card Image */}
                        <div className="relative mb-3 overflow-hidden rounded-lg bg-[#f8f9fa] dark:bg-white/[0.03] aspect-square border border-border dark:border-white/5 group-hover:border-primary/40 transition-all duration-500 shadow-sm group-hover:shadow-md">
                          {image ? (
                            <Image
                              src={image}
                              alt={product.name}
                              fill
                              sizes="(max-width:640px) 100vw,(max-width:1280px) 50vw,33vw"
                              className="object-contain p-2 transition-transform duration-700 group-hover:scale-110"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
                              <span className="material-symbols-outlined text-6xl">inventory_2</span>
                            </div>
                          )}
                          {/* Badge */}
                          <div className="absolute top-4 left-4">
                            {isInStock ? (
                              <span className="bg-tertiary-fixed text-on-tertiary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-sm">
                                <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                In Stock
                              </span>
                            ) : (
                              <span className="bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-sm">
                                <span className="material-symbols-outlined text-[12px]">schedule</span>
                                Pre-Order
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 mr-4">
                              <span className="text-[10px] font-label uppercase tracking-widest text-primary-foreground bg-primary/20 px-2 py-0.5 rounded">
                                {product.category || "General"}
                              </span>
                              <h2 className="text-base font-headline font-bold mt-1 text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors uppercase tracking-tight">
                                {product.name}
                              </h2>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-headline font-bold text-foreground">{formatMoney(getPrice(product))}</p>
                              <p className="text-[10px] font-label text-muted-foreground uppercase tracking-widest">/ {product.unit || "Unit"}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                            <span className="text-xs font-medium line-clamp-1">
                              Verified Exporter: {product.exporter?.businessName || product.exporter?.name || "Partner"}
                            </span>
                          </div>
                        </div>
                      </Link>

                      <div className="pt-4 mt-3 flex items-center gap-3 border-t border-border">
                        <button
                          onClick={() => handleRemove(product.id)}
                          className="size-10 flex-shrink-0 flex items-center justify-center border border-border rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors text-muted-foreground"
                          title="Remove from wishlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            addToCart(product.id, product.minOrderQty || 1);
                            toast.success("Added to cart");
                          }}
                          className="h-10 flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors text-sm"
                        >
                          <ShoppingCart className="w-4 h-4" /> Add to Cart
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
