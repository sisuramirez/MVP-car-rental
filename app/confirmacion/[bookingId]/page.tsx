"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatGTQ,
  formatDateTime,
  CATEGORY_LABELS,
  TRANSMISSION_LABELS,
  FUEL_LABELS,
} from "@/lib/format";

interface BookingData {
  id: number;
  startDate: string;
  endDate: string;
  totalDays: number;
  dailyRateApplied: number;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  depositAmount: number;
  status: string;
  paymentStatus: string;
  pickupLocation: string;
  dropoffLocation: string;
  specialRequests?: string;
  createdAt: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dpi: string;
  };
  vehicle: {
    id: number;
    brand: string;
    model: string;
    year: number;
    plateNumber: string;
    category: string;
    transmission: string;
    fuelType: string;
    passengerCapacity: number;
    hasAC: boolean;
    hasGPS: boolean;
    imageUrl?: string;
  };
}

export default function ConfirmacionPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/bookings/${bookingId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Reserva no encontrada");
        return res.json();
      })
      .then((data) => {
        setBooking(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [bookingId]);

  if (loading) {
    return (
      <p className="text-center py-20 text-muted-foreground">
        Cargando reserva...
      </p>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Reserva no encontrada</h1>
        <p className="text-muted-foreground mb-8">
          {error || "No pudimos encontrar esta reserva."}
        </p>
        <Button asChild>
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold text-green-600 mb-2">
          ¡Reserva Confirmada!
        </h1>
        <p className="text-muted-foreground">
          Número de reserva: <span className="font-mono font-bold">#{booking.id}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Vehicle Details */}
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Vehículo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h3 className="font-bold text-lg">
                {booking.vehicle.brand} {booking.vehicle.model} {booking.vehicle.year}
              </h3>
              <p className="text-sm text-muted-foreground">
                Placa: {booking.vehicle.plateNumber}
              </p>
            </div>
            <div className="text-sm space-y-1">
              <p>
                <span className="text-muted-foreground">Categoría:</span>{" "}
                {CATEGORY_LABELS[booking.vehicle.category]}
              </p>
              <p>
                <span className="text-muted-foreground">Transmisión:</span>{" "}
                {TRANSMISSION_LABELS[booking.vehicle.transmission]}
              </p>
              <p>
                <span className="text-muted-foreground">Combustible:</span>{" "}
                {FUEL_LABELS[booking.vehicle.fuelType]}
              </p>
              <p>
                <span className="text-muted-foreground">Pasajeros:</span>{" "}
                {booking.vehicle.passengerCapacity}
              </p>
              <p>
                <span className="text-muted-foreground">Características:</span>{" "}
                {booking.vehicle.hasAC ? "A/C" : "Sin A/C"}
                {booking.vehicle.hasGPS ? ", GPS" : ""}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Booking Dates */}
        <Card>
          <CardHeader>
            <CardTitle>Fechas de Reserva</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Recogida</p>
              <p className="font-semibold">{formatDateTime(booking.startDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Devolución</p>
              <p className="font-semibold">{formatDateTime(booking.endDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duración</p>
              <p className="font-semibold">
                {booking.totalDays} {booking.totalDays === 1 ? "día" : "días"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ubicación</p>
              <p className="font-semibold">{booking.pickupLocation}</p>
            </div>
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle>Datos del Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Nombre:</span>{" "}
              {booking.customer.firstName} {booking.customer.lastName}
            </p>
            <p>
              <span className="text-muted-foreground">Email:</span>{" "}
              {booking.customer.email}
            </p>
            <p>
              <span className="text-muted-foreground">Teléfono:</span>{" "}
              {booking.customer.phone}
            </p>
            <p>
              <span className="text-muted-foreground">DPI:</span>{" "}
              {booking.customer.dpi}
            </p>
          </CardContent>
        </Card>

        {/* Pricing Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Pago</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {formatGTQ(booking.dailyRateApplied)}/día × {booking.totalDays}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatGTQ(booking.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">IVA (12%)</span>
                <span>{formatGTQ(booking.taxAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t">
                <span>Total</span>
                <span>{formatGTQ(booking.totalAmount)}</span>
              </div>
            </div>

            <div className="pt-3 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Depósito requerido (30%)</span>
                <span className="font-semibold text-orange-600">
                  {formatGTQ(booking.depositAmount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estado de pago</span>
                <span className="font-semibold text-orange-600">
                  {booking.paymentStatus}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Special Requests */}
      {booking.specialRequests && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Solicitudes Especiales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{booking.specialRequests}</p>
          </CardContent>
        </Card>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h3 className="font-semibold mb-2">📧 Próximos pasos:</h3>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>• Recibirás un correo de confirmación en {booking.customer.email}</li>
          <li>• Nos comunicaremos contigo para coordinar el pago del depósito</li>
          <li>• Recuerda traer tu DPI y licencia de conducir vigente al recoger el vehículo</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={() => window.print()} variant="outline" size="lg">
          🖨️ Imprimir
        </Button>
        <Button asChild size="lg">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  );
}
