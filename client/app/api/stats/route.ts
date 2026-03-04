import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiAuthContext } from '@/lib/supabase/auth';

export const dynamic = 'force-dynamic';

// GET /api/stats — Dashboard statistics for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const auth = await getApiAuthContext(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope') || auth.role.toLowerCase();

    if (scope === 'importer' || auth.role === 'IMPORTER') {
      const [totalOrders, activeShipments, totalSpentResult, pendingDeliveries] = await Promise.all([
        prisma.order.count({ where: { importerId: auth.userId } }),
        prisma.shipment.count({
          where: {
            order: { importerId: auth.userId },
            status: { in: ['PREPARING', 'IN_TRANSIT', 'CUSTOMS', 'OUT_FOR_DELIVERY'] },
          },
        }),
        prisma.order.aggregate({
          where: { importerId: auth.userId, paymentStatus: { in: ['PAID', 'PARTIAL'] } },
          _sum: { totalPrice: true },
        }),
        prisma.shipment.count({
          where: {
            order: { importerId: auth.userId },
            status: { in: ['IN_TRANSIT', 'CUSTOMS', 'OUT_FOR_DELIVERY'] },
          },
        }),
      ]);

      return NextResponse.json({
        totalOrders,
        activeShipments,
        totalSpent: totalSpentResult._sum.totalPrice ?? 0,
        pendingDeliveries,
      });
    }

    if (scope === 'exporter' || auth.role === 'EXPORTER') {
      const [totalProducts, activeOrders, totalRevResult, totalShipments] = await Promise.all([
        prisma.product.count({ where: { exporterId: auth.userId } }),
        prisma.order.count({
          where: {
            product: { exporterId: auth.userId },
            status: { in: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'] },
          },
        }),
        prisma.order.aggregate({
          where: {
            product: { exporterId: auth.userId },
            paymentStatus: { in: ['PAID', 'PARTIAL'] },
          },
          _sum: { totalPrice: true },
        }),
        prisma.shipment.count({
          where: { order: { product: { exporterId: auth.userId } } },
        }),
      ]);

      return NextResponse.json({
        totalProducts,
        activeOrders,
        totalRevenue: totalRevResult._sum.totalPrice ?? 0,
        totalShipments,
      });
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
            where: { status: { in: ['PREPARING', 'IN_TRANSIT', 'CUSTOMS', 'OUT_FOR_DELIVERY'] } },
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
