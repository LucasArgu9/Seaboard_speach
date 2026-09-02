# DESAFÍO SEABOARD

> ¿Cuánto aprendiste sobre nosotros?

Juego de trivia multijugador para el stand de la feria de empleabilidad de
**Seaboard Energías Renovables y Alimentos**. Después del speech, los estudiantes
escanean un QR, entran a la sala y compiten en una ronda de 5 preguntas.

- **Pantalla grande** (`/game/[id]`): QR, lobby, countdown, preguntas, reveal,
  tabla y podio. Conduce la ronda y funciona en **modo kiosko** (al terminar
  crea una sala nueva sola).
- **Teléfono** (`/play/[id]`): registro (nombre, apellido, carrera, año) y
  control remoto con botones grandes.
- **Panel** (`/admin`): métricas de participación y export CSV.

Contenido de las preguntas: **exclusivamente** el documento
`Speach de feria de empleabilidad.docx` (ver `questions.json`).

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Supabase (+ Realtime
Broadcast) · Framer Motion. Confeti en canvas propio (sin dependencias extra).

## Puesta en marcha

```bash
npm install
cp .env.example .env.local     # completá las claves de Supabase (ver supabase/README.md)
# aplicar supabase/migrations/0001..0003 en el SQL Editor
npm run db:seed                # carga las ~40 preguntas
npm run dev
```

Abrí `http://localhost:3000` → redirige a una sala nueva (`/game/<id>`).
Escaneá el QR con 2+ teléfonos (o abrí `/play/<id>` en otras pestañas).

## Reglas del juego

| | |
|---|---|
| Jugadores por ronda | 2 a **10** (`NEXT_PUBLIC_MAX_PLAYERS`) |
| Preguntas | 5 al azar sin repetir, de un banco de ~40 |
| Tiempo por pregunta | 10 s |
| Puntos | `500 + 500 × (tiempo_restante / 10)` si acierta; 0 si no |
| Autoridad del tiempo, la respuesta y el puntaje | **el servidor** |
| Desempate | puntaje → aciertos → menor tiempo total → posición compartida |

## Arquitectura

- La **pantalla** es la autoridad del estado de la ronda: en cada fase llama a
  `POST /api/session/[id]/advance` (idempotente por `rev`).
- El **servidor** (route handlers) calcula timer, corrección, puntos y ranking.
  El cliente nunca manda su tiempo.
- **Realtime**: un canal Broadcast por sesión emite un `bump` con el `rev`; los
  clientes hacen `GET /api/session/[id]` (única fuente de verdad). Hay polling de
  respaldo para reconexiones y refrescos.

## Scripts

```bash
npm run dev         # desarrollo
npm run build       # build de producción
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run test        # vitest (scoring, ranking, máquina de estados, banco)
npm run test:e2e    # playwright (requiere Supabase + db:seed)
npm run db:seed     # carga questions.json en Supabase
```
