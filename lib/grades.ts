export const POIDS: Record<string, number> = { DS: 0.3, TP: 0.2, examen: 0.5 };
export const SEUIL_VALIDATION = 10;

export function mention(m: number) {
  if (m >= 16) return "Très bien";
  if (m >= 14) return "Bien";
  if (m >= 12) return "Assez bien";
  if (m >= 10) return "Passable";
  return "Ajourné";
}

/** Moyenne de matière pondérée par les types d'évaluation présents. */
export function moyenneMatiere(notes: { type: string; valeur: number }[]) {
  let w = 0, s = 0;
  for (const n of notes) { const p = POIDS[n.type] ?? 0; w += p; s += p * n.valeur; }
  return w ? s / w : null;
}

/** Moyenne générale pondérée par les coefficients. */
export function moyenneGenerale(items: { moyenne: number | null; coefficient: number }[]) {
  let w = 0, s = 0;
  for (const i of items) if (i.moyenne !== null) { w += i.coefficient; s += i.coefficient * i.moyenne; }
  return w ? s / w : null;
}

export type Releve = {
  matieres: { _id: string; nom: string; code: string; coefficient: number; credits: number; notes: Record<string, number>; moyenne: number | null; validee: boolean }[];
  generale: number | null;
};

export function buildReleve(matieres: any[], notes: any[]): Releve {
  const rows = matieres.map((m) => {
    const ns = notes.filter((n) => String(n.matiere) === String(m._id));
    const moyenne = moyenneMatiere(ns);
    return {
      _id: String(m._id), nom: m.nom, code: m.code, coefficient: m.coefficient, credits: m.credits,
      notes: Object.fromEntries(ns.map((n) => [n.type, n.valeur])), moyenne,
      validee: moyenne !== null && moyenne >= SEUIL_VALIDATION,
    };
  });
  return { matieres: rows, generale: moyenneGenerale(rows) };
}
