import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bookingRequestSchema } from "@/lib/validations";
import { calculatePrice } from "@/lib/pricing";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = bookingRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: validation.error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const data = validation.data;
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    // Validate date range
    if (endDate <= startDate) {
      return NextResponse.json(
        { error: "La fecha de fin debe ser posterior a la fecha de inicio" },
        { status: 400 }
      );
    }

    // Check vehicle availability (prevent race condition)
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: data.vehicleId },
      include: {
        bookings: {
          where: {
            AND: [
              { startDate: { lte: endDate } },
              { endDate: { gte: startDate } },
              { status: { not: "CANCELADO" } },
            ],
          },
        },
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Vehículo no encontrado" },
        { status: 404 }
      );
    }

    if (vehicle.status !== "DISPONIBLE") {
      return NextResponse.json(
        { error: "Vehículo no disponible" },
        { status: 409 }
      );
    }

    if (vehicle.bookings.length > 0) {
      return NextResponse.json(
        {
          error:
            "Vehículo no disponible para las fechas seleccionadas. Por favor, selecciona otras fechas.",
        },
        { status: 409 }
      );
    }

    // Calculate pricing
    const pricing = calculatePrice(vehicle, startDate, endDate);
    const depositAmount = Math.round(pricing.total * 0.3); // 30% deposit

    // Create or find customer by email
    let customer = await prisma.customer.findUnique({
      where: { email: data.customer.email },
    });

    if (customer) {
      // Update existing customer data
      customer = await prisma.customer.update({
        where: { email: data.customer.email },
        data: {
          firstName: data.customer.firstName,
          lastName: data.customer.lastName,
          phone: data.customer.phone,
          dpi: data.customer.dpi,
          licenseNumber: data.customer.licenseNumber,
          licenseExpiry: new Date(data.customer.licenseExpiry),
          address: data.customer.address,
          city: data.customer.city,
          department: data.customer.department,
        },
      });
    } else {
      // Create new customer
      customer = await prisma.customer.create({
        data: {
          firstName: data.customer.firstName,
          lastName: data.customer.lastName,
          email: data.customer.email,
          phone: data.customer.phone,
          dpi: data.customer.dpi,
          licenseNumber: data.customer.licenseNumber,
          licenseExpiry: new Date(data.customer.licenseExpiry),
          address: data.customer.address,
          city: data.customer.city,
          department: data.customer.department,
        },
      });
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        vehicleId: data.vehicleId,
        customerId: customer.id,
        startDate,
        endDate,
        dailyRateApplied: pricing.dailyRate,
        totalDays: pricing.totalDays,
        subtotal: pricing.subtotal,
        taxAmount: pricing.tax,
        totalAmount: pricing.total,
        depositAmount,
        pickupLocation: data.pickupLocation,
        dropoffLocation: data.pickupLocation, // Same as pickup for now
        specialRequests: data.specialRequests,
        status: "PENDIENTE",
        paymentStatus: "PENDIENTE",
      },
      include: {
        customer: true,
        vehicle: true,
      },
    });

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        startDate: booking.startDate.toISOString(),
        endDate: booking.endDate.toISOString(),
        totalDays: booking.totalDays,
        subtotal: booking.subtotal,
        taxAmount: booking.taxAmount,
        totalAmount: booking.totalAmount,
        depositAmount: booking.depositAmount,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        pickupLocation: booking.pickupLocation,
        specialRequests: booking.specialRequests,
      },
      customer: {
        firstName: booking.customer.firstName,
        lastName: booking.customer.lastName,
        email: booking.customer.email,
        phone: booking.customer.phone,
      },
      vehicle: {
        brand: booking.vehicle.brand,
        model: booking.vehicle.model,
        year: booking.vehicle.year,
        plateNumber: booking.vehicle.plateNumber,
        imageUrl: booking.vehicle.imageUrl,
      },
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Error al crear la reserva. Por favor, intenta de nuevo." },
      { status: 500 }
    );
  }
}
