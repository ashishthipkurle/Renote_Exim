export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiAuthContext } from "@/lib/auth-server";

export async function GET(request: NextRequest) {
  try {
    const { auth, error } = await getApiAuthContext(request, ["EXPORTER", "ADMIN"]);
    if (!auth) return error!;

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const documents = await prisma.document.findMany({
      where: { userId },
      select: {
        id: true,
        docType: true,
        fileUrl: true,
        fileName: true,
        mimeType: true,
        verificationStatus: true,
        description: true,
        fileSizeBytes: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ documents });
  } catch (error: any) {
    console.error("[admin/users/documents] Error:", error.message);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}
