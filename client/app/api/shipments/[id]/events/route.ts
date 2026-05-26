export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiAuthContext } from '@/lib/auth-server';
import { z } from 'zod';
import { ShipmentStatus } from '@prisma/client';

const eventSchema = z.object({
  status: z.nativeEnum(ShipmentStatus),
  location: z.string().optional(),
  note: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await getApiAuthContext(request).then(res => res.auth);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const parsed = eventSchema.parse(body);

    const shipment = await prisma.shipment.findUnique({
      where: { id },
      include: {
        order: { select: { sellerId: true, buyerId: true, orderNumber: true } }
      }
    });

    if (!shipment) return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });

    // Only EXPORTER (seller) or ADMIN can add tracking events manually
    const canUpdate = auth.role === 'ADMIN' || 
      (auth.role === 'EXPORTER' && shipment.order.sellerId === auth.userId);

    if (!canUpdate) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Update shipment currentStatus and add event
    const updatedShipment = await prisma.shipment.update({
      where: { id },
      data: {
        currentStatus: parsed.status,
        statusHistory: {
          create: {
            status: parsed.status,
            location: parsed.location,
            note: parsed.note,
          }
        }
      },
      include: {
        statusHistory: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    // Notify Importer
    try {
      await prisma.notification.create({
        data: {
          userId: shipment.order.buyerId,
          type: 'SHIPMENT_UPDATE',
          title: 'Tracking Update',
          message: `Shipment for order ${shipment.order.orderNumber} is now ${parsed.status.replaceAll("_", " ")}`,
          link: `/dashboard/importer/orders?orderId=${shipment.orderId}`,
          linkedEntityId: shipment.id,
        }
      });
    } catch (e) {
      console.warn("Failed to notify buyer of shipment update", e);
    }

    return NextResponse.json({ shipment: updatedShipment });
  } catch (error) {
    console.error('Add shipment event error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
