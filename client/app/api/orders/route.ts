export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiAuthContext } from '@/lib/auth-server';

// GET /api/orders — List orders for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const { auth, error: authError } = await getApiAuthContext(request);
    if (authError || !auth) {
      return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const noShipment = searchParams.get('noShipment') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    const where: any = {};

    // Scope orders based on role
    if (auth.role === 'EXPORTER') {
      where.sellerId = auth.userId;
      // Exclude incomplete checkout orders — only show paid/confirmed orders
      where.orderStatus = { not: 'CHECKOUT' };
    } else if (auth.role === 'IMPORTER' || auth.role === 'CONSUMER' || auth.role === 'USER') {
      where.buyerId = auth.userId;
    }
    // ADMIN sees all

    // Filter to orders without shipments (for creating new shipments)
    if (noShipment) {
      where.shipment = null;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        product: {
          select: { id: true, name: true, category: true, images: true },
        },
        buyer: {
          select: { id: true, name: true, businessName: true, country: true, email: true },
        },
        seller: {
          select: { id: true, name: true, businessName: true, country: true },
        },
        shipment: {
          select: { id: true, trackingNumber: true, currentStatus: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('List orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
