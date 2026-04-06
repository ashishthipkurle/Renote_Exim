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
    <div className="h-dvh overflow-hidden flex flex-col bg-background transition-colors duration-300">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-border bg-header backdrop-blur-xl z-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground uppercase italic">Procurement Archive</h1>
            <p className="text-muted-foreground mt-1 font-black text-[10px] uppercase tracking-widest leading-none">
              {orders.length} Assets Logged · {formatCurrency(totalSpent)} Cumulative Capital Outflow
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
