import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiAuthContext } from '@/lib/supabase/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const auth = await getApiAuthContext(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('q') || '';
        const category = searchParams.get('category');

        // Fetch exporters with their product counts and basic order volume
        const exporters = await prisma.user.findMany({
            where: {
                role: 'EXPORTER',
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { companyName: { contains: search, mode: 'insensitive' } },
                ],
                ...(category && category !== 'all' ? {
                    products: {
                        some: { category }
                    }
                } : {})
            },
            select: {
                id: true,
                name: true,
                companyName: true,
                image: true,
                description: true,
                _count: {
                    select: {
                        products: true,
                    }
                },
            }
        });

        // Enhance with trade history for the importer to see
        const exportersWithStats = await Promise.all(exporters.map(async (exp) => {
            // Get total orders from this exporter
            const totalOrders = await prisma.order.count({
                where: { product: { exporterId: exp.id } }
            });

            // Get unique categories they sell in
            const categories = await prisma.product.groupBy({
                by: ['category'],
                where: { exporterId: exp.id },
            });

            // Mock rating (since we don't have a rating system yet)
            const rating = 4 + Math.random();

            return {
                ...exp,
                rating: rating.toFixed(1),
                tradeVolume: totalOrders,
                categories: categories.map(c => c.category),
                joinedAt: new Date().toISOString(), // Fallback
            };
        }));

        return NextResponse.json({
            exporters: exportersWithStats.sort((a, b) => b.tradeVolume - a.tradeVolume),
        });
    } catch (error) {
        console.error('Directory error:', error);
        return NextResponse.json({ error: 'Failed to fetch directory' }, { status: 500 });
    }
}
