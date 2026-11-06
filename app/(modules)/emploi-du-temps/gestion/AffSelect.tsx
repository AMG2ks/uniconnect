"use client";
import { useState } from "react";
import { Field, inputCls } from "@/components/ActionForm";

export function AffSelect({ affs, x }: { affs: any[]; x?: any }) {
  const initial = affs.find((a) => a.matiere?._id === x?.matiere?._id && a.enseignant?._id === x?.enseignant?._id && a.groupe?._id === x?.groupe?._id)?._id ?? affs[0]?._id;
  const [id, setId] = useState<string>(initial);
  const a = affs.find((i) => i._id === id);
  return (
    <>
      <Field label="Affectation">
        <select value={id} onChange={(e) => setId(e.target.value)} className={inputCls}>
          {affs.map((i) => <option key={i._id} value={i._id}>{i.matiere?.code} · {i.enseignant?.nom} · {i.groupe?.nom}</option>)}
        </select>
      </Field>
      <input type="hidden" name="matiere" value={a?.matiere?._id ?? ""} />
      <input type="hidden" name="enseignant" value={a?.enseignant?._id ?? ""} />
      <input type="hidden" name="groupe" value={a?.groupe?._id ?? ""} />
    </>
  );
}
