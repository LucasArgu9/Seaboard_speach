import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-sans", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Desafío Seaboard",
  description: "¿Cuánto aprendiste sobre nosotros? Juego de la feria de empleabilidad de Seaboard.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0A1F44",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${inter.variable} antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
