import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { Affectation, Matiere, Note, User } from "@/models";
import { plain } from "@/lib/utils";
import { buildReleve, mention, moyenneMatiere } from "@/lib/grades";
import { ActionForm, SubmitButton, inputCls } from "@/components/ActionForm";
import { saveNotes } from "./actions";

const fmt = (n: number | null | undefined) => (n === null || n === undefined ? "–" : n.toFixed(2));

export default async function NotesPage({ searchParams }: { searchParams: Promise<{ aff?: string }> }) {
  const s = (await getSession())!;
  await connectDB();
  if (s.role === "etudiant") return <Releve userId={s.userId} nom={s.nom} />;
  if (s.role === "admin") return <p>Les notes sont saisies par les enseignants.</p>;

  const { aff } = await searchParams;
  const affs: any[] = await Affectation.find({ enseignant: s.userId }).populate("matiere groupe").lean().then(plain);
  const cur = affs.find((a) => a._id === aff) ?? affs[0];
  const students: any[] = cur ? await User.find({ role: "etudiant", groupe: cur.groupe._id }).select("nom").sort({ nom: 1 }).lean().then(plain) : [];
  const notes: any[] = cur ? await Note.find({ matiere: cur.matiere._id, etudiant: { $in: students.map((e) => e._id) } }).lean().then(plain) : [];
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">Saisie des notes</h1>
      {affs.length === 0 && <p>Aucune matière ne vous est affectée.</p>}
      <div className="flex flex-wrap gap-2">
        {affs.map((a) => (
          <Link key={a._id} href={`/notes?aff=${a._id}`} className={`inline-flex min-h-11 items-center rounded-lg px-3 text-sm ${a._id === cur?._id ? "bg-teal-700 text-white" : "bg-white text-slate-700"}`}>{a.matiere.code} · {a.groupe.nom}</Link>
        ))}
      </div>
      {cur && (
        <ul className="grid gap-3">
          {students.map((e) => {
            const mine = notes.filter((n) => n.etudiant === e._id);
            const val = (t: string) => mine.find((n) => n.type === t)?.valeur;
            const moy = moyenneMatiere(mine);
            return (
              <li key={e._id} className="rounded-xl bg-white p-4 shadow-sm">
                <ActionForm action={saveNotes} className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  <input type="hidden" name="etudiant" value={e._id} />
                  <input type="hidden" name="matiere" value={cur.matiere._id} />
                  <input type="hidden" name="groupe" value={cur.groupe._id} />
                  <p className="col-span-3 font-semibold sm:col-span-5">{e.nom} <span className="text-sm font-normal text-slate-600">— moyenne {fmt(moy)}</span></p>
                  {[["ds", "DS"], ["tp", "TP"], ["examen", "Examen"]].map(([k, l]) => (
                    <label key={k} className="grid gap-1 text-xs font-medium">{l}
                      <input name={k} type="number" step="0.25" min="0" max="20" defaultValue={val(l === "Examen" ? "examen" : l)} className={inputCls} />
                    </label>
                  ))}
                  <div className="col-span-3 self-end sm:col-span-2"><SubmitButton>Enregistrer</SubmitButton></div>
                </ActionForm>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

async function Releve({ userId, nom }: { userId: string; nom: string }) {
  const me: any = await User.findById(userId).lean();
  const groupe: any = me?.groupe ? await (await import("@/models")).Groupe.findById(me.groupe).lean() : null;
  const mats: any[] = groupe ? await Matiere.find({ filiere: groupe.filiere }).sort({ semestre: 1, nom: 1 }).lean().then(plain) : [];
  const notes: any[] = await Note.find({ etudiant: userId }).lean().then(plain);
  const r = buildReleve(mats, notes);
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">Relevé de notes — {nom}</h1>
      <div className="rounded-xl bg-teal-700 p-4 text-white">
        <p className="text-sm">Moyenne générale</p>
        <p className="text-3xl font-bold">{fmt(r.generale)} / 20</p>
        {r.generale !== null && <p>{mention(r.generale)}</p>}
      </div>
      <div className="hidden overflow-x-auto rounded-xl bg-white shadow-sm md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100"><tr><th className="p-3">Matière</th><th>Coef</th><th>DS</th><th>TP</th><th>Examen</th><th>Moyenne</th><th>Résultat</th></tr></thead>
          <tbody>{r.matieres.map((m) => (
            <tr key={m._id} className="border-t"><td className="p-3">{m.nom}</td><td>{m.coefficient}</td><td>{fmt(m.notes.DS)}</td><td>{fmt(m.notes.TP)}</td><td>{fmt(m.notes.examen)}</td><td className="font-semibold">{fmt(m.moyenne)}</td><td>{m.moyenne === null ? "–" : m.validee ? "Validée" : "Non validée"}</td></tr>
          ))}</tbody>
        </table>
      </div>
      <ul className="grid gap-3 md:hidden">
        {r.matieres.map((m) => (
          <li key={m._id} className="rounded-xl bg-white p-4 shadow-sm">
            <p className="font-semibold">{m.nom} <span className="text-xs text-slate-600">coef {m.coefficient}</span></p>
            <p className="text-sm">DS {fmt(m.notes.DS)} · TP {fmt(m.notes.TP)} · Examen {fmt(m.notes.examen)}</p>
            <p className="text-sm font-semibold">Moyenne {fmt(m.moyenne)} — {m.moyenne === null ? "en attente" : m.validee ? "Validée" : "Non validée"}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
