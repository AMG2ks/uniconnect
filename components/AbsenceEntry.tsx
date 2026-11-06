"use client";
import { useState } from "react";
import { markAbsences, type AbsencePayload } from "@/app/(modules)/absences/actions";
import { enqueueAbsence } from "@/lib/offline-queue";

type Student = { _id: string; nom: string; absent: boolean };

export function AbsenceEntry({ seance, date, students }: { seance: string; date: string; students: Student[] }) {
  const [absents, setAbsents] = useState<string[]>(students.filter((s) => s.absent).map((s) => s._id));
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const toggle = (id: string) => setAbsents((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));

  async function save() {
    setBusy(true);
    const payload: AbsencePayload = { seance, date, absents, tous: students.map((s) => s._id), clientId: crypto.randomUUID() };
    try {
      if (!navigator.onLine) throw new Error("offline");
      const r = await markAbsences(payload);
      setMsg(r?.error ? `⚠️ ${r.error}` : "Enregistré ✔");
    } catch {
      await enqueueAbsence(payload);
      setMsg("📴 Hors ligne : enregistré sur l'appareil, synchronisation automatique au retour du réseau.");
    }
    setBusy(false);
  }

  return (
    <div className="grid gap-3">
      <ul className="grid gap-2">
        {students.map((s) => (
          <li key={s._id}>
            <label className="flex min-h-11 items-center gap-3 rounded-lg bg-white px-3 shadow-sm">
              <input type="checkbox" className="size-5 accent-teal-700" checked={absents.includes(s._id)} onChange={() => toggle(s._id)} />
              <span>{s.nom}</span>
              {absents.includes(s._id) && <span className="ml-auto text-xs font-semibold text-red-700">Absent</span>}
            </label>
          </li>
        ))}
      </ul>
      <button onClick={save} disabled={busy} className="min-h-11 rounded-lg bg-teal-700 px-4 text-sm font-medium text-white disabled:opacity-60">{busy ? "…" : "Enregistrer l'appel"}</button>
      {msg && <p role="status" className="text-sm">{msg}</p>}
    </div>
  );
}
