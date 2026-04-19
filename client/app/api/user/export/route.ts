export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiAuthContext } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
 try {
 const { auth: context, error: authError } = await getApiAuthContext(request);
 if (authError || !context) {
 return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 }

 // Fetch all user related data
 const userData = await prisma.user.findUnique({
 where: { id: context.userId },
 include: {
 exportedProducts: true,
 orders: {
 include: {
 items: {
 include: {
 product: true
 }
 },
 shipment: true,
 }
 },
 sentMessages: true,
 receivedMessages: true,
 }
 });

 if (!userData) {
 return NextResponse.json({ error: 'User not found' }, { status: 404 });
 }

 // Prepare export object
 const exportData = {
 profile: {
 id: userData.id,
 email: userData.email,
 name: userData.name,
 role: userData.role,
 createdAt: userData.createdAt,
 },
 exportedProducts: userData.exportedProducts.map(p => ({
 id: p.id,
 name: p.name,
 description: p.description,
 price: p.price,
 createdAt: p.createdAt,
 })),
 orders: userData.orders.map(o => ({
 id: o.id,
 orderNumber: o.orderNumber,
 status: o.status,
 totalPrice: o.totalPrice,
 currency: o.currency,
 createdAt: o.createdAt,
 items: o.items.map(i => ({
 product: i.product.name,
 quantity: i.quantity,
 unitPrice: i.unitPrice
 })),
 shipment: o.shipment,
 })),
 messages: {
 sent: userData.sentMessages.map(m => ({
 id: m.id,
 content: m.content,
 sentAt: m.createdAt,
 receiverId: m.receiverId,
 })),
 received: userData.receivedMessages.map(m => ({
 id: m.id,
 content: m.content,
 receivedAt: m.createdAt,
 senderId: m.senderId,
 })),
 },
 };

 return new NextResponse(JSON.stringify(exportData, null, 2), {
 status: 200,
 headers: {
 'Content-Type': 'application/json',
 'Content-Disposition': `attachment; filename=user-data-${context.userId}.json`,
 },
 });
 } catch (error) {
 console.error('Export Error:', error);
 return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
 }
}

