import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDIENTE: {
    label: "Pendiente",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  CONFIRMADO: {
    label: "Confirmado",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  ACTIVO: {
    label: "Activo",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  COMPLETADO: {
    label: "Completado",
    className: "bg-gray-100 text-gray-800 border-gray-200",
  },
  CANCELADO: {
    label: "Cancelado",
    className: "bg-red-100 text-red-800 border-red-200",
  },
};

const PAYMENT_CONFIG: Record<string, { label: string; className: string }> = {
  PENDIENTE: {
    label: "Pendiente",
    className: "bg-orange-100 text-orange-800 border-orange-200",
  },
  PARCIAL: {
    label: "Parcial",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  PAGADO: {
    label: "Pagado",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  REEMBOLSADO: {
    label: "Reembolsado",
    className: "bg-purple-100 text-purple-800 border-purple-200",
  },
};

const VEHICLE_STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  DISPONIBLE: {
    label: "Disponible",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  RENTADO: {
    label: "Rentado",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  MANTENIMIENTO: {
    label: "Mantenimiento",
    className: "bg-orange-100 text-orange-800 border-orange-200",
  },
  RETIRADO: {
    label: "Retirado",
    className: "bg-gray-100 text-gray-800 border-gray-200",
  },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    className: "",
  };
  return (
    <Badge variant="outline" className={cn(config.className)}>
      {config.label}
    </Badge>
  );
}

export function PaymentBadge({ status }: { status: string }) {
  const config = PAYMENT_CONFIG[status] || {
    label: status,
    className: "",
  };
  return (
    <Badge variant="outline" className={cn(config.className)}>
      {config.label}
    </Badge>
  );
}

export function VehicleStatusBadge({ status }: { status: string }) {
  const config = VEHICLE_STATUS_CONFIG[status] || {
    label: status,
    className: "",
  };
  return (
    <Badge variant="outline" className={cn(config.className)}>
      {config.label}
    </Badge>
  );
}
