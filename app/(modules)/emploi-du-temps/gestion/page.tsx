import { connectDB } from "@/lib/mongodb";
import { Seance, Salle, Affectation } from "@/models";
import { JOURS, plain } from "@/lib/utils";
import { ActionForm, DeleteForm, Field, SubmitButton, inputCls } from "@/components/ActionForm";
import { AffSelect } from "./AffSelect";
import { saveSeance, deleteSeance, saveSalle, deleteSalle } from "../actions";

const card = "card";

export default async function GestionPlanning() {
  await connectDB();
  const [seances, salles, affs] = await Promise.all([
    Seance.find().populate("matiere enseignant groupe salle").sort({ jour: 1, heureDebut: 1 }).lean().then(plain),
    Salle.find().sort({ nom: 1 }).lean().then(plain),
    Affectation.find().populate("matiere enseignant groupe").lean().then(plain),
  ]);
  const seanceForm = (x?: any) => (
    <ActionForm action={saveSeance} className="grid gap-3 sm:grid-cols-3">
      {x && <input type="hidden" name="id" value={x._id} />}
      <AffSelect affs={affs} x={x} />
      <Field label="Jour"><select name="jour" defaultValue={x?.jour ?? 1} className={inputCls}>{[1, 2, 3, 4, 5, 6].map((j) => <option key={j} value={j}>{JOURS[j]}</option>)}</select></Field>
      <Field label="Début"><input type="time" name="heureDebut" defaultValue={x?.heureDebut ?? "08:30"} required className={inputCls} /></Field>
      <Field label="Fin"><input type="time" name="heureFin" defaultValue={x?.heureFin ?? "10:00"} required className={inputCls} /></Field>
      <Field label="Salle"><select name="salle" defaultValue={x?.salle?._id} required className={inputCls}>{salles.map((s: any) => <option key={s._id} value={s._id}>{s.nom} ({s.capacite})</option>)}</select></Field>
      <div className="sm:col-span-3"><SubmitButton>{x ? "Modifier" : "Planifier"}</SubmitButton></div>
    </ActionForm>
  );
  return (
    <div className="grid gap-8">
      <h1 className="page-title">Gestion de l'emploi du temps</h1>
      <section className="grid gap-3">
        <h2 className="section-title">Salles</h2>
        <div className={card}>
          <ActionForm action={saveSalle} className="grid gap-3 sm:grid-cols-3">
            <Field label="Nom"><input name="nom" required className={inputCls} /></Field>
            <Field label="Capacité"><input name="capacite" type="number" min="1" required className={inputCls} /></Field>
            <div className="self-end"><SubmitButton>Ajouter</SubmitButton></div>
          </ActionForm>
        </div>
        {salles.map((s: any) => (
          <details key={s._id} className={card}>
            <summary className="min-h-11 cursor-pointer content-center">{s.nom} — {s.capacite} places</summary>
            <ActionForm action={saveSalle} className="mt-3 grid gap-3 sm:grid-cols-3">
              <input type="hidden" name="id" value={s._id} />
              <Field label="Nom"><input name="nom" defaultValue={s.nom} required className={inputCls} /></Field>
              <Field label="Capacité"><input name="capacite" type="number" min="1" defaultValue={s.capacite} required className={inputCls} /></Field>
              <div className="self-end"><SubmitButton>Modifier</SubmitButton></div>
            </ActionForm>
            <div className="mt-2"><DeleteForm action={deleteSalle} id={s._id} /></div>
          </details>
        ))}
      </section>
      <section className="grid gap-3">
        <h2 className="section-title">Séances</h2>
        <div className={card}>{salles.length && affs.length ? seanceForm() : <p className="text-sm">Créez d'abord une salle et une affectation.</p>}</div>
        {seances.map((x: any) => (
          <details key={x._id} className={card}>
            <summary className="min-h-11 cursor-pointer content-center">{JOURS[x.jour]} {x.heureDebut}–{x.heureFin} · {x.matiere?.code} · {x.groupe?.nom} · {x.salle?.nom}</summary>
            <div className="mt-3">{seanceForm(x)}</div>
            <div className="mt-2"><DeleteForm action={deleteSeance} id={x._id} /></div>
          </details>
        ))}
      </section>
    </div>
  );
}
