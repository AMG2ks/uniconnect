"use server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { User } from "@/models";
import { requireRole, getSession } from "@/lib/session";
import { run, str, opt } from "@/lib/action";
import type { ActionState } from "@/lib/utils";

const schema = z.object({
  nom: z.string().min(2, "Nom trop court"),
  email: z.string().email("Email invalide"),
  role: z.enum(["admin", "enseignant", "etudiant"]),
});

export async function createUser(_: ActionState, fd: FormData) {
  return run(async () => {
    await requireRole("admin");
    const d = schema.parse({ nom: str(fd, "nom"), email: str(fd, "email"), role: str(fd, "role") });
    const pwd = str(fd, "motDePasse");
    if (pwd.length < 6) throw new Error("Mot de passe: 6 caractères minimum");
    const groupe = d.role === "etudiant" ? opt(fd, "groupe") : undefined;
    await User.create({ ...d, groupe, motDePasse: await bcrypt.hash(pwd, 10) });
    revalidatePath("/utilisateurs");
  });
}

export async function updateUser(_: ActionState, fd: FormData) {
  return run(async () => {
    await requireRole("admin");
    const d = schema.parse({ nom: str(fd, "nom"), email: str(fd, "email"), role: str(fd, "role") });
    const upd: any = { ...d, groupe: d.role === "etudiant" ? opt(fd, "groupe") ?? null : null };
    const pwd = str(fd, "motDePasse");
    if (pwd) {
      if (pwd.length < 6) throw new Error("Mot de passe: 6 caractères minimum");
      upd.motDePasse = await bcrypt.hash(pwd, 10);
    }
    await User.findByIdAndUpdate(str(fd, "id"), upd, { runValidators: true });
    revalidatePath("/utilisateurs");
  });
}

export async function deleteUser(_: ActionState, fd: FormData) {
  return run(async () => {
    const s = await requireRole("admin");
    const id = str(fd, "id");
    if (id === s.userId) throw new Error("Vous ne pouvez pas supprimer votre propre compte");
    await User.findByIdAndDelete(id);
    revalidatePath("/utilisateurs");
  });
}

export async function updateProfile(_: ActionState, fd: FormData) {
  return run(async () => {
    const s = await getSession();
    if (!s) throw new Error("Non authentifié");
    const nom = z.string().min(2, "Nom trop court").parse(str(fd, "nom"));
    const upd: any = { nom, photo: opt(fd, "photo") };
    const pwd = str(fd, "motDePasse");
    if (pwd) {
      if (pwd.length < 6) throw new Error("Mot de passe: 6 caractères minimum");
      upd.motDePasse = await bcrypt.hash(pwd, 10);
    }
    await User.findByIdAndUpdate(s.userId, upd);
    revalidatePath("/profil");
  });
}
