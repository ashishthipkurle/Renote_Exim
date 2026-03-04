import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, Clock, CheckCircle2, XCircle, Truck, ShoppingCart } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getServerAuth } from "@/lib/supabase/server";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Package }> = {
  PENDING: { label: "Pending", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20", icon: Clock },
  CONFIRMED: { label: "Confirmed", color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: CheckCircle2 },
  PROCESSING: { label: "Processing", color: "text-purple-400 bg-purple-400/10 border-purple-400/20", icon: Package },
  SHIPPED: { label: "Shipped", color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20", icon: Truck },
  DELIVERED: { label: "Delivered", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", color: "text-red-400 bg-red-400/10 border-red-400/20", icon: XCircle },
};

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(d);
}

export default async function ImporterOrdersPage() {
  const auth = await getServerAuth();
  if (!auth) redirect("/login");
  if (auth.role !== "IMPORTER" && auth.role !== "ADMIN") {
    redirect(`/dashboard/${auth.role.toLowerCase()}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orders: any[] = [];
  try {
    orders = await prisma.order.findMany({
      where: { importerId: auth.userId },
      include: {
        product: {
          select: { name: true, category: true, images: true },
          include: { exporter: { select: { name: true, companyName: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  } catch (e) {
    console.warn("Failed to fetch orders (DB may be unavailable):", e);
  }

  const totalSpent = orders
    .filter((o) => o.paymentStatus === "PAID" || o.paymentStatus === "PARTIAL")
    .reduce((acc, o) => acc + o.totalPrice, 0);

  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-gradient-to-br from-[#0a0c12] via-[#0d1017] to-[#0a0c12]">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">My Orders</h1>
            <p className="text-slate-400 mt-1">
              {orders.length} orders · {formatMoney(totalSpent)} total spent
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-primary hover:bg-[#0f49bd] text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-primary/20 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            Browse Products
          </Link>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto space-y-4">
          {orders.length === 0 ? (
            <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-12 text-center">
              <ShoppingCart className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">No orders yet</h2>
              <p className="text-slate-400 text-sm mb-4">
                Browse the marketplace and place your first order.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-primary hover:bg-[#0f49bd] text-white font-bold py-2 px-4 rounded-xl text-sm"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <>
              <div className="hidden lg:grid grid-cols-12 gap-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <div className="col-span-4">Product &amp; Seller</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2 text-right">Tracking</div>
              </div>

              {orders.map((order) => {
                const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
                const StatusIcon = cfg.icon;
                return (
                  <div
                    key={order.id}
                    className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 hover:border-primary/30 transition-colors shadow-xl rounded-2xl p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center"
                  >
                    <div className="lg:col-span-4 flex items-center gap-4">
                      <div className="size-12 rounded-xl bg-slate-800 border border-white/5 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {order.product.images?.[0] ? (
                          <img src={order.product.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-5 h-5 text-slate-500" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{order.product.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          by {order.product.exporter.companyName || order.product.exporter.name}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Qty: {order.quantity} · {order.product.category}
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                      <div className="text-white font-bold">{formatMoney(order.totalPrice)}</div>
                      <div className="text-[10px] text-slate-500 capitalize">{order.paymentStatus.toLowerCase()}</div>
                    </div>

                    <div className="lg:col-span-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide ${cfg.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </div>

                    <div className="lg:col-span-2">
                      <div className="text-sm text-slate-300">{formatDate(order.createdAt)}</div>
                    </div>

                    <div className="lg:col-span-2 flex justify-end">
                      {order.status === "SHIPPED" ? (
                        <Link
                          href={`/dashboard/importer/shipments`}
                          className="inline-flex items-center gap-1 text-cyan-400 text-xs font-bold hover:underline"
                        >
                          <Truck className="w-3 h-3" /> Track
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )}
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
