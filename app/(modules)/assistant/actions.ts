"use server";
import { Absence, Affectation, Matiere, Note, Seance, User, Groupe } from "@/models";
import { requireRole } from "@/lib/session";
import { connectDB } from "@/lib/mongodb";
import { askModel } from "@/lib/ai";
import { tauxAbsences } from "@/lib/absences";
import { buildReleve, mention } from "@/lib/grades";
import { JOURS, toMin } from "@/lib/utils";

async function studentContext(userId: string) {
  await connectDB();
  const me: any = await User.findById(userId).lean();
  const groupe: any = me?.groupe ? await Groupe.findById(me.groupe).lean() : null;
  const seances: any[] = me?.groupe ? await Seance.find({ groupe: me.groupe }).populate("matiere salle enseignant").lean() : [];
  const mats: any[] = groupe ? await Matiere.find({ filiere: groupe.filiere }).lean() : [];
  const notes: any[] = await Note.find({ etudiant: userId }).lean();
  return { me, seances, releve: buildReleve(mats, notes), taux: await tauxAbsences(userId) };
}

function prochaineSeance(seances: any[]) {
  const now = new Date();
  const jour = ((now.getDay() + 6) % 7) + 1; // 1 = lundi
  const minutes = now.getHours() * 60 + now.getMinutes();
  const score = (s: any) => ((s.jour - jour + 7) % 7) * 1440 + toMin(s.heureDebut) - minutes;
  return seances.map((s) => ({ s, d: score(s) < 0 ? score(s) + 7 * 1440 : score(s) })).sort((a, b) => a.d - b.d)[0]?.s;
}

const fmtSeance = (s: any) => `${s.matiere.nom} le ${JOURS[s.jour].toLowerCase()} de ${s.heureDebut} à ${s.heureFin} en ${s.salle.nom} avec ${s.enseignant.nom}`;

