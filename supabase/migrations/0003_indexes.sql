-- ============================================================================
-- 0003_indexes.sql — índices de apoyo
-- ============================================================================

create index if not exists players_session_idx      on public.players (session_id);
create index if not exists answers_session_idx       on public.answers (session_id);
create index if not exists answers_player_idx         on public.answers (player_id);
create index if not exists answers_question_idx       on public.answers (question_id);
create index if not exists round_scores_session_idx   on public.round_scores (session_id);
create index if not exists sessions_status_idx        on public.sessions (status);
create index if not exists sessions_finished_idx      on public.sessions (finished_at);
create index if not exists question_options_qid_idx   on public.question_options (question_id);
