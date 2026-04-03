"use client";

import { CheckCircle2, Circle, MapPin, Package, ShieldCheck, Truck } from "lucide-react";

const SHIPMENT_STEPS = [
  { key: "PREPARING", label: "Preparing", icon: Package },
  { key: "IN_TRANSIT", label: "In Transit", icon: Truck },
  { key: "CUSTOMS", label: "Customs", icon: ShieldCheck },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: Truck },
  { key: "DELIVERED", label: "Delivered", icon: CheckCircle2 },
] as const;

const SHIPMENT_STATUS_STYLE: Record<string, string> = {
  PREPARING: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/25",
  IN_TRANSIT: "text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/25",
  CUSTOMS: "text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/25",
  OUT_FOR_DELIVERY: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/25",
  DELIVERED: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
  RETURNED: "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/25",
};

function statusIndex(status: string | undefined) {
  if (!status) return -1;
  return SHIPMENT_STEPS.findIndex((s) => s.key === status);
}

function formatDate(value?: string | Date | null) {
  if (!value) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function ShipmentTrackingPanel({ shipment }: { shipment?: any | null }) {
  if (!shipment) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-white/[0.03] p-4">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Shipment not created yet</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Tracking details will appear here once dispatch is initialized.
        </p>
      </div>
    );
  }

  const currentIndex = statusIndex(shipment.status);
  const pct = currentIndex < 0 ? 0 : Math.max(8, (currentIndex / (SHIPMENT_STEPS.length - 1)) * 100);
  const badgeStyle = SHIPMENT_STATUS_STYLE[shipment.status] ?? "text-slate-600 dark:text-slate-300 bg-slate-500/10 border-slate-500/20";

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] p-4 space-y-4 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">Shipment Details</p>
          <p className="text-sm font-black text-slate-900 dark:text-white">{shipment.trackingNumber}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider w-fit ${badgeStyle}`}>
          <span className="size-1.5 rounded-full bg-current animate-pulse" />
          {String(shipment.status).replaceAll("_", " ")}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] p-3">
          <p className="uppercase tracking-widest text-slate-500 dark:text-slate-400 text-[10px] font-bold">Carrier</p>
          <p className="text-slate-900 dark:text-white font-semibold mt-1">{shipment.carrier || "Global Logistics"}</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] p-3">
          <p className="uppercase tracking-widest text-slate-500 dark:text-slate-400 text-[10px] font-bold">Estimated Delivery</p>
          <p className="text-slate-900 dark:text-white font-semibold mt-1">{formatDate(shipment.estimatedDelivery)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] p-3">
          <p className="uppercase tracking-widest text-slate-500 dark:text-slate-400 text-[10px] font-bold">Current Location</p>
          <p className="text-slate-900 dark:text-white font-semibold mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            {shipment.currentLocation || shipment.destination || "Updating"}
          </p>
        </div>
      </div>

      <div className="relative pt-2">
        <div className="absolute left-0 right-0 top-5 h-1 rounded-full bg-slate-200 dark:bg-slate-800" />
        <div
          className="absolute left-0 top-5 h-1 rounded-full bg-gradient-to-r from-primary to-cyan-500 transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
        <div className="absolute top-[14px] transition-all duration-700" style={{ left: `calc(${pct}% - 8px)` }}>
          <span className="block size-4 rounded-full bg-primary shadow-[0_0_12px_rgba(37,99,235,0.55)] animate-pulse" />
        </div>

        <div className="grid grid-cols-5 gap-2 pt-5">
          {SHIPMENT_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const done = idx <= currentIndex;
            return (
              <div key={step.key} className="text-center">
                <div className={`mx-auto size-7 rounded-full border flex items-center justify-center transition-all ${done ? "bg-primary/15 border-primary/40 text-primary" : "bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400"}`}>
                  {done ? <Icon className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                </div>
                <p className={`mt-1 text-[10px] font-bold uppercase tracking-wide ${done ? "text-slate-800 dark:text-slate-100" : "text-slate-500 dark:text-slate-500"}`}>
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {Array.isArray(shipment.statusHistory) && shipment.statusHistory.length > 0 && (
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] p-3">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold mb-2">Tracking Timeline</p>
          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
            {shipment.statusHistory.slice().reverse().map((entry: any, i: number) => (
              <div key={`${i}-${entry?.timestamp ?? entry?.status ?? "line"}`} className="flex items-start gap-2 text-xs">
                <span className="mt-1 size-1.5 rounded-full bg-primary/80" />
                <div>
                  <p className="text-slate-800 dark:text-slate-100 font-semibold">{String(entry?.status ?? "Update").replaceAll("_", " ")}</p>
                  <p className="text-slate-500 dark:text-slate-400">{entry?.location ?? "-"} · {formatDate(entry?.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
