import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!stripeKey && process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
  console.warn('STRIPE_SECRET_KEY is not defined in environment variables. Stripe operations will fail.');
}

export const stripe = new Stripe(stripeKey || 'dummy_key', {
  apiVersion: '2024-06-20' as any,
});
