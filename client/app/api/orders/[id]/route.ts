export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiAuthContext } from '@/lib/auth-server';
import { z } from 'zod';

const statusUpdateSchema = z.object({
 status: z.enum([
 'PENDING',
 'CONFIRMED',
 'PROCESSING',
 'SHIPPED',
 'DELIVERED',
 'CANCELLED',
 'DISPUTED',
 ]),
});

// GET /api/orders/[id] - Get single order details
export async function GET(
 request: NextRequest,
 { params }: { params: { id: string } }
) {
 try {
 const { auth, error: authError } = await getApiAuthContext(request);
 if (authError || !auth) return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

 const order = await prisma.order.findUnique({
 where: { id: params.id },
 include: {
 product: {
 include: {
 exporter: {
 select: { id: true, name: true, businessName: true, country: true, email: true }
 }
 }
 },
 importer: {
 select: { id: true, name: true, businessName: true, country: true, email: true }
 },
 shipment: true
 }
 });

 if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

 // Authorization check
 const isOwner = auth.role === 'ADMIN' ||
 (auth.role === 'IMPORTER' && order.importerId === auth.userId) ||
 (auth.role === 'EXPORTER' && order.products.exporterId === auth.userId);

 if (!isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

 return NextResponse.json({ order });
 } catch (error) {
 console.error('Get order error:', error);
 return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
 }
}

// PATCH /api/orders/[id] - Update order status
export async function PATCH(
 request: NextRequest,
 { params }: { params: { id: string } }
) {
 try {
 const auth = await getApiAuthContext(request);
 if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

 const body = await request.json();
 const { status } = statusUpdateSchema.parse(body);

 const order = await prisma.order.findUnique({
 where: { id: params.id },
 include: { products: true }
 });

 if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

 // Authorization check: Only exporter or admin can update status
 const canUpdate = auth.role === 'ADMIN' ||
 (auth.role === 'EXPORTER' && order.products.exporterId === auth.userId);

 if (!canUpdate) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

 // Status transition validation (simplified)
 const currentStatus = order.status;

 // Logic for notifications
 let notificationTitle = 'Order Status Updated';
 let notificationMessage = `Your order ${order.orderNumber} is now ${status}`;

 if (status === 'CONFIRMED') {
 notificationTitle = 'Order Confirmed';
 notificationMessage = `Exporter has confirmed your order ${order.orderNumber}`;
 } else if (status === 'SHIPPED') {
 notificationTitle = 'Order Shipped';
 notificationMessage = `Your order ${order.orderNumber} has been shipped`;
 }

 const updatedOrder = await prisma.order.update({
 where: { id: params.id },
 data: { status },
 });

 // Notify Importer
 await prisma.notification.create({
 data: {
 userId: order.importerId,
 type: 'ORDER_UPDATE',
 title: notificationTitle,
 message: notificationMessage,
 link: `/dashboard/importer/orders/${order.id}`,
 }
 });

 return NextResponse.json({ order: updatedOrder });
 } catch (error) {
 console.error('Update order error:', error);
 if (error instanceof z.ZodError) {
 return NextResponse.json({ error: 'Invalid status', details: error.errors }, { status: 400 });
 }
 return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
 }
}
