export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
 try {
 const searchParams = req.nextUrl.searchParams;
 const page = parseInt(searchParams.get("page") || "1");
 const pageSize = parseInt(searchParams.get("pageSize") || "20");
 const search = searchParams.get("q") || "";
 const category = searchParams.get("category");
 const available = searchParams.get("available");

 const where: any = {};

 if (search) {
 where.OR = [
 { name: { contains: search, mode: "insensitive" } },
 { description: { contains: search, mode: "insensitive" } },
 ];
 }

 if (category) {
 where.category = category;
 }

 if (available !== null && available !== undefined && available !== "") {
 where.available = available === "true";
 }

 const [products, total] = await Promise.all([
 prisma.product.findMany({
 where,
 skip: (page - 1) * pageSize,
 take: pageSize,
 orderBy: { createdAt: "desc" },
 include: {
 exporter: {
 select: {
 name: true,
 businessName: true,
 },
 },
 },
 }),
 prisma.product.count({ where }),
 ]);

 return NextResponse.json({
 products,
 total,
 page,
 totalPages: Math.ceil(total / pageSize),
 });
 } catch (error) {
 console.error("Admin products fetch error:", error);
 return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
 }
}

export async function POST(req: NextRequest) {
 try {
 const body = await req.json();
 const { productIds, action, available } = body;

 if (!productIds || !Array.isArray(productIds) || !action) {
 return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
 }

 switch (action) {
 case "toggleAvailability":
 await prisma.product.updateMany({
 where: { id: { in: productIds } },
 data: { available: available },
 });
 break;
 case "delete":
 await prisma.product.deleteMany({
 where: { id: { in: productIds } },
 });
 break;
 default:
 return NextResponse.json({ error: "Invalid action" }, { status: 400 });
 }

 return NextResponse.json({ message: "Action successful" });
 } catch (error) {
 console.error("Admin product action error:", error);
 return NextResponse.json({ error: "Failed to perform action" }, { status: 500 });
 }
}

