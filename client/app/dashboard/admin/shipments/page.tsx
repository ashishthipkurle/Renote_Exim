import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

function statusColor(status: string) {
  switch (status) {
    case "IN_TRANSIT":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
    case "CUSTOMS":
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
    case "DELIVERED":
      return "bg-green-500/10 text-green-700 dark:text-green-400";
    case "DELAYED":
      return "bg-red-500/10 text-red-700 dark:text-red-400";
    default:
      return "bg-primary/10 text-primary";
  }
}

export default async function AdminShipmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);

  const [shipments, total] = await Promise.all([
    prisma.shipment.findMany({
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: {
        order: {
          select: {
            orderNumber: true,
            product: { select: { name: true } },
            importer: { select: { name: true, companyName: true } },
          },
        },
      },
    }),
    prisma.shipment.count(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">All Shipments</h1>
          <p className="text-sm text-muted-foreground">Track all shipments across the platform.</p>
        </div>
        <span className="text-sm text-muted-foreground">{total} total</span>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-black uppercase tracking-widest text-[11px]">Tracking</th>
                <th className="text-left px-4 py-3 font-black uppercase tracking-widest text-[11px]">Order</th>
                <th className="text-left px-4 py-3 font-black uppercase tracking-widest text-[11px]">Product</th>
                <th className="text-left px-4 py-3 font-black uppercase tracking-widest text-[11px]">Carrier</th>
                <th className="text-left px-4 py-3 font-black uppercase tracking-widest text-[11px]">Route</th>
                <th className="text-left px-4 py-3 font-black uppercase tracking-widest text-[11px]">ETA</th>
                <th className="text-left px-4 py-3 font-black uppercase tracking-widest text-[11px]">Status</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="px-4 py-3 font-semibold font-mono text-xs">{s.trackingNumber}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.order.orderNumber}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.order.product.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.carrier || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {s.origin && s.destination ? `${s.origin} → ${s.destination}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {s.estimatedDelivery
                      ? new Date(s.estimatedDelivery).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest " +
                        statusColor(s.status)
                      }
                    >
                      {s.status.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              ))}
              {shipments.length === 0 && (
                <tr>
                  <td className="px-4 py-10 text-center text-muted-foreground" colSpan={7}>
                    No shipments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
            <span className="text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/dashboard/admin/shipments?page=${page - 1}`}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted transition-colors"
                >
                  ← Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/dashboard/admin/shipments?page=${page + 1}`}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted transition-colors"
                >
                  Next →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
