import Link from "next/link";
import { redirect } from "next/navigation";
import { ShoppingCart, ArrowRight, ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getServerAuthContext } from "@/lib/auth-server";
import { OrderStatus } from "@prisma/client";
import OrdersTable from "./OrdersTable";

export default async function ExporterOrdersPage({
 searchParams,
}: {
 searchParams?: { [key: string]: string | string[] | undefined } | Promise<{ [key: string]: string | string[] | undefined }>;
}) {
 const resolvedSearchParams = (await searchParams) ?? {};
 const auth = await getServerAuthContext();
 if (!auth) redirect("/login");
 if (auth.role !== "EXPORTER" && auth.role !== "ADMIN") {
 redirect(`/dashboard/${auth.role.toLowerCase()}`);
 }

 const page = parseInt(typeof resolvedSearchParams.page === 'string' ? resolvedSearchParams.page : "1");
 const limit = 10;
 const skip = (page - 1) * limit;

 // Build where clause
 const where: any = {
 product: { is: { exporterId: auth.userId } },
 };

  if (resolvedSearchParams.status && resolvedSearchParams.status !== "ALL") {
    const s = Array.isArray(resolvedSearchParams.status) ? resolvedSearchParams.status[0] : resolvedSearchParams.status;
    const status = (s || "").toUpperCase();
    if (Object.values(OrderStatus).includes(status as any)) {
      where.orderStatus = status as OrderStatus;
    }
  }


 if (typeof resolvedSearchParams.search === 'string' && resolvedSearchParams.search) {
 const search = resolvedSearchParams.search;
 where.OR = [
 { id: { contains: search, mode: "insensitive" } },
 { product: { is: { name: { contains: search, mode: "insensitive" } } } },
 { buyer: { is: { name: { contains: search, mode: "insensitive" } } } },
 { buyer: { is: { businessName: { contains: search, mode: "insensitive" } } } },
 ];
 }

 let orders: any[] = [];
 let total = 0;
 let statusCounts = {
 all: 0,
 pending: 0,
 processing: 0,
 shipped: 0,
 delivered: 0,
 };

 try {
 // Get orders with pagination
 [orders, total] = await Promise.all([
 prisma.order.findMany({
 where,
 include: {
 product: { select: { name: true, category: true, images: true } },
 buyer: { select: { name: true, businessName: true, country: true } },
 shipment: true,
 },
 orderBy: { createdAt: "desc" },
 skip,
 take: limit,
 }),
 prisma.order.count({ where }),
 ]);

 // Get specific status counts (unfiltered by search/status, but filtered by exporter)
 const baseWhere = { product: { exporterId: auth.userId } };
 const [allCount, pendingCount, procCount, shippedCount, delivCount] = await Promise.all([
 prisma.order.count({ where: baseWhere }),
 prisma.order.count({ where: { ...baseWhere, orderStatus: "QUOTE_REQUESTED" } }),
 prisma.order.count({ where: { ...baseWhere, orderStatus: { in: ["QUOTE_CONFIRMED", "PROCESSING"] } } }),
 prisma.order.count({ where: { ...baseWhere, orderStatus: "SHIPPED" } }),
 prisma.order.count({ where: { ...baseWhere, orderStatus: "DELIVERED" } }),
 ]);

 statusCounts = {
 all: allCount,
 pending: pendingCount,
 processing: procCount,
 shipped: shippedCount,
 delivered: delivCount,
 };
 } catch (e) {
 console.warn("Failed to fetch exporter orders:", e);
 }

 const totalPages = Math.ceil(total / limit);

 return (
 <div className="h-full overflow-hidden flex flex-col bg-background selection:bg-primary selection:text-primary-foreground">
 {/* ── Header ── */}
 <header className="flex-shrink-0 px-10 py-10 border-b border-border dark:border-white/5 bg-background/40 backdrop-blur-3xl z-40">
 <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10">
 <div>
 <h1 className="text-5xl font-black tracking-tighter text-foreground dark:text-white uppercase ">Order Intelligence</h1>
 <p className="text-muted-foreground/40 mt-3 text-[10px] font-black uppercase tracking-[0.3em] ">
 Registry Node Index: {statusCounts.all} Active Signal Nodes Identified
 </p>
 </div>
 <div className="flex items-center gap-5">
 <div className="px-6 py-4 rounded-lg bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 text-foreground dark:text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl dark:shadow-2xl">
 Node: Exporter_Alpha
 </div>
 </div>
 </div>
 </header>

 <div className="flex-1 overflow-y-auto p-10 space-y-16 custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-1000">
 <div className="max-w-[1700px] mx-auto space-y-16">
 {/* Order Grid (Table Component) */}
 <div className="space-y-10">
 <div className="flex items-center gap-5 border-b border-border dark:border-white/5 pb-6">
 <ShoppingCart className="w-5 h-5 text-foreground dark:text-white" />
 <h2 className="text-[10px] font-black text-foreground dark:text-white uppercase tracking-[0.4em] ">
 Trade Sequence Feed
 </h2>
 </div>
 <OrdersTable orders={orders} counts={statusCounts} />
 </div>

 {/* Pagination */}
 {totalPages > 1 && (
 <div className="flex items-center justify-center gap-4 mt-20 mb-20">
 <Link
 href={`?${new URLSearchParams({ ...resolvedSearchParams, page: (page - 1).toString() })}`}
 className={`px-8 py-4 rounded-lg bg-card/40 dark:bg-white/5 border border-border dark:border-white/5 text-[10px] uppercase font-black tracking-widest transition-all backdrop-blur-3xl ${page <= 1 ? "opacity-20 pointer-events-none" : "hover:bg-black/10 dark:bg-white/15 hover:border-border dark:border-white/20 text-foreground dark:text-white"
 }`}
 >
 <ArrowLeft className="w-4 h-4 inline-block mr-2" /> Previous Signal
 </Link>
 <div className="flex items-center gap-3">
 {Array.from({ length: totalPages }).map((_, i) => {
 const p = i + 1;
 if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
 return (
 <Link
 key={p}
 href={`?${new URLSearchParams({ ...resolvedSearchParams, page: p.toString() })}`}
 className={`w-14 h-14 flex items-center justify-center rounded-lg border text-[10px] font-black transition-all backdrop-blur-3xl ${page === p
 ? "bg-primary border-transparent text-primary-foreground shadow-2xl shadow-white/10 scale-110"
 : "bg-card/40 dark:bg-white/5 border-border dark:border-white/5 text-muted-foreground hover:bg-black/10 dark:bg-white/15 hover:border-border dark:border-white/20 hover:text-foreground dark:text-white"
 }`}
 >
 {p < 10 ? `0${p}` : p}
 </Link>
 );
 }
 if (p === page - 2 || p === page + 2) {
 return <span key={p} className="text-white/20 px-2 font-black ">...</span>;
 }
 return null;
 })}
 </div>
 <Link
 href={`?${new URLSearchParams({ ...resolvedSearchParams, page: (page + 1).toString() })}`}
 className={`px-8 py-4 rounded-lg bg-card/40 dark:bg-white/5 border border-border dark:border-white/5 text-[10px] uppercase font-black tracking-widest transition-all backdrop-blur-3xl ${page >= totalPages ? "opacity-20 pointer-events-none" : "hover:bg-black/10 dark:bg-white/15 hover:border-border dark:border-white/20 text-foreground dark:text-white"
 }`}
 >
 Next Signal <ArrowRight className="w-4 h-4 inline-block ml-2" />
 </Link>
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
