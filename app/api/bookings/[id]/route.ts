import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
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

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        vehicle: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Reserva no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: booking.id,
      startDate: booking.startDate.toISOString(),
      endDate: booking.endDate.toISOString(),
      totalDays: booking.totalDays,
      dailyRateApplied: booking.dailyRateApplied,
      subtotal: booking.subtotal,
      taxAmount: booking.taxAmount,
      totalAmount: booking.totalAmount,
      depositAmount: booking.depositAmount,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      pickupLocation: booking.pickupLocation,
      dropoffLocation: booking.dropoffLocation,
      specialRequests: booking.specialRequests,
      createdAt: booking.createdAt.toISOString(),
      customer: {
        firstName: booking.customer.firstName,
        lastName: booking.customer.lastName,
        email: booking.customer.email,
        phone: booking.customer.phone,
        dpi: booking.customer.dpi,
      },
      vehicle: {
        id: booking.vehicle.id,
        brand: booking.vehicle.brand,
        model: booking.vehicle.model,
        year: booking.vehicle.year,
        plateNumber: booking.vehicle.plateNumber,
        category: booking.vehicle.category,
        transmission: booking.vehicle.transmission,
        fuelType: booking.vehicle.fuelType,
        passengerCapacity: booking.vehicle.passengerCapacity,
        hasAC: booking.vehicle.hasAC,
        hasGPS: booking.vehicle.hasGPS,
        imageUrl: booking.vehicle.imageUrl,
      },
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { error: "Error al obtener la reserva" },
      { status: 500 }
    );
  }
}
