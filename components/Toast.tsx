"use client";
import { useEffect, useState } from "react";

export function Toast() {
  const [t, setT] = useState<{ ok: boolean; text: string } | null>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const on = (e: Event) => {
      setT((e as CustomEvent).detail);
      clearTimeout(timer);
      timer = setTimeout(() => setT(null), 3500);
    };
    window.addEventListener("uc-toast", on);
    return () => { window.removeEventListener("uc-toast", on); clearTimeout(timer); };
  }, []);
  if (!t) return null;
  return (
    <div role="status" aria-live="polite" className={`fixed inset-x-4 bottom-24 z-30 mx-auto flex max-w-sm items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-white shadow-xl md:bottom-6 ${t.ok ? "bg-brand-800" : "bg-red-700"}`}>
      <span aria-hidden="true">{t.ok ? "✓" : "!"}</span>{t.text}
    </div>
  );
}
