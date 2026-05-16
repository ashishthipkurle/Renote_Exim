export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiAuthContext } from '@/lib/auth-server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { auth, error: authError } = await getApiAuthContext(request);
    if (authError || !auth) {
      return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;

    const shipment = await prisma.shipment.findUnique({
      where: { id: resolvedParams.id },
      include: {
        order: {
          include: {
            product: {
              select: { id: true, name: true, category: true, exporterId: true, images: true }
            },
            buyer: { select: { id: true, name: true, businessName: true, country: true } },
            seller: { select: { id: true, name: true, businessName: true, country: true } },
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!shipment) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }

    // Security check: only involved parties can see
    const order = shipment.order as any;
    const isBuyer = order.buyerId === auth.userId;
    const isSeller = order.sellerId === auth.userId;
    const isAdmin = auth.role === 'ADMIN';

    if (!isBuyer && !isSeller && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(shipment);
  } catch (error) {
    console.error('Get shipment detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
