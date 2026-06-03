/**
 * Client-side Razorpay checkout script loader and popup helper.
 * Dynamically loads the Razorpay checkout.js from CDN and provides
 * a typed interface for opening the payment popup.
 */

export const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number; // in paise
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  close: () => void;
  on: (event: string, handler: (...args: any[]) => void) => void;
}

let scriptLoaded = false;
let scriptLoading: Promise<void> | null = null;

/**
 * Load the Razorpay checkout.js script from CDN.
 * Deduplicates multiple calls — only loads once.
 */
export function loadRazorpayScript(): Promise<void> {
  if (scriptLoaded && window.Razorpay) {
    return Promise.resolve();
  }

  if (scriptLoading) {
    return scriptLoading;
  }

  scriptLoading = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    script.onerror = () => {
      scriptLoading = null;
      reject(new Error('Failed to load Razorpay checkout script'));
    };
    document.body.appendChild(script);
  });

  return scriptLoading;
}

/**
 * Open the Razorpay checkout popup with the given options.
 * Automatically loads the script if not already loaded.
 */
export async function openRazorpayCheckout(options: RazorpayOptions): Promise<void> {
  await loadRazorpayScript();

  if (!window.Razorpay) {
    throw new Error('Razorpay SDK not available');
  }

  const rzp = new window.Razorpay(options);
  rzp.on('payment.failed', (response: any) => {
    console.error('Razorpay payment failed:', response.error);
  });
  rzp.open();
}
