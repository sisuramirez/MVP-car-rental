import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatGTQ,
  CATEGORY_LABELS,
  TRANSMISSION_LABELS,
  FUEL_LABELS,
} from "@/lib/format";

interface Pricing {
  dailyRate: number;
  totalDays: number;
  subtotal: number;
  tax: number;
  total: number;
}

interface VehicleCardProps {
  vehicle: {
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
    imageUrl?: string | null;
  };
  showPrice?: boolean;
  pricing?: Pricing;
  inicio?: string;
  fin?: string;
}

export default function VehicleCard({
  vehicle,
  showPrice = false,
  pricing,
  inicio,
  fin,
}: VehicleCardProps) {
  return (
    <Card className="flex flex-col">
      {vehicle.imageUrl ? (
        <div className="h-48 relative rounded-t-lg overflow-hidden">
          <img
            src={vehicle.imageUrl}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="h-48 bg-muted flex items-center justify-center rounded-t-lg">
          <span className="text-4xl text-muted-foreground">
            {vehicle.category === "SUV"
              ? "🚙"
              : vehicle.category === "VAN"
              ? "🚐"
              : vehicle.category === "LUJO"
              ? "🏎️"
              : "🚗"}
          </span>
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {vehicle.brand} {vehicle.model} {vehicle.year}
          </CardTitle>
          <Badge variant="secondary">
            {CATEGORY_LABELS[vehicle.category] || vehicle.category}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{vehicle.plateNumber}</p>
      </CardHeader>

      <CardContent className="flex-1 pb-2">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1">
            <span>⚙️</span>
            <span>{TRANSMISSION_LABELS[vehicle.transmission]}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>⛽</span>
            <span>{FUEL_LABELS[vehicle.fuelType]}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>👥</span>
            <span>{vehicle.passengerCapacity} pasajeros</span>
          </div>
          <div className="flex items-center gap-1">
            {vehicle.hasAC ? (
              <>
                <span>❄️</span>
                <span>A/C</span>
              </>
            ) : (
              <>
                <span>🌡️</span>
                <span>Sin A/C</span>
              </>
            )}
          </div>
          {vehicle.hasGPS && (
            <div className="flex items-center gap-1">
              <span>📍</span>
              <span>GPS</span>
            </div>
          )}
        </div>

        {showPrice && pricing && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="flex justify-between text-sm">
              <span>
                {formatGTQ(pricing.dailyRate)}/dia x {pricing.totalDays} dias
              </span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatGTQ(pricing.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>IVA (12%)</span>
              <span>{formatGTQ(pricing.tax)}</span>
            </div>
            <div className="flex justify-between font-bold mt-1 pt-1 border-t">
              <span>Total</span>
              <span>{formatGTQ(pricing.total)}</span>
            </div>
          </div>
        )}

        {!showPrice && (
          <p className="mt-4 text-sm text-muted-foreground">
            Desde {formatGTQ(vehicle.dailyRate1_2)}/dia
          </p>
        )}
      </CardContent>

      <CardFooter>
        {showPrice && inicio && fin ? (
          <Button asChild className="w-full">
            <Link
              href={`/reservar/${vehicle.id}?inicio=${inicio}&fin=${fin}`}
            >
              Reservar
            </Link>
          </Button>
        ) : (
          <Button variant="outline" className="w-full" disabled>
            Ver Detalles
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
