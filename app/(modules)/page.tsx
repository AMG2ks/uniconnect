import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { Annonce, Seance, User, Justificatif } from "@/models";
import { JOURS, plain } from "@/lib/utils";
import { tauxAbsences } from "@/lib/absences";

export default async function Home() {
  const s = (await getSession())!;
  await connectDB();
  const me: any = await User.findById(s.userId).lean();
  const annonceFilter = s.role === "etudiant" ? { $or: [{ portee: "generale" }, { groupe: me?.groupe ?? null }] } : {};
  const jour = ((new Date().getDay() + 6) % 7) + 1;
  const seanceFilter = s.role === "enseignant" ? { enseignant: s.userId } : s.role === "etudiant" ? { groupe: me?.groupe ?? null } : {};
  const [annonces, seances, taux, nbUsers, nbJustifs]: [any[], any[], any[], number, number] = await Promise.all([
    Annonce.find(annonceFilter).populate("auteur").sort({ date: -1 }).limit(3).lean().then(plain),
    jour <= 6 ? Seance.find({ ...seanceFilter, jour }).populate("matiere salle groupe").sort({ heureDebut: 1 }).lean().then(plain) : Promise.resolve([]),
    s.role === "etudiant" ? tauxAbsences(s.userId) : Promise.resolve([]),
    s.role === "admin" ? User.countDocuments() : Promise.resolve(0),
    s.role === "enseignant" ? Justificatif.countDocuments({ decision: "en_attente" }) : Promise.resolve(0),
  ]);
  const alertes = taux.filter((t) => t.alerte);
  return (
    <div className="grid gap-5">
      <h1 className="text-2xl font-bold">Bonjour {s.nom.split(" ")[0]} 👋</h1>
      {alertes.map((a) => (
        <p key={a.nom} role="alert" className="rounded-xl border-l-4 border-red-600 bg-red-50 p-3 text-sm text-red-900">⚠️ Taux d'absence en {a.nom} : {(a.taux * 100).toFixed(0)} % (seuil dépassé)</p>
      ))}
      {s.role === "admin" && <p className="rounded-xl bg-white p-4 shadow-sm"><strong>{nbUsers}</strong> comptes · <Link className="text-teal-700 underline" href="/utilisateurs">gérer</Link></p>}
      {s.role === "enseignant" && nbJustifs > 0 && <Link href="/absences" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">📎 {nbJustifs} justificatif(s) en attente</Link>}
      <section aria-label="Aujourd'hui">
        <h2 className="mb-2 font-semibold">Aujourd'hui {jour <= 6 && `(${JOURS[jour]})`}</h2>
        {seances.length === 0 && <p className="text-sm text-slate-600">Aucune séance aujourd'hui.</p>}
        <ul className="grid gap-2">
          {seances.map((x) => (
            <li key={x._id} className="rounded-xl border-l-4 border-teal-600 bg-white p-3 shadow-sm">
              <strong>{x.heureDebut}–{x.heureFin}</strong> · {x.matiere?.nom} · {x.salle?.nom} · {x.groupe?.nom}
            </li>
          ))}
        </ul>
      </section>
      <section aria-label="Annonces récentes">
        <h2 className="mb-2 font-semibold">Dernières annonces</h2>
        {annonces.length === 0 && <p className="text-sm text-slate-600">Aucune annonce.</p>}
        <ul className="grid gap-2">
          {annonces.map((a) => (
            <li key={a._id} className="rounded-xl bg-white p-3 shadow-sm"><strong>{a.titre}</strong><p className="line-clamp-2 text-sm">{a.contenu}</p></li>
          ))}
        </ul>
        <Link href="/annonces" className="mt-2 inline-flex min-h-11 items-center text-sm text-teal-700 underline">Toutes les annonces</Link>
      </section>
      <Link href="/profil" className="inline-flex min-h-11 items-center text-sm text-teal-700 underline">Mon profil</Link>
    </div>
  );
}
