import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/cart — Resolve cart items (batch product lookup)
// Body: { productIds: string[] }
// Returns product details for all IDs in a single query (solves the N+1 problem)
export async function POST(request: NextRequest) {
 try {
 const body = await request.json();
 const { productIds } = body as { productIds?: string[] };

 if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
 return NextResponse.json({ error: 'productIds array is required' }, { status: 400 });
 }

 if (productIds.length > 50) {
 return NextResponse.json({ error: 'Maximum 50 products per request' }, { status: 400 });
 }

 const products = await prisma.product.findMany({
 where: { id: { in: productIds } },
 select: {
 id: true,
 name: true,
 price: true,
 images: true,
 available: true,
 minOrderQty: true,
 unit: true,
 originCountry: true,
 category: true,
 exporter: {
 select: {
 name: true,
 businessName: true,
 country: true,
 },
 },
 },
 });

 return NextResponse.json({ products });
 } catch (error) {
 console.error('Cart resolve error:', error);
 return NextResponse.json({ error: 'Failed to resolve cart products' }, { status: 500 });
 }
}
