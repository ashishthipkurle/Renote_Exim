import { inngest } from './client';

export const sendOrderEmail = inngest.createFunction(
  { id: 'send-order-email', retries: 3, triggers: [{ event: 'order.email.send' }] },
  async ({ event, step }) => {
    // Placeholder: Send email logic via Resend
    console.log(`[send-order-email] Sending email for order ${event.data.orderId} of type ${event.data.type}`);
    return { success: true, event };
  }
);

export const fanOutNotifications = inngest.createFunction(
  { id: 'fan-out-notifications', retries: 2, triggers: [{ event: 'notifications.fanout' }] },
  async ({ event, step }) => {
    // Placeholder: Generate notification records and publish to Supabase Realtime
    console.log(`[fan-out-notifications] Fanning out notifications for order ${event.data.orderId}`);
    return { success: true, event };
  }
);

export const scanDocument = inngest.createFunction(
  { id: 'scan-document', retries: 3, triggers: [{ event: 'document.scan' }] },
  async ({ event, step }) => {
    // Placeholder: VirusTotal API integration
    console.log(`[scan-document] Scanning document ${event.data.documentId}`);
    return { success: true, event };
  }
);

export const processRefund = inngest.createFunction(
  { id: 'process-refund', retries: 5, triggers: [{ event: 'order.refund.process' }] },
  async ({ event, step }) => {
    // Placeholder: Call Stripe refund API
    console.log(`[process-refund] Processing refund for order ${event.data.orderId}`);
    return { success: true, event };
  }
);
