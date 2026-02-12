"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BUSINESS_HOURS } from "@/lib/format";

export default function HomePage() {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const [inicioDate, setInicioDate] = useState("");
  const [inicioTime, setInicioTime] = useState("10:00");
  const [finDate, setFinDate] = useState("");
  const [finTime, setFinTime] = useState("10:00");

  function handleSearch() {
    if (!inicioDate || !finDate) return;
    const inicio = `${inicioDate}T${inicioTime}`;
    const fin = `${finDate}T${finTime}`;
    router.push(
      `/vehiculos?inicio=${encodeURIComponent(inicio)}&fin=${encodeURIComponent(fin)}`
    );
  }

  const isValid =
    inicioDate &&
    finDate &&
    `${inicioDate}T${inicioTime}` < `${finDate}T${finTime}`;

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Hero */}
      <section className="py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">Renta de Vehiculos</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Encuentra el vehiculo perfecto para tu viaje en Guatemala
        </p>

        {/* Date + Time picker */}
        <div className="max-w-md mx-auto bg-card border rounded-lg p-6 shadow-sm">
          <div className="grid gap-4">
            {/* Start date + time */}
            <div className="grid gap-2">
              <Label>Fecha y hora de recogida</Label>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                <Input
                  type="date"
                  min={today}
                  value={inicioDate}
                  onChange={(e) => {
                    setInicioDate(e.target.value);
                    if (finDate && e.target.value > finDate) setFinDate("");
                  }}
                />
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={inicioTime}
                  onChange={(e) => setInicioTime(e.target.value)}
                >
                  {BUSINESS_HOURS.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* End date + time */}
            <div className="grid gap-2">
              <Label>Fecha y hora de devolucion</Label>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                <Input
                  type="date"
                  min={inicioDate || today}
                  value={finDate}
                  onChange={(e) => setFinDate(e.target.value)}
                  disabled={!inicioDate}
                />
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={finTime}
                  onChange={(e) => setFinTime(e.target.value)}
                  disabled={!inicioDate}
                >
                  {BUSINESS_HOURS.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button
              onClick={handleSearch}
              disabled={!isValid}
              className="w-full"
              size="lg"
            >
              Buscar Vehiculos Disponibles
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
        <div>
          <div className="text-3xl mb-2">🚗</div>
          <h3 className="font-semibold mb-1">Flota Variada</h3>
          <p className="text-sm text-muted-foreground">
            Economicos, SUV, Lujo y Van
          </p>
        </div>
        <div>
          <div className="text-3xl mb-2">💰</div>
          <h3 className="font-semibold mb-1">Precios Competitivos</h3>
          <p className="text-sm text-muted-foreground">
            Tarifas por dia, semana y mes
          </p>
        </div>
        <div>
          <div className="text-3xl mb-2">📍</div>
          <h3 className="font-semibold mb-1">Guatemala</h3>
          <p className="text-sm text-muted-foreground">
            Servicio local y confiable
          </p>
        </div>
      </section>
    </div>
  );
}
