import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiAuthContext } from '@/lib/supabase/auth';

export const dynamic = 'force-dynamic';

// GET /api/dashboard/finance — Financial summary for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const auth = await getApiAuthContext(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (auth.role === 'EXPORTER') {
      const [paidRevenue, pendingRevenue, recentOrders, lastPaidOrder] = await Promise.all([
        // Available balance (paid orders)
        prisma.order.aggregate({
          where: {
            product: { exporterId: auth.userId },
            paymentStatus: 'PAID',
          },
          _sum: { totalPrice: true },
        }),
        // Pending payouts (partial/pending payment orders that are confirmed+)
        prisma.order.aggregate({
          where: {
            product: { exporterId: auth.userId },
            paymentStatus: { in: ['PENDING', 'PARTIAL'] },
            status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
          },
          _sum: { totalPrice: true },
        }),
        // Recent orders as "invoices"
        prisma.order.findMany({
          where: { product: { exporterId: auth.userId } },
          include: {
            product: { select: { name: true } },
            importer: { select: { name: true, companyName: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        // Last paid order for "last payout" figure
        prisma.order.findFirst({
          where: {
            product: { exporterId: auth.userId },
            paymentStatus: 'PAID',
          },
          orderBy: { updatedAt: 'desc' },
          select: { totalPrice: true, updatedAt: true },
        }),
      ]);

      return NextResponse.json({
        role: 'EXPORTER',
        available: paidRevenue._sum.totalPrice ?? 0,
        pending: pendingRevenue._sum.totalPrice ?? 0,
        lastPayout: lastPaidOrder?.totalPrice ?? 0,
        lastPayoutDate: lastPaidOrder?.updatedAt ?? null,
        recentInvoices: recentOrders.map((o) => ({
          id: o.orderNumber,
          amount: o.totalPrice,
          status: o.paymentStatus,
          orderStatus: o.status,
          product: o.product.name,
          buyer: o.importer.companyName || o.importer.name,
          date: o.createdAt,
        })),
      });
    }

    if (auth.role === 'IMPORTER') {
      const [totalSpent, pendingPayments, recentOrders] = await Promise.all([
        // Total balance (all paid)
        prisma.order.aggregate({
          where: { importerId: auth.userId, paymentStatus: 'PAID' },
          _sum: { totalPrice: true },
        }),
        // Pending payments
        prisma.order.aggregate({
          where: {
            importerId: auth.userId,
            paymentStatus: { in: ['PENDING', 'PARTIAL'] },
          },
          _sum: { totalPrice: true },
        }),
        // Recent orders as invoices
        prisma.order.findMany({
          where: { importerId: auth.userId },
          include: {
            product: {
              select: {
                name: true,
                exporter: { select: { name: true, companyName: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
      ]);

      // Estimate tax liability as 10% of total spent
      const totalSpentVal = totalSpent._sum.totalPrice ?? 0;
      const estTax = totalSpentVal * 0.1;

      return NextResponse.json({
        role: 'IMPORTER',
        totalBalance: totalSpentVal,
        pendingPayouts: pendingPayments._sum.totalPrice ?? 0,
        estTaxLiability: estTax,
        recentInvoices: recentOrders.map((o) => ({
          id: o.orderNumber,
          amount: o.totalPrice,
          status: o.paymentStatus,
          orderStatus: o.status,
          product: o.product.name,
          seller: o.product.exporter.companyName || o.product.exporter.name,
          date: o.createdAt,
        })),
      });
    }

    return NextResponse.json({ error: 'Invalid role for finance' }, { status: 400 });
  } catch (error) {
    console.error('Finance error:', error);
    return NextResponse.json({ error: 'Failed to fetch finance data' }, { status: 500 });
  }
}
