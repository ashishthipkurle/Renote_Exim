export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
 try {
 const searchParams = req.nextUrl.searchParams;
 const page = parseInt(searchParams.get("page") || "1");
 const pageSize = parseInt(searchParams.get("pageSize") || "20");
 const status = searchParams.get("status");

 const where: any = {};

 if (status) {
 where.status = status;
 }

 const [shipments, total] = await Promise.all([
 prisma.shipment.findMany({
 where,
 skip: (page - 1) * pageSize,
 take: pageSize,
 orderBy: { createdAt: "desc" },
 include: {
 order: {
 select: {
 orderNumber: true,
 product: { select: { name: true } },
 },
 },
 },
 }),
 prisma.shipment.count({ where }),
 ]);

 return NextResponse.json({
 shipments,
 total,
 page,
 totalPages: Math.ceil(total / pageSize),
 });
 } catch (error) {
 console.error("Admin shipments fetch error:", error);
 return NextResponse.json({ error: "Failed to fetch shipments" }, { status: 500 });
 }
}

