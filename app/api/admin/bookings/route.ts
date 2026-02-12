import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");

    const where = status && status !== "ALL" ? { status: status as "PENDIENTE" | "CONFIRMADO" | "ACTIVO" | "COMPLETADO" | "CANCELADO" } : {};

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        vehicle: {
          select: {
            brand: true,
            model: true,
            year: true,
            plateNumber: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Error al obtener reservas" },
      { status: 500 }
    );
  }
}
