import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiAuthContext } from '@/lib/supabase/auth';
import { orderSchema } from '@/lib/validations';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

const orderStatusSchema = z.enum([
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'DISPUTED',
]);

// GET /api/orders - Get user's orders
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

    const where: Prisma.OrderWhereInput = {};

    // Filter based on role
    if (auth.role === 'IMPORTER') {
      where.importerId = auth.userId;
    } else if (auth.role === 'EXPORTER') {
      where.product = {
        exporterId: auth.userId,
      };
    }

    if (status) {
      const parsed = orderStatusSchema.safeParse(status);
      if (parsed.success) {
        where.status = parsed.data;
      }
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          product: {
            include: {
              exporter: {
                select: {
                  id: true,
                  name: true,
                  companyName: true,
                  country: true,
                  email: true,
                },
              },
            },
          },
          importer: {
            select: {
              id: true,
              name: true,
              companyName: true,
              country: true,
              email: true,
            },
          },
          shipment: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create new order (Importers only)
export async function POST(request: NextRequest) {
  try {
    const auth = await getApiAuthContext(request);

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (auth.role !== 'IMPORTER') {
      return NextResponse.json(
        { error: 'Access denied. Importers only.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = orderSchema.parse(body);

    // Get product details
    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (!product.available) {
      return NextResponse.json(
        { error: 'Product is not available' },
        { status: 400 }
      );
    }

    if (validatedData.quantity < product.minOrderQty) {
      return NextResponse.json(
        { error: `Minimum order quantity is ${product.minOrderQty}` },
        { status: 400 }
      );
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    // Calculate total price
    const totalPrice = product.price * validatedData.quantity;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        productId: validatedData.productId,
        importerId: auth.userId,
        quantity: validatedData.quantity,
        totalPrice,
        notes: validatedData.notes || null,
      },
      include: {
        product: {
          include: {
            exporter: {
              select: {
                id: true,
                name: true,
                companyName: true,
                email: true,
              },
            },
          },
        },
        importer: {
          select: {
            id: true,
            name: true,
            companyName: true,
            email: true,
          },
        },
      },
    });

    // Create notification for exporter
    await prisma.notification.create({
      data: {
        userId: product.exporterId,
        type: 'ORDER_PLACED',
        title: 'New Order Received',
        message: `You have received a new order for ${product.name}`,
        link: `/dashboard/exporter/orders/${order.id}`,
      },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error: unknown) {
    console.error('Create order error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
