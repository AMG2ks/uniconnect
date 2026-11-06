"use server";
import { revalidatePath } from "next/cache";
import { Matiere, Affectation, Seance, Note } from "@/models";
import { User } from "@/models";
import { requireRole } from "@/lib/session";
import { run, str, num } from "@/lib/action";
import type { ActionState } from "@/lib/utils";

const done = () => revalidatePath("/matieres");

export async function saveMatiere(_: ActionState, fd: FormData) {
  return run(async () => {
    await requireRole("admin");
    const d = {
      nom: str(fd, "nom"), code: str(fd, "code"), coefficient: num(fd, "coefficient"),
      credits: num(fd, "credits"), semestre: num(fd, "semestre"), filiere: str(fd, "filiere"),
    };
    if (!d.nom || !d.code || !d.filiere) throw new Error("Nom, code et filière requis");
    if (!(d.coefficient > 0)) throw new Error("Le coefficient doit être strictement positif");
    if (!(d.credits >= 0)) throw new Error("Crédits invalides");
    const id = str(fd, "id");
    if (id) await Matiere.findByIdAndUpdate(id, d, { runValidators: true });
    else await Matiere.create(d);
    done();
  });
}

export async function deleteMatiere(_: ActionState, fd: FormData) {
  return run(async () => {
    await requireRole("admin");
    const id = str(fd, "id");
    if (await Affectation.exists({ matiere: id })) throw new Error("Suppression refusée : la matière a des affectations");
    if (await Seance.exists({ matiere: id }) || await Note.exists({ matiere: id })) throw new Error("Suppression refusée : la matière est utilisée");
    await Matiere.findByIdAndDelete(id);
    done();
  });
}

export async function saveAffectation(_: ActionState, fd: FormData) {
  return run(async () => {
    await requireRole("admin");
    const d = { matiere: str(fd, "matiere"), enseignant: str(fd, "enseignant"), groupe: str(fd, "groupe"), anneeUniversitaire: str(fd, "anneeUniversitaire") };
    if (Object.values(d).some((v) => !v)) throw new Error("Tous les champs sont requis");
    if (!(await User.exists({ _id: d.enseignant, role: "enseignant" }))) throw new Error("L'utilisateur n'est pas un enseignant");
    const id = str(fd, "id");
    if (id) await Affectation.findByIdAndUpdate(id, d, { runValidators: true });
    else await Affectation.create(d);
    done();
  });
}

export async function deleteAffectation(_: ActionState, fd: FormData) {
  return run(async () => {
    await requireRole("admin");
    await Affectation.findByIdAndDelete(str(fd, "id"));
    done();
  });
}
