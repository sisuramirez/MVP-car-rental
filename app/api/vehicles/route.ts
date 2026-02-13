import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering and disable caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const vehicles = await prisma.vehicle.findMany({
    orderBy: { category: "asc" },
  });

  return NextResponse.json(vehicles, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
