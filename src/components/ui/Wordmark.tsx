import Image from "next/image";
import logo from "../../../public/logo.png";

/**
 * Logo oficial de Seaboard (public/logo.png). Como el archivo tiene fondo
 * blanco, se muestra siempre dentro de una tarjeta blanca redondeada: queda
 * prolijo tanto sobre el navy de la pantalla como sobre el fondo claro del
 * teléfono.
 */
export function Wordmark({
  className = "",
  height = 44,
}: {
  className?: string;
  /** Alto del logo en px (la tarjeta y el padding escalan con este valor). */
  height?: number;
  /** @deprecated se ignora: el logo real ya trae la bajada y va sobre tarjeta blanca. */
  tone?: "light" | "dark";
  /** @deprecated se ignora. */
  showTagline?: boolean;
}) {
  const pad = Math.round(height * 0.16);
  return (
    <span
      className={`inline-flex items-center rounded-xl bg-white shadow-sm ${className}`}
      style={{ padding: pad }}
    >
      <Image
        src={logo}
        alt="Seaboard Energías Renovables y Alimentos"
        height={height}
        priority
        style={{ height, width: "auto" }}
      />
    </span>
  );
}
