import { connectDB } from "@/lib/mongodb";
import { Matiere, Affectation, Filiere, User, Groupe } from "@/models";
import { plain } from "@/lib/utils";
import { ActionForm, DeleteForm, Field, SubmitButton, inputCls } from "@/components/ActionForm";
import { saveMatiere, deleteMatiere, saveAffectation, deleteAffectation } from "./actions";

const card = "card";
const ANNEE = "2026-2027";

export default async function MatieresPage() {
  await connectDB();
  const [mats, affs, fils, profs, grps] = await Promise.all([
    Matiere.find().populate("filiere").sort({ semestre: 1, nom: 1 }).lean().then(plain),
    Affectation.find().populate("matiere enseignant groupe").lean().then(plain),
    Filiere.find().sort({ nom: 1 }).lean().then(plain),
    User.find({ role: "enseignant" }).select("nom").sort({ nom: 1 }).lean().then(plain),
    Groupe.find().sort({ nom: 1 }).lean().then(plain),
  ]);
  const sel = (name: string, items: any[], label: (x: any) => string, def?: string) => (
    <select name={name} defaultValue={def} required className={inputCls}>{items.map((i) => <option key={i._id} value={i._id}>{label(i)}</option>)}</select>
  );
  const matForm = (m?: any) => (
    <ActionForm action={saveMatiere} className="grid gap-3 sm:grid-cols-3">
      {m && <input type="hidden" name="id" value={m._id} />}
      <Field label="Nom"><input name="nom" defaultValue={m?.nom} required className={inputCls} /></Field>
      <Field label="Code"><input name="code" defaultValue={m?.code} required className={inputCls} /></Field>
      <Field label="Filière">{sel("filiere", fils, (f) => `${f.nom} (${f.niveau})`, m?.filiere?._id)}</Field>
      <Field label="Coefficient"><input name="coefficient" type="number" step="0.5" min="0.5" defaultValue={m?.coefficient ?? 1} required className={inputCls} /></Field>
      <Field label="Crédits"><input name="credits" type="number" min="0" defaultValue={m?.credits ?? 3} required className={inputCls} /></Field>
      <Field label="Semestre"><select name="semestre" defaultValue={m?.semestre ?? 1} className={inputCls}><option value="1">S1</option><option value="2">S2</option></select></Field>
      <div className="sm:col-span-3"><SubmitButton>{m ? "Modifier" : "Ajouter"}</SubmitButton></div>
    </ActionForm>
  );
  const affForm = (a?: any) => (
    <ActionForm action={saveAffectation} className="grid gap-3 sm:grid-cols-4">
      {a && <input type="hidden" name="id" value={a._id} />}
      <Field label="Matière">{sel("matiere", mats, (m) => m.code, a?.matiere?._id)}</Field>
      <Field label="Enseignant">{sel("enseignant", profs, (p) => p.nom, a?.enseignant?._id)}</Field>
      <Field label="Groupe">{sel("groupe", grps, (g) => g.nom, a?.groupe?._id)}</Field>
      <Field label="Année"><input name="anneeUniversitaire" defaultValue={a?.anneeUniversitaire ?? ANNEE} required className={inputCls} /></Field>
      <div className="sm:col-span-4"><SubmitButton>{a ? "Modifier" : "Affecter"}</SubmitButton></div>
    </ActionForm>
  );
  return (
    <div className="grid gap-8">
      <h1 className="page-title">Matières et affectations</h1>
      <section className="grid gap-3">
        <h2 className="section-title">Matières (UE)</h2>
        <div className={card}>{matForm()}</div>
        {mats.map((m: any) => (
          <details key={m._id} className={card}>
            <summary className="min-h-11 cursor-pointer content-center"><strong>{m.code}</strong> — {m.nom} · coef {m.coefficient} · {m.credits} crédits · S{m.semestre}</summary>
            <div className="mt-3">{matForm(m)}</div>
            <div className="mt-2"><DeleteForm action={deleteMatiere} id={m._id} /></div>
          </details>
        ))}
      </section>
      <section className="grid gap-3">
        <h2 className="section-title">Affectations enseignant ↔ matière ↔ groupe</h2>
        <div className={card}>{mats.length && profs.length && grps.length ? affForm() : <p className="text-sm">Créez d'abord matières, enseignants et groupes.</p>}</div>
        {affs.map((a: any) => (
          <details key={a._id} className={card}>
            <summary className="min-h-11 cursor-pointer content-center">{a.matiere?.code} · {a.enseignant?.nom} · {a.groupe?.nom} · {a.anneeUniversitaire}</summary>
            <div className="mt-3">{affForm(a)}</div>
            <div className="mt-2"><DeleteForm action={deleteAffectation} id={a._id} /></div>
          </details>
        ))}
      </section>
    </div>
  );
}
