import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiAuthContext } from '@/lib/auth-server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { auth, error: authError } = await getApiAuthContext(request);
    if (authError || !auth) {
      return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (auth.role !== 'EXPORTER' && auth.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const where = auth.role === 'EXPORTER' ? { exporterId: auth.userId } : {};

    const transportMethods = await prisma.transportMethod.findMany({
      where,
      include: {
        _count: {
          select: { shipments: { where: { currentStatus: { notIn: ['DELIVERED'] } } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ transportMethods });
  } catch (error: any) {
    console.error('Get transport methods error:', error);
    const errMsg = error?.message?.toLowerCase() || "";
    if (errMsg.includes("fetch") || errMsg.includes("reach database") || errMsg.includes("database server") || errMsg.includes("timeout") || errMsg.includes("timed out") || error?.code === "P1001" || error?.code === "ECONNREFUSED") {
      return NextResponse.json({ error: 'Network error: Unable to connect to the database.' }, { status: 503 });
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { auth, error: authError } = await getApiAuthContext(request);
    if (authError || !auth) {
      return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (auth.role !== 'EXPORTER' && auth.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const schema = z.object({
      name: z.string().min(1),
      type: z.enum(['OCEAN', 'AIR', 'LAND']),
      capacity: z.string().optional(),
      trackingUrl: z.string().optional(),
      originRegion: z.string().optional(),
      destinationRegion: z.string().optional(),
    });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const method = await prisma.transportMethod.create({
      data: {
        name: parsed.data.name,
        type: parsed.data.type,
        capacity: parsed.data.capacity,
        trackingUrl: parsed.data.trackingUrl,
        originRegion: parsed.data.originRegion,
        destinationRegion: parsed.data.destinationRegion,
        exporterId: auth.userId,
      }
    });

    return NextResponse.json({ method }, { status: 201 });
  } catch (error: any) {
    console.error('Create transport method error:', error);
    const errMsg = error?.message?.toLowerCase() || "";
    if (errMsg.includes("fetch") || errMsg.includes("reach database") || errMsg.includes("database server") || errMsg.includes("timeout") || errMsg.includes("timed out") || error?.code === "P1001" || error?.code === "ECONNREFUSED") {
      return NextResponse.json({ error: 'Network error: Unable to connect to the database.' }, { status: 503 });
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
