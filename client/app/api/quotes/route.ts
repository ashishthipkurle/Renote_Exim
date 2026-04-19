export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiAuthContext } from '@/lib/auth-server';

export async function POST(request: NextRequest) {
 try {
 const { auth: context, error: authError } = await getApiAuthContext(request);
 if (authError || !context || context.role !== 'EXPORTER') {
 return authError || NextResponse.json({ error: 'Only exporters can submit quotes' }, { status: 403 });
 }

 const { rfqId, price, leadTime, validUntil, terms, note } = await request.json();

 // Verify RFQ exists and is open
 const rfq = await prisma.rfq.findUnique({
 where: { id: rfqId }
 });

 if (!rfq) return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });
 if (rfq.status !== 'OPEN') return NextResponse.json({ error: 'RFQ is no longer accepting quotes' }, { status: 400 });

 const quote = await prisma.quote.create({
 data: {
 rfqId,
 exporterId: context.userId,
 price: Number(price),
 leadTime: Number(leadTime),
 validUntil: new Date(validUntil),
 terms,
 note,
 }
 });

 return NextResponse.json(quote, { status: 201 });
 } catch (error) {
 console.error('Quote Error:', error);
 return NextResponse.json({ error: 'Failed to submit quote' }, { status: 500 });
 }
}

export async function GET(request: NextRequest) {
 try {
 const { searchParams } = new URL(request.url);
 const rfqId = searchParams.get('rfqId');
 const { auth: context, error: authError } = await getApiAuthContext(request);
 if (authError || !context) {
 return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 }

 const where: any = {};
 if (rfqId) where.rfqId = rfqId;
 
 if (context.role === 'EXPORTER') {
 where.exporterId = context.userId;
 } else if (context.role === 'IMPORTER') {
 where.rfq = { importerId: context.userId };
 }

 const quotes = await prisma.quote.findMany({
 where,
 include: {
 exporter: { select: { name: true, businessName: true, country: true, avatar: true } }
 },
 orderBy: { createdAt: 'desc' }
 });

 return NextResponse.json(quotes);
 } catch (error) {
 return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
 }
}

// PATCH for accepting/rejecting quotes
export async function PATCH(request: NextRequest) {
 try {
 const { auth: context, error: authError } = await getApiAuthContext(request);
 if (authError || !context || context.role !== 'IMPORTER') {
 return authError || NextResponse.json({ error: 'Only importers can manage quotes' }, { status: 403 });
 }

 const { id, status } = await request.json();

 if (status === 'ACCEPTED') {
 // Logic for accepting quote - could convert to Order
 const quote = await prisma.quote.findUnique({
 where: { id },
 include: { rfq: true }
 });

 if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 });

 // Create Order from Quote
 const order = await prisma.order.create({
 data: {
 importerId: context.userId,
 productId: quote.rfq.id, // Linked via RFQ as a virtual product or real one if specified
 quantity: quote.rfq.quantity,
 totalPrice: quote.price,
 status: 'PENDING',
 }
 });

 // Update quote and rfq
 await prisma.$transaction([
 prisma.quote.update({ where: { id }, data: { status: 'ACCEPTED' } }),
 prisma.rfq.update({ where: { id: quote.rfqId }, data: { status: 'CLOSED' } }),
 // Reject all other quotes for this RFQ
 prisma.quote.updateMany({
 where: { rfqId: quote.rfqId, id: { not: id } },
 data: { status: 'REJECTED' }
 })
 ]);

 return NextResponse.json({ message: 'Quote accepted and order created', orderId: order.id });
 }

 const updatedQuote = await prisma.quote.update({
 where: { id },
 data: { status }
 });

 return NextResponse.json(updatedQuote);
 } catch (error) {
 return NextResponse.json({ error: 'Failed to update quote' }, { status: 500 });
 }
}

