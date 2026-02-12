import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
  console.log('🧹 Starting database cleanup...\n');

  try {
    // Count records before deletion
    const bookingCount = await prisma.booking.count();
    const customerCount = await prisma.customer.count();
    const vehicleCount = await prisma.vehicle.count();

    console.log('📊 Current state:');
    console.log(`   Bookings: ${bookingCount}`);
    console.log(`   Customers: ${customerCount}`);
    console.log(`   Vehicles: ${vehicleCount}\n`);

    // Delete all bookings
    console.log('🗑️  Deleting all bookings...');
    const deletedBookings = await prisma.booking.deleteMany({});
    console.log(`   ✅ Deleted ${deletedBookings.count} bookings\n`);

    // Delete all customers (test customers)
    console.log('🗑️  Deleting all customers...');
    const deletedCustomers = await prisma.customer.deleteMany({});
    console.log(`   ✅ Deleted ${deletedCustomers.count} customers\n`);

    // Reset all vehicle status to DISPONIBLE
    console.log('🔄 Resetting vehicle status to DISPONIBLE...');
    const updatedVehicles = await prisma.vehicle.updateMany({
      data: {
        status: 'DISPONIBLE',
      },
    });
    console.log(`   ✅ Updated ${updatedVehicles.count} vehicles\n`);

    // Verify cleanup
    const remainingBookings = await prisma.booking.count();
    const remainingCustomers = await prisma.customer.count();
    const availableVehicles = await prisma.vehicle.count({
      where: { status: 'DISPONIBLE' },
    });

    console.log('✨ Cleanup complete!');
    console.log('📊 Final state:');
    console.log(`   Bookings: ${remainingBookings}`);
    console.log(`   Customers: ${remainingCustomers}`);
    console.log(`   Vehicles (DISPONIBLE): ${availableVehicles}/${vehicleCount}\n`);

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
