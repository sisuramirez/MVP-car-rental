"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VehicleStatusBadge } from "@/components/admin/StatusBadge";
import {
  formatDateTime,
  CATEGORY_LABELS,
  TRANSMISSION_LABELS,
} from "@/lib/format";

interface VehicleRow {
  id: number;
  plateNumber: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  status: string;
  transmission: string;
  passengerCapacity: number;
  Booking: {
    id: number;
    startDate: string;
    endDate: string;
    status: string;
    Customer: { firstName: string; lastName: string };
  }[];
  _count: { Booking: number };
}

const STATUS_OPTIONS = [
  { value: "ALL", label: "Todos" },
  { value: "DISPONIBLE", label: "Disponibles" },
  { value: "RENTADO", label: "Rentados" },
  { value: "MANTENIMIENTO", label: "Mantenimiento" },
  { value: "RETIRADO", label: "Retirados" },
];

const CATEGORY_OPTIONS = [
  { value: "ALL", label: "Todas" },
  { value: "ECONOMICO", label: "Económico" },
  { value: "SUV", label: "SUV" },
  { value: "LUJO", label: "Lujo" },
  { value: "VAN", label: "Van" },
];

function AdminVehiculosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") || "ALL";
  const categoryFilter = searchParams.get("category") || "ALL";

  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{
    vehicle: VehicleRow;
    canDelete: boolean | null;
    activeBookings: number;
    deleting: boolean;
  } | null>(null);

  function fetchVehicles() {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    if (categoryFilter !== "ALL") params.set("category", categoryFilter);

    fetch(`/api/admin/vehicles?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setVehicles(data);
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, categoryFilter]);

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "ALL") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const qs = params.toString();
    router.push(`/admin/vehiculos${qs ? `?${qs}` : ""}`);
  }

  async function handleDeleteClick(vehicle: VehicleRow) {
    setDeleteDialog({
      vehicle,
      canDelete: null,
      activeBookings: 0,
      deleting: false,
    });

    // Check if deletable
    const res = await fetch(
      `/api/admin/vehicles/${vehicle.id}/check-deletable`
    );
    const data = await res.json();

    setDeleteDialog((prev) =>
      prev
        ? {
            ...prev,
            canDelete: data.canDelete,
            activeBookings: data.activeBookings,
          }
        : null
    );
  }

  async function handleConfirmDelete() {
    if (!deleteDialog) return;

    setDeleteDialog((prev) => (prev ? { ...prev, deleting: true } : null));

    const res = await fetch(
      `/api/admin/vehicles/${deleteDialog.vehicle.id}`,
      { method: "DELETE" }
    );

    if (res.ok) {
      setDeleteDialog(null);
      fetchVehicles();
    } else {
      const data = await res.json();
      alert(data.error || "Error al retirar vehículo");
      setDeleteDialog(null);
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Vehículos</h1>
        <Button asChild>
          <Link href="/admin/vehiculos/nuevo">+ Agregar Vehículo</Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-6 mb-6">
        <div>
          <p className="text-xs text-muted-foreground mb-2">Estado</p>
          <div className="flex gap-1">
            {STATUS_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                variant={statusFilter === opt.value ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("status", opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-2">Categoría</p>
          <div className="flex gap-1">
            {CATEGORY_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                variant={categoryFilter === opt.value ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("category", opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-muted-foreground py-8">Cargando vehículos...</p>
      ) : (
        <div className="border rounded-lg overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Placa</th>
                <th className="text-left p-3 font-medium">Vehículo</th>
                <th className="text-left p-3 font-medium">Categoría</th>
                <th className="text-left p-3 font-medium">Transmisión</th>
                <th className="text-center p-3 font-medium">Pasajeros</th>
                <th className="text-left p-3 font-medium">Estado</th>
                <th className="text-left p-3 font-medium">Reserva Actual</th>
                <th className="text-center p-3 font-medium">Total</th>
                <th className="text-center p-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => {
                const activeBooking = v.Booking[0] || null;
                return (
                  <tr key={v.id} className="border-t hover:bg-muted/30">
                    <td className="p-3 font-mono">{v.plateNumber}</td>
                    <td className="p-3 font-semibold">
                      {v.brand} {v.model} {v.year}
                    </td>
                    <td className="p-3">{CATEGORY_LABELS[v.category]}</td>
                    <td className="p-3">
                      {TRANSMISSION_LABELS[v.transmission]}
                    </td>
                    <td className="p-3 text-center">{v.passengerCapacity}</td>
                    <td className="p-3">
                      <VehicleStatusBadge status={v.status} />
                    </td>
                    <td className="p-3">
                      {activeBooking ? (
                        <div
                          className="cursor-pointer hover:underline"
                          onClick={() =>
                            router.push(
                              `/admin/reservas/${activeBooking.id}`
                            )
                          }
                        >
                          <p className="text-xs">
                            #{activeBooking.id} -{" "}
                            {activeBooking.Customer.firstName}{" "}
                            {activeBooking.Customer.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Hasta {formatDateTime(activeBooking.endDate)}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          —
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">{v._count.Booking}</td>
                    <td className="p-3">
                      <div className="flex gap-1 justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/admin/vehiculos/${v.id}/editar`
                            )
                          }
                        >
                          Editar
                        </Button>
                        {v.status !== "RETIRADO" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteClick(v)}
                          >
                            Retirar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            {deleteDialog.canDelete === null ? (
              <>
                <h3 className="font-semibold text-lg mb-2">Verificando...</h3>
                <p className="text-sm text-muted-foreground">
                  Comprobando reservas activas...
                </p>
              </>
            ) : deleteDialog.canDelete === false ? (
              <>
                <h3 className="font-semibold text-lg mb-2 text-red-600">
                  No se puede retirar
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  El vehículo{" "}
                  <strong>
                    {deleteDialog.vehicle.brand}{" "}
                    {deleteDialog.vehicle.model}
                  </strong>{" "}
                  tiene {deleteDialog.activeBookings} reserva(s) activa(s).
                  Complete o cancele las reservas primero.
                </p>
                <Button onClick={() => setDeleteDialog(null)}>Entendido</Button>
              </>
            ) : (
              <>
                <h3 className="font-semibold text-lg mb-2">
                  ¿Retirar este vehículo?
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  El vehículo{" "}
                  <strong>
                    {deleteDialog.vehicle.brand}{" "}
                    {deleteDialog.vehicle.model}
                  </strong>{" "}
                  ({deleteDialog.vehicle.plateNumber}) será marcado como
                  RETIRADO y no aparecerá en búsquedas.
                </p>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteDialog(null)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={deleteDialog.deleting}
                    onClick={handleConfirmDelete}
                  >
                    {deleteDialog.deleting ? "Retirando..." : "Sí, retirar"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminVehiculosPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Cargando...</div>}>
      <AdminVehiculosContent />
    </Suspense>
  );
}
