import Razorpay from 'razorpay';
import crypto from 'crypto';

/**
 * Lazily instantiate Razorpay to prevent server crashes if environment variables 
 * are missing during module load.
 */
export function getRazorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID || '';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || '';
  
  if (!key_id || !key_secret) {
    throw new Error('Razorpay keys are missing from environment variables (.env)');
  }

  return new Razorpay({ key_id, key_secret });
}

/**
 * Verify Razorpay payment signature using HMAC SHA256.
 * This ensures the payment callback is authentic and not tampered with.
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const key_secret = process.env.RAZORPAY_KEY_SECRET || '';
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', key_secret)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
}
