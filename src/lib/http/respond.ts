import { NextResponse } from "next/server";

export function ok<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(data, { status: 200, ...init });
}

export function created<T>(data: T): NextResponse {
  return NextResponse.json(data, { status: 201 });
}

export function badRequest(message: string, details?: unknown): NextResponse {
  return NextResponse.json({ error: "bad_request", message, details }, { status: 400 });
}

export function unauthorized(message = "No autorizado"): NextResponse {
  return NextResponse.json({ error: "unauthorized", message }, { status: 401 });
}

export function notFound(message = "No encontrado"): NextResponse {
  return NextResponse.json({ error: "not_found", message }, { status: 404 });
}

/** 409 — usado para "sala llena" y transiciones inválidas. */
export function conflict(message: string, code = "conflict"): NextResponse {
  return NextResponse.json({ error: code, message }, { status: 409 });
}

export function serverError(message = "Error interno"): NextResponse {
  return NextResponse.json({ error: "server_error", message }, { status: 500 });
}
