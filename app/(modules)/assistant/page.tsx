import { getSession } from "@/lib/session";
import { aiConfigured } from "@/lib/ai";
import { Chat } from "./Chat";
import { etudiantsARisque } from "./actions";

export default async function AssistantPage() {
  const s = (await getSession())!;
  const risque = s.role === "enseignant" ? await etudiantsARisque() : [];
  return (
    <div className="grid gap-4">
      <h1 className="page-title">{s.role === "etudiant" ? "Assistant UniConnect" : "Étudiants à risque"}</h1>
      {!aiConfigured() && <p className="badge-warn !rounded-xl !px-3 !py-2 !text-xs">Mode démo : aucune clé d'IA configurée, réponses générées par règles.</p>}
      {s.role === "etudiant" && <Chat />}
      {s.role === "enseignant" && (
        <>
          <p className="text-sm text-slate-600">Étudiants dont les absences augmentent (14 derniers jours) et dont la dernière note baisse d'au moins 2 points.</p>
          {risque.length === 0 && <p>Aucun étudiant à risque détecté.</p>}
          <ul className="grid gap-2">
            {risque.map((r) => (
              <li key={r.nom} className="card-sm border-l-4 !border-l-red-500">
                <strong>{r.nom}</strong> — absences : {r.absRecentes} (vs {r.absAvant} avant), note en baisse de {r.baisse} pts
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
