import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { Absence, Justificatif, Seance, User } from "@/models";
import { JOURS, plain } from "@/lib/utils";
import { tauxAbsences, SEUIL_ABSENCE } from "@/lib/absences";
import { AbsenceEntry } from "@/components/AbsenceEntry";
import { ActionForm, DeleteForm, Field, SubmitButton, inputCls } from "@/components/ActionForm";
import { decideJustificatif, deleteAbsence, deleteJustificatif, submitJustificatif } from "./actions";

const card = "rounded-xl bg-white p-4 shadow-sm";
const fr = (d: string) => new Date(d).toLocaleDateString("fr-FR");

export default async function AbsencesPage({ searchParams }: { searchParams: Promise<{ seance?: string; date?: string }> }) {
  const s = (await getSession())!;
  await connectDB();
  if (s.role === "etudiant") return <Etudiant userId={s.userId} />;
  if (s.role === "admin") return <p>Les absences sont saisies par les enseignants.</p>;

  const { seance, date } = await searchParams;
  const seances: any[] = await Seance.find({ enseignant: s.userId }).populate("matiere groupe").sort({ jour: 1, heureDebut: 1 }).lean().then(plain);
  const cur = seances.find((x) => x._id === seance);
  const day = date ?? new Date().toISOString().slice(0, 10);
  const students: any[] = cur ? await User.find({ role: "etudiant", groupe: cur.groupe._id }).select("nom").sort({ nom: 1 }).lean().then(plain) : [];
  const existing: any[] = cur ? await Absence.find({ seance: cur._id, date: new Date(day) }).lean().then(plain) : [];
  const mySeanceIds = seances.map((x) => x._id);
  const justifs: any[] = await Justificatif.find({ decision: "en_attente" }).populate({ path: "absence", populate: [{ path: "etudiant", select: "nom" }, { path: "seance", populate: { path: "matiere" } }] }).lean().then(plain);
  const aTraiter = justifs.filter((j) => mySeanceIds.includes(j.absence?.seance?._id));
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold">Absences</h1>
      <section className="grid gap-3">
        <h2 className="text-lg font-semibold">Faire l'appel</h2>
        <form className="grid gap-3 sm:grid-cols-3">
          <Field label="Séance">
            <select name="seance" defaultValue={cur?._id} className={inputCls}>
              <option value="">— choisir —</option>
              {seances.map((x) => <option key={x._id} value={x._id}>{JOURS[x.jour]} {x.heureDebut} · {x.matiere.code} · {x.groupe.nom}</option>)}
            </select>
          </Field>
          <Field label="Date"><input type="date" name="date" defaultValue={day} className={inputCls} /></Field>
          <div className="self-end"><SubmitButton>Afficher</SubmitButton></div>
        </form>
        {cur && <AbsenceEntry key={cur._id + day} seance={cur._id} date={day} students={students.map((e) => ({ _id: e._id, nom: e.nom, absent: existing.some((a) => a.etudiant === e._id) }))} />}
      </section>
      <section className="grid gap-3">
        <h2 className="text-lg font-semibold">Justificatifs à traiter ({aTraiter.length})</h2>
        {aTraiter.length === 0 && <p className="text-sm text-slate-600">Aucun justificatif en attente.</p>}
        {aTraiter.map((j) => (
          <div key={j._id} className={card}>
            <p className="font-semibold">{j.absence.etudiant?.nom} — {j.absence.seance?.matiere?.nom} le {fr(j.absence.date)}</p>
            <p className="text-sm">{j.motif}</p>
            {j.pieceJointe && <a className="text-sm text-teal-700 underline" href={j.pieceJointe} target="_blank" rel="noreferrer">Pièce jointe</a>}
            <div className="mt-2 flex gap-2">
              {(["accepte", "refuse"] as const).map((d) => (
                <ActionForm key={d} action={decideJustificatif} className="inline-grid">
                  <input type="hidden" name="id" value={j._id} /><input type="hidden" name="decision" value={d} />
                  <SubmitButton danger={d === "refuse"}>{d === "accepte" ? "Accepter" : "Refuser"}</SubmitButton>
                </ActionForm>
              ))}
            </div>
          </div>
        ))}
      </section>
      {cur && existing.length > 0 && (
        <section className="grid gap-2">
          <h2 className="text-lg font-semibold">Absences enregistrées ce jour</h2>
          {existing.map((a) => (
            <div key={a._id} className={`${card} flex items-center justify-between`}>
              <span>{students.find((e) => e._id === a.etudiant)?.nom} {a.justifiee && "(justifiée)"}</span>
              <DeleteForm action={deleteAbsence} id={a._id} />
            </div>
          ))}
        </section>
      )}
      <p className="text-xs text-slate-500">Astuce : l'appel fonctionne sans réseau, <Link href="/offline" className="underline">voir le mode hors ligne</Link>.</p>
    </div>
  );
}

async function Etudiant({ userId }: { userId: string }) {
  const [taux, absences] = await Promise.all([
    tauxAbsences(userId),
    Absence.find({ etudiant: userId }).populate({ path: "seance", populate: { path: "matiere" } }).sort({ date: -1 }).lean().then(plain) as Promise<any[]>,
  ]);
  const justifs: any[] = await Justificatif.find({ absence: { $in: absences.map((a) => a._id) } }).lean().then(plain);
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold">Mes absences</h1>
      <section className="grid gap-2" aria-label="Taux d'absence">
        {taux.map((t) => (
          <div key={t.nom} className={`${card} ${t.alerte ? "border-l-4 border-red-600" : ""}`}>
            <p className="font-semibold">{t.nom}: {(t.taux * 100).toFixed(0)} % <span className="text-xs font-normal text-slate-600">({t.absences} absence(s) non justifiée(s))</span></p>
            {t.alerte && <p role="alert" className="text-sm font-semibold text-red-700">⚠️ Seuil de {SEUIL_ABSENCE * 100} % dépassé : risque d'exclusion.</p>}
          </div>
        ))}
      </section>
      <section className="grid gap-3">
        <h2 className="text-lg font-semibold">Historique</h2>
        {absences.length === 0 && <p className="text-sm text-slate-600">Aucune absence 🎉</p>}
        {absences.map((a) => {
          const j = justifs.find((x) => x.absence === a._id);
          return (
            <div key={a._id} className={card}>
              <p className="font-semibold">{a.seance?.matiere?.nom} — {fr(a.date)} {a.justifiee ? "✅ justifiée" : ""}</p>
              {j && <p className="text-sm">Justificatif : {j.motif} — <strong>{j.decision.replace("_", " ")}</strong></p>}
              {!a.justifiee && (!j || j.decision !== "accepte") && (
                <details className="mt-2">
                  <summary className="min-h-11 cursor-pointer content-center text-sm text-teal-700">{j ? "Modifier le justificatif" : "Soumettre un justificatif"}</summary>
                  <ActionForm action={submitJustificatif}>
                    <input type="hidden" name="absence" value={a._id} />
                    <Field label="Motif"><textarea name="motif" required minLength={5} defaultValue={j?.motif} className={`${inputCls} py-2`} /></Field>
                    <Field label="Lien de la pièce jointe (optionnel)"><input name="pieceJointe" type="url" defaultValue={j?.pieceJointe} className={inputCls} /></Field>
                    <SubmitButton>Envoyer</SubmitButton>
                  </ActionForm>
                  {j?.decision === "en_attente" && <div className="mt-2"><DeleteForm action={deleteJustificatif} id={j._id} label="Retirer le justificatif" /></div>}
                </details>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
