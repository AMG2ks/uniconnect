// Les ObjectId et les Date sont convertis en chaînes avant les composants clients.
export function plain<T>(doc: T): T {
  return JSON.parse(JSON.stringify(doc));
}

export const JOURS = ["", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

export const toMin = (h: string) => {
  const [a, b] = h.split(":").map(Number);
  return a * 60 + b;
};

export type ActionState = { ok?: boolean; error?: string } | undefined;
