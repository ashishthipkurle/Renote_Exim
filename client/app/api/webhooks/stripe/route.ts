import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
    }
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }

  const session = event.data.object as any;

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata.orderId;

      if (orderId) {
        const order = await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'PAID',
            status: 'CONFIRMED',
          },
          include: {
            importer: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        });

        console.log(`Order ${orderId} marked as PAID`);

        // Send Email if preference is enabled
        const prefs = (order.importer.emailPreferences as any) || { orders: true };
        if (prefs.orders !== false) {
          const { sendEmail } = await import('@/lib/email');
          const { OrderConfirmationEmail } = await import('@/components/emails/OrderConfirmation');
          const React = await import('react');

          await sendEmail({
            to: order.importer.email,
            subject: `Order Confirmation - ${order.orderNumber}`,
            react: React.createElement(OrderConfirmationEmail, {
              orderNumber: order.orderNumber,
              customerName: order.importer.name || 'Valued Customer',
              totalAmount: `$${order.totalPrice.toFixed(2)}`,
              items: order.items.map(item => ({
                name: item.product.name,
                quantity: item.quantity,
                price: `$${item.unitPrice.toFixed(2)}`,
              })),
            }),
          });
        }
      }
      break;

    case 'payment_intent.payment_failed':
      const failedIntent = event.data.object as Stripe.PaymentIntent;
      const failedOrderId = failedIntent.metadata.orderId;

      if (failedOrderId) {
        await prisma.order.update({
          where: { id: failedOrderId },
          data: {
            paymentStatus: 'PENDING', // Or FAILED if you add that status
          },
        });
        console.log(`Order ${failedOrderId} payment failed`);
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
