export const dynamic = 'force-dynamic';
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Package, TrendingUp, BarChart2, Globe, ArrowRight, ArrowLeft, Layers, ShieldCheck, ShoppingCart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getServerAuthContext } from "@/lib/auth-server";
import { Prisma } from "@prisma/client";
import InventoryTable from "./InventoryTable";

const CATEGORY_MAP: Record<string, string> = {
  'CHEMICALS': 'Chemicals',
  'MACHINES': 'Machines',
  'TEXTILES': 'Textiles',
  'MEDICAL': 'Medical',
  'ELECTRONICS': 'Electronics',
  'AGRICULTURE': 'Agri',
  'CONSTRUCTION': 'Construction',
  'HANDICRAFTS': 'Handicrafts',
  'FOOD': 'Food',
  'AUTOMOTIVE': 'Automotive',
  'COSMETICS': 'Cosmetics',
  'PLASTICS': 'Plastics',
  'ENERGY': 'Energy',
  'LOGISTICS': 'Logistics',
  'PACKAGING': 'Packaging',
  'METALS': 'Metals',
  'LEATHER': 'Leather',
  'FURNITURE': 'Furniture',
  'TOYS': 'Toys',
  'SPORTS': 'Sports',
  'OTHER': 'Other',
};

function formatNumber(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(n);
}

export default async function ExporterInventoryPage({
  searchParams,
}: {
  searchParams: { search?: string; category?: string; status?: string; page?: string };
}) {
  const auth = await getServerAuthContext();
  if (!auth) redirect("/login");
  if (auth.role !== "EXPORTER" && auth.role !== "ADMIN") {
    redirect(`/dashboard/${auth.role.toLowerCase()}`);
  }

  const page = parseInt(searchParams.page || "1");
  const limit = 10;
  const skip = (page - 1) * limit;

  // Build where clause based on searchParams
  const where: Prisma.ProductWhereInput = { exporterId: auth.userId };

  if (searchParams.search) {
    where.OR = [
      { name: { contains: searchParams.search, mode: "insensitive" } },
      { description: { contains: searchParams.search, mode: "insensitive" } },
    ];
  }

  if (searchParams.category) {
    const prismaCat = CATEGORY_MAP[searchParams.category] || searchParams.category;
    where.category = prismaCat as any;
  }

  if (searchParams.status === "ACTIVE") {
    where.available = true;
  } else if (searchParams.status === "INACTIVE") {
    where.available = false;
  }

  let products: any[] = [];
  let total = 0;
  let categoriesData: Array<{ name: string; productCount: number; revenue: number }> = [];

  try {
    [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    // Fetch Category Stats
    const rawCategories = await prisma.product.groupBy({
      by: ['category'],
      where: { exporterId: auth.userId },
      _count: { id: true },
    });

    // We can't easily join in groupBy in Prisma, so we'll fetch revenue separately or keep it simple
    categoriesData = rawCategories.map((c: any) => ({
      name: c.category,
      productCount: c._count.id,
      revenue: 0, // Simplified for now to avoid complex raw queries in this redesign pass
    }));

  } catch (e) {
    console.warn("Failed to fetch inventory data:", e);
  }

  // Get total stats (ignoring filters for the summary cards)
  let totalListed = 0;
  let totalAvailable = 0;
  let totalValue = 0;

  try {
    const allProducts = await prisma.product.findMany({
      where: { exporterId: auth.userId },
      select: { available: true, price: true, minOrderQty: true },
    });
    totalListed = allProducts.length;
    totalAvailable = allProducts.filter((p: any) => p.available).length;
    totalValue = allProducts.reduce((acc: number, p: any) => acc + p.price * (p.minOrderQty ?? 1), 0);
  } catch (e) {
    console.warn("Failed to fetch summary stats:", e);
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Unified Content Area */}
      <div className="px-8 py-12 lg:px-12 space-y-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Inventory Management</h1>
            <p className="text-slate-500 text-lg mt-2 max-w-2xl">
              Manage your product listings, stock levels, and marketplace presence from a single dashboard.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/exporter/inventory/add"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold text-sm py-3.5 px-8 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Add New Product
            </Link>
          </div>
        </header>

        {/* Stats Cards */}
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Total Products", value: String(totalListed), icon: Package, color: "text-blue-500", bg: "bg-blue-50" },
            { label: "Active Listings", value: String(totalAvailable), icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50" },
            { label: "Inventory Value", value: formatMoney(totalValue), icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-50" },
          ].map((s) => (
            <div key={s.label} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-6">
              <div className={`w-14 h-14 ${s.bg} dark:bg-white/5 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon className="w-7 h-7" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{s.label}</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Product Catalog
            </h2>
          </div>

          <InventoryTable
            products={products}
            availableCategories={categoriesData.map(c => c.name)}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-12 pb-10">
              <Link
                href={`?${new URLSearchParams({ ...searchParams, page: (page - 1).toString() })}`}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 text-sm font-medium transition-all ${
                  page <= 1 ? "opacity-30 pointer-events-none" : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200"
                }`}
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </Link>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const p = i + 1;
                  if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                    return (
                      <Link
                        key={p}
                        href={`?${new URLSearchParams({ ...searchParams, page: p.toString() })}`}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg border text-sm font-bold transition-all ${
                          page === p
                            ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-110"
                            : "border-slate-200 dark:border-white/10 text-slate-500 hover:border-primary/50 hover:text-primary"
                        }`}
                      >
                        {p}
                      </Link>
                    );
                  }
                  if (p === page - 2 || p === page + 2) {
                    return <span key={p} className="text-slate-300 px-1">...</span>;
                  }
                  return null;
                })}
              </div>

              <Link
                href={`?${new URLSearchParams({ ...searchParams, page: (page + 1).toString() })}`}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 text-sm font-medium transition-all ${
                  page >= totalPages ? "opacity-30 pointer-events-none" : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200"
                }`}
              >
                Next <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
