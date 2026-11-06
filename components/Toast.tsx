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
    <div role="status" aria-live="polite" className={`fixed inset-x-4 bottom-20 z-30 mx-auto max-w-sm rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg md:bottom-6 ${t.ok ? "bg-teal-700" : "bg-red-700"}`}>
      {t.text}
    </div>
  );
}
