"use server";
import { revalidatePath } from "next/cache";
import { Seance, Salle, Affectation } from "@/models";
import { requireRole } from "@/lib/session";
import { run, str, num } from "@/lib/action";
import { toMin, type ActionState } from "@/lib/utils";

const done = () => revalidatePath("/emploi-du-temps");

export async function saveSeance(_: ActionState, fd: FormData) {
  return run(async () => {
    await requireRole("admin");
    const d = {
      jour: num(fd, "jour"), heureDebut: str(fd, "heureDebut"), heureFin: str(fd, "heureFin"),
      matiere: str(fd, "matiere"), enseignant: str(fd, "enseignant"), groupe: str(fd, "groupe"), salle: str(fd, "salle"),
    };
    if (Object.values(d).some((v) => v === "" || Number.isNaN(v))) throw new Error("Tous les champs sont requis");
    if (toMin(d.heureFin) <= toMin(d.heureDebut)) throw new Error("L'heure de fin doit être postérieure à l'heure de début");
    if (!(await Affectation.exists({ matiere: d.matiere, enseignant: d.enseignant, groupe: d.groupe })))
      throw new Error("Cet enseignant n'est pas affecté à cette matière pour ce groupe");
    const id = str(fd, "id");
    // Détection de conflits: salle, enseignant ou groupe déjà occupé sur le créneau
    const clash = await Seance.find({
      _id: { $ne: id || undefined }, jour: d.jour,
      heureDebut: { $lt: d.heureFin }, heureFin: { $gt: d.heureDebut },
      $or: [{ salle: d.salle }, { enseignant: d.enseignant }, { groupe: d.groupe }],
    }).lean();
    if (clash.length) {
      const c: any = clash[0];
      const why = String(c.salle) === d.salle ? "La salle" : String(c.enseignant) === d.enseignant ? "L'enseignant" : "Le groupe";
      throw new Error(`${why} est déjà occupé(e) sur ce créneau (${c.heureDebut}–${c.heureFin})`);
    }
    if (id) await Seance.findByIdAndUpdate(id, d, { runValidators: true });
    else await Seance.create(d);
    done();
  });
}

export async function deleteSeance(_: ActionState, fd: FormData) {
  return run(async () => {
    await requireRole("admin");
    await Seance.findByIdAndDelete(str(fd, "id"));
    done();
  });
}

export async function saveSalle(_: ActionState, fd: FormData) {
  return run(async () => {
    await requireRole("admin");
    const d = { nom: str(fd, "nom"), capacite: num(fd, "capacite") };
    if (!d.nom || !(d.capacite > 0)) throw new Error("Nom et capacité (> 0) requis");
    const id = str(fd, "id");
    if (id) await Salle.findByIdAndUpdate(id, d, { runValidators: true });
    else await Salle.create(d);
    done();
  });
}

export async function deleteSalle(_: ActionState, fd: FormData) {
  return run(async () => {
    await requireRole("admin");
    const id = str(fd, "id");
    if (await Seance.exists({ salle: id })) throw new Error("Suppression refusée : la salle est utilisée");
    await Salle.findByIdAndDelete(id);
    done();
  });
}
