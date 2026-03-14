import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const categories = await prisma.product.groupBy({
            by: ['category'],
            _count: { id: true },
        });

        return NextResponse.json({
            categories: categories.map(c => ({
                name: c.category,
                items: c._count.id
            }))
        });
    } catch (error) {
        console.error("Admin categories error:", error);
        return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }
}
