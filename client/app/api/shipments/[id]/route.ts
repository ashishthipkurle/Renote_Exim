import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiAuthContext } from '@/lib/auth-server';

export async function GET(
 request: NextRequest,
 { params }: { params: { id: string } }
) {
 try {
 const { auth, error: authError } = await getApiAuthContext(request);
 if (authError || !auth) {
 return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 }

 const shipment = await prisma.shipment.findUnique({
 where: { id: params.id },
 include: {
 order: {
 include: {
 items: {
 include: { 
 product: { 
 select: { name: true, category: true, exporterId: true } 
 } 
 }
 },
 importer: { select: { id: true, name: true, companyName: true, country: true } },
 },
 },
 },
 });

 if (!shipment) {
 return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
 }

 // Security check: only involved parties can see
 const order = shipment.order as any;
 const isImporter = auth.role === 'IMPORTER' && order.importerId === auth.userId;
 const isExporter = auth.role === 'EXPORTER' && order.items.some((item: any) => item.product.exporterId === auth.userId);
 const isAdmin = auth.role === 'ADMIN';

 if (!isImporter && !isExporter && !isAdmin) {
 return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
 }

 return NextResponse.json(shipment);
 } catch (error) {
 console.error('Get shipment detail error:', error);
 return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
 }
}
