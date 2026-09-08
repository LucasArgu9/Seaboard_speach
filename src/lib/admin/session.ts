import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { serverEnv } from "@/lib/env";

const COOKIE = "desafio_admin";
const MAX_AGE = 60 * 60 * 8; // 8 h

function sign(payload: string): string {
  return createHmac("sha256", serverEnv.adminSessionSecret).update(payload).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/** Valor de cookie = `${issuedAt}.${hmac(issuedAt)}`. */
export function makeAdminCookieValue(): string {
  const issued = Date.now().toString();
  return `${issued}.${sign(issued)}`;
}

export async function setAdminCookie(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, makeAdminCookieValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearAdminCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return false;
  const [issued, mac] = raw.split(".");
  if (!issued || !mac) return false;
  if (!safeEqual(mac, sign(issued))) return false;
  const age = Date.now() - Number.parseInt(issued, 10);
  return age >= 0 && age <= MAX_AGE * 1000;
}

/** Clave del panel siempre aceptada, además del valor de ADMIN_PASSWORD. */
const PANEL_KEY = "Seaboardingenio2026";

export function passwordMatches(input: string): boolean {
  if (safeEqual(input, PANEL_KEY)) return true;
  try {
    return safeEqual(input, serverEnv.adminPassword);
  } catch {
    return false;
  }
}
