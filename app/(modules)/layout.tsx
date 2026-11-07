import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, type Role } from "@/lib/session";
import { Nav, type NavItem } from "@/components/Nav";
import { LogoutButton } from "@/components/LogoutButton";
import { Logo } from "@/components/Icons";
import { Toast } from "@/components/Toast";
import { SyncManager } from "@/components/SyncManager";

const menus: Record<Role, NavItem[]> = {
  admin: [
    { href: "/", label: "Accueil", icon: "home" },
    { href: "/utilisateurs", label: "Comptes", icon: "users" },
    { href: "/structure", label: "Structure", icon: "building" },
    { href: "/matieres", label: "Matières", icon: "book" },
    { href: "/emploi-du-temps", label: "Planning", icon: "calendar" },
    { href: "/annonces", label: "Annonces", icon: "megaphone" },
  ],
  enseignant: [
    { href: "/", label: "Accueil", icon: "home" },
    { href: "/emploi-du-temps", label: "Planning", icon: "calendar" },
    { href: "/notes", label: "Notes", icon: "note" },
    { href: "/absences", label: "Absences", icon: "clipboard" },
    { href: "/annonces", label: "Annonces", icon: "megaphone" },
    { href: "/assistant", label: "IA", icon: "sparkles" },
  ],
  etudiant: [
    { href: "/", label: "Accueil", icon: "home" },
    { href: "/emploi-du-temps", label: "Planning", icon: "calendar" },
    { href: "/notes", label: "Notes", icon: "note" },
    { href: "/absences", label: "Absences", icon: "clipboard" },
    { href: "/annonces", label: "Annonces", icon: "megaphone" },
    { href: "/assistant", label: "IA", icon: "sparkles" },
  ],
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const s = await getSession();
  if (!s) redirect("/login");
  return (
    <div className="flex min-h-dvh">
      <Nav items={menus[s.role]} />
      <div className="flex min-w-0 flex-1 flex-col pb-16 md:pb-0">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/70 bg-white/85 px-4 py-2.5 backdrop-blur md:px-6">
          <div className="flex items-center gap-2 md:hidden"><Logo className="size-8" /><span className="font-semibold tracking-tight text-brand-900">UniConnect</span></div>
          <Link href="/profil" className="flex items-center gap-3 rounded-xl py-1 pr-2 transition hover:bg-slate-50 ml-auto" title="Mon profil">
            <span className="grid size-9 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-800">{s.nom.split(" ").map((x) => x[0]).slice(0, 2).join("").toUpperCase()}</span>
            <span className="hidden text-left leading-tight md:block"><span className="block text-sm font-medium">{s.nom}</span><span className="block text-xs capitalize text-muted">{s.role}</span></span>
          </Link>
          <LogoutButton />
        </header>
        <SyncManager />
        <Toast />
        <main className="mx-auto grid w-full max-w-5xl flex-1 content-start gap-5 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
