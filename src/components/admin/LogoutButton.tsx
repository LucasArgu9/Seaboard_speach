"use client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/admin/login", { method: "DELETE" });
        router.replace("/admin/login");
        router.refresh();
      }}
      className="text-sm font-semibold text-slate underline"
    >
      Cerrar sesión
    </button>
  );
}
