import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { getApiAuthContext } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { auth, error: authError } = await getApiAuthContext(req);
    if (authError || !auth) {
      return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const items = body.items || [];
    const shippingAddress = body.shippingAddress || '';
    const phone = body.phone || '';
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items are required' }, { status: 400 });
    }

    let totalAmount = 0;
    const createdOrders = [];
    const groupId = `GRP-${Date.now()}`;

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 404 });
      }

      const unitPrice = product.price;
      const itemTotal = unitPrice * item.quantity;
      totalAmount += itemTotal;

      // 1. Create the Order with shipping details in notes
      const order = await prisma.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          orderType: auth.role === 'IMPORTER' ? 'B2B' : 'B2C',
          buyerId: auth.userId,
          sellerId: product.exporterId,
          productId: product.id,
          quantity: item.quantity,
          unitPrice: unitPrice,
          totalPrice: itemTotal,
          currency: product.currency || 'USD',
          orderStatus: 'CHECKOUT',
          paymentStatus: 'PENDING',
          stripePaymentIntentId: groupId,
          notes: shippingAddress ? `Ship to: ${shippingAddress}${phone ? ` | Phone: ${phone}` : ''}` : null,
        },
      });
      createdOrders.push(order);
    }

    // 2. Create Stripe Payment Intent
    let clientSecret = 'pi_mock_secret_dummy_123';
    let paymentIntentId = `pi_mock_${Date.now()}`;

    // Only call Stripe API if a real secret key is configured
    if (process.env.STRIPE_SECRET_KEY) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.max(50, Math.round(totalAmount * 100)), // Stripe requires at least 50 cents
        currency: 'usd',
        metadata: {
          userId: auth.userId,
          orderGroupId: groupId,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });
      clientSecret = paymentIntent.client_secret as string;
      paymentIntentId = paymentIntent.id;
    }

    // 3. Update orders with actual payment intent ID
    await prisma.order.updateMany({
      where: { stripePaymentIntentId: groupId },
      data: { stripePaymentIntentId: paymentIntentId },
    });

    return NextResponse.json({
      clientSecret: clientSecret,
      orderId: groupId, // Pass group ID or comma separated
      amount: totalAmount,
    });
  } catch (error: any) {
    console.error('Payment Intent Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
