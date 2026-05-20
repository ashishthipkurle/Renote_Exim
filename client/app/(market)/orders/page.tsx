import Link from "next/link";
import { redirect } from "next/navigation";
import { ShoppingCart } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getServerAuthContext } from "@/lib/auth-server";
import { formatCurrency } from "@/lib/api-utils";
import OrdersList from "@/components/dashboard/OrdersList";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import PageTransition from "@/components/ui/PageTransition";

export const dynamic = 'force-dynamic';

export default async function MarketplaceOrdersPage() {
  const auth = await getServerAuthContext();
  if (!auth) redirect("/login");

  let orders: any[] = [];
  let totalSpent = 0;

  try {
    // Fetch user's orders (importer role)
    orders = await prisma.order.findMany({
      where: { buyerId: auth.userId },
      include: {
        product: {
          include: { 
            exporter: { 
              select: { 
                id: true, 
                name: true, 
                businessName: true, 
                country: true 
              } 
            } 
          },
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
        paymentStatus: { in: ["PAID", "PARTIAL", "ESCROWED"] }
      },
      select: { totalPrice: true }
    });
    
    totalSpent = paidOrders.reduce((acc, o) => acc + o.totalPrice, 0);
  } catch (e) {
    console.warn("Failed to fetch marketplace orders:", e);
  }

  return (
    <SidebarProvider>
      <div className="flex flex-col h-screen w-full bg-background transition-colors duration-300">
        <DashboardHeader />
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <PageTransition>
            <div className="w-full px-8 py-8">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <h1 className="text-3xl font-black tracking-tight text-foreground uppercase italic">Logistics Control</h1>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-black shadow-lg hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <ShoppingCart className="w-4 h-4" /> BROWSE PRODUCTS
                  </Link>
                </div>
                <OrdersList initialOrders={orders} />
              </div>
            </div>
          </PageTransition>
        </div>
      </div>
    </SidebarProvider>
  );
}
