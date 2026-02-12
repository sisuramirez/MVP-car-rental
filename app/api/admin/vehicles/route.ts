import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { vehicleSchema } from "@/lib/validations";
import { uploadVehicleImage } from "@/lib/upload";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const category = searchParams.get("category");

    const where: Record<string, string> = {};
    if (status && status !== "ALL") where.status = status;
    if (category && category !== "ALL") where.category = category;

    const vehicles = await prisma.vehicle.findMany({
      where,
      include: {
        bookings: {
          where: {
            status: { in: ["ACTIVO", "CONFIRMADO", "PENDIENTE"] },
            endDate: { gte: new Date() },
          },
          orderBy: { startDate: "asc" },
          take: 1,
          select: {
            id: true,
            startDate: true,
            endDate: true,
            status: true,
            customer: {
              select: { firstName: true, lastName: true },
            },
          },
        },
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: [{ status: "asc" }, { brand: "asc" }],
    });

    return NextResponse.json(vehicles);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return NextResponse.json(
      { error: "Error al obtener vehículos" },
      { status: 500 }
    );
  }
}

function parseFormNumber(value: FormDataEntryValue | null): number {
  return Number(value) || 0;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const data = {
      plateNumber: formData.get("plateNumber") as string,
      brand: formData.get("brand") as string,
      model: formData.get("model") as string,
      year: parseFormNumber(formData.get("year")),
      category: formData.get("category") as string,
      dailyRate1_2: parseFormNumber(formData.get("dailyRate1_2")),
      dailyRate3_6: parseFormNumber(formData.get("dailyRate3_6")),
      weeklyRate: parseFormNumber(formData.get("weeklyRate")),
      monthlyRate: parseFormNumber(formData.get("monthlyRate")),
      transmission: formData.get("transmission") as string,
      fuelType: formData.get("fuelType") as string,
      passengerCapacity: parseFormNumber(formData.get("passengerCapacity")),
      hasAC: formData.get("hasAC") === "true",
      hasGPS: formData.get("hasGPS") === "true",
    };

    const validation = vehicleSchema.safeParse(data);
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

    // Check unique plate
    const existing = await prisma.vehicle.findUnique({
      where: { plateNumber: data.plateNumber },
    });
    if (existing) {
      return NextResponse.json(
        { error: "La placa ya está registrada" },
        { status: 409 }
      );
    }

    // Upload image
    const imageFile = formData.get("image") as File | null;
    let imageUrl: string | null = null;

    if (imageFile && imageFile.size > 0) {
      imageUrl = await uploadVehicleImage(imageFile);
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        ...validation.data,
        imageUrl,
        status: "DISPONIBLE",
      },
    });

    return NextResponse.json({ success: true, vehicle }, { status: 201 });
  } catch (error) {
    console.error("Error creating vehicle:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al crear vehículo" },
      { status: 500 }
    );
  }
}
