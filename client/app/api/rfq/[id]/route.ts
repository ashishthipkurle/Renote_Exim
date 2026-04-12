import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiAuthContext } from '@/lib/auth-server';

export async function GET(
 request: NextRequest,
 { params }: { params: { id: string } }
) {
 try {
 const { auth: context, error: authError } = await getApiAuthContext(request);
 if (authError || !context) {
 return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 }

 const rfq = await prisma.rfq.findUnique({
 where: { id: params.id },
 include: {
 importer: { select: { name: true, companyName: true, country: true } },
 _count: { select: { quotes: true } }
 }
 });

 if (!rfq) return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });

 // Ensure user has access (importer who created it OR any exporter looking for work)
 // Note: In an open marketplace, all exporters can see RFQs. 
 // If targeted, only that exporter can see.
 if (rfq.exporterId && rfq.exporterId !== context.userId && rfq.importerId !== context.userId) {
 return NextResponse.json({ error: 'Access denied' }, { status: 403 });
 }

 return NextResponse.json(rfq);
 } catch (error) {
 return NextResponse.json({ error: 'Failed to fetch RFQ' }, { status: 500 });
 }
}
