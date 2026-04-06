import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerAuth } from "@/lib/supabase/server";
import ExporterAnalyticsDashboard from "./ExporterAnalyticsDashboard";

// ─── Server-side data fetching ────────────────────────────────────────────────
// All data comes directly from the exporter's own orders / products / shipments.
// No mock/dummy data anywhere in this file.

export default async function ExporterAnalyticsPage() {
  const auth = await getServerAuth();
  if (!auth) redirect("/login");
  if (auth.role !== "EXPORTER" && auth.role !== "ADMIN") {
    redirect(`/dashboard/${auth.role.toLowerCase()}`);
  }

  const exporterId = auth.userId;

  // ── Fetch all orders for this exporter ──────────────────────────────────────
  let orders: {
    id: string;
    status: string;
    paymentStatus: string;
    totalPrice: number;
    quantity: number;
    createdAt: Date;
    product: { id: string; name: string; category: string; price: number };
    importer: { country: string | null; companyName: string | null; name: string | null };
  }[] = [];

  try {
    orders = await prisma.order.findMany({
      where: { product: { exporterId } },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        totalPrice: true,
        quantity: true,
        createdAt: true,
        product: { select: { id: true, name: true, category: true, price: true } },
        importer: { select: { country: true, companyName: true, name: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  } catch (e) {
    console.warn("Analytics: failed to fetch orders:", e);
  }

  // ── Fetch all products for this exporter ────────────────────────────────────
  let products: { id: string; name: string; category: string; available: boolean; price: number }[] = [];
  try {
    products = await prisma.product.findMany({
      where: { exporterId },
      select: { id: true, name: true, category: true, available: true, price: true },
    });
  } catch (e) {
    console.warn("Analytics: failed to fetch products:", e);
  }

  // ── Fetch shipments ─────────────────────────────────────────────────────────
  let shipments: { status: string; createdAt: Date }[] = [];
  try {
    shipments = await prisma.shipment.findMany({
      where: { order: { product: { exporterId } } },
      select: { status: true, createdAt: true },
    });
  } catch (e) {
    console.warn("Analytics: failed to fetch shipments:", e);
  }

  // ── Derive: Monthly revenue & order count ───────────────────────────────────
  const monthlyMap = new Map<string, { revenue: number; orderCount: number }>();
  for (const o of orders) {
    const key = o.createdAt.toISOString().slice(0, 7); // "YYYY-MM"
    const existing = monthlyMap.get(key) ?? { revenue: 0, orderCount: 0 };
    monthlyMap.set(key, {
      revenue: existing.revenue + o.totalPrice,
      orderCount: existing.orderCount + 1,
    });
  }
  const monthlyRevenue = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, v]) => ({ month, ...v }));

  // ── Derive: Revenue by category ─────────────────────────────────────────────
  const categoryMap = new Map<string, { revenue: number; orderCount: number }>();
  for (const o of orders) {
    const cat = o.product.category;
    const existing = categoryMap.get(cat) ?? { revenue: 0, orderCount: 0 };
    categoryMap.set(cat, {
      revenue: existing.revenue + o.totalPrice,
      orderCount: existing.orderCount + 1,
    });
  }
  const revenueByCategory = Array.from(categoryMap.entries())
    .map(([category, v]) => ({ category, ...v }))
    .sort((a, b) => b.revenue - a.revenue);

  // ── Derive: Top products ────────────────────────────────────────────────────
  const productMap = new Map<string, { name: string; category: string; revenue: number; orderCount: number }>();
  for (const o of orders) {
    const existing = productMap.get(o.product.id) ?? {
      name: o.product.name,
      category: o.product.category,
      revenue: 0,
      orderCount: 0,
    };
    productMap.set(o.product.id, {
      ...existing,
      revenue: existing.revenue + o.totalPrice,
      orderCount: existing.orderCount + 1,
    });
  }
  const topProducts = Array.from(productMap.entries())
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // ── Derive: Geographic breakdown ────────────────────────────────────────────
  const geoMap = new Map<string, { orderCount: number; revenue: number }>();
  for (const o of orders) {
    const country = o.importer.country ?? "Unknown";
    const existing = geoMap.get(country) ?? { orderCount: 0, revenue: 0 };
    geoMap.set(country, {
      orderCount: existing.orderCount + 1,
      revenue: existing.revenue + o.totalPrice,
    });
  }
  const geographicData = Array.from(geoMap.entries())
    .map(([country, v]) => ({ country, ...v }))
    .sort((a, b) => b.revenue - a.revenue);

  // ── Derive: Payment breakdown ───────────────────────────────────────────────
  const paymentBreakdown = {
    PAID: orders.filter((o) => o.paymentStatus === "PAID").length,
    PENDING: orders.filter((o) => o.paymentStatus === "PENDING").length,
    FAILED: orders.filter((o) => o.paymentStatus === "FAILED").length,
    REFUNDED: orders.filter((o) => o.paymentStatus === "REFUNDED").length,
  };
  const paidRevenue = orders
    .filter((o) => o.paymentStatus === "PAID")
    .reduce((sum, o) => sum + o.totalPrice, 0);
  const pendingRevenue = orders
    .filter((o) => o.paymentStatus === "PENDING")
    .reduce((sum, o) => sum + o.totalPrice, 0);

  // ── Derive: Order status breakdown ──────────────────────────────────────────
  const orderStatusBreakdown = {
    PENDING: orders.filter((o) => o.status === "PENDING").length,
    CONFIRMED: orders.filter((o) => o.status === "CONFIRMED").length,
    PROCESSING: orders.filter((o) => o.status === "PROCESSING").length,
    SHIPPED: orders.filter((o) => o.status === "SHIPPED").length,
    DELIVERED: orders.filter((o) => o.status === "DELIVERED").length,
    CANCELLED: orders.filter((o) => o.status === "CANCELLED").length,
  };

  // ── Derive: KPIs ─────────────────────────────────────────────────────────────
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
  const totalOrders = orders.length;
  const paidOrders = paymentBreakdown.PAID;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const conversionRate =
    products.length > 0 ? ((paidOrders / products.length) * 100).toFixed(1) + "%" : "0%";

  // ── Derive: Growth (compare last 30 days vs prior 30 days) ──────────────────
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const recentOrders = orders.filter((o) => o.createdAt >= thirtyDaysAgo);
  const priorOrders = orders.filter(
    (o) => o.createdAt >= sixtyDaysAgo && o.createdAt < thirtyDaysAgo
  );
  const recentRevenue = recentOrders.reduce((s, o) => s + o.totalPrice, 0);
  const priorRevenue = priorOrders.reduce((s, o) => s + o.totalPrice, 0);
  const revenueGrowth =
    priorRevenue > 0
      ? parseFloat((((recentRevenue - priorRevenue) / priorRevenue) * 100).toFixed(1))
      : recentRevenue > 0
      ? 100
      : 0;
  const orderGrowth =
    priorOrders.length > 0
      ? parseFloat(
          (((recentOrders.length - priorOrders.length) / priorOrders.length) * 100).toFixed(1)
        )
      : recentOrders.length > 0
      ? 100
      : 0;

  // ── Shipment status breakdown ────────────────────────────────────────────────
  const shipmentBreakdown = {
    PREPARING: shipments.filter((s) => s.status === "PREPARING").length,
    IN_TRANSIT: shipments.filter((s) => s.status === "IN_TRANSIT").length,
    CUSTOMS: shipments.filter((s) => s.status === "CUSTOMS").length,
    OUT_FOR_DELIVERY: shipments.filter((s) => s.status === "OUT_FOR_DELIVERY").length,
    DELIVERED: shipments.filter((s) => s.status === "DELIVERED").length,
    RETURNED: shipments.filter((s) => s.status === "RETURNED").length,
  };

  // ── Pass all derived data to client component ────────────────────────────────
  const analyticsData = {
    // KPIs
    totalRevenue,
    totalOrders,
    paidOrders,
    avgOrderValue,
    conversionRate,
    revenueGrowth,
    orderGrowth,
    totalProducts: products.length,
    availableProducts: products.filter((p) => p.available).length,

    // Charts
    monthlyRevenue,
    revenueByCategory,
    topProducts,
    geographicData,

    // Payment
    paymentBreakdown,
    paidRevenue,
    pendingRevenue,

    // Orders
    orderStatusBreakdown,
    shipmentBreakdown,
  };

  return <ExporterAnalyticsDashboard data={analyticsData} />;
}

