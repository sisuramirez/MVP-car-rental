"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  StatusBadge,
  PaymentBadge,
} from "@/components/admin/StatusBadge";
import {
  formatGTQ,
  formatDateTime,
  CATEGORY_LABELS,
  TRANSMISSION_LABELS,
  FUEL_LABELS,
} from "@/lib/format";

const STATUS_TRANSITIONS: Record<
  string,
  { next: string; label: string; variant: "default" | "outline" }[]
> = {
  PENDIENTE: [
    { next: "CONFIRMADO", label: "Confirmar Reserva", variant: "default" },
    { next: "CANCELADO", label: "Cancelar", variant: "outline" },
  ],
  CONFIRMADO: [
    { next: "ACTIVO", label: "Registrar Recogida", variant: "default" },
    { next: "CANCELADO", label: "Cancelar", variant: "outline" },
  ],
  ACTIVO: [
    { next: "COMPLETADO", label: "Registrar Devolución", variant: "default" },
    { next: "CANCELADO", label: "Cancelar", variant: "outline" },
  ],
  COMPLETADO: [],
  CANCELADO: [],
};

interface BookingDetail {
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
  specialRequests: string | null;
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
  };
}

export default function AdminReservaDetailPage() {
  const params = useParams();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function fetchBooking() {
    fetch(`/api/bookings/${bookingId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Reserva no encontrada");
        return res.json();
      })
      .then((data) => {
        setBooking(data);
        setLoading(false);
      })
      .catch(() => {
        setError("No se encontró la reserva");
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  async function handleStatusChange(newStatus: string) {
    if (!confirm(`¿Cambiar estado a ${newStatus}?`)) return;

    setUpdating(true);
    setError(null);

    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al actualizar");
      }

      // Refresh booking data
      fetchBooking();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Cargando reserva...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">{error || "Reserva no encontrada"}</p>
        <Button asChild className="mt-4">
          <Link href="/admin/reservas">Volver a reservas</Link>
        </Button>
      </div>
    );
  }

  const actions = STATUS_TRANSITIONS[booking.status] || [];

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            href="/admin/reservas"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Volver a reservas
          </Link>
          <h1 className="text-2xl font-bold mt-1">Reserva #{booking.id}</h1>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-6">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Status Actions */}
      {actions.length > 0 && (
        <div className="flex gap-3 mb-6 p-4 bg-muted/30 rounded-lg border">
          <span className="text-sm text-muted-foreground self-center mr-2">
            Acciones:
          </span>
          {actions.map((action) => (
            <Button
              key={action.next}
              variant={action.variant}
              size="sm"
              disabled={updating}
              onClick={() => handleStatusChange(action.next)}
            >
              {updating ? "Actualizando..." : action.label}
            </Button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Nombre:</span>{" "}
              <strong>
                {booking.customer.firstName} {booking.customer.lastName}
              </strong>
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

        {/* Vehicle */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vehículo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>
                {booking.vehicle.brand} {booking.vehicle.model}{" "}
                {booking.vehicle.year}
              </strong>
            </p>
            <p>
              <span className="text-muted-foreground">Placa:</span>{" "}
              {booking.vehicle.plateNumber}
            </p>
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
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fechas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Recogida:</span>{" "}
              <strong>{formatDateTime(booking.startDate)}</strong>
            </p>
            <p>
              <span className="text-muted-foreground">Devolución:</span>{" "}
              <strong>{formatDateTime(booking.endDate)}</strong>
            </p>
            <p>
              <span className="text-muted-foreground">Duración:</span>{" "}
              {booking.totalDays}{" "}
              {booking.totalDays === 1 ? "día" : "días"}
            </p>
            <p>
              <span className="text-muted-foreground">Ubicación:</span>{" "}
              {booking.pickupLocation}
            </p>
            {booking.specialRequests && (
              <p>
                <span className="text-muted-foreground">Solicitudes:</span>{" "}
                {booking.specialRequests}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Desglose de Precio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {formatGTQ(booking.dailyRateApplied)}/día x {booking.totalDays}
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
            <div className="flex justify-between font-bold border-t pt-2">
              <span>Total</span>
              <span>{formatGTQ(booking.totalAmount)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-muted-foreground">Depósito (30%)</span>
              <span className="font-semibold text-orange-600">
                {formatGTQ(booking.depositAmount)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Estado de pago</span>
              <PaymentBadge status={booking.paymentStatus} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info */}
      <div className="mt-6 text-xs text-muted-foreground">
        Creada: {formatDateTime(booking.createdAt)}
      </div>
    </div>
  );
}
