export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
 try {
 const searchParams = req.nextUrl.searchParams;
 const page = parseInt(searchParams.get("page") || "1");
 const pageSize = parseInt(searchParams.get("pageSize") || "20");
 const search = searchParams.get("q") || "";
 const status = searchParams.get("status");

 const where: any = {};

 if (search) {
 where.OR = [
 { orderNumber: { contains: search, mode: "insensitive" } },
 ];
 }

 if (status) {
 where.status = status;
 }

 const [orders, total] = await Promise.all([
 prisma.order.findMany({
 where,
 skip: (page - 1) * pageSize,
 take: pageSize,
 orderBy: { createdAt: "desc" },
 include: {
 product: { select: { name: true } },
 importer: { select: { name: true, businessName: true } },
 shipment: { select: { trackingNumber: true, status: true } },
 },
 }),
 prisma.order.count({ where }),
 ]);

 return NextResponse.json({
 orders,
 total,
 page,
 totalPages: Math.ceil(total / pageSize),
 });
 } catch (error) {
 console.error("Admin orders fetch error:", error);
 return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
 }
}

