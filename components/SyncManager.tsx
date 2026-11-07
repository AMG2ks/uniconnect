"use client";
import { useCallback, useEffect, useState } from "react";
import { markAbsences } from "@/app/(modules)/absences/actions";
import { pending, remove } from "@/lib/offline-queue";

/** Bandeau hors ligne + envoi automatique de la file d'absences au retour du réseau. */
export function SyncManager() {
  const [online, setOnline] = useState(true);
  const [count, setCount] = useState(0);

  const flush = useCallback(async () => {
    if (!navigator.onLine) return;
    for (const p of await pending()) {
      try {
        const r = await markAbsences(p); // idempotent: les doublons sont ignorés
        if (!r?.error) await remove(p.clientId!);
      } catch { return; }
    }
    setCount((await pending()).length);
  }, []);

  useEffect(() => {
    setOnline(navigator.onLine);
    const refresh = async () => setCount((await pending()).length);
    const on = () => { setOnline(true); flush(); };
    const off = () => setOnline(false);
    refresh(); flush();
    window.addEventListener("online", on); window.addEventListener("offline", off); window.addEventListener("uc-queue", refresh);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); window.removeEventListener("uc-queue", refresh); };
  }, [flush]);

  if (online && !count) return null;
  return (
    <div role="status" className={`px-4 py-2 text-sm ${online ? "bg-brand-100 text-brand-900" : "bg-amber-100 text-amber-900"}`}>
      {online ? `Synchronisation de ${count} appel(s)…` : `Mode hors ligne${count ? ` — ${count} appel(s) en attente d'envoi` : ""}`}
    </div>
  );
}
