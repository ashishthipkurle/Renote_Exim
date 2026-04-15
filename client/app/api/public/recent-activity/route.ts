import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            category: true,
            name: true
          }
        },
        buyer: {
          select: {
            country: true
          }
        },
        seller: {
          select: {
            country: true
          }
        }
      }
    });

    const activity = recentOrders.map(order => ({
      id: order.orderNumber,
      from: order.seller.country || 'Global',
      to: order.buyer.country || 'Global',
      value: order.totalPrice,
      category: order.product.category,
      status: order.orderStatus,
      createdAt: order.createdAt
    }));

    return NextResponse.json(activity);
  } catch (error) {
    console.error('Public activity error:', error);
    return NextResponse.json({ error: 'Failed to fetch public activity' }, { status: 500 });
  }
}
