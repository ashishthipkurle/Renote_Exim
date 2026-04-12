import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiAuthContext } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

// GET /api/dashboard/categories — Product categories with stats
export async function GET(request: NextRequest) {
  try {
    const { auth, error: authError } = await getApiAuthContext(request);
    if (authError || !auth) {
      return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (auth.role === 'EXPORTER') {
      const categories = await prisma.product.groupBy({
        by: ['category'],
        where: { exporterId: auth.userId },
        _count: { id: true },
      });

      const revenueData = await prisma.$queryRaw`
        SELECT p.category, COALESCE(SUM(o."totalPrice"), 0) as revenue
        FROM products p
        LEFT JOIN orders o ON o."productId" = p.id
        WHERE p."exporterId" = ${auth.userId}
        GROUP BY p.category
        ORDER BY revenue DESC
      ` as Array<{ category: string; revenue: number }>;

      const revenueMap = new Map((revenueData || []).map((r) => [r.category, Number(r.revenue)]));

      return NextResponse.json({
        categories: categories.map((c) => ({
          name: c.category,
          productCount: c._count.id,
          revenue: revenueMap.get(c.category) ?? 0,
        })).sort((a, b) => b.revenue - a.revenue),
      });
    }

    if (auth.role === 'IMPORTER') {
      const [spentData, user] = await Promise.all([
        prisma.$queryRaw`
          SELECT p.category, COUNT(DISTINCT p.id) as "productCount", COALESCE(SUM(o."totalPrice"), 0) as spent
          FROM orders o
          JOIN products p ON o."productId" = p.id
          WHERE o."importerId" = ${auth.userId}
          GROUP BY p.category
          ORDER BY spent DESC
        ` as Promise<Array<{ category: string; productCount: bigint; spent: number }>>,
        prisma.user.findUnique({
          where: { id: auth.userId },
          select: { preferredCategories: true },
        }),
      ]);

      const spentMap = new Map((spentData || []).map((s) => [s.category, {
        productCount: Number(s.productCount),
        spent: Number(s.spent)
      }]));

      // Also get all categories available to let them pick preferences
      const allCategories = await prisma.product.groupBy({
        by: ['category'],
        where: { available: true },
        _count: { id: true },
      });

      return NextResponse.json({
        role: 'IMPORTER',
        preferredCategories: (user as any)?.preferredCategories ?? [],
        categories: allCategories.map((c) => {
          const stats = spentMap.get(c.category);
          return {
            name: c.category,
            productCount: stats?.productCount ?? 0,
            totalAvailable: c._count.id,
            spent: stats?.spent ?? 0,
            isPreferred: ((user as any)?.preferredCategories ?? []).includes(c.category),
          };
        }).sort((a, b) => b.spent - a.spent),
      });
    }

    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  } catch (error) {
    console.error('Categories error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/dashboard/categories — Toggle category preference
export async function POST(request: NextRequest) {
  try {
    const { auth, error: authError } = await getApiAuthContext(request);
    if (authError || !auth || auth.role !== 'IMPORTER') {
      return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { category } = await request.json();
    if (!category) return NextResponse.json({ error: 'Category required' }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { preferredCategories: true },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const preferences = (user as any).preferredCategories || [];
    const updatedPreferences = preferences.includes(category)
      ? preferences.filter((c: string) => c !== category)
      : [...preferences, category];

    await (prisma.user as any).update({
      where: { id: auth.userId },
      data: { preferredCategories: updatedPreferences },
    });

    return NextResponse.json({ isPreferred: updatedPreferences.includes(category) });
  } catch (error) {
    console.error('Category toggle error:', error);
    return NextResponse.json({ error: 'Failed to toggle preference' }, { status: 500 });
  }
}
