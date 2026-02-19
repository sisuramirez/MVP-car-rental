import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("Authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Delete all bookings and customers, then reset vehicles to seed state
    await prisma.$transaction([
      prisma.booking.deleteMany(),
      prisma.customer.deleteMany(),
      prisma.vehicle.deleteMany(),
    ]);

    // Recreate the 5 seed vehicles
    await prisma.$transaction([
      prisma.vehicle.create({
        data: {
          plateNumber: "P-123-ABC",
          brand: "Toyota",
          model: "Corolla",
          year: 2023,
          category: "ECONOMICO",
          dailyRate1_2: 35000,
          dailyRate3_6: 30000,
          weeklyRate: 25000,
          monthlyRate: 20000,
          status: "DISPONIBLE",
          transmission: "AUTOMATICA",
          fuelType: "GASOLINA",
          passengerCapacity: 5,
          hasAC: true,
          hasGPS: false,
          imageUrl: null,
        },
      }),
      prisma.vehicle.create({
        data: {
          plateNumber: "P-234-BCD",
          brand: "Honda",
          model: "CR-V",
          year: 2024,
          category: "SUV",
          dailyRate1_2: 55000,
          dailyRate3_6: 48000,
          weeklyRate: 42000,
          monthlyRate: 35000,
          status: "DISPONIBLE",
          transmission: "AUTOMATICA",
          fuelType: "GASOLINA",
          passengerCapacity: 5,
          hasAC: true,
          hasGPS: true,
          imageUrl: null,
        },
      }),
      prisma.vehicle.create({
        data: {
          plateNumber: "P-345-CDE",
          brand: "BMW",
          model: "Serie 5",
          year: 2023,
          category: "LUJO",
          dailyRate1_2: 95000,
          dailyRate3_6: 85000,
          weeklyRate: 75000,
          monthlyRate: 60000,
          status: "DISPONIBLE",
          transmission: "AUTOMATICA",
          fuelType: "GASOLINA",
          passengerCapacity: 5,
          hasAC: true,
          hasGPS: true,
          imageUrl: null,
        },
      }),
      prisma.vehicle.create({
        data: {
          plateNumber: "P-456-DEF",
          brand: "Toyota",
          model: "Sienna",
          year: 2024,
          category: "VAN",
          dailyRate1_2: 65000,
          dailyRate3_6: 58000,
          weeklyRate: 50000,
          monthlyRate: 42000,
          status: "DISPONIBLE",
          transmission: "AUTOMATICA",
          fuelType: "HIBRIDO",
          passengerCapacity: 8,
          hasAC: true,
          hasGPS: true,
          imageUrl: null,
        },
      }),
      prisma.vehicle.create({
        data: {
          plateNumber: "P-567-EFG",
          brand: "Mazda",
          model: "3",
          year: 2023,
          category: "ECONOMICO",
          dailyRate1_2: 32000,
          dailyRate3_6: 28000,
          weeklyRate: 24000,
          monthlyRate: 19000,
          status: "DISPONIBLE",
          transmission: "MANUAL",
          fuelType: "GASOLINA",
          passengerCapacity: 5,
          hasAC: true,
          hasGPS: false,
          imageUrl: null,
        },
      }),
    ]);

    return NextResponse.json({ success: true, resetAt: new Date().toISOString() });
  } catch (error) {
    console.error("Cron reset error:", error);
    return NextResponse.json(
      { error: "Error al resetear la base de datos" },
      { status: 500 }
    );
  }
}
