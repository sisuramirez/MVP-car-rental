export function formatGTQ(centavos: number): string {
  const quetzales = centavos / 100;
  return `Q${quetzales.toLocaleString("es-GT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDateTime(isoStr: string): string {
  const date = new Date(isoStr);
  const dateStr = date.toLocaleDateString("es-GT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("es-GT", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${dateStr} a las ${timeStr}`;
}

export const BUSINESS_HOURS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

export const CATEGORY_LABELS: Record<string, string> = {
  ECONOMICO: "Economico",
  SUV: "SUV",
  LUJO: "Lujo",
  VAN: "Van",
};

export const TRANSMISSION_LABELS: Record<string, string> = {
  MANUAL: "Manual",
  AUTOMATICA: "Automatica",
};

export const FUEL_LABELS: Record<string, string> = {
  GASOLINA: "Gasolina",
  DIESEL: "Diesel",
  HIBRIDO: "Hibrido",
  ELECTRICO: "Electrico",
};
