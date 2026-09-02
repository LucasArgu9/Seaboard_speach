import { buildPlayersCsv } from "@/lib/admin/stats";
import { isAdmin } from "@/lib/admin/session";
import { unauthorized } from "@/lib/http/respond";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  const csv = await buildPlayersCsv();
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response("﻿" + csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="desafio-seaboard-${stamp}.csv"`,
    },
  });
}
