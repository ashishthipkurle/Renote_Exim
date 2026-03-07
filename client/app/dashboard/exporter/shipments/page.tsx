import { redirect } from "next/navigation";
import { Truck, Package, MapPin, Clock, CheckCircle2 } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getServerAuth } from "@/lib/supabase/server";

const SHIPMENT_STATUS: Record<string, { label: string; color: string }> = {
  PREPARING: { label: "Preparing", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" },
  IN_TRANSIT: { label: "In Transit", color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20" },
  CUSTOMS: { label: "Customs", color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  DELIVERED: { label: "Delivered", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  RETURNED: { label: "Returned", color: "text-red-400 bg-red-400/10 border-red-400/20" },
};

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(d);
}

import Link from "next/link";
import { Prisma } from "@prisma/client";
import ShipmentsTable from "./ShipmentsTable";

export default async function ExporterShipmentsPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
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
  const where: Prisma.ShipmentWhereInput = {
    order: { product: { exporterId: auth.userId } },
  };

  if (searchParams.search) {
    where.OR = [
      { trackingNumber: { contains: searchParams.search, mode: "insensitive" } },
      { carrier: { contains: searchParams.search, mode: "insensitive" } },
      { order: { product: { name: { contains: searchParams.search, mode: "insensitive" } } } },
      { order: { importer: { name: { contains: searchParams.search, mode: "insensitive" } } } },
      { order: { importer: { companyName: { contains: searchParams.search, mode: "insensitive" } } } },
    ];
  }

  let shipments: any[] = [];
  let total = 0;
  let activeCount = 0;
  let deliveredCount = 0;

  try {
    [shipments, total] = await Promise.all([
      prisma.shipment.findMany({
        where,
        include: {
          order: {
            include: {
              product: { select: { name: true } },
              importer: { select: { name: true, companyName: true, country: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.shipment.count({ where }),
    ]);

    // Summary stats (unfiltered by search, but filtered by exporter)
    const baseWhere = { order: { product: { exporterId: auth.userId } } };
    [activeCount, deliveredCount] = await Promise.all([
      prisma.shipment.count({
        where: {
          ...baseWhere,
          status: { in: ["PREPARING", "IN_TRANSIT", "CUSTOMS", "OUT_FOR_DELIVERY"] },
        },
      }),
      prisma.shipment.count({
        where: { ...baseWhere, status: "DELIVERED" },
      }),
    ]);
  } catch (e) {
    console.warn("Failed to fetch exporter shipments:", e);
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="h-full overflow-hidden flex flex-col bg-gradient-to-br from-[#0a0c12] via-[#0d1017] to-[#0a0c12]">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">Shipment Tracking</h1>
            <p className="text-slate-400 mt-1">
              {total} shipments found — {activeCount} active, {deliveredCount} delivered
            </p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-xs font-bold uppercase">
              {activeCount} Active
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-xs font-bold uppercase">
              {deliveredCount} Delivered
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar">
        <div className="max-w-[1600px] mx-auto space-y-8">
          <ShipmentsTable shipments={shipments} />

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
