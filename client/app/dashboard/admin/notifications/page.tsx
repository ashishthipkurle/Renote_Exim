"use client";

import { motion } from "framer-motion";
import {
  Bell,
  CheckCheck,
  Clock,
  FileText,
  HelpCircle,
  Ship,
  Truck,
} from "lucide-react";
import { toast } from "sonner";

import DashboardLayout from "@/app/dashboard/_components/DashboardLayout";
import { Button } from "@/components/ui/button";

type AlertItem = {
  id: string;
  type: "shipment" | "payment" | "documents";
  title: string;
  message: string;
  time: string;
  statusLabel: string;
};

const shipmentAlerts: AlertItem[] = [
  {
    id: "a1",
    type: "shipment",
    title: "Shipment #SH-8902 Arrived",
    message: "Cargo has arrived at destination port and is pending clearance.",
    time: "2 min ago",
    statusLabel: "Arrived",
  },
  {
    id: "a2",
    type: "shipment",
    title: "Shipment Delayed",
    message: "Port congestion detected. Updated ETA applied.",
    time: "2 hrs ago",
    statusLabel: "Delayed",
  },
  {
    id: "a3",
    type: "shipment",
    title: "Packed for Delivery",
    message: "Order packed and ready for pickup from origin warehouse.",
    time: "5 hrs ago",
    statusLabel: "Ready",
  },
];

const paymentAlerts: AlertItem[] = [
  {
    id: "p1",
    type: "payment",
    title: "Payment Action Needed",
    message: "Pending payment approval for Order #ORD-2023-11.",
    time: "1 hr ago",
    statusLabel: "Action",
  },
  {
    id: "p2",
    type: "payment",
    title: "Invoice Issued",
    message: "Invoice generated and sent to importer.",
    time: "8 hrs ago",
    statusLabel: "Issued",
  },
];

const docAlerts: AlertItem[] = [
  {
    id: "d1",
    type: "documents",
    title: "Compliance Doc Missing",
    message: "Certificate required for customs processing.",
    time: "30 min ago",
    statusLabel: "Missing",
  },
];

function AlertIcon({ type }: { type: AlertItem["type"] }) {
  if (type === "shipment") return <Truck className="h-5 w-5" />;
  if (type === "payment") return <Ship className="h-5 w-5" />;
  return <FileText className="h-5 w-5" />;
}

export default function AdminNotificationsPage() {
  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Notifications & Alerts</h1>
            <p className="text-sm text-muted-foreground">Shipments, payments, and compliance signals.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => toast.message("Filter UI-only in this pass")}
            >
              <Bell className="h-4 w-4" />
              Filter
            </Button>
            <Button
              onClick={() => toast.success("Marked all as read")}
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </Button>
            <Button variant="ghost" onClick={() => toast.message("Help coming soon")}
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Section title="Shipment updates" badge="3 new" items={shipmentAlerts} />
          <Section title="Payments" badge="1 action" items={paymentAlerts} />
          <Section title="Documents" badge="1 missing" items={docAlerts} />
        </div>
      </div>
    </DashboardLayout>
  );
}

function Section({
  title,
  badge,
  items,
}: {
  title: string;
  badge: string;
  items: AlertItem[];
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-black uppercase tracking-widest text-muted-foreground">
          {title}
        </div>
        <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-black text-muted-foreground">
          {badge}
        </span>
      </div>

      <div className="space-y-3">
        {items.map((a, idx) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
                  <AlertIcon type={a.type} />
                </div>
                <div>
                  <div className="text-sm font-black">{a.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {a.message}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                <Clock className="h-3.5 w-3.5" />
                {a.time}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="rounded-full bg-muted px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                {a.statusLabel}
              </span>
              <button
                type="button"
                className="text-xs font-black text-muted-foreground hover:text-primary transition-colors"
                onClick={() => toast.message("Details view not wired yet")}
              >
                View details →
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
