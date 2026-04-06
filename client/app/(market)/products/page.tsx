import Image from "next/image";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { ProductCategory } from "@/lib/types";
import EmptyState from "@/components/ui/EmptyState";
import { createClient } from "@supabase/supabase-js";
import { tryGetSupabaseEnv } from "@/lib/supabase/shared";
import { getServerAuth } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ALL_CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: ProductCategory.ELECTRONICS, label: "Electronics" },
  { value: ProductCategory.TEXTILES, label: "Textiles" },
  { value: ProductCategory.FOOD, label: "Food" },
  { value: ProductCategory.CHEMICALS, label: "Chemicals" },
  { value: ProductCategory.MACHINES, label: "Machinery" },
  { value: ProductCategory.MEDICAL, label: "Medical" },
  { value: ProductCategory.HANDICRAFTS, label: "Handicrafts" },
  { value: ProductCategory.AUTOMOTIVE, label: "Automotive" },
  { value: ProductCategory.CONSTRUCTION, label: "Construction" },
  { value: ProductCategory.AGRICULTURE, label: "Agriculture" },
  { value: ProductCategory.OTHER, label: "Other" },
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

  const auth = await getServerAuth();
  const role = auth?.role || "USER";

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

  type ProductWithExporter = {
    id: string;
    name: string;
    price: number;
    regularPrice: number;
    originCountry: string;
    category: string;
    images: string[];
    quantity: number;
    exporter: { name: string | null; companyName: string | null; country: string | null };
  };
  let products: ProductWithExporter[] = [];
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
          regularPrice: true,
          originCountry: true,
          category: true,
          images: true,
          quantity: true,
          exporter: { select: { name: true, companyName: true, country: true } },
        } as any,
      }) as unknown as ProductWithExporter[],
      prisma.product.count({ where }),
    ]);

    // Apply role-based price swap
    products = products.map((p) => ({
      ...p,
      price: role === "IMPORTER" ? p.price : (p.regularPrice || p.price)
    }));
  } catch (error) {
    console.error("Failed to fetch products from Prisma, trying Supabase fallback:", error);
    try {
      const env = tryGetSupabaseEnv();
      if (env) {
        const supabase = createClient(env.url, env.anonKey);

        // Match the Prisma orderBy logic
        let orderColumn = 'createdAt';
        let isAscending = false;
        if (sortParam === "price_asc") { orderColumn = 'price'; isAscending = true; }
        else if (sortParam === "price_desc") { orderColumn = 'price'; isAscending = false; }
        else if (sortParam === "name") { orderColumn = 'name'; isAscending = true; }

        let query = supabase
          .from('products')
          .select('id, name, price, originCountry, category, images, quantity, exporter:users!exporterId(name, companyName, country)', { count: 'exact' })
          .eq('available', true)
          .order(orderColumn, { ascending: isAscending })
          .range((page - 1) * limit, page * limit - 1);

        if (categoryParam) query = query.eq('category', categoryParam);
        if (originParam) query = query.ilike('originCountry', `%${originParam}%`);
        if (minPriceParam) query = query.gte('price', minPriceParam);
        if (maxPriceParam) query = query.lte('price', maxPriceParam);
        if (searchQuery && searchQuery.trim() !== '') {
          // the ilike syntax in Supabase for OR is separated by comma
          const safeSearch = searchQuery.trim().replace(/%/g, '\\%'); // simple escape
          query = query.or(`name.ilike.%${safeSearch}%,description.ilike.%${safeSearch}%`);
        }

        const { data: supaProducts, count, error: supaError } = await query;

        if (!supaError && supaProducts) {
          // Format exporter to match expected Prisma output (an object, not array, since it's a many-to-one relation)
          products = supaProducts.map((p: any) => ({
            ...p,
            exporter: Array.isArray(p.exporter) ? p.exporter[0] : p.exporter,
            price: role === "IMPORTER" ? p.price : (p.regularPrice || p.price)
          })) as ProductWithExporter[];
          total = count || 0;
        } else {
          console.error("Supabase fallback failed:", supaError);
          products = [];
        }
      }
    } catch (fallbackError) {
      console.error("Error setting up Supabase fallback:", fallbackError);
      products = [];
    }
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

  const iconMap: Record<string, string> = {
    ELECTRONICS: "devices",
    TEXTILES: "texture",
    FOOD: "restaurant",
    CHEMICALS: "science",
    MACHINES: "precision_manufacturing",
    MEDICAL: "medical_services",
    HANDICRAFTS: "brush",
    AUTOMOTIVE: "directions_car",
    CONSTRUCTION: "architecture",
    AGRICULTURE: "agriculture",
    OTHER: "grid_view",
  };

  return (
    <div className="bg-surface text-on-surface selection:bg-primary-fixed">
      <div className="flex pt-0 min-h-screen">
        {/* ─── Left Sidebar ─── */}
        <aside className="h-screen w-64 fixed left-0 top-20 bg-surface-container-low hidden lg:block overflow-y-auto border-r border-surface-container-high z-40">
          <div className="flex flex-col py-10 space-y-2">
            <div className="px-8 mb-6">
              <h3 className="font-headline font-semibold text-sm uppercase tracking-wider text-foreground">Categories</h3>
              <p className="text-xs text-muted-foreground mt-1">Refine by Department</p>
            </div>

            {/* New Arrivals (clear category) */}
            <Link
              href={buildUrl({ category: undefined, page: undefined })}
              className={`flex items-center pl-6 py-3 transition-all group ${!categoryParam ? "text-primary-foreground bg-primary rounded-l-full font-bold shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-accent"}`}
            >
              <span className="material-symbols-outlined mr-3 text-lg">auto_awesome</span>
              <span className="font-headline font-semibold text-sm uppercase tracking-wider">New Arrivals</span>
            </Link>

            {ALL_CATEGORIES.map((cat) => {
              const isActive = categoryParam === cat.value;
              return (
                <Link
                  key={cat.value}
                  href={buildUrl({ category: isActive ? undefined : cat.value, page: undefined })}
                  className={`flex items-center pl-6 py-3 transition-colors group ${isActive ? "text-primary-foreground bg-primary rounded-l-full font-bold shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-accent"}`}
                >
                  <span className="material-symbols-outlined mr-3 text-lg">{iconMap[cat.value] || "category"}</span>
                  <span className="font-headline font-semibold text-sm uppercase tracking-wider">{cat.label}</span>
                </Link>
              );
            })}

            {/* Discovery Tools */}
            <div className="mt-12 px-8">
              <h3 className="font-headline font-semibold text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-4">Discovery Tools</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between group cursor-pointer">
                  <span className="text-sm font-body text-muted-foreground">Verified Exporters</span>
                  <div className="w-8 h-4 bg-accent rounded-full relative">
                    <div className="absolute left-1 top-1 w-2 h-2 bg-muted-foreground rounded-full" />
                  </div>
                </div>
                <div className="flex items-center justify-between group cursor-pointer">
                  <span className="text-sm font-body text-muted-foreground">In Stock Only</span>
                  <div className="w-8 h-4 bg-primary rounded-full relative">
                    <div className="absolute right-1 top-1 w-2 h-2 bg-primary-foreground rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ─── Main Content Canvas ─── */}
        <main className="flex-1 lg:ml-64 px-8 md:px-16 py-12 bg-surface">
          {/* Editorial Header Section */}
          <div className="max-w-screen-xl mx-auto mb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <span className="font-label text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4 block">Marketplace Curation</span>
                <h1 className="text-5xl md:text-7xl font-headline font-bold text-foreground tracking-tight leading-none mb-4">
                  Marketplace Discovery
                </h1>
                <p className="text-muted-foreground text-lg font-body max-w-2xl">
                  A refined selection of industrial chemicals, advanced machinery, and premium materials sourced from globally verified partners.
                </p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-headline font-bold text-foreground">{total.toLocaleString()}</span>
                <span className="text-muted-foreground font-label text-xs uppercase tracking-widest">Listings Found</span>
              </div>
            </div>
          </div>

          {/* ─── Product Grid ─── */}
          <div className="max-w-screen-xl mx-auto">
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-y-24 gap-x-12">
                {products.map((product) => {
                  const image = product.images?.[0] ?? null;
                  const isInStock = product.quantity > 0;

                  return (
                    <div key={product.id} className="group">
                      <Link href={`/products/${product.id}`} className="block">
                        {/* Card Image */}
                        <div className="relative mb-6 overflow-hidden rounded-xl bg-card aspect-[4/5] shadow-inner shadow-black/10">
                          {image ? (
                            <Image
                              src={image}
                              alt={product.name}
                              fill
                              sizes="(max-width:640px) 100vw,(max-width:1280px) 50vw,33vw"
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
                              <span className="material-symbols-outlined text-6xl">inventory_2</span>
                            </div>
                          )}
                          {/* Badge */}
                          <div className="absolute top-4 left-4">
                            {isInStock ? (
                              <span className="bg-tertiary-fixed text-on-tertiary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                In Stock
                              </span>
                            ) : (
                              <span className="bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
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
                                {product.category}
                              </span>
                              <h2 className="text-2xl font-headline font-bold mt-2 text-foreground line-clamp-1">
                                {product.name}
                              </h2>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-headline font-bold text-foreground">{formatMoney(product.price)}</p>
                              <p className="text-[10px] font-label text-muted-foreground uppercase tracking-tighter">/ Unit</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                            <span className="text-xs font-medium">
                              Verified Exporter: {product.exporter?.companyName || product.exporter?.name || "Partner"}
                            </span>
                          </div>

                          <div className="pt-4 flex items-center justify-between border-t border-border">
                            <span className="text-primary font-headline font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                              View Details
                              <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                            </span>
                            <div className="p-2 rounded-full bg-accent hover:bg-accent/80 transition-colors text-muted-foreground">
                              <span className="material-symbols-outlined text-lg">favorite</span>
                            </div>
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
              <div className="mt-24 mb-12 flex justify-center items-center gap-4">
                {page > 1 && (
                  <Link
                    href={buildUrl({ page: (page - 1).toString() })}
                    className="px-6 py-3 border border-border rounded-full font-headline font-bold text-sm tracking-tight hover:bg-accent transition-all text-foreground"
                  >
                    ← Previous
                  </Link>
                )}
                <span className="px-4 py-2 text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={buildUrl({ page: (page + 1).toString() })}
                    className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-headline font-bold tracking-tight hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                  >
                    Load More Listings →
                  </Link>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
