import DashboardLayout from "@/app/dashboard/_components/DashboardLayout";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatMoney(amount: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { name: true } },
      importer: { select: { name: true, companyName: true } },
      shipment: { select: { trackingNumber: true, status: true } },
    },
  });

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">All Orders</h1>
          <p className="text-sm text-muted-foreground">Global order monitoring across the platform.</p>
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
        </div>
      </div>
    </DashboardLayout>
  );
}
