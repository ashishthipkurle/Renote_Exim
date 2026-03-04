import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

function formatMoney(amount: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { name: true } },
        importer: { select: { name: true, companyName: true } },
        shipment: { select: { trackingNumber: true, status: true } },
      },
    }),
    prisma.order.count(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">All Orders</h1>
            <p className="text-sm text-muted-foreground">Global order monitoring across the platform.</p>
          </div>
          <span className="text-sm text-muted-foreground">{total} total</span>
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-black uppercase tracking-widest text-[11px]">Order</th>
                  <th className="text-left px-4 py-3 font-black uppercase tracking-widest text-[11px]">Product</th>
                  <th className="text-left px-4 py-3 font-black uppercase tracking-widest text-[11px]">Importer</th>
                  <th className="text-right px-4 py-3 font-black uppercase tracking-widest text-[11px]">Total</th>
                  <th className="text-left px-4 py-3 font-black uppercase tracking-widest text-[11px]">Status</th>
                  <th className="text-left px-4 py-3 font-black uppercase tracking-widest text-[11px]">Shipment</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-border">
                    <td className="px-4 py-3 font-semibold">{o.orderNumber}</td>
                    <td className="px-4 py-3 text-muted-foreground">{o.product.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {o.importer.companyName || o.importer.name}
                    </td>
                    <td className="px-4 py-3 text-right font-bold">{formatMoney(o.totalPrice)}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {o.shipment ? `${o.shipment.trackingNumber} (${o.shipment.status})` : "—"}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td className="px-4 py-10 text-center text-muted-foreground" colSpan={6}>
                      No orders yet.
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
                    href={`/dashboard/admin/orders?page=${page - 1}`}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted transition-colors"
                  >
                    ← Previous
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/dashboard/admin/orders?page=${page + 1}`}
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
