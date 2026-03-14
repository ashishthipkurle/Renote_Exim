import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiAuthContext } from "@/lib/supabase/auth";
import { z } from "zod";

const documentSchema = z.object({
  fileName: z.string().min(1),
  fileUrl: z.string().url(),
  fileSize: z.number().int().positive(),
  mimeType: z.string().min(1),
  type: z.enum([
    "BUSINESS_LICENSE",
    "TAX_CERTIFICATE",
    "IMPORT_EXPORT_LICENSE",
    "CERTIFICATE_OF_ORIGIN",
    "QUALITY_CERTIFICATE",
    "INSURANCE_DOCUMENT",
    "INVOICE",
    "PACKING_LIST",
    "BILL_OF_LADING",
    "OTHER"
  ]),
  orderId: z.string().uuid().optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
});

/**
 * GET /api/documents
 * Fetches all documents for the current user.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await getApiAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    const documents = await prisma.document.findMany({
      where: {
        ownerId: auth.userId,
        ...(orderId ? { orderId } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ documents });
  } catch (error: any) {
    console.error("Documents GET error:", error);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}

/**
 * POST /api/documents
 * Records a new document upload in the database.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await getApiAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = documentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
    }

    const document = await prisma.document.create({
      data: {
        ...parsed.data,
        ownerId: auth.userId,
      },
    });

    return NextResponse.json({ document });
  } catch (error: any) {
    console.error("Documents POST error:", error);
    return NextResponse.json({ error: "Failed to record document" }, { status: 500 });
  }
}
