import type { ActionState } from "./utils";
import { connectDB } from "./mongodb";

/** Enveloppe une Server Action: connexion BD + messages d'erreur clairs. */
export async function run(fn: () => Promise<void>): Promise<ActionState> {
  try {
    await connectDB();
    await fn();
    return { ok: true };
  } catch (e: any) {
    if (e?.digest?.startsWith?.("NEXT_REDIRECT")) throw e;
    if (e?.code === 11000) return { error: "Cette entrée existe déjà (doublon)" };
    if (e?.name === "ValidationError") return { error: Object.values<any>(e.errors).map((x) => x.message).join(", ") };
    if (e?.name === "ZodError") return { error: e.issues.map((i: any) => i.message).join(", ") };
    return { error: e?.message ?? "Erreur inattendue" };
  }
}

export const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
export const num = (fd: FormData, k: string) => Number(String(fd.get(k) ?? "").replace(",", "."));
export const opt = (fd: FormData, k: string) => str(fd, k) || undefined;
