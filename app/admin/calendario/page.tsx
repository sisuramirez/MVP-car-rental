"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORY_LABELS } from "@/lib/format";

interface CalendarBooking {
  id: number;
  startDate: string;
  endDate: string;
  status: string;
  vehicle: {
    id: number;
    brand: string;
    model: string;
    plateNumber: string;
    category: string;
  };
  customer: {
    firstName: string;
    lastName: string;
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  ECONOMICO: "bg-blue-200 text-blue-900",
  SUV: "bg-green-200 text-green-900",
  LUJO: "bg-purple-200 text-purple-900",
  VAN: "bg-orange-200 text-orange-900",
};

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const DAY_NAMES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export default function AdminCalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/bookings?status=ALL")
      .then((res) => res.json())
      .then((data) => {
        setBookings(
          data.filter(
            (b: CalendarBooking) =>
              b.status !== "CANCELADO" && b.status !== "COMPLETADO"
          )
        );
        setLoading(false);
      });
  }, []);

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  }

  // Calendar grid
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  // Monday-based week: 0=Mon, 6=Sun
  const startDayOfWeek = (firstDay.getDay() + 6) % 7;

  function getBookingsForDay(day: number): CalendarBooking[] {
    const date = new Date(year, month, day);
    return bookings.filter((b) => {
      const start = new Date(b.startDate);
      const end = new Date(b.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return date >= start && date <= end;
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedBookings = selectedDay ? getBookingsForDay(selectedDay) : [];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Calendario</h1>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="sm" onClick={prevMonth}>
          ← Anterior
        </Button>
        <h2 className="text-lg font-semibold">
          {MONTH_NAMES[month]} {year}
        </h2>
        <Button variant="outline" size="sm" onClick={nextMonth}>
          Siguiente →
        </Button>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4 flex-wrap">
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1 text-xs">
            <div
              className={`w-3 h-3 rounded ${CATEGORY_COLORS[key] || "bg-gray-200"}`}
            />
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar grid */}
        <div className="lg:col-span-2">
          {loading ? (
            <p className="text-muted-foreground py-8">Cargando...</p>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              {/* Day names */}
              <div className="grid grid-cols-7 bg-muted/50">
                {DAY_NAMES.map((d) => (
                  <div
                    key={d}
                    className="p-2 text-center text-xs font-medium text-muted-foreground"
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7">
                {/* Empty cells before first day */}
                {Array.from({ length: startDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="p-1 min-h-[80px] border-t bg-muted/10" />
                ))}

                {/* Day cells */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dayBookings = getBookingsForDay(day);
                  const isToday =
                    day === today.getDate() &&
                    month === today.getMonth() &&
                    year === today.getFullYear();
                  const isSelected = day === selectedDay;

                  return (
                    <div
                      key={day}
                      className={`p-1 min-h-[80px] border-t cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-primary/10 ring-2 ring-primary ring-inset"
                          : "hover:bg-muted/30"
                      }`}
                      onClick={() => setSelectedDay(day)}
                    >
                      <div
                        className={`text-xs font-medium mb-1 ${
                          isToday
                            ? "bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center"
                            : ""
                        }`}
                      >
                        {day}
                      </div>
                      <div className="space-y-0.5">
                        {dayBookings.slice(0, 3).map((b) => (
                          <div
                            key={b.id}
                            className={`text-[10px] px-1 rounded truncate ${
                              CATEGORY_COLORS[b.vehicle.category] || "bg-gray-100"
                            }`}
                          >
                            {b.vehicle.brand} {b.vehicle.model}
                          </div>
                        ))}
                        {dayBookings.length > 3 && (
                          <div className="text-[10px] text-muted-foreground px-1">
                            +{dayBookings.length - 3} más
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Selected day detail */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDay
                ? `${selectedDay} de ${MONTH_NAMES[month]}`
                : "Selecciona un día"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedDay ? (
              <p className="text-sm text-muted-foreground">
                Haz clic en un día para ver las reservas.
              </p>
            ) : selectedBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Sin reservas para este día.
              </p>
            ) : (
              <div className="space-y-3">
                {selectedBookings.map((b) => (
                  <a
                    key={b.id}
                    href={`/admin/reservas/${b.id}`}
                    className="block p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          CATEGORY_COLORS[b.vehicle.category]?.split(" ")[0] ||
                          "bg-gray-300"
                        }`}
                      />
                      <span className="font-semibold text-sm">
                        {b.vehicle.brand} {b.vehicle.model}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {b.customer.firstName} {b.customer.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {b.vehicle.plateNumber} · #{b.id}
                    </p>
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
