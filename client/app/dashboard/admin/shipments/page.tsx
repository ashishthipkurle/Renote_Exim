"use client";

import { motion } from "framer-motion";
import { MapPin, Navigation, Search, Truck } from "lucide-react";

import DashboardLayout from "@/app/dashboard/_components/DashboardLayout";

const routes = [
  {
    id: "SH-8902",
    origin: "Shanghai",
    destination: "Los Angeles",
    status: "CUSTOMS",
    eta: "Nov 14",
  },
  {
    id: "SH-1147",
    origin: "Mumbai",
    destination: "Rotterdam",
    status: "IN_TRANSIT",
    eta: "Nov 19",
  },
  {
    id: "SH-2201",
    origin: "Hamburg",
    destination: "Dubai",
    status: "DELAYED",
    eta: "Nov 22",
  },
];

export default function AdminShipmentsPage() {
  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Live Shipment Routes</h1>
            <p className="text-sm text-muted-foreground">Monitor routes, ETAs, and exceptions.</p>
          </div>
          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring/20"
              placeholder="Search shipment ID, port..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-7 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-black">Route map</div>
                <div className="text-sm text-muted-foreground">Map visualization placeholder.</div>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
                <Navigation className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6 h-[360px] rounded-xl border border-border bg-muted/40 grid place-items-center text-sm text-muted-foreground">
              Replace with a real map (Mapbox/Leaflet) when ready.
            </div>
          </div>

          <div className="xl:col-span-5 space-y-4">
            {routes.map((r, idx) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                      Shipment {r.id}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm font-black">
                      <MapPin className="h-4 w-4 text-primary" />
                      {r.origin} → {r.destination}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">ETA {r.eta}</div>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
                    <Truck className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4 flex items-center justify-between">
                  <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">Status</div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                    {r.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
