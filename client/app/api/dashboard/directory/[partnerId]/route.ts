import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiAuthContext } from '@/lib/supabase/auth';

export const dynamic = 'force-dynamic';

// GET /api/dashboard/directory/[partnerId] — Get trade history with a specific partner
export async function GET(
    request: NextRequest,
    { params }: { params: { partnerId: string } }
) {
    try {
        const auth = await getApiAuthContext(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { partnerId } = params;

        if (auth.role === 'EXPORTER') {
            // Find orders where Exporter is the user and Importer is the partner
            const orders = await prisma.order.findMany({
                where: {
                    importerId: partnerId,
                    product: {
                        exporterId: auth.userId,
                    },
                },
                include: {
                    product: {
                        select: { name: true, category: true, images: true, unit: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });

            return NextResponse.json({ orders });
        }

        if (auth.role === 'IMPORTER') {
            // Find orders where Importer is the user and Exporter is the partner
            const orders = await prisma.order.findMany({
                where: {
                    importerId: auth.userId,
                    product: {
                        exporterId: partnerId,
                    },
                },
                include: {
                    product: {
                        select: { name: true, category: true, images: true, unit: true, exporter: { select: { name: true, companyName: true } } },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });

            return NextResponse.json({ orders });
        }

        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    } catch (error) {
        console.error('Directory trade history error:', error);
        return NextResponse.json({ error: 'Failed to fetch trade history' }, { status: 500 });
    }
}
