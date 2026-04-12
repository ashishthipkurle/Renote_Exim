import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiAuthContext } from '@/lib/auth-server';

export async function POST(request: NextRequest) {
 try {
 const { auth: context, error: authError } = await getApiAuthContext(request);
 if (authError || !context) {
 return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 }

 const { orderId, userId, rating, comment } = await request.json();

 // Verify order exists and belongs to the reviewer (if importer) or is for the exporter
 const order = await prisma.order.findUnique({
 where: { id: orderId },
 include: { review: true }
 });

 if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
 if (order.review) return NextResponse.json({ error: 'Review already exists' }, { status: 400 });
 if (order.status !== 'DELIVERED') return NextResponse.json({ error: 'Can only review delivered orders' }, { status: 400 });

 const review = await prisma.review.create({
 data: {
 orderId,
 userId, // Being reviewed
 reviewerId: context.userId,
 rating: Number(rating),
 comment,
 }
 });

 return NextResponse.json(review, { status: 201 });
 } catch (error) {
 console.error('Review Error:', error);
 return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
 }
}

export async function GET(request: NextRequest) {
 const { searchParams } = new URL(request.url);
 const userId = searchParams.get('userId');

 if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

 try {
 const reviews = await prisma.review.findMany({
 where: { userId },
 include: {
 reviewer: { select: { name: true, avatar: true } }
 },
 orderBy: { createdAt: 'desc' }
 });

 const averageRating = reviews.length > 0
 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
 : 0;

 return NextResponse.json({ reviews, averageRating, total: reviews.length });
 } catch (error) {
 return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
 }
}
