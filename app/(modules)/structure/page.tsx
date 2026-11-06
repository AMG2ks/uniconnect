import { connectDB } from "@/lib/mongodb";
import { Departement, Filiere, Groupe, User } from "@/models";
import { plain } from "@/lib/utils";
import { ActionForm, DeleteForm, Field, SubmitButton, inputCls } from "@/components/ActionForm";
import { saveDepartement, deleteDepartement, saveFiliere, deleteFiliere, saveGroupe, deleteGroupe, assignStudent } from "./actions";

const card = "rounded-xl bg-white p-4 shadow-sm";

export default async function StructurePage() {
  await connectDB();
  const [deps, fils, grps, etus, counts] = await Promise.all([
    Departement.find().sort({ nom: 1 }).lean().then(plain),
    Filiere.find().populate("departement").sort({ nom: 1 }).lean().then(plain),
    Groupe.find().populate({ path: "filiere", populate: { path: "departement" } }).sort({ nom: 1 }).lean().then(plain),
    User.find({ role: "etudiant" }).select("nom groupe").sort({ nom: 1 }).lean().then(plain),
    User.aggregate([{ $match: { role: "etudiant", groupe: { $ne: null } } }, { $group: { _id: "$groupe", n: { $sum: 1 } } }]),
  ]);
  const count = Object.fromEntries(counts.map((c: any) => [String(c._id), c.n]));
  const depSel = (def?: string) => (
    <select name="departement" defaultValue={def} required className={inputCls}>{deps.map((d: any) => <option key={d._id} value={d._id}>{d.nom}</option>)}</select>
  );
  const filSel = (def?: string) => (
    <select name="filiere" defaultValue={def} required className={inputCls}>{fils.map((f: any) => <option key={f._id} value={f._id}>{f.nom} ({f.niveau})</option>)}</select>
  );
  return (
    <div className="grid gap-8">
      <h1 className="text-2xl font-bold">Structure académique</h1>

      <section className="grid gap-3">
        <h2 className="text-lg font-semibold">Départements</h2>
        <div className={card}>
          <ActionForm action={saveDepartement} className="grid gap-3 sm:grid-cols-3">
            <Field label="Nom"><input name="nom" required className={inputCls} /></Field>
            <Field label="Code"><input name="code" required className={inputCls} /></Field>
            <div className="self-end"><SubmitButton>Ajouter</SubmitButton></div>
          </ActionForm>
        </div>
        {deps.map((d: any) => (
          <details key={d._id} className={card}>
            <summary className="min-h-11 cursor-pointer content-center"><strong>{d.code}</strong> — {d.nom}</summary>
            <ActionForm action={saveDepartement} className="mt-3 grid gap-3 sm:grid-cols-3">
              <input type="hidden" name="id" value={d._id} />
              <Field label="Nom"><input name="nom" defaultValue={d.nom} required className={inputCls} /></Field>
              <Field label="Code"><input name="code" defaultValue={d.code} required className={inputCls} /></Field>
              <div className="self-end"><SubmitButton>Modifier</SubmitButton></div>
            </ActionForm>
            <div className="mt-2"><DeleteForm action={deleteDepartement} id={d._id} /></div>
          </details>
        ))}
      </section>

      <section className="grid gap-3">
        <h2 className="text-lg font-semibold">Filières et niveaux</h2>
        <div className={card}>
          <ActionForm action={saveFiliere} className="grid gap-3 sm:grid-cols-4">
            <Field label="Nom"><input name="nom" required className={inputCls} /></Field>
            <Field label="Niveau"><input name="niveau" placeholder="L1, L2, M1…" required className={inputCls} /></Field>
            <Field label="Département">{depSel()}</Field>
            <div className="self-end"><SubmitButton>Ajouter</SubmitButton></div>
          </ActionForm>
        </div>
        {fils.map((f: any) => (
          <details key={f._id} className={card}>
            <summary className="min-h-11 cursor-pointer content-center"><strong>{f.nom}</strong> — {f.niveau} · {f.departement?.code}</summary>
            <ActionForm action={saveFiliere} className="mt-3 grid gap-3 sm:grid-cols-4">
              <input type="hidden" name="id" value={f._id} />
              <Field label="Nom"><input name="nom" defaultValue={f.nom} required className={inputCls} /></Field>
              <Field label="Niveau"><input name="niveau" defaultValue={f.niveau} required className={inputCls} /></Field>
              <Field label="Département">{depSel(f.departement?._id)}</Field>
              <div className="self-end"><SubmitButton>Modifier</SubmitButton></div>
            </ActionForm>
            <div className="mt-2"><DeleteForm action={deleteFiliere} id={f._id} /></div>
          </details>
        ))}
      </section>

      <section className="grid gap-3">
        <h2 className="text-lg font-semibold">Groupes</h2>
        <div className={card}>
          <ActionForm action={saveGroupe} className="grid gap-3 sm:grid-cols-3">
            <Field label="Nom"><input name="nom" required className={inputCls} /></Field>
            <Field label="Filière">{filSel()}</Field>
            <div className="self-end"><SubmitButton>Ajouter</SubmitButton></div>
          </ActionForm>
        </div>
        <div className={card}>
          <h3 className="mb-2 text-sm font-semibold">Affecter un étudiant à un groupe</h3>
          <ActionForm action={assignStudent} className="grid gap-3 sm:grid-cols-3">
            <Field label="Étudiant"><select name="etudiant" required className={inputCls}>{etus.map((e: any) => <option key={e._id} value={e._id}>{e.nom}</option>)}</select></Field>
            <Field label="Groupe"><select name="groupe" required className={inputCls}>{grps.map((g: any) => <option key={g._id} value={g._id}>{g.nom}</option>)}</select></Field>
            <div className="self-end"><SubmitButton>Affecter</SubmitButton></div>
          </ActionForm>
        </div>
        {grps.map((g: any) => (
          <details key={g._id} className={card}>
            <summary className="min-h-11 cursor-pointer content-center"><strong>{g.nom}</strong> — {g.filiere?.nom} ({g.filiere?.niveau}) · {count[g._id] ?? 0} étudiant(s)</summary>
            <ActionForm action={saveGroupe} className="mt-3 grid gap-3 sm:grid-cols-3">
              <input type="hidden" name="id" value={g._id} />
              <Field label="Nom"><input name="nom" defaultValue={g.nom} required className={inputCls} /></Field>
              <Field label="Filière">{filSel(g.filiere?._id)}</Field>
              <div className="self-end"><SubmitButton>Modifier</SubmitButton></div>
            </ActionForm>
            <div className="mt-2"><DeleteForm action={deleteGroupe} id={g._id} /></div>
          </details>
        ))}
      </section>
    </div>
  );
}
