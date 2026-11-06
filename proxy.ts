import { NextRequest, NextResponse } from "next/server";
import { decrypt, type Role } from "@/lib/session";

const roleRoutes: Record<string, Role[]> = {
  "/utilisateurs": ["admin"],
  "/structure": ["admin"],
  "/matieres": ["admin"],
  "/emploi-du-temps/gestion": ["admin"],
};
const publicPaths = ["/login", "/offline"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (publicPaths.some((p) => path === p)) return NextResponse.next();
  const session = await decrypt(req.cookies.get("session")?.value);
  if (!session) return NextResponse.redirect(new URL("/login", req.nextUrl));
  for (const [prefix, roles] of Object.entries(roleRoutes)) {
    if (path.startsWith(prefix) && !roles.includes(session.role)) {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icons|manifest.webmanifest|sw.js|.*\\.(?:png|svg|jpg|ico|js)$).*)"],
};
