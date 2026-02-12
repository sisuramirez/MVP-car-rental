"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { StatusBadge, PaymentBadge } from "@/components/admin/StatusBadge";
import { formatGTQ, formatDateTime } from "@/lib/format";

interface BookingRow {
  id: number;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  Customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  Vehicle: {
    brand: string;
    model: string;
    year: number;
    plateNumber: string;
    category: string;
  };
}

const STATUS_OPTIONS = [
  { value: "ALL", label: "Todas" },
  { value: "PENDIENTE", label: "Pendientes" },
  { value: "CONFIRMADO", label: "Confirmadas" },
  { value: "ACTIVO", label: "Activas" },
  { value: "COMPLETADO", label: "Completadas" },
  { value: "CANCELADO", label: "Canceladas" },
];

export default function AdminReservasPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") || "ALL";

  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/bookings?status=${statusFilter}`)
      .then((res) => res.json())
      .then((data) => {
        setBookings(data);
        setLoading(false);
      });
  }, [statusFilter]);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reservas</h1>
        <p className="text-sm text-muted-foreground">
          {bookings.length} reservas
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUS_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            variant={statusFilter === opt.value ? "default" : "outline"}
            size="sm"
            onClick={() =>
              router.push(
                opt.value === "ALL"
                  ? "/admin/reservas"
                  : `/admin/reservas?status=${opt.value}`
              )
            }
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-muted-foreground py-8">Cargando reservas...</p>
      ) : bookings.length === 0 ? (
        <p className="text-muted-foreground py-8">
          No hay reservas con este filtro.
        </p>
      ) : (
        <div className="border rounded-lg overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">ID</th>
                <th className="text-left p-3 font-medium">Cliente</th>
                <th className="text-left p-3 font-medium">Vehículo</th>
                <th className="text-left p-3 font-medium">Recogida</th>
                <th className="text-left p-3 font-medium">Devolución</th>
                <th className="text-left p-3 font-medium">Estado</th>
                <th className="text-left p-3 font-medium">Pago</th>
                <th className="text-right p-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr
                  key={b.id}
                  className="border-t hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => router.push(`/admin/reservas/${b.id}`)}
                >
                  <td className="p-3 font-mono">#{b.id}</td>
                  <td className="p-3">
                    <div>
                      {b.Customer.firstName} {b.Customer.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {b.Customer.email}
                    </div>
                  </td>
                  <td className="p-3">
                    <div>
                      {b.Vehicle.brand} {b.Vehicle.model}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {b.Vehicle.plateNumber}
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {formatDateTime(b.startDate)}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {formatDateTime(b.endDate)}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="p-3">
                    <PaymentBadge status={b.paymentStatus} />
                  </td>
                  <td className="p-3 text-right font-mono">
                    {formatGTQ(b.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
