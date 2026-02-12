import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EstadoReserva } from "@prisma/client";

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDIENTE: ["CONFIRMADO", "CANCELADO"],
  CONFIRMADO: ["ACTIVO", "CANCELADO"],
  ACTIVO: ["COMPLETADO", "CANCELADO"],
  COMPLETADO: [],
  CANCELADO: [],
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = parseInt(params.id);
    if (isNaN(bookingId)) {
      return NextResponse.json(
        { error: "ID de reserva inválido" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const newStatus = body.status;

    if (!newStatus) {
      return NextResponse.json(
        { error: "Estado requerido" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Reserva no encontrada" },
        { status: 404 }
      );
    }

    const allowed = VALID_TRANSITIONS[booking.status] || [];
    if (!allowed.includes(newStatus)) {
      return NextResponse.json(
        {
          error: `No se puede cambiar de ${booking.status} a ${newStatus}`,
        },
        { status: 400 }
      );
    }

    // Update booking status
    const updateData: { status: EstadoReserva; cancelledAt?: Date } = { status: newStatus as EstadoReserva };
    if (newStatus === "CANCELADO") {
      updateData.cancelledAt = new Date();
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
      include: { vehicle: true, customer: true },
    });

    // Update vehicle status based on booking transition
    if (newStatus === "ACTIVO") {
      await prisma.vehicle.update({
        where: { id: booking.vehicleId },
        data: { status: "RENTADO" },
      });
    } else if (newStatus === "COMPLETADO" || newStatus === "CANCELADO") {
      // Check if vehicle has any other active bookings
      const otherActive = await prisma.booking.count({
        where: {
          vehicleId: booking.vehicleId,
          status: "ACTIVO",
          id: { not: bookingId },
        },
      });
      if (otherActive === 0) {
        await prisma.vehicle.update({
          where: { id: booking.vehicleId },
          data: { status: "DISPONIBLE" },
        });
      }
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    return NextResponse.json(
      { error: "Error al actualizar estado" },
      { status: 500 }
    );
  }
}
