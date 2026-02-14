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

function AdminReservasContent() {
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
    <div className="py-6">
      {/* Container centrado con responsive width */}
      <div className="w-[85%] mx-auto max-w-[1200px] lg:w-[80%]">
        {/* Header - Title y Count */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Reservas</h1>
          <p className="text-sm text-muted-foreground">
            {bookings.length} reservas
          </p>
        </div>

        {/* Filters - Flex wrap, NO horizontal scroll */}
        <div className="mb-6">
          <div className="flex gap-2 flex-wrap justify-center">
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
        </div>

        {/* Content */}
        {loading ? (
          <p className="text-muted-foreground py-8 text-center">Cargando reservas...</p>
        ) : bookings.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center">
            No hay reservas con este filtro.
          </p>
        ) : (
          <>
            {/* Desktop Table - Hidden on mobile */}
            <div className="hidden lg:block border rounded-lg overflow-auto">
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

            {/* Mobile Cards - Visible only on mobile */}
            <div className="lg:hidden space-y-4">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="border rounded-lg p-4 shadow-sm cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => router.push(`/admin/reservas/${b.id}`)}
                >
                  {/* Top: Cliente + ID */}
                  <div className="mb-3">
                    <div className="font-bold text-base">
                      {b.Customer.firstName} {b.Customer.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground font-mono">
                      #{b.id}
                    </div>
                  </div>

                  {/* Details in 2-column grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        Vehículo
                      </div>
                      <div className="font-medium">
                        {b.Vehicle.brand} {b.Vehicle.model}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        Estado
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        Recogida
                      </div>
                      <div className="text-xs">
                        {formatDateTime(b.startDate)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        Devolución
                      </div>
                      <div className="text-xs">
                        {formatDateTime(b.endDate)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        Pago
                      </div>
                      <PaymentBadge status={b.paymentStatus} />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        Total
                      </div>
                      <div className="font-mono font-bold">
                        {formatGTQ(b.totalAmount)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminReservasPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Cargando...</div>}>
      <AdminReservasContent />
    </Suspense>
  );
}
