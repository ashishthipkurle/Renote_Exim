import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientName, clientEmail, clientPhone, businessName, items } = body;

    // Save to the database
    const quote = await prisma.quotationRequest.create({
      data: {
        clientName,
        clientEmail,
        clientPhone,
        businessName,
        items: {
          create: items.map((item: any) => ({
            productName: item.name,
            quantity: item.quantity,
          })),
        },
      },
    });

    // Here you would ALSO integrate with the Meta WhatsApp API 
    // to send a message to the admin if configured.
    // Example:
    // await fetch('https://graph.facebook.com/v17.0/.../messages', { ... })

    return NextResponse.json({ success: true, quote });
  } catch (error) {
    console.error('Error saving quote request:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
