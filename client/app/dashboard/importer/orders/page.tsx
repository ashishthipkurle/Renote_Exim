import Link from "next/link";
import { redirect } from "next/navigation";
import { ShoppingCart } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getServerAuth } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/api-utils";
import OrdersList from "@/components/dashboard/OrdersList";

export const dynamic = 'force-dynamic';

export default async function ImporterOrdersPage({
  searchParams,
}: {
  searchParams?: { view?: string } | Promise<{ view?: string }>;
}) {
  await searchParams;
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
          include: { exporter: { select: { name: true, companyName: true, country: true } } },
        },
        shipment: true,
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
    <div className="h-dvh overflow-hidden flex flex-col bg-slate-50 dark:bg-gradient-to-br dark:from-[#0a0c12] dark:via-[#0d1017] dark:to-[#0a0c12] transition-colors duration-300">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-transparent transition-colors duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">My Orders</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {orders.length} orders · {formatCurrency(totalSpent)} total spent
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-primary hover:bg-[#0f49bd] text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-primary/20 transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              Browse Products
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto">
          <OrdersList initialOrders={orders} />
        </div>
      </div>
    </div>
  );
}
