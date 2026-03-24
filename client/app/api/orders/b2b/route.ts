import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiAuthContext } from '@/lib/supabase/auth';

export async function POST(req: NextRequest) {
  try {
    const auth = await getApiAuthContext(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    // Exact V3 KYC gate
    if (auth.role !== 'IMPORTER') {
      return NextResponse.json({ error: 'Access denied. Importers only.' }, { status: 403 });
    }
    
    // Strict Verification check before creating B2B Orders
    if (auth.verificationStatus !== 'VERIFIED') {
      return NextResponse.json({ error: 'Compliance verification pending. You cannot place bulk orders yet.' }, { status: 403 });
    }

    const { productId, quantity, notes } = await req.json();

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    if (!product.available) return NextResponse.json({ error: 'Product is unavailable' }, { status: 400 });
    
    // B2B specific MOQ check
    if (quantity < product.moq) return NextResponse.json({ error: `Minimum Wholesale Quantity is ${product.moq}` }, { status: 400 });

    const orderNumber = `B2B-${Date.now()}`;
    const unitPrice = product.b2bPrice;
    const totalPrice = unitPrice * quantity;

    const order = await prisma.order.create({
      data: {
        orderType: 'B2B',
        orderNumber,
        buyerId: auth.userId,
        sellerId: product.exporterId,
        productId,
        quantity,
        unitPrice,
        totalPrice,
        currency: product.currency,
        orderStatus: 'QUOTE_REQUESTED',
        paymentStatus: 'PENDING',
        notes: notes || null
      }
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
