"use client";
import { useState, useTransition } from "react";
import { askAssistant, summarizeReleve } from "./actions";
import { inputCls } from "@/components/ActionForm";

type Msg = { from: "me" | "bot"; text: string };

export function Chat() {
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "bot", text: "Bonjour ! Demandez-moi votre prochaine séance, vos absences ou vos notes." }]);
  const [q, setQ] = useState("");
  const [pending, start] = useTransition();
  const push = (m: Msg) => setMsgs((x) => [...x, m]);

  function send(e: React.FormEvent) {
    e.preventDefault();
    const text = q.trim();
    if (!text) return;
    setQ(""); push({ from: "me", text });
    start(async () => { const r = await askAssistant(text); push({ from: "bot", text: r.error ?? r.answer ?? "…" }); });
  }
  function resume() {
    push({ from: "me", text: "Résume mon relevé" });
    start(async () => { const r = await summarizeReleve(); push({ from: "bot", text: r.error ?? r.answer ?? "…" }); });
  }
  return (
    <div className="grid gap-3">
      <ul className="grid gap-2" aria-live="polite">
        {msgs.map((m, i) => (
          <li key={i} className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${m.from === "me" ? "ml-auto rounded-br-md bg-brand-700 text-white" : "rounded-bl-md border border-slate-200/70 bg-white shadow-sm"}`}>{m.text}</li>
        ))}
        {pending && <li className="text-sm text-slate-500">…</li>}
      </ul>
      <form onSubmit={send} className="flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Quelle est ma prochaine séance ?" aria-label="Votre question" className={inputCls} />
        <button className="btn-primary">Envoyer</button>
      </form>
      <button onClick={resume} className="btn-ghost text-brand-800">Résumer mon relevé</button>
    </div>
  );
}
