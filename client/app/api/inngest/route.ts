import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest/client';
import { sendOrderEmail, fanOutNotifications, scanDocument, processRefund } from '@/lib/inngest/functions';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    sendOrderEmail,
    fanOutNotifications,
    scanDocument,
    processRefund
  ],
});
