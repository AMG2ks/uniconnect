"use server";
import { revalidatePath } from "next/cache";
import { Annonce, Affectation } from "@/models";
import { requireRole } from "@/lib/session";
import { run, str } from "@/lib/action";
import type { ActionState } from "@/lib/utils";

export async function saveAnnonce(_: ActionState, fd: FormData) {
  return run(async () => {
    const s = await requireRole("admin", "enseignant");
    const titre = str(fd, "titre"), contenu = str(fd, "contenu");
    if (titre.length < 3 || contenu.length < 3) throw new Error("Titre et contenu requis");
    let portee = str(fd, "portee") === "groupe" ? "groupe" : "generale";
    const groupe = str(fd, "groupe") || undefined;
    if (s.role === "enseignant") {
      // Un enseignant publie uniquement pour ses groupes
      portee = "groupe";
      if (!groupe || !(await Affectation.exists({ enseignant: s.userId, groupe }))) throw new Error("Choisissez l'un de vos groupes");
    }
    if (portee === "groupe" && !groupe) throw new Error("Groupe requis");
    const d = { titre, contenu, portee, groupe: portee === "groupe" ? groupe : undefined };
    const id = str(fd, "id");
    if (id) {
      const a: any = await Annonce.findById(id);
      if (!a || (s.role !== "admin" && String(a.auteur) !== s.userId)) throw new Error("Accès refusé");
      await Annonce.findByIdAndUpdate(id, { ...d, groupe: d.groupe ?? null });
    } else await Annonce.create({ ...d, auteur: s.userId });
    revalidatePath("/annonces");
  });
}

export async function deleteAnnonce(_: ActionState, fd: FormData) {
  return run(async () => {
    const s = await requireRole("admin", "enseignant");
    const a: any = await Annonce.findById(str(fd, "id"));
    if (!a || (s.role !== "admin" && String(a.auteur) !== s.userId)) throw new Error("Accès refusé");
    await a.deleteOne();
    revalidatePath("/annonces");
  });
}
