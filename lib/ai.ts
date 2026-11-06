/** Appel du modèle d'IA, uniquement côté serveur. La clé reste dans les variables d'environnement. */
export const aiConfigured = () => Boolean(process.env.ANTHROPIC_API_KEY);

export async function askModel(system: string, user: string): Promise<string | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null; // le mode simulé prend le relais
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: process.env.AI_MODEL ?? "claude-haiku-5-5",
      max_tokens: 700,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok) throw new Error("Le service d'IA est indisponible");
  const data = await res.json();
  return data.content?.map((c: any) => c.text).join("") ?? null;
}
