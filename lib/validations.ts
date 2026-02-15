import { z } from "zod";

// Customer validation schema
export const customerSchema = z.object({
  firstName: z.string().min(2, "Nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "Apellido debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(8, "Teléfono inválido"),
  dpi: z.string().length(13, "DPI debe tener 13 dígitos"),
  licenseNumber: z.string().min(5, "Número de licencia inválido"),
  licenseExpiry: z.string().refine((date) => {
    const expiry = new Date(date);
    return expiry > new Date();
  }, "Licencia vencida"),
  address: z.string().optional(),
  city: z.string().optional(),
  department: z.string().optional(),
});

// Booking request validation schema
export const bookingRequestSchema = z.object({
  vehicleId: z.number().int().positive(),
  startDate: z.string().refine((date) => !isNaN(new Date(date).getTime()), {
    message: "Fecha de inicio inválida",
  }),
  endDate: z.string().refine((date) => !isNaN(new Date(date).getTime()), {
    message: "Fecha de fin inválida",
  }),
  customer: customerSchema,
  pickupLocation: z.string().min(5, "Ubicación de recogida requerida"),
  specialRequests: z.string().optional(),
});

export type CustomerInput = z.infer<typeof customerSchema>;
export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;

// Vehicle validation schema
export const vehicleSchema = z.object({
  plateNumber: z
    .string()
    .regex(/^P-\d{6}$/, "Formato de placa inválido. Use P-XXXXXX"),
  brand: z.string().min(2, "Marca requerida"),
  model: z.string().min(1, "Modelo requerido"),
  year: z
    .number()
    .min(2020, "Año mínimo: 2020")
    .max(new Date().getFullYear() + 1, "Año inválido"),
  category: z.enum(["ECONOMICO", "SUV", "LUJO", "VAN"]),
  status: z.enum(["DISPONIBLE", "RENTADO", "MANTENIMIENTO", "RETIRADO"]).default("DISPONIBLE"),
  dailyRate1_2: z.number().positive("Precio debe ser positivo"),
  dailyRate3_6: z.number().positive("Precio debe ser positivo"),
  weeklyRate: z.number().positive("Precio debe ser positivo"),
  monthlyRate: z.number().positive("Precio debe ser positivo"),
  transmission: z.enum(["MANUAL", "AUTOMATICA"]),
  fuelType: z.enum(["GASOLINA", "DIESEL", "HIBRIDO", "ELECTRICO"]),
  passengerCapacity: z.number().min(2, "Mínimo 2 pasajeros").max(15, "Máximo 15 pasajeros"),
  hasAC: z.boolean(),
  hasGPS: z.boolean(),
});

export const vehicleUpdateSchema = vehicleSchema.partial();

export type VehicleInput = z.infer<typeof vehicleSchema>;
export type VehicleUpdateInput = z.infer<typeof vehicleUpdateSchema>;
