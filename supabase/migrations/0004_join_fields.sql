-- ============================================================================
-- 0004_join_fields.sql — datos extra del registro del jugador
--   university       : "UCASAL" | "UNSA" | "Otra"
--   university_other : nombre libre cuando university = "Otra"
--   career_other     : texto libre cuando la carrera es "Otra carrera (especificar)"
--   contact          : correo o teléfono para que RRHH pueda contactar (PII)
-- `contact` NO se expone en la vista players_public: queda solo para service role
-- (panel /admin y export CSV).
-- ============================================================================

alter table public.players
  add column if not exists university       text not null default '',
  add column if not exists university_other text not null default '',
  add column if not exists career_other     text not null default '',
  add column if not exists contact          text not null default '';
