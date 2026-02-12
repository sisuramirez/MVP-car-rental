"use client";

import { useEffect, useState } from "react";
import VehicleCard from "@/components/VehicleCard";

interface Vehicle {
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
  imageUrl: string | null;
}

export default function FlotaPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vehicles")
      .then((res) => res.json())
      .then((data) => {
        setVehicles(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Nuestra Flota</h1>
      <p className="text-muted-foreground mb-8">
        Conoce todos nuestros vehiculos disponibles
      </p>

      {loading ? (
        <p className="text-center py-12 text-muted-foreground">
          Cargando vehiculos...
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      )}
    </div>
  );
}
