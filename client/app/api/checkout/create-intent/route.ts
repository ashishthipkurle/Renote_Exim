import { NextRequest, NextResponse } from 'next/server';
import { getRazorpayClient } from '@/lib/razorpay';
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

      const unitPrice = auth.role === 'IMPORTER' 
        ? (product.b2bPrice ?? product.price) 
        : (product.regularPrice ?? product.price);
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
          currency: product.currency || 'INR',
          orderStatus: 'CHECKOUT',
          paymentStatus: 'PENDING',
          stripePaymentIntentId: groupId, // Keep for backward compat / order grouping
          razorpayOrderId: groupId, // Temporary, will be updated below
          notes: shippingAddress ? `Ship to: ${shippingAddress}${phone ? ` | Phone: ${phone}` : ''}` : null,
        },
      });
      createdOrders.push(order);
    }

    // 2. Create Razorpay Order (amount in paise = multiply by 100)
    const amountInPaise = Math.max(100, Math.round(totalAmount * 100)); // Razorpay min is ₹1 = 100 paise
    let razorpayOrderId = `rz_mock_${Date.now()}`;
    const isDev = !process.env.RAZORPAY_KEY_ID;

    if (!isDev) {
      const razorpay = getRazorpayClient();
      const rzOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: groupId,
      });
      razorpayOrderId = rzOrder.id;
    }

    // 3. Update orders with actual Razorpay order ID
    await prisma.order.updateMany({
      where: { stripePaymentIntentId: groupId },
      data: {
        razorpayOrderId: razorpayOrderId,
        stripePaymentIntentId: razorpayOrderId, // Also update group lookup field
      },
    });

    return NextResponse.json({
      razorpayOrderId,
      amount: amountInPaise,
      currency: 'INR',
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
      orderId: razorpayOrderId,
      isDev,
    });
  } catch (error: any) {
    console.error('Razorpay Order Creation Error:', error);
    // Razorpay errors are often nested in error.error.description
    const errorMsg = error?.error?.description || error?.message || 'Failed to communicate with payment gateway';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
