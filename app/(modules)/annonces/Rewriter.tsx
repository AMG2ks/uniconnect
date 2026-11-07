"use client";
import { useRef, useState, useTransition } from "react";
import { rewriteAnnonce } from "../assistant/actions";
import { Field, inputCls } from "@/components/ActionForm";

export function Rewriter({ defaultValue }: { defaultValue?: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();
  return (
    <div className="grid gap-2">
      <Field label="Contenu"><textarea ref={ref} name="contenu" required rows={4} defaultValue={defaultValue} className={`${inputCls} py-2`} /></Field>
      <button type="button" disabled={pending} className="btn-ghost justify-self-start text-brand-800"
        onClick={() => start(async () => { const r = await rewriteAnnonce(ref.current?.value ?? ""); if (r.answer && ref.current) ref.current.value = r.answer; setErr(r.error ?? ""); })}>
        {pending ? "…" : "✨ Reformuler avec l'IA"}
      </button>
      {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
    </div>
  );
}
