import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRazorpaySignature } from '@/lib/razorpay';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orderGroupId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    // Support both old orderGroupId and new Razorpay params
    const lookupId = razorpay_order_id || orderGroupId;

    if (!lookupId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Find all orders associated with this Razorpay order ID (or group ID)
    const orders = await prisma.order.findMany({
      where: { razorpayOrderId: lookupId },
    });

    // Fallback: also check stripePaymentIntentId for backward compatibility
    const finalOrders = orders.length > 0
      ? orders
      : await prisma.order.findMany({
          where: { stripePaymentIntentId: lookupId },
        });

    if (!finalOrders || finalOrders.length === 0) {
      return NextResponse.json({ error: 'Orders not found' }, { status: 404 });
    }

    // Check if they are already confirmed
    if (finalOrders[0].paymentStatus === 'PAID') {
      return NextResponse.json({ success: true, message: 'Already confirmed' });
    }

    // Verify Razorpay signature (skip in dev mode when no secret is configured)
    if (process.env.RAZORPAY_KEY_SECRET && razorpay_order_id && razorpay_payment_id && razorpay_signature) {
      const isValid = verifyRazorpaySignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );

      if (!isValid) {
        console.error('Razorpay signature verification failed');
        return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
      }
    } else if (!process.env.RAZORPAY_KEY_SECRET) {
      // Dev mode — no verification needed
      console.warn('RAZORPAY_KEY_SECRET not set — skipping payment signature verification (dev mode)');
    }

    // Confirm orders and decrement inventory
    await prisma.$transaction(async (tx) => {
      // 1. Update order statuses + store Razorpay payment ID
      for (const order of finalOrders) {
        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'PAID',
            orderStatus: 'QUOTE_CONFIRMED',
            razorpayPaymentId: razorpay_payment_id || null,
          },
        });
      }

      // 2. Decrement inventory for each product
      for (const order of finalOrders) {
        await tx.product.update({
          where: { id: order.productId },
          data: {
            stockQty: {
              decrement: order.quantity,
            },
          },
        });
        
        // Ensure stock doesn't go below 0
        const updatedProduct = await tx.product.findUnique({ where: { id: order.productId } });
        if (updatedProduct && updatedProduct.stockQty < 0) {
           await tx.product.update({
             where: { id: order.productId },
             data: { stockQty: 0 }
           });
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Checkout Confirm Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
