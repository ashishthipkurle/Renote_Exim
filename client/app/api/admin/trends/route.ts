export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
 try {
 const [topCategories, topProducts, recentTrends] = await Promise.all([
 prisma.product.groupBy({
 by: ['category'],
 _count: { id: true },
 orderBy: { _count: { id: 'desc' } },
 take: 5
 }),
 prisma.product.findMany({
 take: 5,
 orderBy: { orders: { _count: 'desc' } },
 include: { _count: { select: { orders: true } } }
 }),
 prisma.priceHistory.findMany({
 take: 10,
 orderBy: { createdAt: 'desc' },
 include: { product: { select: { name: true } } }
 })
 ]);

 return NextResponse.json({
 topCategories: topCategories.map(c => ({ name: c.category, count: c._count.id })),
 topProducts: topProducts.map(p => ({ id: p.id, name: p.name, orders: p._count.orders })),
 recentTrends: recentTrends.map(t => ({
 id: t.id,
 productName: t.product.name,
 price: t.price,
 time: t.createdAt
 }))
 });
 } catch (error) {
 console.error("Admin trends error:", error);
 return NextResponse.json({ error: "Failed to fetch trends" }, { status: 500 });
 }
}

