import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { Annonce, Seance, User, Justificatif } from "@/models";
import { JOURS, plain } from "@/lib/utils";
import { tauxAbsences } from "@/lib/absences";
import { Icon } from "@/components/Icons";

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
  const hour = new Date().getHours();
  const salut = hour < 18 ? "Bonjour" : "Bonsoir";
  return (
    <div className="grid gap-5">
      <section className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-900 p-5 text-white shadow-md">
        <p className="text-sm text-brand-100">{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{salut} {s.nom.split(" ")[0]}</h1>
        <p className="mt-1 text-sm text-brand-100">
          {s.role === "admin" ? `${nbUsers} comptes sur la plateforme` : seances.length ? `${seances.length} séance(s) aujourd'hui` : "Aucune séance aujourd'hui"}
        </p>
      </section>

      {alertes.map((a) => (
        <div key={a.nom} role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <Icon name="alert" className="mt-0.5 size-5 shrink-0 text-red-600" />
          <p><b>Taux d'absence en {a.nom} : {(a.taux * 100).toFixed(0)} %</b><br />Le seuil de 25 % est dépassé.</p>
        </div>
      ))}
      {s.role === "enseignant" && nbJustifs > 0 && (
        <Link href="/absences" className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 transition hover:bg-amber-100">
          <Icon name="inbox" className="size-5 text-amber-700" /><span><b>{nbJustifs} justificatif(s)</b> en attente de décision</span>
        </Link>
      )}
      {s.role === "admin" && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[["/utilisateurs", "users", "Comptes"], ["/structure", "building", "Structure"], ["/matieres", "book", "Matières"], ["/emploi-du-temps/gestion", "calendar", "Planning"]].map(([href, icon, label]) => (
            <Link key={href} href={href} className="card flex flex-col items-center gap-2 py-5 text-sm font-medium transition hover:-translate-y-0.5 hover:shadow-md">
              <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-700"><Icon name={icon} /></span>{label}
            </Link>
          ))}
        </div>
      )}

      <section aria-label="Aujourd'hui" className="grid gap-3">
        <h2 className="section-title">Aujourd'hui{jour <= 6 && <span className="font-normal text-muted"> · {JOURS[jour]}</span>}</h2>
        {seances.length === 0 && (
          <div className="card flex items-center gap-3 text-sm text-muted"><Icon name="calendar" className="size-5 text-slate-400" />Rien de prévu aujourd'hui, profitez-en !</div>
        )}
        <ul className="grid gap-2">
          {seances.map((x) => (
            <li key={x._id} className="card flex items-center gap-4 !p-3.5">
              <div className="grid w-16 shrink-0 place-items-center rounded-xl bg-brand-50 py-2 text-brand-800">
                <span className="text-sm font-semibold leading-none">{x.heureDebut}</span>
                <span className="mt-1 text-[11px] leading-none text-brand-600">{x.heureFin}</span>
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium">{x.matiere?.nom}</p>
                <p className="flex items-center gap-1 text-sm text-muted"><Icon name="pin" className="size-3.5" />{x.salle?.nom} · {x.groupe?.nom}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Annonces récentes" className="grid gap-3">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Dernières annonces</h2>
          <Link href="/annonces" className="text-sm font-medium text-brand-700 hover:underline">Tout voir</Link>
        </div>
        {annonces.length === 0 && <div className="card text-sm text-muted">Aucune annonce pour le moment.</div>}
        <ul className="grid gap-2">
          {annonces.map((a) => (
            <li key={a._id} className="card !p-3.5">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium">{a.titre}</p>
                <span className="badge shrink-0">{a.portee === "generale" ? "Générale" : "Groupe"}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-muted">{a.contenu}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
