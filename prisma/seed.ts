import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Delete existing data
  await prisma.booking.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.vehicle.deleteMany();

  const vehicles = await Promise.all([
    // 1. Económico - Toyota Corolla 2023
    prisma.vehicle.create({
      data: {
        plateNumber: "P-123456",
        brand: "Toyota",
        model: "Corolla",
        year: 2023,
        category: "ECONOMICO",
        dailyRate1_2: 35000,   // Q350/día
        dailyRate3_6: 30000,   // Q300/día
        weeklyRate: 25000,     // Q250/día
        monthlyRate: 20000,    // Q200/día
        status: "DISPONIBLE",
        transmission: "AUTOMATICA",
        fuelType: "GASOLINA",
        passengerCapacity: 5,
        hasAC: true,
        hasGPS: false,
        imageUrl: null,
      },
    }),

    // 2. SUV - Honda CR-V 2024
    prisma.vehicle.create({
      data: {
        plateNumber: "P-234567",
        brand: "Honda",
        model: "CR-V",
        year: 2024,
        category: "SUV",
        dailyRate1_2: 55000,   // Q550/día
        dailyRate3_6: 48000,   // Q480/día
        weeklyRate: 42000,     // Q420/día
        monthlyRate: 35000,    // Q350/día
        status: "DISPONIBLE",
        transmission: "AUTOMATICA",
        fuelType: "GASOLINA",
        passengerCapacity: 5,
        hasAC: true,
        hasGPS: true,
        imageUrl: null,
      },
    }),

    // 3. Lujo - BMW 5 Series 2023
    prisma.vehicle.create({
      data: {
        plateNumber: "P-345678",
        brand: "BMW",
        model: "Serie 5",
        year: 2023,
        category: "LUJO",
        dailyRate1_2: 95000,   // Q950/día
        dailyRate3_6: 85000,   // Q850/día
        weeklyRate: 75000,     // Q750/día
        monthlyRate: 60000,    // Q600/día
        status: "DISPONIBLE",
        transmission: "AUTOMATICA",
        fuelType: "GASOLINA",
        passengerCapacity: 5,
        hasAC: true,
        hasGPS: true,
        imageUrl: null,
      },
    }),

    // 4. Van - Toyota Sienna 2024
    prisma.vehicle.create({
      data: {
        plateNumber: "P-456789",
        brand: "Toyota",
        model: "Sienna",
        year: 2024,
        category: "VAN",
        dailyRate1_2: 65000,   // Q650/día
        dailyRate3_6: 58000,   // Q580/día
        weeklyRate: 50000,     // Q500/día
        monthlyRate: 42000,    // Q420/día
        status: "DISPONIBLE",
        transmission: "AUTOMATICA",
        fuelType: "HIBRIDO",
        passengerCapacity: 8,
        hasAC: true,
        hasGPS: true,
        imageUrl: null,
      },
    }),

    // 5. Económico - Mazda 3 2023
    prisma.vehicle.create({
      data: {
        plateNumber: "P-567890",
        brand: "Mazda",
        model: "3",
        year: 2023,
        category: "ECONOMICO",
        dailyRate1_2: 32000,   // Q320/día
        dailyRate3_6: 28000,   // Q280/día
        weeklyRate: 24000,     // Q240/día
        monthlyRate: 19000,    // Q190/día
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

  console.log(`Created ${vehicles.length} vehicles:`);
  vehicles.forEach((v) => {
    console.log(`  - ${v.brand} ${v.model} ${v.year} (${v.plateNumber}) - ${v.category}`);
  });

  console.log("\nSeed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
