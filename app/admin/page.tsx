"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatsCard } from "@/components/admin/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Stats {
  bookings: {
    total: number;
    pendientes: number;
    confirmados: number;
    activos: number;
    completados: number;
    cancelados: number;
  };
  today: {
    pickups: number;
    returns: number;
  };
  vehicles: {
    total: number;
    disponibles: number;
    rentados: number;
    mantenimiento: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error ${res.status}: No se pudieron cargar las estadísticas`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.error) {
          throw new Error(data.error);
        }
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading stats:", err);
        setError(err.message || "Error al cargar estadísticas");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Cargando estadísticas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-red-900 mb-2">
              Error al cargar el dashboard
            </h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Booking stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Pendientes"
          value={stats.bookings.pendientes}
          icon="🟡"
          subtitle="Requieren confirmación"
        />
        <StatsCard
          title="Confirmadas"
          value={stats.bookings.confirmados}
          icon="🔵"
          subtitle="Esperando recogida"
        />
        <StatsCard
          title="Activas"
          value={stats.bookings.activos}
          icon="🟢"
          subtitle="Vehículos en renta"
        />
        <StatsCard
          title="Total Reservas"
          value={stats.bookings.total}
          icon="📋"
        />
      </div>

      {/* Today + Vehicles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold">{stats.today.pickups}</p>
                <p className="text-sm text-muted-foreground">Recogidas</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold">{stats.today.returns}</p>
                <p className="text-sm text-muted-foreground">Devoluciones</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Flota</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold">
                  {stats.vehicles.disponibles}
                </p>
                <p className="text-sm text-muted-foreground">Disponibles</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold">{stats.vehicles.rentados}</p>
                <p className="text-sm text-muted-foreground">Rentados</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-3xl font-bold">
                  {stats.vehicles.mantenimiento}
                </p>
                <p className="text-sm text-muted-foreground">Mant.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/reservas?status=PENDIENTE"
          className="p-4 border rounded-lg hover:bg-muted transition-colors"
        >
          <h3 className="font-semibold">🟡 Reservas Pendientes</h3>
          <p className="text-sm text-muted-foreground">
            {stats.bookings.pendientes} por confirmar
          </p>
        </Link>
        <Link
          href="/admin/vehiculos"
          className="p-4 border rounded-lg hover:bg-muted transition-colors"
        >
          <h3 className="font-semibold">🚗 Gestionar Flota</h3>
          <p className="text-sm text-muted-foreground">
            {stats.vehicles.total} vehículos
          </p>
        </Link>
        <Link
          href="/admin/calendario"
          className="p-4 border rounded-lg hover:bg-muted transition-colors"
        >
          <h3 className="font-semibold">📅 Ver Calendario</h3>
          <p className="text-sm text-muted-foreground">
            Disponibilidad mensual
          </p>
        </Link>
      </div>
    </div>
  );
}
