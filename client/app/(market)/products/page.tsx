import Image from "next/image";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { ProductCategory, Prisma } from "@prisma/client";
import EmptyState from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

const ALL_CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "ELECTRONICS", label: "Electronics" },
  { value: "TEXTILES", label: "Textiles" },
  { value: "FOOD", label: "Food" },
  { value: "CHEMICALS", label: "Chemicals" },
  { value: "MACHINES", label: "Machinery" },
  { value: "MEDICAL", label: "Medical" },
  { value: "HANDICRAFTS", label: "Handicrafts" },
  { value: "AUTOMOTIVE", label: "Automotive" },
  { value: "CONSTRUCTION", label: "Construction" },
  { value: "AGRICULTURE", label: "Agriculture" },
  { value: "OTHER", label: "Other" },
];

function formatMoney(amount: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const categoryParam = typeof resolvedParams.category === "string" ? resolvedParams.category : undefined;
  const searchQuery = typeof resolvedParams.search === "string" ? resolvedParams.search : undefined;
  const originParam = typeof resolvedParams.origin === "string" ? resolvedParams.origin : undefined;
  const minPriceParam = typeof resolvedParams.minPrice === "string" ? parseFloat(resolvedParams.minPrice) : undefined;
  const maxPriceParam = typeof resolvedParams.maxPrice === "string" ? parseFloat(resolvedParams.maxPrice) : undefined;
  const sortParam = typeof resolvedParams.sort === "string" ? resolvedParams.sort : "newest";
  const page = typeof resolvedParams.page === "string" ? Math.max(1, parseInt(resolvedParams.page)) : 1;
  const limit = 30;

  // Build Prisma where clause
  const where: Prisma.ProductWhereInput = { available: true };

  if (categoryParam && ALL_CATEGORIES.some((c) => c.value === categoryParam)) {
    where.category = categoryParam as ProductCategory;
  }

  if (searchQuery && searchQuery.trim().length > 0) {
    where.OR = [
      { name: { contains: searchQuery.trim(), mode: "insensitive" } },
      { description: { contains: searchQuery.trim(), mode: "insensitive" } },
    ];
  }

  if (originParam && originParam.trim().length > 0) {
    where.originCountry = { contains: originParam.trim(), mode: "insensitive" };
  }

  if (minPriceParam && !isNaN(minPriceParam)) {
    where.price = { ...(where.price as Record<string, number> || {}), gte: minPriceParam };
  }
  if (maxPriceParam && !isNaN(maxPriceParam)) {
    where.price = { ...(where.price as Record<string, number> || {}), lte: maxPriceParam };
  }

  // Sort
  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  if (sortParam === "price_asc") orderBy = { price: "asc" };
  else if (sortParam === "price_desc") orderBy = { price: "desc" };
  else if (sortParam === "name") orderBy = { name: "asc" };

  let products: Array<{
    id: string;
    name: string;
    price: number;
    originCountry: string;
    category: ProductCategory;
    images: string[];
    quantity: number;
    exporter: { name: string | null; companyName: string | null; country: string | null };
  }> = [];
  let total = 0;

  try {
    [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        select: {
          id: true,
          name: true,
          price: true,
          originCountry: true,
          category: true,
          images: true,
          // @ts-ignore - Prisma Client needs regeneration (Server Restart Required)
          quantity: true,
          exporter: { select: { name: true, companyName: true, country: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);
  } catch {
    products = [];
  }

  const totalPages = Math.ceil(total / limit);

  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged: Record<string, string | undefined> = {
      category: categoryParam,
      search: searchQuery,
      origin: originParam,
      minPrice: minPriceParam?.toString(),
      maxPrice: maxPriceParam?.toString(),
      sort: sortParam !== "newest" ? sortParam : undefined,
      ...overrides,
    };
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v);
    }
    const qs = params.toString();
    return `/products${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="min-h-[calc(100dvh-5rem)] bg-background dark:bg-[radial-gradient(circle_at_top_right,rgba(19,91,236,0.12),transparent_40%)]">
      <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-10 py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 relative items-start">
          {/* ─── Main Content ─── */}
          <section className="flex-1 w-full order-2 lg:order-1">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 mb-6">
              <div className="flex items-center gap-4 w-full">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                    Marketplace <span className="text-primary">Discovery</span>
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    {total > 0 ? `Showing ${products.length} of ${total} listings` : "No listings found"}
                  </p>
                </div>
              </div>

              {/* Desktop Filter Toggle Button (Above products/no match box) */}
              <div className="hidden lg:flex w-full mb-6 justify-end">
                <label
                  htmlFor="desktop-filter-toggle"
                  className="cursor-pointer flex items-center gap-2 rounded-xl border border-border bg-background/60 px-4 py-2 text-sm font-semibold hover:border-primary/40 hover:bg-muted/30 transition-all hover:scale-[1.03] active:scale-95"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                </label>
              </div>

              <div className="lg:hidden flex gap-2 flex-wrap items-center">
                <details className="group relative">
                  <summary className="list-none flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-background/60 px-4 py-2 text-sm font-semibold hover:border-primary/40 hover:bg-muted/30 transition-all hover:scale-[1.03] active:scale-95">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filters
                  </summary>

                  {/* Mobile filter dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-[min(28rem,90vw)] max-h-[75vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-xl p-6 hidden group-open:block z-50">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-extrabold tracking-tight">Filters</h2>
                      <Link href="/products" className="text-xs font-black text-primary hover:underline">
                        Clear all
                      </Link>
                    </div>

                    {/* Sort buttons inside mobile dropdown */}
                    <div className="mt-6">
                      <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Sort by</div>
                      <div className="grid grid-cols-2 gap-2">
                        {[{ value: "newest", label: "Newest" }, { value: "price_asc", label: "Price ↑" }, { value: "price_desc", label: "Price ↓" }, { value: "name", label: "A-Z" }].map((s) => (
                          <Link
                            key={s.value}
                            href={buildUrl({ sort: s.value === "newest" ? undefined : s.value, page: undefined })}
                            className={
                              "w-full text-center rounded-xl border px-3 py-2 text-sm font-semibold transition-colors " +
                              (sortParam === s.value
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-background/60 text-muted-foreground hover:border-primary/40")
                            }
                          >
                            {s.label}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Search */}
                    <form className="mt-6" action="/products" method="GET">
                      {categoryParam && <input type="hidden" name="category" value={categoryParam} />}
                      {originParam && <input type="hidden" name="origin" value={originParam} />}
                      <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
                        Search
                      </div>
                      <div className="flex gap-2">
                        <input
                          name="search"
                          defaultValue={searchQuery ?? ""}
                          className="h-11 flex-1 rounded-xl border border-input bg-background/60 px-4 text-sm outline-none transition-all focus:ring-4 focus:ring-primary/20 focus:border-primary/60 hover:bg-muted/30"
                          placeholder="Search products..."
                        />
                        <button
                          type="submit"
                          className="h-11 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-sm hover:shadow-primary/20"
                        >
                          Go
                        </button>
                      </div>
                    </form>

                    {/* Categories */}
                    <div className="mt-6">
                      <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
                        Categories
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {ALL_CATEGORIES.map((cat) => {
                          const isActive = categoryParam === cat.value;
                          return (
                            <Link
                              key={cat.value}
                              href={buildUrl({ category: isActive ? undefined : cat.value, page: undefined })}
                              className={
                                "flex items-center group cursor-pointer px-3 py-2 rounded-lg transition-all " +
                                (isActive ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/40")
                              }
                            >
                              <div
                                className={
                                  "size-4 rounded border flex items-center justify-center mr-3 transition-all " +
                                  (isActive ? "border-primary bg-primary" : "border-border bg-background/40 group-hover:border-primary")
                                }
                              >
                                {isActive && (
                                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                  </svg>
                                )}
                              </div>
                              <span
                                className={
                                  "text-sm transition-colors " +
                                  (isActive ? "text-foreground font-semibold" : "text-muted-foreground group-hover:text-foreground")
                                }
                              >
                                {cat.label}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    {/* Origin */}
                    <form className="mt-6" action="/products" method="GET">
                      {categoryParam && <input type="hidden" name="category" value={categoryParam} />}
                      {searchQuery && <input type="hidden" name="search" value={searchQuery} />}
                      <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
                        Origin Country
                      </div>
                      <div className="flex gap-2">
                        <input
                          name="origin"
                          defaultValue={originParam ?? ""}
                          className="h-11 flex-1 rounded-xl border border-input bg-background/60 px-4 text-sm outline-none transition-all focus:ring-4 focus:ring-primary/20 focus:border-primary/60 hover:bg-muted/30"
                          placeholder="e.g. India, USA"
                        />
                        <button type="submit" className="h-11 px-3 rounded-xl bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-all hover:scale-105 active:scale-95">
                          Apply
                        </button>
                      </div>
                    </form>

                    {/* Price Range */}
                    <form className="mt-6" action="/products" method="GET">
                      {categoryParam && <input type="hidden" name="category" value={categoryParam} />}
                      {searchQuery && <input type="hidden" name="search" value={searchQuery} />}
                      {originParam && <input type="hidden" name="origin" value={originParam} />}
                      <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
                        Price Range (USD)
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input name="minPrice" type="number" defaultValue={minPriceParam ?? ""} className="h-11 w-full rounded-xl border border-input bg-background/60 px-4 text-sm outline-none transition-all focus:ring-4 focus:ring-primary/20 focus:border-primary/60 hover:bg-muted/30" placeholder="Min" />
                        <input name="maxPrice" type="number" defaultValue={maxPriceParam ?? ""} className="h-11 w-full rounded-xl border border-input bg-background/60 px-4 text-sm outline-none transition-all focus:ring-4 focus:ring-primary/20 focus:border-primary/60 hover:bg-muted/30" placeholder="Max" />
                      </div>
                      <button type="submit" className="mt-3 w-full h-10 rounded-xl bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                        Apply Price Filter
                      </button>
                    </form>

                    {/* Active filters summary */}
                    {(categoryParam || searchQuery || originParam || minPriceParam || maxPriceParam) && (
                      <div className="mt-6 rounded-xl bg-primary/5 border border-primary/10 p-4 text-xs text-muted-foreground space-y-1">
                        <div className="font-black text-foreground mb-2">Active Filters:</div>
                        {categoryParam && <div>Category: <span className="font-semibold text-primary">{categoryParam}</span></div>}
                        {searchQuery && <div>Search: <span className="font-semibold text-primary">&quot;{searchQuery}&quot;</span></div>}
                        {originParam && <div>Origin: <span className="font-semibold text-primary">{originParam}</span></div>}
                        {(minPriceParam || maxPriceParam) && (
                          <div>Price: <span className="font-semibold text-primary">{minPriceParam ? `$${minPriceParam}` : "$0"} — {maxPriceParam ? `$${maxPriceParam}` : "∞"}</span></div>
                        )}
                      </div>
                    )}
                  </div>
                </details>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="py-20">
                <EmptyState 
                  iconName="searchX"
                  title="No Listings Found"
                  description="We couldn't find any products matching your current filters. Try broadening your search or clearing filters."
                  actionLabel="Clear all filters"
                  href="/products"
                />
              </div>
            ) : (
              <div className="columns-1 sm:columns-2 xl:columns-3 2xl:columns-4 gap-6 relative z-10">
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
                            <Image src={image} alt={product.name} fill sizes="(max-width:640px) 100vw,(max-width:1280px) 50vw,33vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">No image</div>
                          )}
                          <div className="absolute top-4 left-4">
                            <span className="rounded-full border border-border bg-background/60 px-2 py-1 text-[10px] font-black uppercase tracking-widest">{product.category}</span>
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="font-extrabold text-lg tracking-tight group-hover:text-primary transition-colors line-clamp-2">{product.name}</h3>
                          <div className="text-xs text-muted-foreground mt-1">{product.originCountry} • {product.category}</div>
                          <div className="flex items-baseline gap-2 mt-3 mb-4">
                            <span className="text-primary text-2xl font-black">{formatMoney(product.price)}</span>
                            <span className="text-xs text-muted-foreground">/ unit</span>
                          </div>
                          <div className="flex items-center justify-between gap-3 py-3 border-y border-border/60">
                            <div className="text-[10px] text-muted-foreground font-semibold">Verified exporter</div>
                            <div className="text-[10px] text-muted-foreground">{(product.exporter.companyName || product.exporter.name) ?? "Unknown"}</div>
                          </div>

                          {/* Stock Status */}
                          <div className="mt-4 flex items-center justify-between">
                            <div className="text-xs font-black text-primary">View details →</div>
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${(product as any).quantity > 0
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-red-500/10 text-red-500"
                              }`}>
                              {(product as any).quantity > 0 ? "In Stock" : "Out of Stock"}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                {page > 1 && (
                  <Link href={buildUrl({ page: (page - 1).toString() })} className="px-4 py-2 rounded-xl border border-border bg-background/60 text-sm font-semibold hover:border-primary/40 hover:bg-muted/30 transition-all hover:scale-105 active:scale-95">
                    ← Previous
                  </Link>
                )}
                <span className="px-4 py-2 text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                {page < totalPages && (
                  <Link href={buildUrl({ page: (page + 1).toString() })} className="px-4 py-2 rounded-xl border border-border bg-background/60 text-sm font-semibold hover:border-primary/40 hover:bg-muted/30 transition-all hover:scale-105 active:scale-95">
                    Next →
                  </Link>
                )}
              </div>
            )}
          </section>

          {/* ─── Desktop Sidebar Toggle Hack (Server-Component safe CSS toggle) ─── */}
          <input type="checkbox" id="desktop-filter-toggle" className="peer/desktop-filter hidden" />

          {/* ─── Desktop Sidebar ─── */}
          <aside className="hidden lg:flex flex-col w-0 opacity-0 peer-checked/desktop-filter:w-80 peer-checked/desktop-filter:opacity-100 peer-checked/desktop-filter:ml-6 shrink-0 sticky top-24 h-[calc(100vh-8rem)] overflow-visible order-1 lg:order-2 transition-all duration-500 ease-in-out">
            <div className="rounded-2xl border border-border bg-card shadow-sm p-6 w-80 shrink-0">
              <div className="flex items-center justify-between pb-4 border-b border-border/40">
                <h2 className="text-lg font-extrabold tracking-tight">Filters</h2>
                <Link href="/products" className="text-xs font-black text-primary hover:underline">
                  Clear all
                </Link>
              </div>

              {/* Sort buttons */}
              <div className="mt-6">
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Sort by</div>
                <div className="grid grid-cols-2 gap-2">
                  {[{ value: "newest", label: "Newest" }, { value: "price_asc", label: "Price ↑" }, { value: "price_desc", label: "Price ↓" }, { value: "name", label: "A-Z" }].map((s) => (
                    <Link
                      key={s.value}
                      href={buildUrl({ sort: s.value === "newest" ? undefined : s.value, page: undefined })}
                      className={
                        "w-full text-center rounded-xl border px-3 py-2 text-sm font-semibold transition-colors " +
                        (sortParam === s.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background/60 text-muted-foreground hover:border-primary/40")
                      }
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Search */}
              <form className="mt-6" action="/products" method="GET">
                {categoryParam && <input type="hidden" name="category" value={categoryParam} />}
                {originParam && <input type="hidden" name="origin" value={originParam} />}
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
                  Search
                </div>
                <div className="flex gap-2">
                  <input
                    name="search"
                    defaultValue={searchQuery ?? ""}
                    className="h-11 flex-1 rounded-xl border border-input bg-background/60 px-4 text-sm outline-none transition-all focus:ring-4 focus:ring-primary/20 focus:border-primary/60 hover:bg-muted/30"
                    placeholder="Search products..."
                  />
                  <button
                    type="submit"
                    className="h-11 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-sm hover:shadow-primary/20"
                  >
                    Go
                  </button>
                </div>
              </form>

              {/* Categories */}
              <div className="mt-6">
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
                  Categories
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_CATEGORIES.map((cat) => {
                    const isActive = categoryParam === cat.value;
                    return (
                      <Link
                        key={cat.value}
                        href={buildUrl({ category: isActive ? undefined : cat.value, page: undefined })}
                        className={
                          "flex items-center group cursor-pointer px-3 py-2 rounded-lg transition-all " +
                          (isActive ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/40")
                        }
                      >
                        <div
                          className={
                            "size-4 rounded border flex items-center justify-center mr-3 transition-all " +
                            (isActive ? "border-primary bg-primary" : "border-border bg-background/40 group-hover:border-primary")
                          }
                        >
                          {isActive && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                        </div>
                        <span
                          className={
                            "text-sm transition-colors " +
                            (isActive ? "text-foreground font-semibold" : "text-muted-foreground group-hover:text-foreground")
                          }
                        >
                          {cat.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Origin */}
              <form className="mt-6" action="/products" method="GET">
                {categoryParam && <input type="hidden" name="category" value={categoryParam} />}
                {searchQuery && <input type="hidden" name="search" value={searchQuery} />}
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
                  Origin Country
                </div>
                <div className="flex gap-2">
                  <input
                    name="origin"
                    defaultValue={originParam ?? ""}
                    className="h-11 flex-1 rounded-xl border border-input bg-background/60 px-4 text-sm outline-none transition-all focus:ring-4 focus:ring-primary/20 focus:border-primary/60 hover:bg-muted/30"
                    placeholder="e.g. India, USA"
                  />
                  <button type="submit" className="h-11 px-3 rounded-xl bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-all hover:scale-105 active:scale-95">
                    Apply
                  </button>
                </div>
              </form>

              {/* Price Range */}
              <form className="mt-6" action="/products" method="GET">
                {categoryParam && <input type="hidden" name="category" value={categoryParam} />}
                {searchQuery && <input type="hidden" name="search" value={searchQuery} />}
                {originParam && <input type="hidden" name="origin" value={originParam} />}
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
                  Price Range (USD)
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input name="minPrice" type="number" defaultValue={minPriceParam ?? ""} className="h-11 w-full rounded-xl border border-input bg-background/60 px-4 text-sm outline-none transition-all focus:ring-4 focus:ring-primary/20 focus:border-primary/60 hover:bg-muted/30" placeholder="Min" />
                  <input name="maxPrice" type="number" defaultValue={maxPriceParam ?? ""} className="h-11 w-full rounded-xl border border-input bg-background/60 px-4 text-sm outline-none transition-all focus:ring-4 focus:ring-primary/20 focus:border-primary/60 hover:bg-muted/30" placeholder="Max" />
                </div>
                <button type="submit" className="mt-3 w-full h-10 rounded-xl bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  Apply Price Filter
                </button>
              </form>

              {/* Active filters summary */}
              {(categoryParam || searchQuery || originParam || minPriceParam || maxPriceParam) && (
                <div className="mt-6 rounded-xl bg-primary/5 border border-primary/10 p-4 text-xs text-muted-foreground space-y-1">
                  <div className="font-black text-foreground mb-2">Active Filters:</div>
                  {categoryParam && <div>Category: <span className="font-semibold text-primary">{categoryParam}</span></div>}
                  {searchQuery && <div>Search: <span className="font-semibold text-primary">&quot;{searchQuery}&quot;</span></div>}
                  {originParam && <div>Origin: <span className="font-semibold text-primary">{originParam}</span></div>}
                  {(minPriceParam || maxPriceParam) && (
                    <div>Price: <span className="font-semibold text-primary">{minPriceParam ? `$${minPriceParam}` : "$0"} — {maxPriceParam ? `$${maxPriceParam}` : "∞"}</span></div>
                  )}
                </div>
              )}

            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
