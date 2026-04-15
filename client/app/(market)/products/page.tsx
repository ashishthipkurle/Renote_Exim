import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { ProductCategory } from "@/lib/types";
import EmptyState from "@/components/ui/EmptyState";
import ImporterSidebar from "@/components/importer/ImporterSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardScaler } from "@/components/dashboard/DashboardScaler";
import PageTransition from "@/components/ui/PageTransition";
import { getServerAuthContext } from "@/lib/auth-server";

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
  const start = Date.now();
  console.log("[Products Page] Starting render at:", new Date(start).toLocaleTimeString());

  const categoryParam = typeof resolvedParams.category === "string" ? resolvedParams.category : undefined;
  const searchQuery = typeof resolvedParams.search === "string" ? resolvedParams.search : undefined;
  const originParam = typeof resolvedParams.origin === "string" ? resolvedParams.origin : undefined;
  const minPriceParam = typeof resolvedParams.minPrice === "string" ? parseFloat(resolvedParams.minPrice) : undefined;
  const maxPriceParam = typeof resolvedParams.maxPrice === "string" ? parseFloat(resolvedParams.maxPrice) : undefined;
  const sortParam = typeof resolvedParams.sort === "string" ? resolvedParams.sort : "newest";
  const page = typeof resolvedParams.page === "string" ? Math.max(1, parseInt(resolvedParams.page)) : 1;
  const limit = 30;

  const auth = await getServerAuthContext();
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
    stockQty: number;
    exporter: { name: string | null; businessName: string | null; country: string | null };
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
          stockQty: true,
          exporter: { select: { name: true, businessName: true, country: true } },
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
    console.error("Failed to fetch products from Prisma:", error);
    products = [];
  }

  const end = Date.now();
  console.log(`[Products Page] Rendered ${products.length} products in ${end - start}ms`);

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
    <SidebarProvider>
      <DashboardScaler targetWidth={1440}>
        <div className="flex flex-col h-full w-full bg-board transition-colors duration-300 overflow-hidden border border-slate-200 dark:border-white/5 shadow-2xl">
          <DashboardHeader />

          <div className="flex flex-1 overflow-hidden relative border-t border-slate-200 dark:border-white/5">
            <ImporterSidebar basePath="/dashboard/importer">
              {/* Marketplace Categories integrated into Sidebar */}
              <div className="flex flex-col py-4 space-y-2">
                <div className="px-4 mb-4">
                  <h3 className="font-headline font-semibold text-[10px] uppercase tracking-wider text-muted-foreground">Market Verticals</h3>
                </div>
                
                <Link
                  href={buildUrl({ category: undefined, page: undefined })}
                  className={`flex items-center px-4 py-2 rounded-lg transition-all group ${!categoryParam ? "bg-primary/5 text-primary font-bold shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-primary"}`}
                >
                  <span className="material-symbols-outlined mr-3 text-[20px]">auto_awesome</span>
                  <span className="font-headline font-semibold text-sm uppercase tracking-tight">New Arrivals</span>
                </Link>

                {ALL_CATEGORIES.map((cat) => {
                  const isActive = categoryParam === cat.value;
                  return (
                    <Link
                      key={cat.value}
                      href={buildUrl({ category: isActive ? undefined : cat.value, page: undefined })}
                      className={`flex items-center px-4 py-2 rounded-lg transition-all group ${isActive ? "bg-primary/5 text-primary font-bold shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
                    >
                      <span className="material-symbols-outlined mr-3 text-[20px]">{iconMap[cat.value] || "category"}</span>
                      <span className="font-headline font-semibold text-sm uppercase tracking-tight">{cat.label}</span>
                    </Link>
                  );
                })}
              </div>
            </ImporterSidebar>
            
            <SidebarInset className="overflow-hidden">
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-surface h-[calc(100vh-80px)]">
                <PageTransition>
                  {/* Editorial Header Section */}
                  <div className="w-full px-8 py-8">
                  

                    {/* ─── Product Grid ─── */}
                    <div className="">
                      {products.length === 0 ? (
                        <div className="py-20 text-center">
                          <EmptyState
                            iconName="searchX"
                            title="No Listings Found"
                            description="We couldn't find any products matching your current filters. Try broadening your search or clearing filters."
                            actionLabel="Clear all filters"
                            href="/products"
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                          {products.map((product) => {
                            const image = product.images?.[0] ?? null;
                            const isInStock = product.stockQty > 0;

                            return (
                              <div key={product.id} className="group">
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
                                        <h2 className="text-base font-headline font-bold mt-1 text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors uppercase tracking-tight">
                                          {product.name}
                                        </h2>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-lg font-headline font-bold text-foreground">{formatMoney(product.price)}</p>
                                        <p className="text-[10px] font-label text-muted-foreground uppercase tracking-widest">/ Unit</p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                      <span className="text-xs font-medium">
                                        Verified Exporter: {product.exporter?.businessName || product.exporter?.name || "Partner"}
                                      </span>
                                    </div>

                                    <div className="pt-4 flex items-center justify-between border-t border-border">
                                      <span className="text-primary font-headline font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                                        View Details
                                        <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
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
                        <div className="flex justify-center gap-2 mt-20">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <Link
                              key={p}
                              href={buildUrl({ page: p })}
                              className={`w-12 h-12 rounded-full flex items-center justify-center font-headline font-bold transition-all ${p === page ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-accent text-muted-foreground"}`}
                            >
                              {p}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </PageTransition>
              </div>
            </SidebarInset>
          </div>
        </div>
      </DashboardScaler>
    </SidebarProvider>
  );
}
