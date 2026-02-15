"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { VehicleForm } from "@/components/admin/VehicleForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface VehicleDetail {
  id: number;
  plateNumber: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  status: string;
  dailyRate1_2: number;
  dailyRate3_6: number;
  weeklyRate: number;
  monthlyRate: number;
  transmission: string;
  fuelType: string;
  passengerCapacity: number;
  hasAC: boolean;
  hasGPS: boolean;
  imageUrl: string | null;
  activeBookings: number;
  _count: { Booking: number };
}

export default function EditarVehiculoPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [vehicle, setVehicle] = useState<VehicleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/vehicles/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Vehículo no encontrado");
        return res.json();
      })
      .then((data) => {
        setVehicle(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  async function handleMarkAsAvailable() {
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.set("status", "DISPONIBLE");

      const res = await fetch(`/api/admin/vehicles/${id}`, {
        method: "PATCH",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Error al actualizar vehículo");
      }

      router.push("/admin/vehiculos");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al actualizar");
      setUpdating(false);
      setShowConfirmDialog(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Cargando vehículo...</p>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">{error || "No encontrado"}</p>
        <Link
          href="/admin/vehiculos"
          className="text-sm text-primary hover:underline mt-4 inline-block"
        >
          ← Volver a vehículos
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      <Link
        href="/admin/vehiculos"
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Volver a vehículos
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-2">
        Editar {vehicle.brand} {vehicle.model}
      </h1>

      {/* Booking stats and maintenance button */}
      <div className="flex gap-3 mb-6 items-center flex-wrap">
        <Badge variant="outline">
          Total reservas: {vehicle._count.Booking}
        </Badge>
        {vehicle.activeBookings > 0 && (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Reservas activas: {vehicle.activeBookings}
          </Badge>
        )}
        {vehicle.status === "MANTENIMIENTO" && (
          <Button
            onClick={() => setShowConfirmDialog(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            ✓ Marcar como Disponible
          </Button>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Confirmar cambio de estado</h2>
            <p className="text-muted-foreground mb-6">
              ¿Estás seguro de enviar el auto a un estado disponible de nuevo?
              El vehículo volverá a estar disponible para rentas.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
                disabled={updating}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleMarkAsAvailable}
                disabled={updating}
                className="bg-green-600 hover:bg-green-700"
              >
                {updating ? "Actualizando..." : "Sí, marcar como disponible"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <VehicleForm mode="edit" initialData={vehicle} />
    </div>
  );
}
