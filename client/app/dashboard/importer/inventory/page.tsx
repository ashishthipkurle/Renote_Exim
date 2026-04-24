import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerAuthContext } from "@/lib/auth-server";
import ImporterInventoryClient from "./ImporterInventoryClient";

export const dynamic = 'force-dynamic';

export default async function ImporterInventoryPage() {
 const auth = await getServerAuthContext();
 if (!auth) redirect("/login");
 if (auth.role !== "IMPORTER" && auth.role !== "ADMIN") {
 redirect(`/dashboard/${auth.role.toLowerCase()}`);
 }

 let orders: any[] = [];
 try {
 orders = await prisma.order.findMany({
 where: { buyerId: auth.userId },
 include: {
 product: {
  select: {
   id: true, name: true, category: true, images: true, unit: true,
   exporter: { select: { name: true, businessName: true, country: true } },
  },
 },
 shipment: true,
 },
 orderBy: { createdAt: "desc" },
 });
 } catch (e) {
 console.warn("Failed to fetch inventory orders:", e);
 }

 // Serialize dates for client component
 const serialized = orders.map((o: any) => ({
 ...o,
 createdAt: o.createdAt?.toISOString?.() ?? o.createdAt,
 updatedAt: o.updatedAt?.toISOString?.() ?? o.updatedAt,
 product: o.product ? {
 ...o.product,
 createdAt: undefined,
 updatedAt: undefined,
 } : null,
 shipment: o.shipment ? {
 ...o.shipment,
 createdAt: o.shipment.createdAt?.toISOString?.() ?? o.shipment.createdAt,
 updatedAt: o.shipment.updatedAt?.toISOString?.() ?? o.shipment.updatedAt,
 estimatedDelivery: o.shipment.estimatedDelivery?.toISOString?.() ?? o.shipment.estimatedDelivery,
 actualDelivery: o.shipment.actualDelivery?.toISOString?.() ?? o.shipment.actualDelivery,
 } : null,
 }));

 return <ImporterInventoryClient initialOrders={serialized} />;
}
