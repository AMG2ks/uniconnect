"use server";
import { revalidatePath } from "next/cache";
import { Note, Affectation, User } from "@/models";
import { requireRole } from "@/lib/session";
import { run, str } from "@/lib/action";
import type { ActionState } from "@/lib/utils";

const TYPES = [["ds", "DS"], ["tp", "TP"], ["examen", "examen"]] as const;

export async function saveNotes(_: ActionState, fd: FormData) {
  return run(async () => {
    const s = await requireRole("enseignant");
    const matiere = str(fd, "matiere"), etudiant = str(fd, "etudiant"), groupe = str(fd, "groupe");
    // Un enseignant n'intervient que sur les matières qui lui sont affectées
    if (!(await Affectation.exists({ matiere, groupe, enseignant: s.userId }))) throw new Error("Matière non affectée à cet enseignant pour ce groupe");
    if (!(await User.exists({ _id: etudiant, groupe, role: "etudiant" }))) throw new Error("Étudiant hors du groupe");
    for (const [field, type] of TYPES) {
      const raw = str(fd, field).replace(",", ".");
      if (raw === "") continue;
      const valeur = Number(raw);
      if (Number.isNaN(valeur) || valeur < 0 || valeur > 20) throw new Error(`${type} : la note doit être comprise entre 0 et 20`);
      await Note.findOneAndUpdate({ etudiant, matiere, type }, { valeur, date: new Date() }, { upsert: true, runValidators: true });
    }
    revalidatePath("/notes");
  });
}

export async function deleteNote(_: ActionState, fd: FormData) {
  return run(async () => {
    const s = await requireRole("enseignant");
    const n: any = await Note.findById(str(fd, "id"));
    if (!n) throw new Error("Note introuvable");
    const etu: any = await User.findById(n.etudiant).lean();
    if (!(await Affectation.exists({ matiere: n.matiere, groupe: etu?.groupe, enseignant: s.userId }))) throw new Error("Accès refusé");
    await n.deleteOne();
    revalidatePath("/notes");
  });
}
