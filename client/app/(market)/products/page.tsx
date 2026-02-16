import Image from "next/image";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import type { ProductCategory } from "@prisma/client";

export const dynamic = "force-dynamic";

function formatMoney(amount: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function ProductsPage() {
  let products: Array<{
    id: string;
    name: string;
    price: number;
    originCountry: string;
    category: ProductCategory;
    images: string[];
    exporter: { name: string | null; companyName: string | null; country: string | null };
  }> = [];

  try {
    products = await prisma.product.findMany({
      take: 30,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        price: true,
        originCountry: true,
        category: true,
        images: true,
        exporter: {
          select: {
            name: true,
            companyName: true,
            country: true,
          },
        },
      },
    });
  } catch {
    products = [];
  }

  return (
    <div className="min-h-[calc(100dvh-5rem)] bg-background dark:bg-[radial-gradient(circle_at_top_right,rgba(19,91,236,0.12),transparent_40%)]">
      <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-10 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="rounded-2xl border border-border bg-card/80 dark:bg-card/40 backdrop-blur-sm p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold tracking-tight">Advanced Filters</h2>
                <button type="button" className="text-xs font-black text-primary hover:underline">
                  Clear all
                </button>
              </div>

              <div className="mt-6 space-y-6">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
                    Categories
                  </div>
                  <div className="space-y-3">
                    {[
                      "Industrial Electronics",
                      "Raw Materials",
                      "Luxury Goods",
                      "Precision Machinery",
                    ].map((label, idx) => {
                      const checked = idx === 1;
                      return (
                        <label key={label} className="flex items-center group cursor-pointer">
                          <div
                            className={
                              "size-5 rounded border flex items-center justify-center mr-3 transition-all " +
                              (checked
                                ? "border-primary bg-primary/10"
                                : "border-border bg-background/40 group-hover:border-primary")
                            }
                          >
                            <div
                              className={
                                "size-2.5 bg-primary rounded-sm transition-opacity " +
                                (checked ? "opacity-100" : "opacity-0 group-hover:opacity-100")
                              }
                            />
                          </div>
                          <span
                            className={
                              "text-sm transition-colors " +
                              (checked ? "text-foreground font-semibold" : "text-muted-foreground group-hover:text-foreground")
                            }
                          >
                            {label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
                    Origin
                  </div>
                  <input
                    className="h-11 w-full rounded-xl border border-input bg-background/60 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/60"
                    placeholder="e.g. India, USA"
                  />
                </div>

                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
                    Price range
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      className="h-11 w-full rounded-xl border border-input bg-background/60 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/60"
                      placeholder="Min"
                    />
                    <input
                      className="h-11 w-full rounded-xl border border-input bg-background/60 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/60"
                      placeholder="Max"
                    />
                  </div>
                </div>

                <div className="rounded-xl bg-muted/40 p-4 text-xs text-muted-foreground">
                  Filters are UI-only in this pass; wire them to `/api/products` when you’re ready.
                </div>
              </div>
            </div>
          </aside>

          <section className="lg:col-span-8 xl:col-span-9">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Marketplace <span className="text-primary">Discovery</span>
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {products.length > 0
                    ? `Showing ${products.length} premium listings`
                    : "No listings yet"}
                </p>
              </div>

              <div className="flex gap-3">
                <div className="rounded-xl border border-border bg-background/60 px-4 py-2 text-sm">
                  <span className="text-muted-foreground mr-2">Sort by:</span>
                  <span className="font-black">Relevance</span>
                </div>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
                No products found. Create a few products as an exporter to populate this view.
              </div>
            ) : (
              <div className="columns-1 sm:columns-2 xl:columns-3 gap-6">
                {products.map((product) => {
                  const image = product.images?.[0] ?? null;
                  return (
                    <div key={product.id} className="mb-6 break-inside-avoid">
                      <Link
                        href={`/products/${product.id}`}
                        className="group block overflow-hidden rounded-2xl border border-border bg-card/80 dark:bg-card/40 backdrop-blur-sm hover:border-primary/50 hover:shadow-[0_0_24px_rgba(19,91,236,0.15)] transition-all"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                          {image ? (
                            <Image
                              src={image}
                              alt={product.name}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                              No image
                            </div>
                          )}
                          <div className="absolute top-4 left-4 flex gap-2">
                            <span className="rounded-full border border-border bg-background/60 px-2 py-1 text-[10px] font-black uppercase tracking-widest">
                              New Arrival
                            </span>
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="flex justify-between items-start gap-3 mb-2">
                            <div>
                              <h3 className="font-extrabold text-lg tracking-tight group-hover:text-primary transition-colors line-clamp-2">
                                {product.name}
                              </h3>
                              <div className="text-xs text-muted-foreground mt-1">
                                {product.originCountry} • {product.category}
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">SKU</div>
                          </div>

                          <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-primary text-2xl font-black">
                              {formatMoney(product.price)}
                            </span>
                            <span className="text-xs text-muted-foreground">/ unit</span>
                          </div>

                          <div className="flex items-center justify-between gap-3 py-3 border-y border-border/60">
                            <div className="text-[10px] text-muted-foreground font-semibold">
                              Verified exporter
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {(product.exporter.companyName || product.exporter.name) ?? "Unknown"}
                            </div>
                          </div>

                          <div className="mt-4 text-xs font-black text-primary">View details →</div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
