"use client";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";

/**
 * Cliente Supabase anónimo para el navegador. Se usa SOLO para el canal
 * Realtime Broadcast (efímero). Toda lectura de datos va por la API REST de la
 * app (GET /api/session/[id]); toda escritura, por route handlers.
 */
let cached: SupabaseClient | null = null;

export function supabaseBrowser(): SupabaseClient {
  if (cached) return cached;
  cached = createClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { params: { eventsPerSecond: 10 } },
  });
  return cached;
}

/** Nombre del canal Broadcast de una sesión. */
export function sessionChannelName(sessionId: string): string {
  return `desafio:${sessionId}`;
}
