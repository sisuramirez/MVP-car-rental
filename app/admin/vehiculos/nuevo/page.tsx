"use client";

import Link from "next/link";
import { VehicleForm } from "@/components/admin/VehicleForm";

export default function NuevoVehiculoPage() {
  return (
    <div className="p-8">
      <Link
        href="/admin/vehiculos"
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Volver a vehículos
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">Agregar Nuevo Vehículo</h1>
      <VehicleForm mode="create" />
    </div>
  );
}
