import { Vehicle } from "@prisma/client";
import { differenceInCalendarDays } from "date-fns";

export function getDailyRate(vehicle: Vehicle, totalDays: number): number {
  if (totalDays <= 2) return vehicle.dailyRate1_2;
  if (totalDays <= 6) return vehicle.dailyRate3_6;
  if (totalDays <= 13) return vehicle.weeklyRate;
  return vehicle.monthlyRate;
}

export function calculatePrice(
  vehicle: Vehicle,
  startDate: Date,
  endDate: Date
) {
  const totalDays = differenceInCalendarDays(endDate, startDate);
  const dailyRate = getDailyRate(vehicle, totalDays);
  const subtotal = dailyRate * totalDays;
  const tax = Math.round(subtotal * 0.12);
  const total = subtotal + tax;

  return { dailyRate, totalDays, subtotal, tax, total };
}
