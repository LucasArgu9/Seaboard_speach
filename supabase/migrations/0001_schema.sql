-- ============================================================================
-- 0001_schema.sql — DESAFÍO SEABOARD
-- Orden de aplicación: 0001_schema -> 0002_rls -> 0003_indexes -> seed.sql
-- snake_case en SQL. El servidor (route handlers de Next, service role) es la
-- única autoridad de escritura: timer, respuesta válida, puntos y ranking.
-- ============================================================================

create extension if not exists "pgcrypto" with schema "extensions";

-- ---------------------------------------------------------------------------
-- sessions — una ronda del kiosko. `rev` es monótono y sube en cada
-- transición aceptada para que los clientes Realtime descarten eventos viejos.
-- `question_ids` son los 5 ids elegidos al azar sin repetir para la ronda.
-- ---------------------------------------------------------------------------
create table if not exists public.sessions (
  id                     uuid primary key default gen_random_uuid(),
  code                   text not null,
  status                 text not null default 'WAITING'
                           check (status in (
                             'WAITING','LOBBY','COUNTDOWN','QUESTION',
                             'ANSWER_REVEAL','SCORE_UPDATE','FINAL_RANKING'
                           )),
  rev                    integer not null default 0,
  current_question_index integer not null default -1,
  question_started_at    timestamptz,
  question_ids           jsonb not null default '[]'::jsonb,
  total_questions        integer not null default 5,
  created_at             timestamptz not null default now(),
  started_at             timestamptz,
  finished_at            timestamptz
);

comment on table public.sessions is
  'Ronda del kiosko + máquina de estados. El navegador solo lee la vista session_public.';

-- ---------------------------------------------------------------------------
-- players — hasta NEXT_PUBLIC_MAX_PLAYERS por sesión. `seat` = orden de
-- llegada (1..N) y se usa para mostrar. Apellido / carrera / año son datos
-- del formulario: nunca salen por Realtime ni por la pantalla grande.
-- ---------------------------------------------------------------------------
create table if not exists public.players (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid not null references public.sessions(id) on delete cascade,
  seat          integer not null check (seat between 1 and 64),
  first_name    text not null,
  last_name     text not null default '',
  career        text not null default '',
  study_year    text not null default '',
  score         integer not null default 0,
  correct_count integer not null default 0,
  total_time_ms integer not null default 0,
  joined_at     timestamptz not null default now(),
  constraint players_seat_unique unique (session_id, seat)
);

-- ---------------------------------------------------------------------------
-- questions / question_options — la app RENDERIZA desde questions.json;
-- estas tablas dan integridad referencial a `answers` y alimentan /admin.
-- Se cargan con `npm run db:seed`.
-- ---------------------------------------------------------------------------
create table if not exists public.questions (
  id                text primary key,
  category          text not null,
  difficulty        text not null default 'facil'
                      check (difficulty in ('facil','media','dificil')),
  prompt            text not null,
  reference         text not null default '',
  correct_option_id text not null,
  active            boolean not null default true
);

create table if not exists public.question_options (
  id          text primary key,
  question_id text not null references public.questions(id) on delete cascade,
  text        text not null,
  "order"     integer not null check ("order" between 0 and 3),
  constraint question_options_unique_order unique (question_id, "order")
);

-- ---------------------------------------------------------------------------
-- answers — una fila por (player, question). `selected_option_id` null =
-- sin respuesta / timeout. La unicidad hace que POST /api/answer sea
-- idempotente (ON CONFLICT DO NOTHING) => no se puede cambiar la respuesta.
-- `response_time_ms` y `points` los calcula SIEMPRE el servidor.
-- ---------------------------------------------------------------------------
create table if not exists public.answers (
  id                 uuid primary key default gen_random_uuid(),
  session_id         uuid not null references public.sessions(id) on delete cascade,
  player_id          uuid not null references public.players(id) on delete cascade,
  question_id        text not null references public.questions(id),
  selected_option_id text references public.question_options(id) on delete set null,
  is_correct         boolean not null default false,
  response_time_ms   integer check (response_time_ms is null or response_time_ms >= 0),
  timed_out          boolean not null default false,
  points             integer not null default 0 check (points >= 0),
  created_at         timestamptz not null default now(),
  constraint answers_one_per_question unique (player_id, question_id)
);

-- ---------------------------------------------------------------------------
-- round_scores — snapshot final por (session, player). Se escribe una vez al
-- entrar en FINAL_RANKING (upsert idempotente).
-- Desempate: score desc -> correct_count desc -> total_time_ms asc ->
-- posición compartida.
-- ---------------------------------------------------------------------------
create table if not exists public.round_scores (
  session_id      uuid not null references public.sessions(id) on delete cascade,
  player_id       uuid not null references public.players(id) on delete cascade,
  first_name      text not null,
  score           integer not null default 0,
  correct_count   integer not null default 0,
  total_time_ms   integer not null default 0,
  rank            integer not null,
  shared_position boolean not null default false,
  created_at      timestamptz not null default now(),
  primary key (session_id, player_id)
);

-- ---------------------------------------------------------------------------
-- Vistas públicas — única superficie de lectura para el rol anon (navegador).
-- security_invoker = off: corren con permisos del owner y saltean RLS para
-- proyectar solo columnas no sensibles.
-- ---------------------------------------------------------------------------
create or replace view public.session_public with (security_invoker = off) as
  select id, code, status, rev, current_question_index, question_started_at,
         total_questions, created_at
  from public.sessions;

create or replace view public.players_public with (security_invoker = off) as
  select id, session_id, seat, first_name, score, correct_count, joined_at
  from public.players;

-- Opciones SIN la respuesta correcta.
create or replace view public.question_options_public with (security_invoker = off) as
  select id, question_id, text, "order"
  from public.question_options;

create or replace view public.questions_public with (security_invoker = off) as
  select id, category, difficulty, prompt
  from public.questions;

comment on view public.session_public is 'Proyección no sensible de sessions para el rol anon.';
comment on view public.players_public is 'Sin apellido/carrera/año. Lo que ve la pantalla grande.';
comment on view public.question_options_public is 'Opciones sin correct_option_id.';
