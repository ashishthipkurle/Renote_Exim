import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiAuthContext } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { auth, error: authError } = await getApiAuthContext(request);
    if (authError || !auth) {
      return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (auth.role !== 'EXPORTER' && auth.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = params;

    // Verify ownership
    const method = await prisma.transportMethod.findUnique({ where: { id } });
    if (!method) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (auth.role !== 'ADMIN' && method.exporterId !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if it's being used by active shipments
    const activeShipments = await prisma.shipment.count({
      where: {
        transportMethodId: id,
        currentStatus: { notIn: ['DELIVERED'] }
      }
    });

    if (activeShipments > 0) {
      return NextResponse.json({ error: 'Cannot delete: This method is currently assigned to active shipments.' }, { status: 400 });
    }

    await prisma.transportMethod.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete transport method error:', error);
    const errMsg = error?.message?.toLowerCase() || "";
    if (errMsg.includes("fetch") || errMsg.includes("reach database") || errMsg.includes("database server") || error?.code === "P1001" || error?.code === "ECONNREFUSED") {
      return NextResponse.json({ error: 'Network error: Unable to connect to the database.' }, { status: 503 });
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
