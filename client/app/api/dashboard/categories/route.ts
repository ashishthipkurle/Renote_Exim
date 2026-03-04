import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiAuthContext } from '@/lib/supabase/auth';

export const dynamic = 'force-dynamic';

// GET /api/dashboard/categories — Product categories with stats
export async function GET(request: NextRequest) {
  try {
    const auth = await getApiAuthContext(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (auth.role === 'EXPORTER') {
      // Categories from this exporter's products
      const categories = await prisma.product.groupBy({
        by: ['category'],
        where: { exporterId: auth.userId },
        _count: { id: true },
      });

      // Get revenue per category
      const revenueData = await prisma.$queryRaw`
        SELECT p.category, COALESCE(SUM(o."totalPrice"), 0) as revenue
        FROM products p
        LEFT JOIN orders o ON o."productId" = p.id
        WHERE p."exporterId" = ${auth.userId}
        GROUP BY p.category
        ORDER BY revenue DESC
      ` as Array<{ category: string; revenue: number }>;

      const revenueMap = new Map(revenueData.map((r) => [r.category, Number(r.revenue)]));

      return NextResponse.json({
        categories: categories.map((c) => ({
          name: c.category,
          productCount: c._count.id,
          revenue: revenueMap.get(c.category) ?? 0,
        })).sort((a, b) => b.revenue - a.revenue),
      });
    }

    if (auth.role === 'IMPORTER') {
      // Categories from products this importer has ordered
      const categories = await prisma.$queryRaw`
        SELECT p.category, COUNT(DISTINCT p.id) as "productCount", COALESCE(SUM(o."totalPrice"), 0) as spent
        FROM orders o
        JOIN products p ON o."productId" = p.id
        WHERE o."importerId" = ${auth.userId}
        GROUP BY p.category
        ORDER BY spent DESC
      ` as Array<{ category: string; productCount: number; spent: number }>;

      return NextResponse.json({
        categories: (categories || []).map((c) => ({
          name: c.category,
          productCount: Number(c.productCount),
          spent: Number(c.spent),
        })),
      });
    }

    // For any role, return all available categories with counts
    const allCategories = await prisma.product.groupBy({
      by: ['category'],
      where: { available: true },
      _count: { id: true },
    });

    return NextResponse.json({
      categories: allCategories.map((c) => ({
        name: c.category,
        productCount: c._count.id,
      })),
    });
  } catch (error) {
    console.error('Categories error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
