const fs = require('fs');

const path = 'app/(market)/products/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add imports
const newImports = `
import ImporterSidebar from "@/components/importer/ImporterSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardScaler } from "@/components/dashboard/DashboardScaler";
import PageTransition from "@/components/ui/PageTransition";
`;

if (!content.includes('ImporterSidebar')) {
    content = content.replace(/import EmptyState from "@\/components\/ui\/EmptyState";/, `import EmptyState from "@/components/ui/EmptyState";\n${newImports}`);
}

// 2. Identify the content we want to wrap.
// We want to keep all the fetching logic at the top.
// The return statement starts around line 164.

const startOfReturn = content.indexOf('<div className="bg-surface');
const endOfFile = content.lastIndexOf(');');

if (startOfReturn === -1) {
    console.error("Could not find start of return statement");
    process.exit(1);
}

// Extract the inner content and refactor it
// We need to remove the old <aside> and wrap the rest in the dashboard layout.
// The main content area was <main className="flex-1 lg:ml-64 px-8 md:px-16 py-12 bg-surface">

const newReturn = `
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
                  className={\`flex items-center px-4 py-2.5 rounded-xl transition-all group \${!categoryParam ? "bg-primary/10 text-primary font-bold border border-primary/20" : "text-slate-500 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/5 hover:text-primary"}\`}
                >
                  <span className="material-symbols-outlined mr-3 text-lg">auto_awesome</span>
                  <span className="font-headline font-semibold text-xs tracking-tight uppercase">New Arrivals</span>
                </Link>

                {ALL_CATEGORIES.map((cat) => {
                  const isActive = categoryParam === cat.value;
                  return (
                    <Link
                      key={cat.value}
                      href={buildUrl({ category: isActive ? undefined : cat.value, page: undefined })}
                      className={\`flex items-center px-4 py-2.5 rounded-xl transition-all group \${isActive ? "bg-primary/10 text-primary font-bold border border-primary/20" : "text-slate-500 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/5 hover:text-primary"}\`}
                    >
                      <span className="material-symbols-outlined mr-3 text-lg">{iconMap[cat.value] || "category"}</span>
                      <span className="font-headline font-semibold text-xs tracking-tight uppercase">{cat.label}</span>
                    </Link>
                  );
                })}
              </div>
            </ImporterSidebar>
            
            <SidebarInset>
              <div className="flex-1 overflow-auto custom-scrollbar bg-surface min-h-screen">
                <PageTransition>
                  {/* Editorial Header Section */}
                  <div className="max-w-screen-xl mx-auto px-8 md:px-16 py-12">
                    <div className="mb-20">
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
                                <Link href={\`/products/\${product.id}\`} className="block">
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
                              className={\`w-12 h-12 rounded-full flex items-center justify-center font-headline font-bold transition-all \${p === page ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-accent text-muted-foreground"}\`}
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
`;

const finalContent = content.substring(0, startOfReturn) + newReturn;
fs.writeFileSync(path, finalContent);
console.log("Successfully unified Marketplace layout with Dashboard components.");
