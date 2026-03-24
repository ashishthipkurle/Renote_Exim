import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, Clock, CheckCircle2, XCircle, Truck } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getServerAuth } from "@/lib/supabase/server";
import { Prisma } from "@prisma/client";
import OrdersTable from "./OrdersTable";

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
    <div className="h-full overflow-hidden flex flex-col bg-background">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground uppercase">Orders</h1>
            <p className="text-muted-foreground mt-1">
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
                className={`px-4 py-2 rounded-xl border border-border text-xs font-bold transition-all ${page <= 1 ? "opacity-50 pointer-events-none" : "hover:bg-muted"
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
                        className={`w-10 h-10 flex items-center justify-center rounded-xl border text-xs font-bold transition-all ${page === p ? "bg-primary border-primary text-white" : "border-border hover:bg-muted text-muted-foreground"
                          }`}
                      >
                        {p}
                      </Link>
                    );
                  }
                  if (p === page - 2 || p === page + 2) {
                    return <span key={p} className="text-muted-foreground/60 px-1">...</span>;
                  }
                  return null;
                })}
              </div>
              <Link
                href={`?${new URLSearchParams({ ...searchParams, page: (page + 1).toString() })}`}
                className={`px-4 py-2 rounded-xl border border-border text-xs font-bold transition-all ${page >= totalPages ? "opacity-50 pointer-events-none" : "hover:bg-muted"
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
