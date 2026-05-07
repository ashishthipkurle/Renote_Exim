export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiAuthContext } from '@/lib/auth-server';
import { z } from 'zod';
import { OrderStatus } from '@prisma/client';

const statusUpdateSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

// GET /api/orders/[id] - Get single order details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getApiAuthContext(request).then(res => res.auth);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        product: true,
        buyer: {
          select: { id: true, name: true, businessName: true, country: true, email: true }
        },
        seller: {
          select: { id: true, name: true, businessName: true, country: true, email: true }
        },
        shipment: true
      }
    });

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // Authorization check
    const isRelated = auth.role === 'ADMIN' ||
      order.buyerId === auth.userId ||
      order.sellerId === auth.userId;

    if (!isRelated) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

// PATCH /api/orders/[id] - Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getApiAuthContext(request).then(res => res.auth);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { status } = statusUpdateSchema.parse(body);

    const order = await prisma.order.findUnique({
      where: { id: params.id },
    });

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // Authorization check: Only exporter (seller) or admin can update status
    const canUpdate = auth.role === 'ADMIN' ||
      (auth.role === 'EXPORTER' && order.sellerId === auth.userId);

    if (!canUpdate) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: { orderStatus: status },
    });

    // Notify Importer
    try {
      let notificationTitle = 'Order Status Updated';
      let notificationMessage = `Your order ${order.orderNumber} is now ${status}`;

      if (status === 'QUOTE_CONFIRMED') {
        notificationTitle = 'Order Confirmed';
        notificationMessage = `Exporter has confirmed your order ${order.orderNumber}`;
      } else if (status === 'SHIPPED') {
        notificationTitle = 'Order Shipped';
        notificationMessage = `Your order ${order.orderNumber} has been shipped`;
      }

      await prisma.notification.create({
        data: {
          userId: order.buyerId,
          type: 'ORDER_UPDATE',
          title: notificationTitle,
          message: notificationMessage,
          link: `/dashboard/importer/orders?orderId=${order.id}`,
          linkedEntityId: order.id,
        }
      });
    } catch (notifErr) {
      console.warn("Failed to create notification:", notifErr);
      // Don't fail the whole request if notification fails
    }

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error('Update order error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid status', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
