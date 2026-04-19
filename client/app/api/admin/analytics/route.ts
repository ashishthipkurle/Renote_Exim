export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
 try {
 // Last 6 months signups
 const months = [];
 for (let i = 5; i >= 0; i--) {
 const d = new Date();
 d.setMonth(d.getMonth() - i);
 months.push({
 name: d.toLocaleString('default', { month: 'short' }),
 date: new Date(d.getFullYear(), d.getMonth(), 1),
 endDate: new Date(d.getFullYear(), d.getMonth() + 1, 0),
 });
 }

 const growthData = await Promise.all(
 months.map(async (m) => {
 const [users, revenue, orders] = await Promise.all([
 prisma.user.count({
 where: { createdAt: { gte: m.date, lte: m.endDate } },
 }),
 prisma.order.aggregate({
 where: { createdAt: { gte: m.date, lte: m.endDate } },
 _sum: { totalPrice: true },
 }),
 prisma.order.count({
 where: { createdAt: { gte: m.date, lte: m.endDate } },
 }),
 ]);


 return {
 month: m.name,
 users,
 revenue: revenue._sum.totalPrice || 0,
 orders,
 };
 })
 );

 // Category distribution
 const categoriesRaw = await prisma.product.groupBy({
 by: ['category'],
 _count: { id: true },
 });

 const categoryDistribution = categoriesRaw.map((c: any) => ({
 name: c.category,
 value: c._count.id,
 }));

 return NextResponse.json({
 growthData,
 categoryDistribution,
 });
 } catch (error) {
 console.error("Admin analytics error:", error);
 return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
 }
}

