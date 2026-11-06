import { getSession } from "@/lib/session";
import { aiConfigured } from "@/lib/ai";
import { Chat } from "./Chat";
import { etudiantsARisque } from "./actions";

export default async function AssistantPage() {
  const s = (await getSession())!;
  const risque = s.role === "enseignant" ? await etudiantsARisque() : [];
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">{s.role === "etudiant" ? "Assistant UniConnect" : "Étudiants à risque"}</h1>
      {!aiConfigured() && <p className="rounded-lg bg-amber-50 p-2 text-xs text-amber-900">Mode démo : aucune clé d'IA configurée, réponses générées par règles.</p>}
      {s.role === "etudiant" && <Chat />}
      {s.role === "enseignant" && (
        <>
          <p className="text-sm text-slate-600">Étudiants dont les absences augmentent (14 derniers jours) et dont la dernière note baisse d'au moins 2 points.</p>
          {risque.length === 0 && <p>Aucun étudiant à risque détecté ✅</p>}
          <ul className="grid gap-2">
            {risque.map((r) => (
              <li key={r.nom} className="rounded-xl border-l-4 border-red-600 bg-white p-3 shadow-sm">
                <strong>{r.nom}</strong> — absences : {r.absRecentes} (vs {r.absAvant} avant), note en baisse de {r.baisse} pts
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
