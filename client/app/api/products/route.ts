import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiAuthContext } from '@/lib/supabase/auth';
import { productSchema } from '@/lib/validations';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { createSupabaseRouteClient } from '@/lib/supabase/route';

const productCategorySchema = z.enum([
  'CHEMICALS',
  'MACHINES',
  'TEXTILES',
  'MEDICAL',
  'HANDICRAFTS',
  'FOOD',
  'ELECTRONICS',
  'AUTOMOTIVE',
  'CONSTRUCTION',
  'AGRICULTURE',
  'OTHER',
]);

// GET /api/products - Get all products (with filtering)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const country = searchParams.get('country');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    // Try Prisma first
    try {
      const where: Prisma.ProductWhereInput = { available: true };

      if (category) {
        const parsed = productCategorySchema.safeParse(category);
        if (parsed.success) {
          where.category = parsed.data;
        }
      }
      if (country) where.originCountry = country;
      if (minPrice || maxPrice) {
        const price: Prisma.FloatFilter = {};
        if (minPrice) price.gte = parseFloat(minPrice);
        if (maxPrice) price.lte = parseFloat(maxPrice);
        where.price = price;
      }
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            exporter: {
              select: {
                id: true,
                name: true,
                companyName: true,
                country: true,
                verified: true,
              },
            },
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.product.count({ where }),
      ]);

      return NextResponse.json({
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (prismaError) {
      console.warn('[GET /api/products] Prisma failed, using Supabase REST fallback:', prismaError);
    }

    // Fallback: Supabase REST
    const { supabase } = createSupabaseRouteClient(request);
    let query = supabase
      .from('products')
      .select('*, exporter:users!exporterId(id, name, companyName, country, verified)', { count: 'exact' })
      .eq('available', true)
      .order('createdAt', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (category) query = query.eq('category', category);
    if (country) query = query.eq('originCountry', country);
    if (minPrice) query = query.gte('price', parseFloat(minPrice));
    if (maxPrice) query = query.lte('price', parseFloat(maxPrice));
    if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);

    const { data: products, count, error } = await query;

    if (error) {
      console.error('[GET /api/products] Supabase REST also failed:', error);
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    return NextResponse.json({
      products: products || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create new product (Exporters only)
export async function POST(request: NextRequest) {
  try {
    const auth = await getApiAuthContext(request);

    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (auth.role !== 'EXPORTER') {
      return NextResponse.json(
        { error: 'Access denied. Exporters only.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = productSchema.parse(body);

    // Try Prisma first
    try {
      const product = await prisma.$transaction(async (tx) => {
        const newProduct = await tx.product.create({
          data: {
            ...validatedData,
            exporterId: auth.userId,
          },
          include: {
            exporter: {
              select: {
                id: true,
                name: true,
                companyName: true,
                country: true,
              },
            },
          },
        });

        // Record initial price in history
        await tx.priceHistory.create({
          data: {
            productId: newProduct.id,
            price: newProduct.price,
          },
        });

        return newProduct;
      });

      return NextResponse.json({ product }, { status: 201 });
    } catch (prismaError) {
      console.warn('[POST /api/products] Prisma create failed, using Supabase REST fallback:', prismaError);
    }

    // Fallback: Supabase REST
    const { supabase } = createSupabaseRouteClient(request);
    const { data: product, error: insertError } = await supabase
      .from('products')
      .insert({
        ...validatedData,
        exporterId: auth.userId,
      })
      .select('*, exporter:users!exporterId(id, name, companyName, country)')
      .single();

    if (insertError) {
      console.error('[POST /api/products] Supabase REST insert failed:', insertError);
      return NextResponse.json(
        { error: 'Failed to create product' },
        { status: 500 }
      );
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: unknown) {
    console.error('Create product error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

