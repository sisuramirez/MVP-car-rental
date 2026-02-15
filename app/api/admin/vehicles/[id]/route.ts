import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { vehicleUpdateSchema } from "@/lib/validations";
import { uploadVehicleImage, deleteVehicleImage } from "@/lib/upload";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        _count: {
          select: { Booking: true },
        },
        Booking: {
          where: { status: "ACTIVO" },
          select: { id: true },
        },
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Vehículo no encontrado" },
        { status: 404 }
      );
    }

    const { Booking, ...rest } = vehicle;
    return NextResponse.json({
      ...rest,
      activeBookings: Booking.length,
    });
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    return NextResponse.json(
      { error: "Error al obtener vehículo" },
      { status: 500 }
    );
  }
}

function parseFormNumber(value: FormDataEntryValue | null): number | undefined {
  if (value === null || value === "") return undefined;
  const n = Number(value);
  return isNaN(n) ? undefined : n;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      return NextResponse.json(
        { error: "Vehículo no encontrado" },
        { status: 404 }
      );
    }

    const formData = await request.formData();

    // Build update data from form fields
    const rawData: Record<string, string | number | boolean> = {};
    const fields = [
      "plateNumber",
      "brand",
      "model",
      "category",
      "status",
      "transmission",
      "fuelType",
    ];
    for (const f of fields) {
      const v = formData.get(f);
      if (v !== null && v !== "" && typeof v === "string") rawData[f] = v;
    }

    const numFields = [
      "year",
      "dailyRate1_2",
      "dailyRate3_6",
      "weeklyRate",
      "monthlyRate",
      "passengerCapacity",
    ];
    for (const f of numFields) {
      const v = parseFormNumber(formData.get(f));
      if (v !== undefined) rawData[f] = v;
    }

    const hasAC = formData.get("hasAC");
    if (hasAC !== null) rawData.hasAC = hasAC === "true";
    const hasGPS = formData.get("hasGPS");
    if (hasGPS !== null) rawData.hasGPS = hasGPS === "true";

    // Validate
    const validation = vehicleUpdateSchema.safeParse(rawData);
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

    // Check plate uniqueness if changed
    if (
      validation.data.plateNumber &&
      validation.data.plateNumber !== vehicle.plateNumber
    ) {
      const existing = await prisma.vehicle.findUnique({
        where: { plateNumber: validation.data.plateNumber },
      });
      if (existing) {
        return NextResponse.json(
          { error: "La placa ya está registrada" },
          { status: 409 }
        );
      }
    }

    // Handle image upload
    const imageFile = formData.get("image") as File | null;
    let imageUrl: string | undefined;

    if (imageFile && imageFile.size > 0) {
      imageUrl = await uploadVehicleImage(imageFile);
      // Delete old image
      if (vehicle.imageUrl) {
        await deleteVehicleImage(vehicle.imageUrl);
      }
    }

    const updated = await prisma.vehicle.update({
      where: { id },
      data: {
        ...validation.data,
        ...(imageUrl !== undefined ? { imageUrl } : {}),
      },
    });

    return NextResponse.json({ success: true, vehicle: updated });
  } catch (error) {
    console.error("Error updating vehicle:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al actualizar vehículo" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      return NextResponse.json(
        { error: "Vehículo no encontrado" },
        { status: 404 }
      );
    }

    // Check for active bookings
    const activeBookings = await prisma.booking.findMany({
      where: { vehicleId: id, status: "ACTIVO" },
      select: { id: true },
    });

    if (activeBookings.length > 0) {
      return NextResponse.json(
        {
          error: `No se puede retirar este vehículo. Tiene ${activeBookings.length} reserva(s) activa(s).`,
          activeBookingIds: activeBookings.map((b) => b.id),
        },
        { status: 409 }
      );
    }

    await prisma.vehicle.update({
      where: { id },
      data: { status: "RETIRADO" },
    });

    return NextResponse.json({
      success: true,
      message: "Vehículo retirado correctamente",
      vehicleId: id,
    });
  } catch (error) {
    console.error("Error retiring vehicle:", error);
    return NextResponse.json(
      { error: "Error al retirar vehículo" },
      { status: 500 }
    );
  }
}
