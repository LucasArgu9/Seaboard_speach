# Supabase · Desafío Seaboard

## 1. Crear el proyecto

1. Creá un proyecto nuevo en <https://supabase.com/dashboard>.
2. En **Project Settings → API** copiá:
   - `Project URL` → `SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `SUPABASE_ANON_KEY` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` (secreto) → `SUPABASE_SERVICE_ROLE_KEY`
3. Pegalos en `.env.local` (copiá `.env.example`).

## 2. Aplicar el esquema

Ejecutá los archivos **en orden** en el **SQL Editor** del dashboard
(o con la CLI: `supabase db push`):

```
migrations/0001_schema.sql
migrations/0002_rls.sql
migrations/0003_indexes.sql
migrations/0004_join_fields.sql
```

## 3. Cargar el banco de preguntas

```bash
npm run db:seed
```

Lee `questions.json` (raíz del repo) y hace upsert en `questions` /
`question_options`.

## 4. Realtime

El juego usa **Broadcast** efímero (canal `desafio:<session_id>`), no
`postgres_changes`. No hace falta habilitar replicación de tablas. El servidor
emite el broadcast por la API HTTP de Realtime con la service role key.

## Seguridad

- RLS activo en todas las tablas, **sin políticas** → el rol `anon` no lee ni
  escribe las tablas base.
- El navegador solo lee las vistas `*_public` (sin PII, sin la respuesta
  correcta).
- Toda escritura pasa por route handlers con la service role key.
