import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalBookings,
      pendientes,
      confirmados,
      activos,
      completados,
      cancelados,
      todayPickups,
      todayReturns,
      totalVehicles,
      vehiclesDisponibles,
      vehiclesRentados,
      vehiclesMantenimiento,
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: "PENDIENTE" } }),
      prisma.booking.count({ where: { status: "CONFIRMADO" } }),
      prisma.booking.count({ where: { status: "ACTIVO" } }),
      prisma.booking.count({ where: { status: "COMPLETADO" } }),
      prisma.booking.count({ where: { status: "CANCELADO" } }),
      prisma.booking.count({
        where: {
          startDate: { gte: today, lt: tomorrow },
          status: { in: ["PENDIENTE", "CONFIRMADO"] },
        },
      }),
      prisma.booking.count({
        where: {
          endDate: { gte: today, lt: tomorrow },
          status: "ACTIVO",
        },
      }),
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { status: "DISPONIBLE" } }),
      prisma.vehicle.count({ where: { status: "RENTADO" } }),
      prisma.vehicle.count({ where: { status: "MANTENIMIENTO" } }),
    ]);

    return NextResponse.json({
      bookings: {
        total: totalBookings,
        pendientes,
        confirmados,
        activos,
        completados,
        cancelados,
      },
      today: {
        pickups: todayPickups,
        returns: todayReturns,
      },
      vehicles: {
        total: totalVehicles,
        disponibles: vehiclesDisponibles,
        rentados: vehiclesRentados,
        mantenimiento: vehiclesMantenimiento,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
}
