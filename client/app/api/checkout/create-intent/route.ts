import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { getApiAuthContext } from '@/lib/supabase/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const auth = await getApiAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const items = body.items || [];
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items are required' }, { status: 400 });
    }

    const firstItem = items[0];

    const product = await prisma.product.findUnique({
      where: { id: firstItem.productId },
    });

    if (!product) {
      return NextResponse.json({ error: `Product not found: ${firstItem.productId}` }, { status: 404 });
    }

    const totalPrice = product.price * firstItem.quantity;

    // 1. Create the Order in PENDING status
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        importerId: auth.userId,
        productId: product.id,
        quantity: firstItem.quantity,
        totalPrice: totalPrice,
        status: 'PENDING',
        paymentStatus: 'PENDING',
      },
    });

    // 2. Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100),
      currency: 'usd',
      metadata: {
        userId: auth.userId,
        orderId: order.id,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
      amount: totalPrice,
    });
  } catch (error: any) {
    console.error('Payment Intent Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
