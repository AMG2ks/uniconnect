"use client";
import { logout } from "@/app/login/actions";

export function LogoutButton() {
  async function onSubmit() {
    try {
      navigator.serviceWorker?.controller?.postMessage("clear");
      if ("caches" in window) await Promise.all((await caches.keys()).map((k) => caches.delete(k)));
    } catch {}
  }
  return (
    <form action={logout} onSubmit={onSubmit}>
      <button className="min-h-11 rounded-lg px-3 text-sm text-slate-700 hover:bg-slate-100">Déconnexion</button>
    </form>
  );
}
