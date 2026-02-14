import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import { Toaster } from "@/components/ui/toaster";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "RentaCar GT - Renta de Vehiculos en Guatemala",
  description:
    "Alquiler de vehiculos en Guatemala. Economicos, SUV, Lujo y Van.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ConditionalNavbar />
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        <footer className="border-t py-6 text-center text-sm text-muted-foreground">
          <p>RentaCar GT - Guatemala</p>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
