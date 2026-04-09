import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiAuthContext } from '@/lib/auth-server';
import { productSchema } from '@/lib/validations';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await getApiAuthContext(request);
    const role = auth?.role || 'USER';

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        exporter: {
          select: {
            id: true,
            name: true,
            companyName: true,
            country: true,
            verified: true,
            email: true,
            phone: true,
            website: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const displayProduct = {
      ...product,
      price: role === 'IMPORTER' ? product.price : (product.regularPrice || product.price)
    };

    return NextResponse.json({ product: displayProduct });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await getApiAuthContext(request);

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if product exists and belongs to user
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (existingProduct.exporterId !== auth.userId && auth.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = productSchema.partial().parse(body);

    const product = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updatedProduct = await tx.product.update({
        where: { id },
        data: validatedData as any,
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

      // If price was updated, record in history
      if (validatedData.price !== undefined && validatedData.price !== existingProduct.price) {
        await tx.priceHistory.create({
          data: {
            productId: updatedProduct.id,
            price: validatedData.price,
          },
        });
      }

      // If regularPrice was updated, we could also record history if needed, 
      // but the user only mentioned 'price' (FOB) for existing history.

      return updatedProduct;
    });

    return NextResponse.json({ product });
  } catch (error: unknown) {
    console.error('Update product error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await getApiAuthContext(request);

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if product exists and belongs to user
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (existingProduct.exporterId !== auth.userId && auth.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
