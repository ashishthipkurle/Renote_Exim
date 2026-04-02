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
    <div className="h-dvh overflow-hidden flex flex-col bg-background transition-colors duration-300">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-border bg-background backdrop-blur-xl z-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3 uppercase italic">
              Global Logistics
              <div className="flex -space-x-2">
                <div className="size-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(212,175,55,0.4)]" />
              </div>
            </h1>
            <p className="text-muted-foreground mt-1 font-black text-[10px] uppercase tracking-widest leading-none">Inbound Intelligence Node | Asset Tracking</p>
          </div>

          <div className="flex gap-4">
            <div className="bg-muted px-5 py-3 rounded-2xl border border-border flex items-center gap-3">
              <Truck className="w-5 h-5 text-foreground" />
              <div>
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active</div>
                <div className="text-sm font-black text-foreground leading-none mt-0.5">{activeShipments.length}</div>
              </div>
            </div>
            <div className="bg-muted px-5 py-3 rounded-2xl border border-border flex items-center gap-3">
              <PackageCheck className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Received</div>
                <div className="text-sm font-black text-foreground leading-none mt-0.5">{deliveredShipments.length}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Active Shipments Section */}
          <div className="xl:col-span-8 space-y-6 text-foreground">
            <h2 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2 italic">
              <div className="size-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(212,175,55,0.4)]" />
              Intelligence Node Monitoring
            </h2>

            {activeShipments.length === 0 ? (
              <div className="bg-muted/40 backdrop-blur-xl border border-dashed border-border rounded-3xl p-20 text-center shadow-xl">
                <Archive className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                <h3 className="text-lg font-black text-foreground uppercase italic tracking-tighter mb-1 leading-none">Node Sync Latency</h3>
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mt-2">Your inbound logistics pipeline is currently vacant.</p>
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
            <h2 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2 italic">
              <div className="size-1.5 rounded-full bg-neutral-500" />
              Archived Logs
            </h2>

            {deliveredShipments.length === 0 ? (
              <div className="bg-muted border border-border rounded-3xl p-8 text-center shadow-xl">
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Historical Logs Vacant</p>
              </div>
            ) : (
              <div className="space-y-4">
                {deliveredShipments.map((s) => (
                  <div
                    key={s.id}
                    className="group bg-muted/40 backdrop-blur-md border border-border hover:border-border transition-all rounded-2xl p-4 flex items-center justify-between shadow-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-muted/20 flex items-center justify-center text-foreground group-hover:scale-110 transition-transform">
                        <PackageCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-foreground uppercase italic tracking-tighter leading-none">{s.trackingNumber}</div>
                        <div className="text-[8px] text-muted-foreground font-black uppercase tracking-widest mt-1 truncate max-w-[150px]">{s.order.product.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-foreground font-black text-[9px] uppercase tracking-[0.2em] leading-none mb-1">Delivered</div>
                      <div className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">
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
