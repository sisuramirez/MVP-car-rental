import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculatePrice } from "@/lib/pricing";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");

  if (!startDateParam || !endDateParam) {
    return NextResponse.json(
      { error: "startDate y endDate son requeridos" },
      { status: 400 }
    );
  }

  const startDate = new Date(startDateParam);
  const endDate = new Date(endDateParam);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return NextResponse.json(
      { error: "Formato de fecha inválido" },
      { status: 400 }
    );
  }

  if (endDate <= startDate) {
    return NextResponse.json(
      { error: "endDate debe ser posterior a startDate" },
      { status: 400 }
    );
  }

  // Find vehicles that are DISPONIBLE and have no overlapping non-cancelled bookings
  const vehicles = await prisma.vehicle.findMany({
    where: {
      status: "DISPONIBLE",
      bookings: {
        none: {
          AND: [
            { startDate: { lte: endDate } },
            { endDate: { gte: startDate } },
            { status: { not: "CANCELADO" } },
          ],
        },
      },
    },
    orderBy: { category: "asc" },
  });

  const vehiclesWithPricing = vehicles.map((vehicle) => {
    const pricing = calculatePrice(vehicle, startDate, endDate);
    return { ...vehicle, pricing };
  });

  return NextResponse.json(vehiclesWithPricing);
}
