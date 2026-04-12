import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiAuthContext } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

// GET /api/dashboard/inventory — Importer's Wishlist with Price Tracking
export async function GET(request: NextRequest) {
    try {
        const { auth, error: authError } = await getApiAuthContext(request);
        if (authError || !auth || auth.role !== 'IMPORTER') {
            return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch wishlist items with product details and price history
        const wishlist = await prisma.wishlist.findMany({
            where: { userId: auth.userId },
            include: {
                product: {
                    include: {
                        exporter: {
                            select: {
                                id: true,
                                name: true,
                                companyName: true,
                                country: true,
                            },
                        },
                        priceHistory: {
                            orderBy: { createdAt: 'desc' },
                            take: 10,
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({
            wishlist: wishlist.map((item) => {
                const product = item.product;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const history = (product as any).priceHistory || [];
                const currentPrice = product.price;
                const previousPrice = history.length > 1 ? history[1].price : currentPrice;

                // Price change calculation
                const priceDiff = currentPrice - previousPrice;
                const priceChangePercent = previousPrice > 0 ? (priceDiff / previousPrice) * 100 : 0;

                return {
                    id: item.id,
                    productId: product.id,
                    name: product.name,
                    category: product.category,
                    currentPrice: product.price,
                    previousPrice,
                    priceChangePercent: Number(priceChangePercent.toFixed(1)),
                    minOrderQty: product.minOrderQty,
                    unit: product.unit,
                    originCountry: product.originCountry,
                    images: product.images,
                    exporter: product.exporter,
                    savedAt: item.createdAt,
                };
            }),
        });
    } catch (error) {
        console.error('Inventory GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
    }
}

// POST /api/dashboard/inventory — Toggle product in wishlist
export async function POST(request: NextRequest) {
    try {
        const { auth, error: authError } = await getApiAuthContext(request);
        if (!auth || auth.role !== 'IMPORTER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { productId } = await request.json();
        if (!productId) {
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
        }

        // Check if item exists in wishlist
        const existing = await prisma.wishlist.findUnique({
            where: {
                userId_productId: {
                    userId: auth.userId,
                    productId,
                },
            },
        });

        if (existing) {
            // Remove from wishlist
            await prisma.wishlist.delete({
                where: { id: existing.id },
            });
            return NextResponse.json({ status: 'REMOVED' });
        } else {
            // Add to wishlist
            await prisma.wishlist.create({
                data: {
                    userId: auth.userId,
                    productId,
                },
            });
            return NextResponse.json({ status: 'ADDED' });
        }
    } catch (error) {
        console.error('Inventory POST error:', error);
        return NextResponse.json({ error: 'Failed to update wishlist' }, { status: 500 });
    }
}
