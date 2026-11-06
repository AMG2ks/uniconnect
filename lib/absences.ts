import { Absence, Seance, User } from "@/models";

export const SEUIL_ABSENCE = 0.25; // alerte au-delà de 25 %
export const SEMAINES = 14; // durée d'un semestre pour estimer le volume de séances

/** Taux d'absence (non justifiées) par matière pour un étudiant. */
export async function tauxAbsences(etudiantId: string) {
  const me: any = await User.findById(etudiantId).lean();
  if (!me?.groupe) return [];
  const seances: any[] = await Seance.find({ groupe: me.groupe }).populate("matiere").lean();
  const mine: any[] = await Absence.find({ etudiant: etudiantId, justifiee: false }).lean();
  const parMatiere = new Map<string, { nom: string; prevues: number; absences: number }>();
  for (const s of seances) {
    const k = String(s.matiere._id);
    const e = parMatiere.get(k) ?? { nom: s.matiere.nom, prevues: 0, absences: 0 };
    e.prevues += SEMAINES;
    parMatiere.set(k, e);
  }
  const bySeance = new Map(seances.map((s) => [String(s._id), String(s.matiere._id)]));
  for (const a of mine) {
    const k = bySeance.get(String(a.seance));
    if (k) parMatiere.get(k)!.absences += 1;
  }
  return [...parMatiere.values()].map((e) => ({ ...e, taux: e.prevues ? e.absences / e.prevues : 0, alerte: e.prevues ? e.absences / e.prevues > SEUIL_ABSENCE : false }));
}
