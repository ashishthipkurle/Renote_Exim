import { redirect } from "next/navigation";
import { Truck, MapPin } from "lucide-react";

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

export default async function ImporterShipmentsPage() {
  const auth = await getServerAuth();
  if (!auth) redirect("/login");
  if (auth.role !== "IMPORTER" && auth.role !== "ADMIN") {
    redirect(`/dashboard/${auth.role.toLowerCase()}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let shipments: any[] = [];
  try {
    shipments = await prisma.shipment.findMany({
      where: { order: { importerId: auth.userId } },
      include: {
        order: {
          include: {
            product: {
              select: { name: true },
              include: { exporter: { select: { name: true, companyName: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  } catch (e) {
    console.warn("Failed to fetch shipments (DB may be unavailable):", e);
  }

  const activeShipments = shipments.filter((s) =>
    ["PREPARING", "IN_TRANSIT", "CUSTOMS", "OUT_FOR_DELIVERY"].includes(s.status)
  );
  const deliveredShipments = shipments.filter((s) => s.status === "DELIVERED");

  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-gradient-to-br from-[#0a0c12] via-[#0d1017] to-[#0a0c12]">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Order Tracking</h1>
            <p className="text-slate-400 mt-1">
              Track your shipments — {activeShipments.length} active, {deliveredShipments.length} delivered
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Active shipments */}
          <section className="xl:col-span-7 space-y-4">
            <h2 className="text-lg font-bold text-white">Active Shipments</h2>
            {activeShipments.length === 0 ? (
              <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-8 text-center">
                <Truck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No active shipments</p>
              </div>
            ) : (
              activeShipments.map((shipment) => {
                const cfg = SHIPMENT_STATUS[shipment.status] ?? SHIPMENT_STATUS.PREPARING;
                const steps = ["Order Processed", "In Transit", "Customs Clearance", "Final Delivery"];
                const activeStep =
                  shipment.status === "PREPARING" ? 0
                  : shipment.status === "IN_TRANSIT" ? 1
                  : shipment.status === "CUSTOMS" ? 2
                  : 3;

                return (
                  <div
                    key={shipment.id}
                    className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl overflow-hidden"
                  >
                    <div className="p-6 border-b border-white/10 flex items-center justify-between">
                      <div>
                        <div className="text-white font-bold tracking-tight font-mono">
                          {shipment.trackingNumber}
                        </div>
                        <div className="text-slate-400 text-xs mt-1">
                          {shipment.order.product.name} —{" "}
                          {shipment.order.product.exporter.companyName || shipment.order.product.exporter.name}
                        </div>
                      </div>
                      <span className={`px-3 py-1.5 rounded-full border text-xs font-bold ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                        <span>Carrier: {shipment.carrier ?? "TBD"}</span>
                        <span>
                          ETA: {shipment.estimatedArrival ? formatDate(shipment.estimatedArrival) : "TBD"}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {steps.map((step, idx) => (
                          <div
                            key={step}
                            className={
                              "rounded-xl border border-white/10 px-4 py-3 flex items-center justify-between " +
                              (idx > activeStep ? "opacity-40 bg-transparent" : "bg-white/5")
                            }
                          >
                            <div className="text-white font-semibold text-sm">{step}</div>
                            <div className="text-xs text-slate-400">
                              {idx < activeStep ? "Completed" : idx === activeStep ? "Current" : "Pending"}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all"
                          style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </section>

          {/* Delivered shipments archive */}
          <section className="xl:col-span-5 space-y-4">
            <h2 className="text-lg font-bold text-white">Delivered</h2>
            {deliveredShipments.length === 0 ? (
              <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-8 text-center">
                <p className="text-slate-400 text-sm">No delivered shipments yet</p>
              </div>
            ) : (
              <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6 space-y-3">
                {deliveredShipments.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-white text-sm font-bold font-mono">{s.trackingNumber}</div>
                      <div className="text-slate-400 text-xs">{s.order.product.name}</div>
                    </div>
                    <div className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400">
                      DELIVERED
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
