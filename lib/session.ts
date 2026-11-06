import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type Role = "admin" | "enseignant" | "etudiant";
export type Session = { userId: string; role: Role; nom: string };

const key = () => new TextEncoder().encode(process.env.SESSION_SECRET ?? "dev-secret");
const COOKIE = "session";

export async function encrypt(s: Session) {
  return new SignJWT({ ...s })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(key());
}

export async function decrypt(token?: string): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    return payload as unknown as Session;
  } catch {
    return null;
  }
}

export async function createSession(s: Session) {
  const token = await encrypt(s);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession() {
  return decrypt((await cookies()).get(COOKIE)?.value);
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function requireRole(...roles: Role[]) {
  const s = await getSession();
  if (!s) throw new Error("Non authentifié");
  if (roles.length && !roles.includes(s.role)) throw new Error("Accès refusé");
  return s;
}
