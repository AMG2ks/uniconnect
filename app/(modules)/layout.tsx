import { redirect } from "next/navigation";
import { getSession, type Role } from "@/lib/session";
import { Nav, type NavItem } from "@/components/Nav";
import { LogoutButton } from "@/components/LogoutButton";
import { SyncManager } from "@/components/SyncManager";

const menus: Record<Role, NavItem[]> = {
  admin: [
    { href: "/", label: "Accueil", icon: "🏠" },
    { href: "/utilisateurs", label: "Comptes", icon: "👥" },
    { href: "/structure", label: "Structure", icon: "🏛️" },
    { href: "/matieres", label: "Matières", icon: "📚" },
    { href: "/emploi-du-temps", label: "Planning", icon: "🗓️" },
    { href: "/annonces", label: "Annonces", icon: "📣" },
  ],
  enseignant: [
    { href: "/", label: "Accueil", icon: "🏠" },
    { href: "/emploi-du-temps", label: "Planning", icon: "🗓️" },
    { href: "/notes", label: "Notes", icon: "📝" },
    { href: "/absences", label: "Absences", icon: "🚫" },
    { href: "/annonces", label: "Annonces", icon: "📣" },
    { href: "/assistant", label: "IA", icon: "🤖" },
  ],
  etudiant: [
    { href: "/", label: "Accueil", icon: "🏠" },
    { href: "/emploi-du-temps", label: "Planning", icon: "🗓️" },
    { href: "/notes", label: "Notes", icon: "📝" },
    { href: "/absences", label: "Absences", icon: "🚫" },
    { href: "/annonces", label: "Annonces", icon: "📣" },
    { href: "/assistant", label: "IA", icon: "🤖" },
  ],
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const s = await getSession();
  if (!s) redirect("/login");
  return (
    <div className="flex min-h-dvh bg-slate-50">
      <Nav items={menus[s.role]} />
      <div className="flex min-w-0 flex-1 flex-col pb-16 md:pb-0">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <p className="font-bold text-teal-700 md:hidden">UniConnect</p>
          <p className="hidden text-sm text-slate-600 md:block">{s.nom} · {s.role}</p>
          <LogoutButton />
        </header>
        <SyncManager />
        <main className="mx-auto w-full max-w-5xl flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}
