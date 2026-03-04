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

export default async function ExporterShipmentsPage() {
  const auth = await getServerAuth();
  if (!auth) redirect("/login");
  if (auth.role !== "EXPORTER" && auth.role !== "ADMIN") {
    redirect(`/dashboard/${auth.role.toLowerCase()}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let shipments: any[] = [];
  try {
    shipments = await prisma.shipment.findMany({
      where: { order: { product: { exporterId: auth.userId } } },
      include: {
        order: {
          include: {
            product: { select: { name: true } },
            importer: { select: { name: true, companyName: true, country: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  } catch (e) {
    console.warn("Failed to fetch exporter shipments (DB may be unavailable):", e);
  }

  const activeCount = shipments.filter((s) =>
    ["PREPARING", "IN_TRANSIT", "CUSTOMS", "OUT_FOR_DELIVERY"].includes(s.status)
  ).length;
  const deliveredCount = shipments.filter((s) => s.status === "DELIVERED").length;

  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-gradient-to-br from-[#0a0c12] via-[#0d1017] to-[#0a0c12]">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Shipment Tracking</h1>
            <p className="text-slate-400 mt-1">
              {shipments.length} shipments — {activeCount} active, {deliveredCount} delivered
            </p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-xs font-bold">
              {activeCount} Active
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-xs font-bold">
              {deliveredCount} Delivered
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto space-y-4">
          {shipments.length === 0 ? (
            <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-12 text-center">
              <Truck className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">No shipments yet</h2>
              <p className="text-slate-400 text-sm">
                Shipments will appear here once orders are fulfilled.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden lg:grid grid-cols-12 gap-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <div className="col-span-3">Tracking / Product</div>
                <div className="col-span-2">Buyer</div>
                <div className="col-span-2">Carrier</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1">ETA</div>
                <div className="col-span-2 text-right">Created</div>
              </div>

              {shipments.map((shipment) => {
                const cfg = SHIPMENT_STATUS[shipment.status] ?? SHIPMENT_STATUS.PREPARING;
                return (
                  <div
                    key={shipment.id}
                    className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 hover:border-primary/30 transition-colors shadow-xl rounded-2xl p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center"
                  >
                    <div className="lg:col-span-3">
                      <div className="text-sm font-bold text-white font-mono">
                        {shipment.trackingNumber}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {shipment.order.product.name}
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                      <div className="text-sm text-slate-300">
                        {shipment.order.importer.companyName || shipment.order.importer.name}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {shipment.order.importer.country ?? "N/A"}
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                      <div className="text-sm text-slate-300">{shipment.carrier ?? "—"}</div>
                    </div>

                    <div className="lg:col-span-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide ${cfg.color}`}>
                        <span className="size-1.5 rounded-full bg-current" />
                        {cfg.label}
                      </span>
                    </div>

                    <div className="lg:col-span-1">
                      <div className="text-sm text-slate-300">
                        {shipment.estimatedArrival
                          ? formatDate(shipment.estimatedArrival)
                          : "TBD"}
                      </div>
                    </div>

                    <div className="lg:col-span-2 text-right">
                      <div className="text-sm text-slate-400">{formatDate(shipment.createdAt)}</div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
