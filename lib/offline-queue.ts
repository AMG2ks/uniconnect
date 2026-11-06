"use client";
import { openDB } from "idb";
import type { AbsencePayload } from "@/app/(modules)/absences/actions";

const db = () => openDB("uniconnect", 1, { upgrade(d) { d.createObjectStore("absences", { keyPath: "clientId" }); } });

export async function enqueueAbsence(p: AbsencePayload) {
  await (await db()).put("absences", p);
  window.dispatchEvent(new Event("uc-queue"));
}
export async function pending(): Promise<AbsencePayload[]> { return (await db()).getAll("absences"); }
export async function remove(id: string) { await (await db()).delete("absences", id); }
