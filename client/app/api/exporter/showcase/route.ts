import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth-server'; // Note: adjust auth import if needed

export async function GET() {
  try {
    const items = await prisma.homeShowcaseItem.findMany({
      orderBy: {
        orderIndex: 'asc',
      },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching showcase items:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, subtitle, tag, category, desc, image, orderIndex, isActive } = body;

    const newItem = await prisma.homeShowcaseItem.create({
      data: {
        title,
        subtitle,
        tag,
        category,
        desc,
        image,
        orderIndex: orderIndex ? parseInt(orderIndex) : 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Error creating showcase item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
