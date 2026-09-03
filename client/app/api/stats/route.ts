import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiAuthContext } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

// GET /api/stats — Dashboard statistics for the authenticated user
export async function GET(request: NextRequest) {
 try {
 const { auth, error: authError } = await getApiAuthContext(request);
 if (authError || !auth) {
 return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 }

 const { searchParams } = new URL(request.url);
 const scope = searchParams.get('scope') || auth.role.toLowerCase();

  if (scope === 'importer') {
    const isOwner = auth.role !== 'ADMIN';
    const buyerWhere = isOwner ? { buyerId: auth.userId } : {};
    
    const [totalOrders, activeShipments, totalSpentResult, pendingOrders, paidOrders] = await Promise.all([
      prisma.order.count({ where: buyerWhere }),
      prisma.shipment.count({
        where: {
          order: buyerWhere,
          currentStatus: { in: ['PREPARING', 'IN_TRANSIT', 'CUSTOMS', 'OUT_FOR_DELIVERY'] },
        },
      }),
      prisma.order.aggregate({
        where: { ...buyerWhere, paymentStatus: { in: ['PAID', 'PARTIAL'] } },
        _sum: { totalPrice: true },
      }),
      prisma.order.count({
        where: {
          ...buyerWhere,
          orderStatus: { in: ['QUOTE_REQUESTED', 'PO_RAISED', 'PAYMENT_CONFIRMED', 'PROCESSING'] },
        },
      }),
      prisma.order.findMany({
        where: { ...buyerWhere, paymentStatus: { in: ['PAID', 'PARTIAL'] } },
        include: { product: true },
      }),
    ]);

    const monthlySpending = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return {
        month: d.toLocaleString('default', { month: 'short' }),
        spent: 0,
        year: d.getFullYear(),
        monthNum: d.getMonth()
      };
    }).reverse();

    const categoryMap = new Map<string, number>();

    paidOrders.forEach((order: any) => {
      const cat = order.product?.category || 'OTHER';
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + order.totalPrice);
      
      const orderDate = new Date(order.createdAt);
      const m = monthlySpending.find((m: any) => m.monthNum === orderDate.getMonth() && m.year === orderDate.getFullYear());
      if (m) {
        m.spent += order.totalPrice;
      }
    });

    const categories = Array.from(categoryMap.entries()).map(([name, spent]) => ({ name, spent }));

    return NextResponse.json({
      totalOrders,
      activeShipments,
      totalSpent: totalSpentResult._sum.totalPrice ?? 0,
      pendingOrders,
      monthlySpending,
      categories
    }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
  }

  if (scope === 'exporter') {
    const isOwner = auth.role !== 'ADMIN';
    const sellerWhere = isOwner ? { sellerId: auth.userId } : {};
    const exporterWhere = isOwner ? { exporterId: auth.userId } : {};

    const [totalProducts, activeOrders, totalRevResult, totalShipments] = await Promise.all([
      prisma.product.count({ where: exporterWhere }),
      prisma.order.count({
        where: {
          ...sellerWhere,
          orderStatus: { in: ['QUOTE_REQUESTED', 'PO_RAISED', 'PAYMENT_CONFIRMED', 'PROCESSING', 'SHIPPED'] },
        },
      }),
      prisma.order.aggregate({
        where: {
          ...sellerWhere,
          paymentStatus: { in: ['PAID', 'PARTIAL'] },
        },
        _sum: { totalPrice: true },
      }),
      prisma.shipment.count({
        where: { order: sellerWhere },
      }),
    ]);

    return NextResponse.json({
      totalProducts,
      activeOrders,
      totalRevenue: totalRevResult._sum.totalPrice ?? 0,
      totalShipments,
    }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
  }

 if (scope === 'admin' || auth.role === 'ADMIN') {
 const [totalUsers, totalProducts, totalOrders, totalRevResult, activeShipments, recentOrders] =
 await Promise.all([
 prisma.user.count(),
 prisma.product.count(),
 prisma.order.count(),
 prisma.order.aggregate({
 where: { paymentStatus: { in: ['PAID', 'PARTIAL'] } },
 _sum: { totalPrice: true },
 }),
 prisma.shipment.count({
 where: { currentStatus: { in: ['PREPARING', 'IN_TRANSIT', 'CUSTOMS', 'OUT_FOR_DELIVERY'] } },
 }),
 prisma.order.count({
 where: {
 createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
 },
 }),
 ]);

 return NextResponse.json({
 totalUsers,
 totalProducts,
 totalOrders,
 totalRevenue: totalRevResult._sum.totalPrice ?? 0,
 activeShipments,
 recentOrders,
 });
 }

 return NextResponse.json({ error: 'Invalid scope' }, { status: 400 });
 } catch (error) {
 console.error('Stats error:', error);
 return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
 }
}
