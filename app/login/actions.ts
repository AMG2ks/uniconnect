"use server";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models";
import { createSession, destroySession } from "@/lib/session";
import type { ActionState } from "@/lib/utils";

export async function login(_: ActionState, fd: FormData): Promise<ActionState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const pwd = String(fd.get("motDePasse") ?? "");
  if (!email || !pwd) return { error: "Email et mot de passe requis" };
  await connectDB();
  const u = await User.findOne({ email });
  if (!u || !(await bcrypt.compare(pwd, u.motDePasse))) return { error: "Identifiants invalides" };
  await createSession({ userId: String(u._id), role: u.role, nom: u.nom });
  redirect("/");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
