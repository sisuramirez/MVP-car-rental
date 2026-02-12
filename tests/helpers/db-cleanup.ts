import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Delete all test bookings created during test runs
 * Identifies test data by email pattern (test-*, conflict-test-*, existing-customer-*)
 */
export async function cleanupTestBookings() {
  try {
    // Find all test customers by email pattern
    const testCustomers = await prisma.customer.findMany({
      where: {
        OR: [
          { email: { contains: 'test-' } },
          { email: { contains: 'conflict-test-' } },
          { email: { contains: 'existing-customer-' } },
          { email: { endsWith: '@example.com' } },
        ],
      },
      select: { id: true },
    });

    const customerIds = testCustomers.map((c) => c.id);

    if (customerIds.length > 0) {
      // Delete bookings for test customers
      const deletedBookings = await prisma.booking.deleteMany({
        where: {
          customerId: { in: customerIds },
        },
      });

      // Delete test customers
      const deletedCustomers = await prisma.customer.deleteMany({
        where: {
          id: { in: customerIds },
        },
      });

      console.log(`🧹 Cleaned up ${deletedBookings.count} test bookings and ${deletedCustomers.count} test customers`);
    }

    // Reset all vehicles to DISPONIBLE
    await prisma.vehicle.updateMany({
      data: { status: 'DISPONIBLE' },
    });

  } catch (error) {
    console.error('Error during test cleanup:', error);
  }
}

/**
 * Delete a specific booking by ID (for granular cleanup)
 */
export async function deleteBooking(bookingId: number) {
  try {
    await prisma.booking.delete({
      where: { id: bookingId },
    });
  } catch (error) {
    console.error(`Error deleting booking ${bookingId}:`, error);
  }
}

/**
 * Disconnect Prisma client
 */
export async function disconnectPrisma() {
  await prisma.$disconnect();
}
