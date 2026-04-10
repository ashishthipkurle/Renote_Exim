import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiAuthContext } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const auth = await getApiAuthContext(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = request.nextUrl;
        const search = searchParams.get('q') || '';
        const category = searchParams.get('category') || 'all';

        const targetRole = (auth.role === 'IMPORTER' || auth.role === 'ADMIN') ? 'EXPORTER' : 'IMPORTER';

        // Fetch partners with their basic stats
        const users = await prisma.user.findMany({
            where: {
                role: targetRole,
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { businessName: { contains: search, mode: 'insensitive' } },
                    { country: { contains: search, mode: 'insensitive' } },
                ],
                ...(category && category !== 'all' ? (targetRole === 'EXPORTER' ? {
                    products: {
                        some: { category: category as any }
                    }
                } : {}) : {})
            },
            select: {
                id: true,
                name: true,
                businessName: true,
                avatar: true,
<<<<<<< HEAD
                description: true,
=======
                country: true,
                createdAt: true,
>>>>>>> origin/Ashish-new-modification-branch-3
                _count: {
                    select: {
                        products: targetRole === 'EXPORTER',
                        ordersAsBuyer: targetRole === 'IMPORTER',
                    }
                },
            }
        });

<<<<<<< HEAD
        interface Exporter {
            id: string;
            name: string | null;
            companyName: string | null;
            avatar: string | null;
            description: string | null;
            _count: {
                exportedProducts: number;
            };
        }

        // Enhance with trade history for the importer to see
        const exportersWithStats = await Promise.all((exporters as unknown as Exporter[]).map(async (exp) => {
            // Get total orders from this exporter
            const totalOrders = await prisma.order.count({
                where: { product: { exporterId: exp.id } }
            });
=======
        const partnersWithStats = await Promise.all(users.map(async (u: any) => {
            let totalVolume = 0;
            let categories: string[] = [];
>>>>>>> origin/Ashish-new-modification-branch-3

            if (targetRole === 'EXPORTER') {
                totalVolume = await prisma.order.count({
                    where: { product: { exporterId: u.id } }
                });
                const cats = await prisma.product.groupBy({
                    by: ['category'],
                    where: { exporterId: u.id },
                });
                categories = cats.map((c: any) => c.category);
            } else {
                totalVolume = await prisma.order.count({
                    where: { buyerId: u.id }
                });
                // Importers don't have product categories, but maybe we can show what they buy?
                // For now, empty
            }

<<<<<<< HEAD
            // Mock rating (since we don't have a rating system yet)
            const rating = 4 + Math.random();
=======
            const rating = 4 + Math.min(0.9, totalVolume / 50);
>>>>>>> origin/Ashish-new-modification-branch-3

            return {
                id: u.id,
                name: u.name,
                businessName: u.businessName,
                avatar: u.avatar,
                country: u.country,
                rating: rating.toFixed(1),
<<<<<<< HEAD
                tradeVolume: totalOrders,
                categories: categories.map(c => c.category),
                joinedAt: new Date().toISOString(), // Fallback
=======
                tradeVolume: totalVolume,
                categories,
                joinedAt: u.createdAt.toISOString(),
                _count: u._count,
>>>>>>> origin/Ashish-new-modification-branch-3
            };
        }));

        const resultKey = targetRole === 'EXPORTER' ? 'exporters' : 'importers';

        return NextResponse.json({
            [resultKey]: partnersWithStats.sort((a, b) => b.tradeVolume - a.tradeVolume),
            role: auth.role,
            queryRole: targetRole,
        });
    } catch (error) {
        console.error('Directory error:', error);
        return NextResponse.json({ error: 'Failed to fetch directory' }, { status: 500 });
    }
}
