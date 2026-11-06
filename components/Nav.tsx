"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string; icon: string };

export function Nav({ items }: { items: NavItem[] }) {
  const path = usePathname();
  const active = (h: string) => (h === "/" ? path === "/" : path.startsWith(h));
  return (
    <>
      <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white p-4 md:block">
        <p className="mb-6 text-xl font-bold text-teal-700">UniConnect</p>
        <nav className="grid gap-1" aria-label="Navigation principale">
          {items.map((i) => (
            <Link key={i.href} href={i.href} className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm ${active(i.href) ? "bg-teal-50 font-semibold text-teal-800" : "text-slate-700 hover:bg-slate-100"}`}>
              <span aria-hidden>{i.icon}</span>{i.label}
            </Link>
          ))}
        </nav>
      </aside>
      <nav aria-label="Navigation principale" className="fixed inset-x-0 bottom-0 z-20 flex overflow-x-auto border-t border-slate-200 bg-white md:hidden">
        {items.map((i) => (
          <Link key={i.href} href={i.href} className={`flex min-h-14 min-w-16 flex-1 flex-col items-center justify-center gap-0.5 px-2 text-[11px] ${active(i.href) ? "font-semibold text-teal-700" : "text-slate-600"}`}>
            <span aria-hidden className="text-lg">{i.icon}</span>{i.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
