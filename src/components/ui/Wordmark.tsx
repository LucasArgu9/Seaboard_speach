/**
 * Logo Seaboard — recreación vectorial (wordmark serif + globo verde + bajada).
 * `tone="dark"` para fondos oscuros (pantalla), `tone="light"` para fondo claro.
 * El wordmark usa `currentColor`; el color se pasa por className del contenedor.
 */
export function Wordmark({
  className = "",
  tone = "light",
  showTagline = false,
  title = "Seaboard Energías Renovables y Alimentos",
}: {
  className?: string;
  tone?: "light" | "dark";
  showTagline?: boolean;
  title?: string;
}) {
  const wordFill = tone === "dark" ? "#ffffff" : "#0a2158";
  const tagFill = tone === "dark" ? "#8fd8a6" : "#2e9f3a";
  const vbH = showTagline ? 210 : 150;

  return (
    <span className={className} style={{ color: wordFill, display: "inline-block", lineHeight: 0 }}>
      <svg
        viewBox={`0 0 812 ${vbH}`}
        role="img"
        aria-label={title}
        style={{ height: "1em", width: "auto", overflow: "visible" }}
      >
        <title>{title}</title>

        {/* SEAB */}
        <text
          x="0"
          y="120"
          textLength="322"
          lengthAdjust="spacingAndGlyphs"
          fontFamily="Georgia, 'Times New Roman', 'Nimbus Roman', serif"
          fontWeight="700"
          fontSize="150"
          fill="currentColor"
        >
          SEAB
        </text>

        {/* Globo verde en lugar de la O */}
        <g transform="translate(400 68)">
          <circle r="62" fill="#2fa23d" />
          <g fill="none" stroke="#ffffff" strokeWidth="3" opacity="0.85">
            <circle r="62" />
            <ellipse rx="62" ry="21" />
            <ellipse rx="26" ry="62" />
            <line x1="-62" y1="0" x2="62" y2="0" />
          </g>
          <path
            d="M -9,-52 C -24,-45 -19,-29 -25,-21 C -31,-13 -21,-5 -27,3 C -14,-1 -19,-14 -11,-20 C -3,-26 -9,-40 3,-44 C 11,-47 7,-52 -9,-52 Z M -6,5 C -15,11 -11,25 -17,35 C -23,45 -12,53 -6,50 C 1,47 -4,36 3,28 C 9,20 2,11 -6,5 Z"
            fill="#ffffff"
            opacity="0.95"
          />
        </g>

        {/* ARD */}
        <text
          x="470"
          y="120"
          textLength="300"
          lengthAdjust="spacingAndGlyphs"
          fontFamily="Georgia, 'Times New Roman', 'Nimbus Roman', serif"
          fontWeight="700"
          fontSize="150"
          fill="currentColor"
        >
          ARD
        </text>

        {showTagline && (
          <text
            x="40"
            y="192"
            textLength="700"
            lengthAdjust="spacingAndGlyphs"
            fontFamily="Georgia, 'Times New Roman', 'Nimbus Roman', serif"
            fontStyle="italic"
            fontWeight="700"
            fontSize="46"
            fill={tagFill}
          >
            energías renovables • alimentos
          </text>
        )}
      </svg>
    </span>
  );
}
