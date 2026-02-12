"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { VehicleForm } from "@/components/admin/VehicleForm";
import { Badge } from "@/components/ui/badge";

interface VehicleDetail {
  id: number;
  plateNumber: string;
  brand: string;
  model: string;
  year: number;
  category: string;
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
  const id = params.id as string;

  const [vehicle, setVehicle] = useState<VehicleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      {/* Booking stats */}
      <div className="flex gap-3 mb-6">
        <Badge variant="outline">
          Total reservas: {vehicle._count.Booking}
        </Badge>
        {vehicle.activeBookings > 0 && (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Reservas activas: {vehicle.activeBookings}
          </Badge>
        )}
      </div>

      <VehicleForm mode="edit" initialData={vehicle} />
    </div>
  );
}
