"use client";
import { logout } from "@/app/login/actions";
import { Icon } from "./Icons";

export function LogoutButton() {
  async function onSubmit() {
    try {
      navigator.serviceWorker?.controller?.postMessage("clear");
      if ("caches" in window) await Promise.all((await caches.keys()).map((k) => caches.delete(k)));
    } catch {}
  }
  return (
    <form action={logout} onSubmit={onSubmit}>
      <button className="btn-ghost !min-h-10 !px-3" title="Se déconnecter">
        <Icon name="logout" className="size-4" /><span className="hidden sm:inline">Déconnexion</span>
      </button>
    </form>
  );
}