export async function askAssistant(question: string): Promise<{ answer?: string; error?: string }> {
  try {
    const s = await requireRole("etudiant");
    const q = question.trim().slice(0, 500);
    if (!q) return { error: "Posez une question" };
    const c = await studentContext(s.userId);
    const data = {
      etudiant: c.me?.nom,
      emploiDuTemps: c.seances.map(fmtSeance),
      prochaineSeance: c.seances.length ? fmtSeance(prochaineSeance(c.seances)) : null,
      absencesParMatiere: c.taux.map((t) => ({ matiere: t.nom, absencesNonJustifiees: t.absences, taux: Math.round(t.taux * 100) + "%" })),
      notes: c.releve.matieres.map((m) => ({ matiere: m.nom, notes: m.notes, moyenne: m.moyenne })),
      moyenneGenerale: c.releve.generale,
    };
    const ai = await askModel(
      "Tu es l'assistant UniConnect. Réponds en français, brièvement, uniquement à partir des données JSON de l'étudiant fournies. Si l'information manque, dis-le.",
      `Données: ${JSON.stringify(data)}\n\nQuestion: ${q}`,
    );
    if (ai) return { answer: ai };
    // Mode simulé (aucune clé d'API): réponses à base de règles sur les mêmes données
    const low = q.toLowerCase();
    if (/prochain|séance|cours/.test(low)) return { answer: data.prochaineSeance ? `Votre prochaine séance : ${data.prochaineSeance}.` : "Aucune séance planifiée pour votre groupe." };
    if (/absence/.test(low)) {
      const hit = c.taux.find((t) => low.includes(t.nom.toLowerCase()));
      if (hit) return { answer: `En ${hit.nom}, vous avez ${hit.absences} absence(s) non justifiée(s) (${Math.round(hit.taux * 100)} %).` };
      return { answer: c.taux.length ? c.taux.map((t) => `${t.nom} : ${t.absences}`).join(" ; ") : "Aucune absence enregistrée." };
    }
    if (/moyenne|note|résultat/.test(low)) return { answer: data.moyenneGenerale === null ? "Pas encore de notes." : `Votre moyenne générale est de ${data.moyenneGenerale.toFixed(2)}/20 (${mention(data.moyenneGenerale)}).` };
    return { answer: "(Mode démo, sans clé d'IA) Je sais répondre sur votre prochaine séance, vos absences et vos notes." };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function summarizeReleve(): Promise<{ answer?: string; error?: string }> {
  try {
    const s = await requireRole("etudiant");
    const c = await studentContext(s.userId);
    const r = c.releve;
    const ai = await askModel(
      "Tu es un conseiller pédagogique bienveillant. Fais en français une synthèse courte du relevé et 3 conseils de progression concrets.",
      JSON.stringify({ generale: r.generale, matieres: r.matieres.map((m) => ({ nom: m.nom, coef: m.coefficient, moyenne: m.moyenne })), absences: c.taux }),
    );
    if (ai) return { answer: ai };
    const graded = r.matieres.filter((m) => m.moyenne !== null).sort((a, b) => a.moyenne! - b.moyenne!);
    if (!graded.length) return { answer: "Aucune note disponible pour le moment." };
    const faible = graded[0], fort = graded[graded.length - 1];
    return { answer: `Moyenne générale ${r.generale!.toFixed(2)}/20 (${mention(r.generale!)}). Point fort : ${fort.nom} (${fort.moyenne!.toFixed(1)}). À renforcer : ${faible.nom} (${faible.moyenne!.toFixed(1)}). Conseils : révisez ${faible.nom} en priorité, refaites les annales, et demandez de l'aide à l'enseignant.` };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function rewriteAnnonce(text: string): Promise<{ answer?: string; error?: string }> {
  try {
    await requireRole("admin", "enseignant");
    const t = text.trim().slice(0, 2000);
    if (t.length < 5) return { error: "Écrivez d'abord un brouillon" };
    const ai = await askModel("Reformule cette annonce universitaire en français : claire, polie, concise. Renvoie uniquement le texte.", t);
    if (ai) return { answer: ai };
    const clean = t.charAt(0).toUpperCase() + t.slice(1).replace(/\s+/g, " ");
    return { answer: `Chers étudiants,\n\n${clean}${/[.!?]$/.test(clean) ? "" : "."}\n\nCordialement.` };
  } catch (e: any) {
    return { error: e.message };
  }
}

/** Étudiants à risque: absences en hausse ET notes en baisse. */
export async function etudiantsARisque(): Promise<{ nom: string; absRecentes: number; absAvant: number; baisse: number }[]> {
  const s = await requireRole("enseignant");
  await connectDB();
  const affs: any[] = await Affectation.find({ enseignant: s.userId }).lean();
  const out: any[] = [];
  const now = Date.now(), d14 = 14 * 864e5;
  for (const a of affs) {
    const students: any[] = await User.find({ role: "etudiant", groupe: a.groupe }).select("nom").lean();
    for (const st of students) {
      if (out.some((o) => o.id === String(st._id))) continue;
      const abs: any[] = await Absence.find({ etudiant: st._id }).lean();
      const rec = abs.filter((x) => now - +x.date < d14).length;
      const avant = abs.filter((x) => now - +x.date >= d14 && now - +x.date < 2 * d14).length;
      const notes: any[] = await Note.find({ etudiant: st._id, matiere: a.matiere }).sort({ date: 1 }).lean();
      let baisse = 0;
      if (notes.length >= 2) {
        const last = notes[notes.length - 1].valeur;
        const prev = notes.slice(0, -1).reduce((x, n) => x + n.valeur, 0) / (notes.length - 1);
        baisse = prev - last;
      }
      if (rec > avant && baisse >= 2) out.push({ id: String(st._id), nom: st.nom, absRecentes: rec, absAvant: avant, baisse: Math.round(baisse * 10) / 10 });
    }
  }
  return out.map(({ id, ...r }) => r);
}
