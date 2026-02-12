"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "./ImageUpload";
import { useToast } from "@/hooks/use-toast";

interface VehicleData {
  id?: number;
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
  imageUrl?: string | null;
}

interface VehicleFormProps {
  mode: "create" | "edit";
  initialData?: VehicleData;
}

const defaultData: VehicleData = {
  plateNumber: "",
  brand: "",
  model: "",
  year: new Date().getFullYear(),
  category: "ECONOMICO",
  dailyRate1_2: 0,
  dailyRate3_6: 0,
  weeklyRate: 0,
  monthlyRate: 0,
  transmission: "AUTOMATICA",
  fuelType: "GASOLINA",
  passengerCapacity: 5,
  hasAC: true,
  hasGPS: false,
};

export function VehicleForm({ mode, initialData }: VehicleFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const data = initialData || defaultData;

  const [form, setForm] = useState({
    plateNumber: data.plateNumber,
    brand: data.brand,
    model: data.model,
    year: data.year,
    category: data.category,
    // Display in quetzales (divide centavos by 100)
    dailyRate1_2: data.dailyRate1_2 / 100,
    dailyRate3_6: data.dailyRate3_6 / 100,
    weeklyRate: data.weeklyRate / 100,
    monthlyRate: data.monthlyRate / 100,
    transmission: data.transmission,
    fuelType: data.fuelType,
    passengerCapacity: data.passengerCapacity,
    hasAC: data.hasAC,
    hasGPS: data.hasGPS,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;
    setForm((f) => ({
      ...f,
      [name]:
        type === "number"
          ? parseFloat(value) || 0
          : type === "checkbox"
            ? (e.target as HTMLInputElement).checked
            : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.set("plateNumber", form.plateNumber);
      formData.set("brand", form.brand);
      formData.set("model", form.model);
      formData.set("year", String(form.year));
      formData.set("category", form.category);
      // Convert quetzales to centavos
      formData.set("dailyRate1_2", String(Math.round(form.dailyRate1_2 * 100)));
      formData.set("dailyRate3_6", String(Math.round(form.dailyRate3_6 * 100)));
      formData.set("weeklyRate", String(Math.round(form.weeklyRate * 100)));
      formData.set("monthlyRate", String(Math.round(form.monthlyRate * 100)));
      formData.set("transmission", form.transmission);
      formData.set("fuelType", form.fuelType);
      formData.set("passengerCapacity", String(form.passengerCapacity));
      formData.set("hasAC", String(form.hasAC));
      formData.set("hasGPS", String(form.hasGPS));

      if (imageFile) {
        formData.set("image", imageFile);
      }

      const url =
        mode === "create"
          ? "/api/admin/vehicles"
          : `/api/admin/vehicles/${data.id}`;

      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Error al guardar");
      }

      toast({
        title: mode === "create" ? "Vehículo creado exitosamente" : "Vehículo actualizado exitosamente",
        description: `${form.brand} ${form.model} se ha guardado correctamente.`,
      });

      router.push("/admin/vehiculos");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información Básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plateNumber">Placa *</Label>
              <Input
                id="plateNumber"
                name="plateNumber"
                required
                value={form.plateNumber}
                onChange={handleChange}
                placeholder="P-123456"
                pattern="P-\d{6}"
                title="Formato: P-XXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Año *</Label>
              <Input
                id="year"
                name="year"
                type="number"
                required
                min={2020}
                max={new Date().getFullYear() + 1}
                value={form.year}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Marca *</Label>
              <Input
                id="brand"
                name="brand"
                required
                value={form.brand}
                onChange={handleChange}
                placeholder="Toyota"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Modelo *</Label>
              <Input
                id="model"
                name="model"
                required
                value={form.model}
                onChange={handleChange}
                placeholder="Corolla"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoría *</Label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="ECONOMICO">Económico</option>
              <option value="SUV">SUV</option>
              <option value="LUJO">Lujo</option>
              <option value="VAN">Van</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Specs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Especificaciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="transmission">Transmisión *</Label>
              <select
                id="transmission"
                name="transmission"
                value={form.transmission}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="AUTOMATICA">Automática</option>
                <option value="MANUAL">Manual</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fuelType">Combustible *</Label>
              <select
                id="fuelType"
                name="fuelType"
                value={form.fuelType}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="GASOLINA">Gasolina</option>
                <option value="DIESEL">Diesel</option>
                <option value="HIBRIDO">Híbrido</option>
                <option value="ELECTRICO">Eléctrico</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="passengerCapacity">Capacidad de Pasajeros *</Label>
            <Input
              id="passengerCapacity"
              name="passengerCapacity"
              type="number"
              required
              min={2}
              max={15}
              value={form.passengerCapacity}
              onChange={handleChange}
            />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="hasAC"
                checked={form.hasAC}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span className="text-sm">Aire Acondicionado</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="hasGPS"
                checked={form.hasGPS}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span className="text-sm">GPS</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Precios (en Quetzales)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Ingrese el precio por día en quetzales (ej: 350.00)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dailyRate1_2">Precio 1-2 días *</Label>
              <Input
                id="dailyRate1_2"
                name="dailyRate1_2"
                type="number"
                required
                min={0}
                step={0.01}
                value={form.dailyRate1_2 || ""}
                onChange={handleChange}
                placeholder="350.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dailyRate3_6">Precio 3-6 días *</Label>
              <Input
                id="dailyRate3_6"
                name="dailyRate3_6"
                type="number"
                required
                min={0}
                step={0.01}
                value={form.dailyRate3_6 || ""}
                onChange={handleChange}
                placeholder="300.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weeklyRate">Precio semanal *</Label>
              <Input
                id="weeklyRate"
                name="weeklyRate"
                type="number"
                required
                min={0}
                step={0.01}
                value={form.weeklyRate || ""}
                onChange={handleChange}
                placeholder="250.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyRate">Precio mensual *</Label>
              <Input
                id="monthlyRate"
                name="monthlyRate"
                type="number"
                required
                min={0}
                step={0.01}
                value={form.monthlyRate || ""}
                onChange={handleChange}
                placeholder="200.00"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Imagen</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload
            currentImageUrl={data.imageUrl}
            onChange={setImageFile}
          />
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting
            ? "Guardando..."
            : mode === "create"
              ? "Guardar Vehículo"
              : "Actualizar Vehículo"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/vehiculos">Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}
