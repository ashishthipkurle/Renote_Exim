export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiAuthContext } from "@/lib/auth-server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { auth, error: authError } = await getApiAuthContext(request);
    if (authError || !auth) {
      return authError || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (auth.role !== "EXPORTER" && auth.role !== "ADMIN") {
      return NextResponse.json({ error: "Only exporters can assign transport methods" }, { status: 403 });
    }

    const { transportMethodId } = await request.json();
    if (!transportMethodId) {
      return NextResponse.json({ error: "transportMethodId is required" }, { status: 400 });
    }

    const resolvedParams = await params;
    const orderId = resolvedParams.id;

    // Verify order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { buyer: true, product: { include: { exporter: true } }, shipment: true }
    });

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // If shipment exists, just update it
    if (order.shipment) {
      await prisma.shipment.update({
        where: { id: order.shipment.id },
        data: { transportMethodId }
      });
      return NextResponse.json({ success: true, message: "Transport method updated" });
    }

    // Otherwise, create a new shipment with defaults
    const origin = (order as any).product?.exporter?.country || "Origin";
    const destination = (order as any).buyer?.country || "Destination";
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);
    
    const trackingNumber = `TRK-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const shipment = await prisma.shipment.create({
      data: {
        orderId,
        transportMethodId,
        trackingNumber,
        origin,
        destination,
        estimatedDelivery,
        currentStatus: "PREPARING",
        statusHistory: {
          create: {
            status: "PREPARING",
            location: origin,
            note: "Shipment created via quick assign"
          }
        }
      }
    });

    // Update order status if it was pending or confirmed
    if (order.orderStatus === "PENDING" || order.orderStatus === "CONFIRMED" || order.orderStatus === "QUOTE_CONFIRMED") {
      await prisma.order.update({
        where: { id: orderId },
        data: { orderStatus: "PROCESSING" }
      });
    }

    return NextResponse.json({ success: true, shipment });
  } catch (error) {
    console.error("Assign transport method error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
