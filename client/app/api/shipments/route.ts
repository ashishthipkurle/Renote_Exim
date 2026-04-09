import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiAuthContext } from '@/lib/auth-server';
import { z } from 'zod';

const shipmentStatusSchema = z.enum([
  'PREPARING',
  'IN_TRANSIT',
  'CUSTOMS',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'DELAYED',
  'RETURNED',
]);

// GET /api/shipments — Get shipments for authenticated user
export async function GET(request: NextRequest) {
  try {
    const auth = await getApiAuthContext(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: Record<string, unknown> = {};

    if (auth.role === 'IMPORTER') {
      where.order = { importerId: auth.userId };
    } else if (auth.role === 'EXPORTER') {
      where.order = { product: { exporterId: auth.userId } };
    }
    // ADMIN sees all shipments

    if (status) {
      const parsed = shipmentStatusSchema.safeParse(status);
      if (parsed.success) {
        where.status = parsed.data;
      }
    }

    const [shipments, total] = await Promise.all([
      prisma.shipment.findMany({
        where,
        include: {
          order: {
            include: {
              product: { select: { name: true, category: true } },
              importer: { select: { name: true, companyName: true, country: true } },
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.shipment.count({ where }),
    ]);

    return NextResponse.json({
      shipments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get shipments error:', error);
    return NextResponse.json({ error: 'Failed to fetch shipments' }, { status: 500 });
  }
}

// POST /api/shipments — Create a shipment (Exporters/Admin only)
export async function POST(request: NextRequest) {
  try {
    const auth = await getApiAuthContext(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (auth.role === 'IMPORTER') {
      return NextResponse.json({ error: 'Only exporters and admins can create shipments' }, { status: 403 });
    }

    const body = await request.json();
    const schema = z.object({
      orderId: z.string().uuid(),
      carrier: z.string().min(1),
      origin: z.string().min(1),
      destination: z.string().min(1),
      estimatedDelivery: z.string().datetime(),
    });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    // Verify order exists and belongs to this exporter's product
    const order = await prisma.order.findUnique({
      where: { id: parsed.data.orderId },
      include: { product: true, shipment: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.shipment) {
      return NextResponse.json({ error: 'Order already has a shipment' }, { status: 409 });
    }

    if (auth.role === 'EXPORTER' && order.product.exporterId !== auth.userId) {
      return NextResponse.json({ error: 'Not authorized for this order' }, { status: 403 });
    }

    const trackingNumber = `TRK-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const shipment = await prisma.shipment.create({
      data: {
        orderId: parsed.data.orderId,
        userId: auth.userId,
        trackingNumber,
        carrier: parsed.data.carrier,
        origin: parsed.data.origin,
        destination: parsed.data.destination,
        estimatedDelivery: new Date(parsed.data.estimatedDelivery),
        status: 'PREPARING',
        statusHistory: [
          { status: 'PREPARING', timestamp: new Date().toISOString(), note: 'Shipment created' },
        ],
      },
    });

    // Update order status to PROCESSING
    await prisma.order.update({
      where: { id: parsed.data.orderId },
      data: { status: 'PROCESSING' },
    });

    // Notify the importer
    try {
      await prisma.notification.create({
        data: {
          userId: order.importerId,
          type: 'ORDER_SHIPPED',
          title: 'Shipment Created',
          message: `Your order ${order.orderNumber} is being prepared for shipment. Tracking: ${trackingNumber}`,
          link: `/orders`,
        },
      });
    } catch {
      // Non-critical — best effort
    }

    return NextResponse.json({ shipment }, { status: 201 });
  } catch (error) {
    console.error('Create shipment error:', error);
    return NextResponse.json({ error: 'Failed to create shipment' }, { status: 500 });
  }
}
