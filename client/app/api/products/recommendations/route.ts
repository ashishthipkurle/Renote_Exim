export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiAuthContext } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
 try {
 const { auth: context, error: authError } = await getApiAuthContext(request);
 
 // If not logged in or invalid token, return top trending products
 // (In this public route, we treat auth errors as guest access)
 if (authError || !context) {
 const trending = await prisma.product.findMany({
 take: 10,
 orderBy: {
 createdAt: 'desc',
 },
 where: { available: true }
 });
 return NextResponse.json(trending);
 }

 // Get user preferences
 const user = await prisma.user.findUnique({
 where: { id: context.userId },
 select: { preferredCategories: true }
 });

 if (!user || user.preferredCategories.length === 0) {
 // Fallback to general trending
 const trending = await prisma.product.findMany({
 take: 10,
 orderBy: {
 createdAt: 'desc',
 },
 where: { available: true }
 });
 return NextResponse.json(trending);
 }

 // Recommend products in preferred categories
 const recommendations = await prisma.product.findMany({
 where: {
 AND: [
 { category: { in: user.preferredCategories as any } },
 { available: true },
 { exporterId: { not: context.userId } } // Don't recommend own products
 ]
 },
 take: 10,
 orderBy: {
 createdAt: 'desc'
 }
 });

 return NextResponse.json(recommendations);
 } catch (error) {
 console.error('Recommendation Error:', error);
 return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
 }
}

