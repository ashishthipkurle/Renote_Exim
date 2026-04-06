import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { inngest } from '@/lib/inngest/client';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_123', {
  apiVersion: '2024-04-10',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_123';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }

  // Idempotency check using StripeEvent table from v3 schema
  try {
    const existingEvent = await prisma.stripeEvent.findUnique({
      where: { stripeEventId: event.id },
    });

    if (existingEvent) {
      console.log(`Event ${event.id} already processed.`);
      return NextResponse.json({ received: true, status: 'already_processed' });
    }

    // Process the event
    await handleStripeEvent(event);

    // Record event to prevent duplicate processing
    await prisma.stripeEvent.create({
      data: {
        stripeEventId: event.id,
        eventType: event.type,
        processedAt: new Date(),
      },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Error processing webhook event: `, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function handleStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      // B2C Checkout Completed
      const orderId = session.metadata?.orderId;
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            orderStatus: 'PAYMENT_CONFIRMED',
            paymentStatus: 'PAID',
          },
        });
        await inngest.send({
          name: 'order.email.send',
          data: { orderId, type: 'b2c_checkout_success' },
        });
        await inngest.send({
          name: 'notifications.fanout',
          data: { orderId, type: 'order_update' },
        });
      }
      break;
    }
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      // B2B Payment Intent Succeeded
      const orderId = paymentIntent.metadata?.orderId;
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'PAID',
          },
        });
        await inngest.send({
          name: 'order.email.send',
          data: { orderId, type: 'b2b_payment_success' },
        });
        await inngest.send({
          name: 'notifications.fanout',
          data: { orderId, type: 'payment_received' },
        });
      }
      break;
    }
    case 'invoice.paid': {
      // Partial B2B invoice paid
      const invoice = event.data.object as Stripe.Invoice;
      const orderId = invoice.metadata?.orderId;
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'PARTIAL',
          },
        });
      }
      break;
    }
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.orderId;
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            orderStatus: 'PAYMENT_FAILED',
            paymentStatus: 'FAILED',
          },
        });
        await inngest.send({
          name: 'order.email.send',
          data: { orderId, type: 'payment_failed' },
        });
      }
      break;
    }
    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId = charge.payment_intent as string;
      if (paymentIntentId) {
        const order = await prisma.order.findFirst({
          where: { stripePaymentIntentId: paymentIntentId }
        });
        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'REFUNDED',
              orderStatus: 'CANCELLED',
            },
          });
          await inngest.send({
            name: 'order.email.send',
            data: { orderId: order.id, type: 'refund_issued' },
          });
        }
      }
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const orderId = invoice.metadata?.orderId;
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'FAILED',
          },
        });
      }
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}
