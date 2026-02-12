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
        Customer: true,
        Vehicle: true,
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
        firstName: booking.Customer.firstName,
        lastName: booking.Customer.lastName,
        email: booking.Customer.email,
        phone: booking.Customer.phone,
        dpi: booking.Customer.dpi,
      },
      vehicle: {
        id: booking.Vehicle.id,
        brand: booking.Vehicle.brand,
        model: booking.Vehicle.model,
        year: booking.Vehicle.year,
        plateNumber: booking.Vehicle.plateNumber,
        category: booking.Vehicle.category,
        transmission: booking.Vehicle.transmission,
        fuelType: booking.Vehicle.fuelType,
        passengerCapacity: booking.Vehicle.passengerCapacity,
        hasAC: booking.Vehicle.hasAC,
        hasGPS: booking.Vehicle.hasGPS,
        imageUrl: booking.Vehicle.imageUrl,
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
