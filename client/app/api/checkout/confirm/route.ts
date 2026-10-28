import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { getApiAuthContext } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { auth, error: authError } = await getApiAuthContext(req);
    if (authError || !auth) {
      return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      // Items and order data passed from client (originally from create-intent)
      validatedItems,
      shippingAddress,
      phone,
    } = body;

    if (!razorpay_order_id) {
      return NextResponse.json({ error: 'Razorpay Order ID is required' }, { status: 400 });
    }

    if (!validatedItems || !Array.isArray(validatedItems) || validatedItems.length === 0) {
      return NextResponse.json({ error: 'Order items are required' }, { status: 400 });
    }

    // Check if orders already exist for this Razorpay order (idempotency)
    const existingOrders = await prisma.order.findMany({
      where: { razorpayOrderId: razorpay_order_id },
    });

    if (existingOrders.length > 0) {
      // Already confirmed
      if (existingOrders[0].paymentStatus === 'PAID') {
        return NextResponse.json({ success: true, message: 'Already confirmed' });
      }
      // Orders exist but not paid — shouldn't happen with new flow, but handle gracefully
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
      console.warn('RAZORPAY_KEY_SECRET not set — skipping payment signature verification (dev mode)');
    }

    // Payment verified — now create orders and decrement inventory in a single transaction
    await prisma.$transaction(async (tx) => {
      for (const item of validatedItems) {
        // Re-validate product exists
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        // SSOT Pricing: Recalculate price on the server instead of trusting the client
        const unitPrice = auth.role === 'IMPORTER' 
          ? (product.b2bPrice ?? product.price) 
          : (product.regularPrice ?? product.price);
        const itemTotal = unitPrice * item.quantity;

        // Create the order with PAID status directly
        await tx.order.create({
          data: {
            orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            orderType: auth.role === 'IMPORTER' ? 'B2B' : 'B2C',
            buyerId: auth.userId,
            sellerId: item.sellerId,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: unitPrice, // Using server calculated price
            totalPrice: itemTotal, // Using server calculated price
            currency: item.currency,
            orderStatus: 'QUOTE_CONFIRMED',
            paymentStatus: 'PAID',
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id || null,
            stripePaymentIntentId: razorpay_order_id, // backward compat
            notes: shippingAddress
              ? `Ship to: ${shippingAddress}${phone ? ` | Phone: ${phone}` : ''}`
              : null,
          },
        });

        // Decrement inventory (Atomic Optimistic Locking)
        const updatedProduct = await tx.product.updateMany({
          where: { 
            id: item.productId,
            stockQty: { gte: item.quantity } // Ensure enough stock
          },
          data: {
            stockQty: {
              decrement: item.quantity,
            },
          },
        });

        if (updatedProduct.count === 0) {
           throw new Error(`Insufficient stock for product: ${item.productId}`);
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Checkout Confirm Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
