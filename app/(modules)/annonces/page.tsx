import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { Annonce, Affectation, Groupe, User } from "@/models";
import { plain } from "@/lib/utils";
import { ActionForm, DeleteForm, Field, SubmitButton, inputCls } from "@/components/ActionForm";
import { Pager } from "@/components/Pager";
import { saveAnnonce, deleteAnnonce } from "./actions";
import { Rewriter } from "./Rewriter";

const PAGE = 10;

export default async function AnnoncesPage({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const s = (await getSession())!;
  const page = Math.max(1, Number((await searchParams).p) || 1);
  await connectDB();
  let filter: any = {};
  let groupes: any[] = [];
  if (s.role === "etudiant") {
    const me: any = await User.findById(s.userId).lean();
    filter = { $or: [{ portee: "generale" }, { groupe: me?.groupe ?? null }] };
  } else if (s.role === "enseignant") {
    const ids = await Affectation.distinct("groupe", { enseignant: s.userId });
    groupes = await Groupe.find({ _id: { $in: ids } }).lean().then(plain);
    filter = { $or: [{ portee: "generale" }, { auteur: s.userId }] };
  } else groupes = await Groupe.find().lean().then(plain);
  const [list, total]: [any[], number] = await Promise.all([
    Annonce.find(filter).populate("auteur groupe").sort({ date: -1 }).skip((page - 1) * PAGE).limit(PAGE).lean().then(plain),
    Annonce.countDocuments(filter),
  ]);
  const canWrite = s.role !== "etudiant";
  const form = (a?: any) => (
    <ActionForm action={saveAnnonce}>
      {a && <input type="hidden" name="id" value={a._id} />}
      <Field label="Titre"><input name="titre" defaultValue={a?.titre} required className={inputCls} /></Field>
      <Rewriter defaultValue={a?.contenu} />
      {s.role === "admin" && <Field label="Portée"><select name="portee" defaultValue={a?.portee ?? "generale"} className={inputCls}><option value="generale">Générale</option><option value="groupe">Un groupe</option></select></Field>}
      <Field label={s.role === "admin" ? "Groupe (si portée « groupe »)" : "Groupe"}>
        <select name="groupe" defaultValue={a?.groupe?._id ?? ""} className={inputCls}>
          {s.role === "admin" && <option value="">—</option>}
          {groupes.map((g) => <option key={g._id} value={g._id}>{g.nom}</option>)}
        </select>
      </Field>
      <SubmitButton>{a ? "Modifier" : "Publier"}</SubmitButton>
    </ActionForm>
  );
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">Annonces</h1>
      {canWrite && <section className="rounded-xl bg-white p-4 shadow-sm"><h2 className="mb-3 font-semibold">Nouvelle annonce</h2>{form()}</section>}
      {list.length === 0 && <p className="text-slate-600">Aucune annonce.</p>}
      {list.map((a) => {
        const mine = s.role === "admin" || a.auteur?._id === s.userId;
        return (
          <article key={a._id} className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="font-semibold">{a.titre}</h2>
            <p className="text-xs text-slate-600">{new Date(a.date).toLocaleDateString("fr-FR")} · {a.auteur?.nom} · {a.portee === "generale" ? "Générale" : a.groupe?.nom}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm">{a.contenu}</p>
            {canWrite && mine && (
              <details className="mt-2">
                <summary className="min-h-11 cursor-pointer content-center text-sm text-teal-700">Modifier / supprimer</summary>
                {form(a)}
                <div className="mt-2"><DeleteForm action={deleteAnnonce} id={a._id} /></div>
              </details>
            )}
          </article>
        );
      })}
      <Pager page={page} total={total} per={PAGE} base="/annonces" />
    </div>
  );
}
