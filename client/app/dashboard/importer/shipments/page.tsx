import { redirect } from "next/navigation";
import { Truck, Archive, PackageCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getServerAuth } from "@/lib/supabase/server";
import ShipmentCard from "@/components/dashboard/ShipmentCard";

export const dynamic = 'force-dynamic';

export default async function ImporterShipmentsPage() {
  const auth = await getServerAuth();
  if (!auth) redirect("/login");

  if (auth.role !== "IMPORTER" && auth.role !== "ADMIN") {
    redirect(`/dashboard/${auth.role.toLowerCase()}`);
  }

  let shipments: any[] = [];
  try {
    shipments = await prisma.shipment.findMany({
      where: { order: { importerId: auth.userId } },
      include: {
        order: {
          include: {
            product: {
              select: { name: true, images: true, price: true },
              include: { exporter: { select: { name: true, companyName: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    console.warn("Shipment fetch error:", e);
  }

  const activeShipments = shipments.filter((s) =>
    ["PREPARING", "IN_TRANSIT", "CUSTOMS", "OUT_FOR_DELIVERY"].includes(s.status)
  );
  const deliveredShipments = shipments.filter((s) => s.status === "DELIVERED");

  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-slate-50 dark:bg-gradient-to-br dark:from-[#0a0c12] dark:via-[#0d1017] dark:to-[#0a0c12] transition-colors duration-300">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-transparent transition-colors duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              Global Logistics
              <div className="flex -space-x-2">
                <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                <div className="size-2 rounded-full bg-emerald-500/50" />
              </div>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time status of your inbound international shipments.</p>
          </div>

          <div className="flex gap-4">
            <div className="bg-slate-100 dark:bg-[#151c2a]/60 px-5 py-3 rounded-2xl border border-slate-200 dark:border-white/5 flex items-center gap-3">
              <Truck className="w-5 h-5 text-primary" />
              <div>
                <div className="text-[10px] font-black text-slate-500 uppercase">Active</div>
                <div className="text-sm font-black text-slate-900 dark:text-white">{activeShipments.length}</div>
              </div>
            </div>
            <div className="bg-slate-100 dark:bg-[#151c2a]/60 px-5 py-3 rounded-2xl border border-slate-200 dark:border-white/5 flex items-center gap-3">
              <PackageCheck className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              <div>
                <div className="text-[10px] font-black text-slate-500 uppercase">Received</div>
                <div className="text-sm font-black text-slate-900 dark:text-white">{deliveredShipments.length}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Active Shipments Section */}
          <div className="xl:col-span-8 space-y-6">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-primary" />
              In Transit Monitoring
            </h2>

            {activeShipments.length === 0 ? (
              <div className="bg-white dark:bg-[#151c2a]/40 backdrop-blur-xl border border-dashed border-slate-200 dark:border-white/10 rounded-3xl p-20 text-center shadow-sm dark:shadow-none">
                <Archive className="w-12 h-12 text-slate-400 dark:text-slate-700 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Active Shipments</h3>
                <p className="text-slate-600 dark:text-slate-500 text-sm">Your inbound logistics pipeline is currently empty.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeShipments.map((shipment) => (
                  <ShipmentCard key={shipment.id} shipment={shipment} />
                ))}
              </div>
            )}
          </div>

          {/* Delivered Archive */}
          <div className="xl:col-span-4 space-y-6">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-emerald-500" />
              Delivery History
            </h2>

            {deliveredShipments.length === 0 ? (
              <div className="bg-white dark:bg-[#151c2a]/40 border border-slate-200 dark:border-white/5 rounded-3xl p-8 text-center shadow-sm dark:shadow-none">
                <p className="text-slate-500 dark:text-slate-600 text-xs font-bold uppercase tracking-widest">Archive Empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {deliveredShipments.map((s) => (
                  <div
                    key={s.id}
                    className="group bg-white dark:bg-[#151c2a]/60 backdrop-blur-md border border-slate-200 dark:border-white/5 hover:border-emerald-500/50 dark:hover:border-emerald-500/20 transition-all rounded-2xl p-4 flex items-center justify-between shadow-sm dark:shadow-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                        <PackageCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-mono font-black text-slate-900 dark:text-white uppercase">{s.trackingNumber}</div>
                        <div className="text-[10px] text-slate-500 font-bold truncate max-w-[150px]">{s.order.product.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-600 dark:text-emerald-400 font-black text-[10px] uppercase tracking-widest leading-none">Delivered</div>
                      <div className="text-slate-500 dark:text-slate-600 text-[10px] font-bold mt-1">
                        {s.actualArrival ? new Date(s.actualArrival).toLocaleDateString() : "Historical"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
