"use server";
import { revalidatePath } from "next/cache";
import { Absence, Justificatif, Seance, User } from "@/models";
import { requireRole } from "@/lib/session";
import { run, str } from "@/lib/action";
import type { ActionState } from "@/lib/utils";

export type AbsencePayload = { seance: string; date: string; absents: string[]; tous: string[]; clientId?: string };

/** Marque les absences d'une séance. Idempotente: sûre pour la synchronisation hors ligne (doublons ignorés). */
export async function markAbsences(p: AbsencePayload): Promise<ActionState> {
  return run(async () => {
    const s = await requireRole("enseignant");
    const date = new Date(p.date);
    if (Number.isNaN(date.getTime())) throw new Error("Date invalide");
    const seance: any = await Seance.findById(p.seance).lean();
    // Seul l'enseignant de la matière marque une absence
    if (!seance || String(seance.enseignant) !== s.userId) throw new Error("Cette séance n'est pas la vôtre");
    const valid = await User.find({ _id: { $in: p.tous }, groupe: seance.groupe, role: "etudiant" }).select("_id").lean();
    const ok = new Set(valid.map((u: any) => String(u._id)));
    for (const id of p.absents) {
      if (!ok.has(id)) continue;
      await Absence.updateOne({ etudiant: id, seance: p.seance, date }, { $setOnInsert: { statut: "absent", justifiee: false } }, { upsert: true });
    }
    const presents = [...ok].filter((id) => !p.absents.includes(id));
    if (presents.length) await Absence.deleteMany({ etudiant: { $in: presents }, seance: p.seance, date, justifiee: false });
    revalidatePath("/absences");
  });
}

export async function deleteAbsence(_: ActionState, fd: FormData) {
  return run(async () => {
    const s = await requireRole("enseignant");
    const a: any = await Absence.findById(str(fd, "id"));
    const seance: any = a && (await Seance.findById(a.seance).lean());
    if (!a || !seance || String(seance.enseignant) !== s.userId) throw new Error("Accès refusé");
    await Justificatif.deleteMany({ absence: a._id });
    await a.deleteOne();
    revalidatePath("/absences");
  });
}

export async function submitJustificatif(_: ActionState, fd: FormData) {
  return run(async () => {
    const s = await requireRole("etudiant");
    const absence: any = await Absence.findById(str(fd, "absence"));
    if (!absence || String(absence.etudiant) !== s.userId) throw new Error("Absence introuvable");
    const motif = str(fd, "motif");
    if (motif.length < 5) throw new Error("Motif trop court");
    const pieceJointe = str(fd, "pieceJointe") || undefined;
    await Justificatif.findOneAndUpdate({ absence: absence._id }, { motif, pieceJointe, decision: "en_attente" }, { upsert: true });
    revalidatePath("/absences");
  });
}

export async function deleteJustificatif(_: ActionState, fd: FormData) {
  return run(async () => {
    const s = await requireRole("etudiant");
    const j: any = await Justificatif.findById(str(fd, "id")).populate("absence");
    if (!j || String(j.absence.etudiant) !== s.userId) throw new Error("Accès refusé");
    if (j.decision !== "en_attente") throw new Error("Justificatif déjà traité");
    await j.deleteOne();
    revalidatePath("/absences");
  });
}

export async function decideJustificatif(_: ActionState, fd: FormData) {
  return run(async () => {
    const s = await requireRole("enseignant");
    const decision = str(fd, "decision");
    if (!["accepte", "refuse"].includes(decision)) throw new Error("Décision invalide");
    const j: any = await Justificatif.findById(str(fd, "id")).populate({ path: "absence", populate: { path: "seance" } });
    if (!j || String(j.absence.seance.enseignant) !== s.userId) throw new Error("Accès refusé");
    j.decision = decision;
    await j.save();
    await Absence.findByIdAndUpdate(j.absence._id, { justifiee: decision === "accepte" });
    revalidatePath("/absences");
  });
}
