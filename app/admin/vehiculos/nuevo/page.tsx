"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { VehicleForm } from "@/components/admin/VehicleForm";
import { useDemo } from "@/app/admin/DemoContext";

export default function NuevoVehiculoPage() {
  const router = useRouter();
  const { isDemo } = useDemo();

  useEffect(() => {
    if (isDemo) {
      router.replace("/admin/vehiculos");
    }
  }, [isDemo, router]);

  if (isDemo) return null;

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
