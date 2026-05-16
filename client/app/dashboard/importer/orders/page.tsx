import Link from "next/link";
import { redirect } from "next/navigation";
import { ShoppingCart, Globe, Package } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getServerAuthContext } from "@/lib/auth-server";
import { formatCurrency } from "@/lib/api-utils";
import OrdersList from "@/components/dashboard/OrdersList";

export const dynamic = 'force-dynamic';

export default async function ImporterOrdersPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined } | Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const auth = await getServerAuthContext();
  if (!auth) redirect("/login");
  if (auth.role !== "IMPORTER" && auth.role !== "ADMIN") {
    redirect(`/dashboard/${auth.role.toLowerCase()}`);
  }

  let orders: any[] = [];
  let totalSpent = 0;
  
  try {
    orders = await prisma.order.findMany({
      where: { buyerId: auth.userId },
      include: {
        product: {
          include: { exporter: { select: { id: true, name: true, businessName: true, country: true } } },
        },
        seller: { select: { id: true, name: true, businessName: true, country: true } },
        shipment: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const paidOrders = await prisma.order.findMany({
      where: { 
        buyerId: auth.userId,
        paymentStatus: { in: ["PAID", "PARTIAL"] }
      },
      select: { totalPrice: true }
    });
    
    totalSpent = paidOrders.reduce((acc, o) => acc + o.totalPrice, 0);
  } catch (e) {
    console.warn("Failed to fetch orders (DB may be unavailable):", e);
  }

  return (
    <div className="h-full overflow-hidden flex flex-col bg-background">
      {/* Header */}
      <header className="flex-shrink-0 px-8 py-8 border-b border-border bg-background/60 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">My Orders</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {orders.length} {orders.length === 1 ? "order" : "orders"} · {formatCurrency(totalSpent)} total spent
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold shadow-lg hover:opacity-90 transition-all"
          >
            <ShoppingCart className="w-4 h-4" /> Browse Products
          </Link>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-[1400px] mx-auto">
          <OrdersList initialOrders={orders} />
        </div>
      </div>
    </div>
  );
}
