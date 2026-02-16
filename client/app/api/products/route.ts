import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiAuthContext } from '@/lib/supabase/auth';
import { productSchema } from '@/lib/validations';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

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

    const product = await prisma.product.create({
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
