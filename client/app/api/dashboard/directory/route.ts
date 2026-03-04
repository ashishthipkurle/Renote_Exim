import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiAuthContext } from '@/lib/supabase/auth';

export const dynamic = 'force-dynamic';

// GET /api/dashboard/directory — Trading partners for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const auth = await getApiAuthContext(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (auth.role === 'EXPORTER') {
      // Importers who have ordered from this exporter's products
      const partners = await prisma.$queryRaw`
        SELECT 
          u.id,
          u.name,
          u."companyName",
          u.country,
          u.verified,
          u.avatar,
          COUNT(DISTINCT o.id) as "orderCount",
          COALESCE(SUM(o."totalPrice"), 0) as "totalValue"
        FROM users u
        JOIN orders o ON o."importerId" = u.id
        JOIN products p ON o."productId" = p.id
        WHERE p."exporterId" = ${auth.userId}
          AND (
            ${search} = '' 
            OR u.name ILIKE '%' || ${search} || '%' 
            OR u."companyName" ILIKE '%' || ${search} || '%'
            OR u.country ILIKE '%' || ${search} || '%'
          )
        GROUP BY u.id, u.name, u."companyName", u.country, u.verified, u.avatar
        ORDER BY "totalValue" DESC
        LIMIT ${limit} OFFSET ${(page - 1) * limit}
      ` as Array<{
        id: string;
        name: string;
        companyName: string | null;
        country: string | null;
        verified: boolean;
        avatar: string | null;
        orderCount: number;
        totalValue: number;
      }>;

      const totalResult = await prisma.$queryRaw`
        SELECT COUNT(DISTINCT u.id) as count
        FROM users u
        JOIN orders o ON o."importerId" = u.id
        JOIN products p ON o."productId" = p.id
        WHERE p."exporterId" = ${auth.userId}
      ` as Array<{ count: number }>;

      return NextResponse.json({
        partners: partners.map((p) => ({
          id: p.id,
          name: p.name,
          companyName: p.companyName,
          country: p.country,
          verified: p.verified,
          avatar: p.avatar,
          orderCount: Number(p.orderCount),
          totalValue: Number(p.totalValue),
        })),
        pagination: {
          page,
          limit,
          total: Number(totalResult?.[0]?.count ?? 0),
        },
      });
    }

    if (auth.role === 'IMPORTER') {
      // Exporters this importer has ordered from
      const partners = await prisma.$queryRaw`
        SELECT 
          u.id,
          u.name,
          u."companyName",
          u.country,
          u.verified,
          u.avatar,
          COUNT(DISTINCT o.id) as "orderCount",
          COALESCE(SUM(o."totalPrice"), 0) as "totalValue"
        FROM users u
        JOIN products p ON p."exporterId" = u.id
        JOIN orders o ON o."productId" = p.id
        WHERE o."importerId" = ${auth.userId}
          AND (
            ${search} = '' 
            OR u.name ILIKE '%' || ${search} || '%' 
            OR u."companyName" ILIKE '%' || ${search} || '%'
            OR u.country ILIKE '%' || ${search} || '%'
          )
        GROUP BY u.id, u.name, u."companyName", u.country, u.verified, u.avatar
        ORDER BY "totalValue" DESC
        LIMIT ${limit} OFFSET ${(page - 1) * limit}
      ` as Array<{
        id: string;
        name: string;
        companyName: string | null;
        country: string | null;
        verified: boolean;
        avatar: string | null;
        orderCount: number;
        totalValue: number;
      }>;

      const totalResult = await prisma.$queryRaw`
        SELECT COUNT(DISTINCT u.id) as count
        FROM users u
        JOIN products p ON p."exporterId" = u.id
        JOIN orders o ON o."productId" = p.id
        WHERE o."importerId" = ${auth.userId}
      ` as Array<{ count: number }>;

      return NextResponse.json({
        partners: partners.map((p) => ({
          id: p.id,
          name: p.name,
          companyName: p.companyName,
          country: p.country,
          verified: p.verified,
          avatar: p.avatar,
          orderCount: Number(p.orderCount),
          totalValue: Number(p.totalValue),
        })),
        pagination: {
          page,
          limit,
          total: Number(totalResult?.[0]?.count ?? 0),
        },
      });
    }

    return NextResponse.json({ error: 'Invalid role for directory' }, { status: 400 });
  } catch (error) {
    console.error('Directory error:', error);
    return NextResponse.json({ error: 'Failed to fetch directory' }, { status: 500 });
  }
}
