import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiAuthContext } from '@/lib/auth-server';

export async function POST(request: NextRequest) {
  try {
    const { auth: context, error: authError } = await getApiAuthContext(request);
    if (authError || !context || context.role !== 'IMPORTER') {
      return authError || NextResponse.json({ error: 'Only importers can create RFQs' }, { status: 403 });
    }

    const { title, description, category, quantity, unit, budget, deadline, exporterId } = await request.json();

    const rfq = await (prisma as any).rfq.create({
      data: {
        title,
        description,
        category,
        quantity: Number(quantity),
        unit,
        budget: budget ? Number(budget) : null,
        deadline: deadline ? new Date(deadline) : null,
        importerId: context.userId,
        exporterId, // Optional: Target specific exporter
      }
    });

    return NextResponse.json(rfq, { status: 201 });
  } catch (error) {
    console.error('RFQ Error:', error);
    return NextResponse.json({ error: 'Failed to create RFQ' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { auth: context, error: authError } = await getApiAuthContext(request);
    if (authError || !context) {
      return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rfqs = await (prisma as any).rfq.findMany({
      where: context.role === 'IMPORTER' 
        ? { importerId: context.userId }
        : { OR: [{ exporterId: context.userId }, { exporterId: null }] },
      include: {
        importer: { select: { name: true, email: true } },
        _count: { select: { quotes: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(rfqs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch RFQs' }, { status: 500 });
  }
}
