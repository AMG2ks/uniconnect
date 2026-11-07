import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { Seance, User } from "@/models";
import { JOURS, plain } from "@/lib/utils";

export default async function PlanningPage({ searchParams }: { searchParams: Promise<{ groupe?: string }> }) {
  const s = (await getSession())!;
  await connectDB();
  let filter: any = {};
  if (s.role === "enseignant") filter = { enseignant: s.userId };
  else if (s.role === "etudiant") {
    const me: any = await User.findById(s.userId).lean();
    filter = { groupe: me?.groupe ?? null };
  } else {
    const { groupe } = await searchParams;
    if (groupe) filter = { groupe };
  }
  const seances: any[] = await Seance.find(filter).populate("matiere enseignant groupe salle").sort({ jour: 1, heureDebut: 1 }).lean().then(plain);
  const byDay = (j: number) => seances.filter((x) => x.jour === j);
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="page-title">Emploi du temps</h1>
        {s.role === "admin" && <Link href="/emploi-du-temps/gestion" className="btn-primary">Gérer</Link>}
      </div>
      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        {[1, 2, 3, 4, 5, 6].map((j) => (
          <section key={j} aria-label={JOURS[j]} className="card-sm">
            <h2 className="mb-2 flex items-center justify-between text-sm font-semibold text-brand-800">{JOURS[j]}{byDay(j).length > 0 && <span className="badge">{byDay(j).length}</span>}</h2>
            {byDay(j).length === 0 && <p className="text-xs text-slate-400">Aucune séance</p>}
            <ul className="grid gap-2">
              {byDay(j).map((x) => (
                <li key={x._id} className="rounded-xl border-l-4 border-brand-500 bg-brand-50/70 p-2.5 text-xs">
                  <p className="font-semibold">{x.heureDebut}–{x.heureFin}</p>
                  <p>{x.matiere?.nom}</p>
                  <p className="text-slate-600">{x.salle?.nom} · {x.groupe?.nom}</p>
                  {s.role !== "enseignant" && <p className="text-slate-600">{x.enseignant?.nom}</p>}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
