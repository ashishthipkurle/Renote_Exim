import Link from "next/link";
import { redirect } from "next/navigation";
import { ShoppingCart, Globe, ArrowRight, User } from "lucide-react";

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
          select: { id: true, name: true, category: true, images: true },
          include: { exporter: { select: { id: true, name: true, businessName: true, country: true } } },
        },
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
    <div className="h-full overflow-hidden flex flex-col bg-background selection:bg-primary selection:text-primary-foreground">
      {/* ── Header ── */}
      <header className="flex-shrink-0 px-10 py-10 border-b border-border dark:border-white/5 bg-background/40 backdrop-blur-3xl z-40">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10">
          <div>
            <h1 className="text-5xl font-black tracking-tighter text-foreground dark:text-white uppercase">Procurement Archive</h1>
            <p className="text-muted-foreground/40 mt-3 text-[10px] font-black uppercase tracking-[0.3em]">
              Registry Index: {orders.length < 10 ? `0${orders.length}` : orders.length} Assets Logged · {formatCurrency(totalSpent)} Cumulative Capital Outflow
            </p>
          </div>
          <div className="flex items-center gap-5">
            <div className="px-6 py-4 rounded-lg bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 text-foreground dark:text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl dark:shadow-2xl">
              Node: {auth.user?.businessName || auth.user?.name || "PROCUREMENT_NODE"}
            </div>
            <Link
              href="/products"
              className="px-8 py-4 rounded-lg bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 transition-all hover:scale-105 hover:bg-primary/90 flex items-center gap-3"
            >
              <ShoppingCart className="w-4 h-4" /> Marketplace_Access
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-10 space-y-16 custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="max-w-[1700px] mx-auto">
          <div className="space-y-10">
            <div className="flex items-center gap-5 border-b border-border dark:border-white/5 pb-6">
              <Globe className="w-5 h-5 text-foreground dark:text-white" />
              <h2 className="text-[10px] font-black text-foreground dark:text-white uppercase tracking-[0.4em]">
                Active Trade Sequence Feed
              </h2>
            </div>
            <OrdersList initialOrders={orders} />
          </div>
        </div>
      </div>
    </div>
  );
}
