-- ============================================================================
-- 0002_rls.sql — Row Level Security
-- Todas las tablas: RLS ON y SIN políticas => el rol anon/authenticated no
-- puede leer ni escribir las tablas base. El navegador lee únicamente las
-- vistas *_public (0001). El servidor usa la service role key, que saltea RLS.
-- ============================================================================

alter table public.sessions          enable row level security;
alter table public.players           enable row level security;
alter table public.questions         enable row level security;
alter table public.question_options  enable row level security;
alter table public.answers           enable row level security;
alter table public.round_scores      enable row level security;

-- Acceso de lectura del navegador: solo las vistas proyectadas.
grant select on public.session_public          to anon, authenticated;
grant select on public.players_public          to anon, authenticated;
grant select on public.questions_public        to anon, authenticated;
grant select on public.question_options_public to anon, authenticated;

-- Realtime Broadcast: el canal es efímero (no depende de postgres_changes),
-- así que no hace falta publicación. Nada más que conceder acá.
