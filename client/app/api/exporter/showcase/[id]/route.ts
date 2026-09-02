import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth-server'; // Note: adjust auth import if needed

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    
    // Only update fields that are provided
    const updateData: any = {};
    const fields = ['title', 'subtitle', 'tag', 'category', 'desc', 'image', 'orderIndex', 'isActive'];
    
    fields.forEach(field => {
      if (body[field] !== undefined) {
        if (field === 'orderIndex') {
          updateData[field] = parseInt(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    });

    const updatedItem = await prisma.homeShowcaseItem.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating showcase item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await prisma.homeShowcaseItem.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting showcase item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
