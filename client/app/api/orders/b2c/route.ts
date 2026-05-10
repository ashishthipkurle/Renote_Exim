export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiAuthContext } from '@/lib/auth-server';

export async function POST(req: NextRequest) {
 try {
 const { auth, error: authError } = await getApiAuthContext(req);
 if (authError || !auth) return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 
 // Exact V3 role check, NO VERIFICATION REQUIRED FOR CONSUMERS
 if (auth.role !== 'CONSUMER' && auth.role !== 'IMPORTER') {
 return NextResponse.json({ error: 'Access denied. Retail checkouts strictly for Consumers or Importers (retail mode).' }, { status: 403 });
 }

 const { productId, quantity } = await req.json();

 const product = await prisma.product.findUnique({ where: { id: productId } });
 if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
 
 // Retail pricing fallback 
 const unitPrice = product.b2cPrice || product.price;
 const totalPrice = unitPrice * quantity;
 const orderNumber = `B2C-${Date.now()}`;

 const order = await prisma.order.create({
 data: {
 orderType: 'B2C',
 orderNumber,
 buyerId: auth.userId,
 sellerId: product.exporterId,
 productId,
 quantity,
 unitPrice,
 totalPrice,
 currency: product.currency,
 orderStatus: 'CHECKOUT', 
 paymentStatus: 'PENDING',
 }
 });

 return NextResponse.json({ order }, { status: 201 });
 } catch (error: any) {
 return NextResponse.json({ error: error.message }, { status: 500 });
 }
}
