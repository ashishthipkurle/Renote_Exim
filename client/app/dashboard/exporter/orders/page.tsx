import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, ArrowRight, Clock, CheckCircle2, XCircle, Truck } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getServerAuth } from "@/lib/supabase/server";
import { Prisma } from "@prisma/client";
import OrdersTable from "./OrdersTable";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Package }> = {
  PENDING: { label: "Pending", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20", icon: Clock },
  CONFIRMED: { label: "Confirmed", color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: CheckCircle2 },
  PROCESSING: { label: "Processing", color: "text-purple-400 bg-purple-400/10 border-purple-400/20", icon: Package },
  SHIPPED: { label: "Shipped", color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20", icon: Truck },
  DELIVERED: { label: "Delivered", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", color: "text-red-400 bg-red-400/10 border-red-400/20", icon: XCircle },
};

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(d);
}

export default async function ExporterOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; search?: string; page?: string };
}) {
  const auth = await getServerAuth();
  if (!auth) redirect("/login");
  if (auth.role !== "EXPORTER" && auth.role !== "ADMIN") {
    redirect(`/dashboard/${auth.role.toLowerCase()}`);
  }

  const page = parseInt(searchParams.page || "1");
  const limit = 10;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: Prisma.OrderWhereInput = {
    product: { exporterId: auth.userId },
  };

  if (searchParams.status && searchParams.status !== "ALL") {
    where.status = searchParams.status as any;
  }

  if (searchParams.search) {
    where.OR = [
      { id: { contains: searchParams.search, mode: "insensitive" } },
      { product: { name: { contains: searchParams.search, mode: "insensitive" } } },
      { importer: { name: { contains: searchParams.search, mode: "insensitive" } } },
      { importer: { companyName: { contains: searchParams.search, mode: "insensitive" } } },
    ];
  }

  let orders: any[] = [];
  let total = 0;
  let statusCounts = {
    all: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
  };

  try {
    // Get orders with pagination
    [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          product: { select: { name: true, category: true, images: true } },
          importer: { select: { name: true, companyName: true, country: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    // Get specific status counts (unfiltered by search/status, but filtered by exporter)
    const baseWhere = { product: { exporterId: auth.userId } };
    const [allCount, pendingCount, procCount, shippedCount, delivCount] = await Promise.all([
      prisma.order.count({ where: baseWhere }),
      prisma.order.count({ where: { ...baseWhere, status: "PENDING" } }),
      prisma.order.count({ where: { ...baseWhere, status: { in: ["CONFIRMED", "PROCESSING"] } } }),
      prisma.order.count({ where: { ...baseWhere, status: "SHIPPED" } }),
      prisma.order.count({ where: { ...baseWhere, status: "DELIVERED" } }),
    ]);

    statusCounts = {
      all: allCount,
      pending: pendingCount,
      processing: procCount,
      shipped: shippedCount,
      delivered: delivCount,
    };
  } catch (e) {
    console.warn("Failed to fetch exporter orders:", e);
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="h-full overflow-hidden flex flex-col bg-gradient-to-br from-[#0a0c12] via-[#0d1017] to-[#0a0c12]">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">Orders</h1>
            <p className="text-slate-400 mt-1">
              Manage incoming orders from importers — {statusCounts.all} total
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar">
        <div className="max-w-[1600px] mx-auto space-y-8">
          <OrdersTable orders={orders} counts={statusCounts} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pb-12">
              <Link
                href={`?${new URLSearchParams({ ...searchParams, page: (page - 1).toString() })}`}
                className={`px-4 py-2 rounded-xl border border-white/5 text-xs font-bold transition-all ${page <= 1 ? "opacity-50 pointer-events-none" : "hover:bg-white/5"
                  }`}
              >
                Previous
              </Link>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const p = i + 1;
                  // Show only first, last, and pages around current
                  if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                    return (
                      <Link
                        key={p}
                        href={`?${new URLSearchParams({ ...searchParams, page: p.toString() })}`}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl border text-xs font-bold transition-all ${page === p ? "bg-primary border-primary text-white" : "border-white/5 hover:bg-white/5 text-slate-400"
                          }`}
                      >
                        {p}
                      </Link>
                    );
                  }
                  if (p === page - 2 || p === page + 2) {
                    return <span key={p} className="text-slate-600 px-1">...</span>;
                  }
                  return null;
                })}
              </div>
              <Link
                href={`?${new URLSearchParams({ ...searchParams, page: (page + 1).toString() })}`}
                className={`px-4 py-2 rounded-xl border border-white/5 text-xs font-bold transition-all ${page >= totalPages ? "opacity-50 pointer-events-none" : "hover:bg-white/5"
                  }`}
              >
                Next
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
