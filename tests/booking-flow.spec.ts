import { test, expect } from '@playwright/test';
import { cleanupTestBookings, disconnectPrisma } from './helpers/db-cleanup';

test.describe('Booking Flow', () => {
  // Clean up test data after each test to prevent database pollution
  test.afterEach(async () => {
    await cleanupTestBookings();
  });

  // Disconnect Prisma after all tests
  test.afterAll(async () => {
    await disconnectPrisma();
  });

  test.beforeEach(async ({ page }) => {
    // Start at homepage
    await page.goto('/');
  });

  test('complete booking flow - happy path', async ({ page }) => {
    // Step 1: Fill search form on homepage
    await expect(page.getByRole('heading', { name: /Renta de Vehiculos/i })).toBeVisible();

    // Select dates - use timestamp to ensure unique dates for each test run
    const timestamp = Date.now();
    const daysOffset = 200 + (timestamp % 50); // 200-250 days from now
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + daysOffset);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + daysOffset + 5);

    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    // Fill dates (using type="date" inputs)
    await page.locator('input[type="date"]').first().fill(formatDate(startDate));
    await page.locator('input[type="date"]').nth(1).fill(formatDate(endDate));

    // Times are already set to 10:00 by default

    // Click search button
    await page.getByRole('button', { name: /Buscar Vehiculos Disponibles/i }).click();

    // Step 2: Verify we're on vehicles page with results
    await expect(page).toHaveURL(/\/vehiculos/);
    await expect(page.getByRole('heading', { name: /Vehiculos Disponibles/i })).toBeVisible();

    // Wait for vehicles to load - check for the link text "Reservar"
    await expect(page.getByRole('link', { name: /Reservar/i }).first()).toBeVisible({ timeout: 10000 });

    // Click "Reservar" on first available vehicle
    await page.getByRole('link', { name: /Reservar/i }).first().click();

    // Step 3: Fill booking form
    await expect(page).toHaveURL(/\/reservar\/\d+/);
    await expect(page.getByRole('heading', { name: /Reservar Vehiculo/i })).toBeVisible();

    // Fill customer information - reuse timestamp from earlier
    const uniqueDPI = `${timestamp}`.padStart(13, '0').slice(0, 13);

    await page.fill('input[name="firstName"]', 'Carlos');
    await page.fill('input[name="lastName"]', 'Rodriguez');
    await page.fill('input[name="email"]', `test-${timestamp}@example.com`); // Unique email
    await page.fill('input[name="phone"]', '+502 5555-1234');
    await page.fill('input[name="dpi"]', uniqueDPI);
    await page.fill('input[name="licenseNumber"]', 'LIC987654321');

    // Set license expiry to 2 years from now
    const licenseExpiry = new Date();
    licenseExpiry.setFullYear(licenseExpiry.getFullYear() + 2);
    await page.fill('input[name="licenseExpiry"]', formatDate(licenseExpiry));

    await page.fill('input[name="address"]', 'Zona 10, Ciudad de Guatemala');
    await page.fill('textarea[name="specialRequests"]', 'Por favor incluir GPS');

    // Step 4: Submit form
    await page.getByRole('button', { name: /Confirmar Reserva/i }).click();

    // Wait for submission to complete
    await page.waitForURL(/\/confirmacion\/\d+/, { timeout: 15000 });

    // Step 5: Verify confirmation page
    await expect(page.getByText(/¡Reserva Confirmada!/i)).toBeVisible();
    await expect(page.getByText(/Número de reserva:/i)).toBeVisible();

    // Verify customer name is displayed
    await expect(page.getByText(/Carlos Rodriguez/i)).toBeVisible();

    // Verify vehicle info is displayed
    await expect(page.getByText(/Toyota|Honda|BMW|Mazda/i)).toBeVisible();

    // Verify pricing is displayed
    await expect(page.getByText('Total', { exact: true })).toBeVisible();
    await expect(page.getByText(/Subtotal/i)).toBeVisible();
    await expect(page.getByText(/IVA/i)).toBeVisible();

    // Verify deposit info
    await expect(page.getByText(/Depósito requerido/i)).toBeVisible();
    await expect(page.getByText(/30%/i)).toBeVisible();

    // Verify payment status
    await expect(page.getByText(/PENDIENTE/i)).toBeVisible();

    // Verify special requests are shown
    await expect(page.getByText(/Por favor incluir GPS/i)).toBeVisible();

    // Verify action buttons exist
    await expect(page.getByRole('button', { name: /Imprimir/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Volver al inicio/i })).toBeVisible();
  });

  test('form validation - missing required fields', async ({ page }) => {
    // Navigate directly to a booking form
    const timestamp = Date.now();
    const daysOffset = 250 + (timestamp % 50); // 250-300 days from now
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + daysOffset);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + daysOffset + 5);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    // Fill homepage form
    await page.locator('input[type="date"]').first().fill(formatDate(startDate));
    await page.locator('input[type="date"]').nth(1).fill(formatDate(endDate));
    await page.getByRole('button', { name: /Buscar Vehiculos Disponibles/i }).click();

    // Wait for vehicles and click first reserve button
    await expect(page.getByRole('link', { name: /Reservar/i }).first()).toBeVisible({ timeout: 10000 });
    await page.getByRole('link', { name: /Reservar/i }).first().click();

    // Try to submit empty form
    await page.getByRole('button', { name: /Confirmar Reserva/i }).click();

    // Form should not submit - we should still be on the same page
    await expect(page).toHaveURL(/\/reservar\/\d+/);

    // HTML5 validation should prevent submission
    // Check that required fields have the required attribute
    await expect(page.locator('input[name="firstName"]')).toHaveAttribute('required', '');
    await expect(page.locator('input[name="lastName"]')).toHaveAttribute('required', '');
    await expect(page.locator('input[name="email"]')).toHaveAttribute('required', '');
    await expect(page.locator('input[name="phone"]')).toHaveAttribute('required', '');
    await expect(page.locator('input[name="dpi"]')).toHaveAttribute('required', '');
    await expect(page.locator('input[name="licenseNumber"]')).toHaveAttribute('required', '');
    await expect(page.locator('input[name="licenseExpiry"]')).toHaveAttribute('required', '');
  });

  test('vehicle conflict - booking overlapping dates', async ({ page }) => {
    // Use a specific date far in the future to avoid conflicts with other test runs
    const timestamp = Date.now();
    const daysOffset = 100 + (timestamp % 100); // 100-200 days from now, varies by timestamp
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + daysOffset);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + daysOffset + 5);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const formatDateTime = (date: Date) => date.toISOString();

    // First booking - create via API
    const firstBookingEmail = `conflict-test-${timestamp}@example.com`;
    const uniqueDPI = `${timestamp}`.padStart(13, '0').slice(0, 13); // Generate unique 13-digit DPI

    const firstBooking = await page.request.post('http://localhost:3000/api/bookings', {
      data: {
        vehicleId: 3, // Toyota Corolla
        startDate: formatDateTime(startDate),
        endDate: formatDateTime(endDate),
        customer: {
          firstName: 'Test',
          lastName: 'User1',
          email: firstBookingEmail,
          phone: '+502 1111-1111',
          dpi: uniqueDPI,
          licenseNumber: 'LIC111111',
          licenseExpiry: '2027-12-31',
        },
        pickupLocation: 'Oficina Central - Guatemala',
      },
    });

    if (!firstBooking.ok()) {
      const error = await firstBooking.json();
      console.error('Booking API error:', error);
    }
    expect(firstBooking.ok()).toBeTruthy();

    // Now try to book the same vehicle for overlapping dates via UI
    const overlapStart = new Date(startDate);
    overlapStart.setDate(overlapStart.getDate() + 2); // Overlaps with first booking
    const overlapEnd = new Date(endDate);
    overlapEnd.setDate(overlapEnd.getDate() + 2);

    await page.goto('/');

    await page.locator('input[type="date"]').first().fill(formatDate(overlapStart));
    await page.locator('input[type="date"]').nth(1).fill(formatDate(overlapEnd));
    await page.getByRole('button', { name: /Buscar Vehiculos Disponibles/i }).click();

    // Wait for page to load
    await page.waitForURL(/\/vehiculos/);
    await page.waitForTimeout(2000); // Wait for API call to complete

    // Vehicle 3 (Toyota Corolla) should NOT be in the available list
    const pageContent = await page.content();
    const hasCorolla = pageContent.includes('Toyota') && pageContent.includes('Corolla');

    // The Toyota Corolla with id:3 should not be available
    expect(hasCorolla).toBe(false);
  });

  test('customer data reuse - existing email', async ({ page }) => {
    const timestamp = Date.now();
    const daysOffset = 300 + (timestamp % 50); // 300-350 days from now
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + daysOffset);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + daysOffset + 3);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    const existingEmail = `existing-customer-${timestamp}@example.com`;
    const uniqueDPI = `${timestamp}`.padStart(13, '0').slice(0, 13);

    // Go to homepage and search
    await page.locator('input[type="date"]').first().fill(formatDate(startDate));
    await page.locator('input[type="date"]').nth(1).fill(formatDate(endDate));
    await page.getByRole('button', { name: /Buscar Vehiculos Disponibles/i }).click();

    await expect(page.getByRole('link', { name: /Reservar/i }).first()).toBeVisible({ timeout: 10000 });
    await page.getByRole('link', { name: /Reservar/i }).first().click();

    // Fill form with new customer
    await page.fill('input[name="firstName"]', 'Maria');
    await page.fill('input[name="lastName"]', 'Lopez');
    await page.fill('input[name="email"]', existingEmail);
    await page.fill('input[name="phone"]', '+502 9999-9999');
    await page.fill('input[name="dpi"]', uniqueDPI);
    await page.fill('input[name="licenseNumber"]', 'LIC999999');

    const licenseExpiry = new Date();
    licenseExpiry.setFullYear(licenseExpiry.getFullYear() + 2);
    await page.fill('input[name="licenseExpiry"]', formatDate(licenseExpiry));

    await page.getByRole('button', { name: /Confirmar Reserva/i }).click();

    // Wait for confirmation
    await page.waitForURL(/\/confirmacion\/\d+/, { timeout: 15000 });
    await expect(page.getByText(/¡Reserva Confirmada!/i)).toBeVisible();
    await expect(page.getByText(/Maria Lopez/i)).toBeVisible();

    // Now create another booking with the same email (use different dates)
    const daysOffset2 = daysOffset + 10; // 10 days after first booking ends
    const startDate2 = new Date();
    startDate2.setDate(startDate2.getDate() + daysOffset2);
    const endDate2 = new Date();
    endDate2.setDate(endDate2.getDate() + daysOffset2 + 3);

    await page.goto('/');

    await page.locator('input[type="date"]').first().fill(formatDate(startDate2));
    await page.locator('input[type="date"]').nth(1).fill(formatDate(endDate2));
    await page.getByRole('button', { name: /Buscar Vehiculos Disponibles/i }).click();

    await expect(page.getByRole('link', { name: /Reservar/i }).first()).toBeVisible({ timeout: 10000 });
    await page.getByRole('link', { name: /Reservar/i }).first().click();

    // Fill with same email but updated info (DPI should also be the same since it's the same customer)
    await page.fill('input[name="firstName"]', 'Maria');
    await page.fill('input[name="lastName"]', 'Lopez-Updated');
    await page.fill('input[name="email"]', existingEmail); // Same email
    await page.fill('input[name="phone"]', '+502 8888-8888'); // Updated phone
    await page.fill('input[name="dpi"]', uniqueDPI); // Same DPI
    await page.fill('input[name="licenseNumber"]', 'LIC999999');
    await page.fill('input[name="licenseExpiry"]', formatDate(licenseExpiry));

    await page.getByRole('button', { name: /Confirmar Reserva/i }).click();

    // Should successfully create second booking
    await page.waitForURL(/\/confirmacion\/\d+/, { timeout: 15000 });
    await expect(page.getByText(/¡Reserva Confirmada!/i)).toBeVisible();
  });
});
