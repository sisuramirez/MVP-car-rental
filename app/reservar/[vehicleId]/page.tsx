"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatGTQ,
  formatDateTime,
  CATEGORY_LABELS,
  TRANSMISSION_LABELS,
  FUEL_LABELS,
} from "@/lib/format";

interface Pricing {
  dailyRate: number;
  totalDays: number;
  subtotal: number;
  tax: number;
  total: number;
}

interface VehicleWithPricing {
  id: number;
  brand: string;
  model: string;
  year: number;
  category: string;
  plateNumber: string;
  transmission: string;
  fuelType: string;
  passengerCapacity: number;
  hasAC: boolean;
  hasGPS: boolean;
  pricing: Pricing;
}

export default function ReservarPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const vehicleId = params.vehicleId as string;
  const inicio = searchParams.get("inicio");
  const fin = searchParams.get("fin");

  const [vehicle, setVehicle] = useState<VehicleWithPricing | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dpi: "",
    licenseNumber: "",
    licenseExpiry: "",
    address: "",
    specialRequests: "",
  });

  useEffect(() => {
    if (!inicio || !fin) return;
    fetch(`/api/vehicles/available?startDate=${inicio}&endDate=${fin}`)
      .then((res) => res.json())
      .then((data: VehicleWithPricing[]) => {
        const found = data.find((v) => v.id === Number(vehicleId));
        setVehicle(found || null);
        setLoading(false);
      });
  }, [vehicleId, inicio, fin]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: Number(vehicleId),
          startDate: inicio,
          endDate: fin,
          customer: {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone,
            dpi: form.dpi,
            licenseNumber: form.licenseNumber,
            licenseExpiry: form.licenseExpiry,
            address: form.address || undefined,
          },
          pickupLocation: "Oficina Central - Guatemala", // Default for MVP
          specialRequests: form.specialRequests || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear la reserva");
      }

      // Redirect to confirmation page
      router.push(`/confirmacion/${data.booking.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al procesar la reserva"
      );
      setSubmitting(false);
    }
  }

  if (!inicio || !fin) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Fechas no seleccionadas</h1>
        <Button asChild>
          <Link href="/">Ir al inicio</Link>
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <p className="text-center py-20 text-muted-foreground">
        Cargando vehiculo...
      </p>
    );
  }

  if (!vehicle) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Vehiculo no disponible</h1>
        <Button asChild>
          <Link href={`/vehiculos?inicio=${inicio}&fin=${fin}`}>
            Ver otros vehiculos
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Reservar Vehiculo</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Vehicle summary */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg">
              {vehicle.brand} {vehicle.model} {vehicle.year}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <span className="text-muted-foreground">Categoria:</span>{" "}
              {CATEGORY_LABELS[vehicle.category]}
            </p>
            <p>
              <span className="text-muted-foreground">Placa:</span>{" "}
              {vehicle.plateNumber}
            </p>
            <p>
              <span className="text-muted-foreground">Transmision:</span>{" "}
              {TRANSMISSION_LABELS[vehicle.transmission]}
            </p>
            <p>
              <span className="text-muted-foreground">Combustible:</span>{" "}
              {FUEL_LABELS[vehicle.fuelType]}
            </p>
            <p>
              <span className="text-muted-foreground">Pasajeros:</span>{" "}
              {vehicle.passengerCapacity}
            </p>

            <div className="border-t pt-3 mt-3">
              <p>
                <span className="text-muted-foreground">Recogida:</span>{" "}
                {formatDateTime(inicio)}
              </p>
              <p>
                <span className="text-muted-foreground">Devolucion:</span>{" "}
                {formatDateTime(fin)}
              </p>
              <p>
                <span className="text-muted-foreground">Dias:</span>{" "}
                {vehicle.pricing.totalDays}
              </p>
            </div>

            <div className="border-t pt-3 mt-3 space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {formatGTQ(vehicle.pricing.dailyRate)}/dia x{" "}
                  {vehicle.pricing.totalDays}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatGTQ(vehicle.pricing.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">IVA (12%)</span>
                <span>{formatGTQ(vehicle.pricing.tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-1 border-t">
                <span>Total</span>
                <span>{formatGTQ(vehicle.pricing.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking form */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Datos del Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    required
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="Juan"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    required
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Garcia"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="juan@ejemplo.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefono *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    required
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+502 1234-5678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dpi">DPI *</Label>
                  <Input
                    id="dpi"
                    name="dpi"
                    required
                    maxLength={13}
                    value={form.dpi}
                    onChange={handleChange}
                    placeholder="1234567890123"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">No. de Licencia *</Label>
                  <Input
                    id="licenseNumber"
                    name="licenseNumber"
                    required
                    value={form.licenseNumber}
                    onChange={handleChange}
                    placeholder="Numero de licencia"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="licenseExpiry">
                    Vencimiento de Licencia *
                  </Label>
                  <Input
                    id="licenseExpiry"
                    name="licenseExpiry"
                    type="date"
                    required
                    value={form.licenseExpiry}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Direccion</Label>
                  <Input
                    id="address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Zona 10, Guatemala"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialRequests">
                  Solicitudes especiales
                </Label>
                <Textarea
                  id="specialRequests"
                  name="specialRequests"
                  value={form.specialRequests}
                  onChange={handleChange}
                  placeholder="Silla para bebe, GPS adicional, etc."
                  rows={3}
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={submitting}
              >
                {submitting ? "Procesando..." : "Confirmar Reserva"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
