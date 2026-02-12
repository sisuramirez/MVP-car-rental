import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const activeBookings = await prisma.booking.count({
      where: { vehicleId: id, status: "ACTIVO" },
    });

    return NextResponse.json({
      canDelete: activeBookings === 0,
      activeBookings,
    });
  } catch (error) {
    console.error("Error checking deletable:", error);
    return NextResponse.json(
      { error: "Error al verificar" },
      { status: 500 }
    );
  }
}
