import { NextResponse } from "next/server";

/**
 * GET /api/health
 * Returns the health status of the API.
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
}
