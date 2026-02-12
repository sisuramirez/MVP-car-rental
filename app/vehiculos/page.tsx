"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import VehicleCard from "@/components/VehicleCard";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";

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
  dailyRate1_2: number;
  pricing: Pricing;
}

export default function VehiculosPage() {
  const searchParams = useSearchParams();
  const inicio = searchParams.get("inicio");
  const fin = searchParams.get("fin");

  const [vehicles, setVehicles] = useState<VehicleWithPricing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!inicio || !fin) return;
    fetch(`/api/vehicles/available?startDate=${inicio}&endDate=${fin}`)
      .then((res) => res.json())
      .then((data) => {
        setVehicles(data);
        setLoading(false);
      });
  }, [inicio, fin]);

  if (!inicio || !fin) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Fechas no seleccionadas</h1>
        <p className="text-muted-foreground mb-6">
          Selecciona fechas de inicio y fin para ver vehiculos disponibles.
        </p>
        <Button asChild>
          <Link href="/">Ir al inicio</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Vehiculos Disponibles</h1>
        <p className="text-muted-foreground">
          Recogida: {formatDateTime(inicio)}
        </p>
        <p className="text-muted-foreground">
          Devolucion: {formatDateTime(fin)}
        </p>
      </div>

      {loading ? (
        <p className="text-center py-12 text-muted-foreground">
          Buscando vehiculos disponibles...
        </p>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg mb-4">
            No hay vehiculos disponibles para esas fechas.
          </p>
          <Button asChild>
            <Link href="/">Buscar otras fechas</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              showPrice
              pricing={vehicle.pricing}
              inicio={inicio}
              fin={fin}
            />
          ))}
        </div>
      )}
    </div>
  );
}
