"use server";
import { revalidatePath } from "next/cache";
import { Departement, Filiere, Groupe, User, Matiere } from "@/models";
import { requireRole } from "@/lib/session";
import { run, str, num } from "@/lib/action";
import type { ActionState } from "@/lib/utils";

const need = (v: string, msg: string) => { if (!v) throw new Error(msg); return v; };
const done = () => revalidatePath("/structure");

/* Départements */
export async function saveDepartement(_: ActionState, fd: FormData) {
  return run(async () => {
    await requireRole("admin");
    const d = { nom: need(str(fd, "nom"), "Nom requis"), code: need(str(fd, "code"), "Code requis") };
    const id = str(fd, "id");
    if (id) await Departement.findByIdAndUpdate(id, d, { runValidators: true });
    else await Departement.create(d);
    done();
  });
}
export async function deleteDepartement(_: ActionState, fd: FormData) {
  return run(async () => {
    await requireRole("admin");
    const id = str(fd, "id");
    if (await Filiere.exists({ departement: id })) throw new Error("Suppression refusée : le département contient des filières");
    await Departement.findByIdAndDelete(id);
    done();
  });
}

/* Filières (avec niveau) */
export async function saveFiliere(_: ActionState, fd: FormData) {
  return run(async () => {
    await requireRole("admin");
    const d = { nom: need(str(fd, "nom"), "Nom requis"), niveau: need(str(fd, "niveau"), "Niveau requis"), departement: need(str(fd, "departement"), "Département requis") };
    const id = str(fd, "id");
    if (id) await Filiere.findByIdAndUpdate(id, d, { runValidators: true });
    else await Filiere.create(d);
    done();
  });
}
export async function deleteFiliere(_: ActionState, fd: FormData) {
  return run(async () => {
    await requireRole("admin");
    const id = str(fd, "id");
    if (await Groupe.exists({ filiere: id })) throw new Error("Suppression refusée : la filière contient des groupes");
    if (await Matiere.exists({ filiere: id })) throw new Error("Suppression refusée : la filière contient des matières");
    await Filiere.findByIdAndDelete(id);
    done();
  });
}

/* Groupes */
export async function saveGroupe(_: ActionState, fd: FormData) {
  return run(async () => {
    await requireRole("admin");
    const d = { nom: need(str(fd, "nom"), "Nom requis"), filiere: need(str(fd, "filiere"), "Filière requise") };
    const id = str(fd, "id");
    if (id) await Groupe.findByIdAndUpdate(id, d, { runValidators: true });
    else await Groupe.create(d);
    done();
  });
}
export async function deleteGroupe(_: ActionState, fd: FormData) {
  return run(async () => {
    await requireRole("admin");
    const id = str(fd, "id");
    if (await User.exists({ groupe: id })) throw new Error("Suppression refusée : le groupe contient des étudiants");
    await Groupe.findByIdAndDelete(id);
    done();
  });
}

/* Affectation d'un étudiant à un (seul) groupe */
export async function assignStudent(_: ActionState, fd: FormData) {
  return run(async () => {
    await requireRole("admin");
    const etu = need(str(fd, "etudiant"), "Étudiant requis");
    const groupe = need(str(fd, "groupe"), "Groupe requis");
    const u = await User.findOneAndUpdate({ _id: etu, role: "etudiant" }, { groupe });
    if (!u) throw new Error("Étudiant introuvable");
    done();
  });
}
void num;
