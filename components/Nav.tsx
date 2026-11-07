"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, Logo } from "./Icons";

export type NavItem = { href: string; label: string; icon: string };

export function Nav({ items }: { items: NavItem[] }) {
  const path = usePathname();
  const active = (h: string) => (h === "/" ? path === "/" : path.startsWith(h));
  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200/70 bg-white px-3 py-5 md:flex">
        <div className="mb-8 flex items-center gap-3 px-3">
          <Logo />
          <span className="section-title tracking-tight text-brand-900">UniConnect</span>
        </div>
        <nav className="grid gap-1" aria-label="Navigation principale">
          {items.map((i) => (
            <Link key={i.href} href={i.href} aria-current={active(i.href) ? "page" : undefined}
              className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${active(i.href) ? "bg-brand-50 text-brand-800" : "text-slate-600 hover:bg-slate-50 hover:text-ink"}`}>
              <Icon name={i.icon} className={`size-5 ${active(i.href) ? "text-brand-600" : "text-slate-400"}`} />
              {i.label}
            </Link>
          ))}
        </nav>
      </aside>
      <nav aria-label="Navigation principale" className="fixed inset-x-0 bottom-0 z-20 flex justify-around gap-1 overflow-x-auto border-t border-slate-200/70 bg-white/95 px-2 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur md:hidden">
        {items.map((i) => (
          <Link key={i.href} href={i.href} aria-current={active(i.href) ? "page" : undefined}
            className={`flex min-h-12 min-w-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[11px] font-medium transition ${active(i.href) ? "text-brand-800" : "text-slate-500"}`}>
            <span className={`grid h-7 w-12 place-items-center rounded-full transition ${active(i.href) ? "bg-brand-100" : ""}`}>
              <Icon name={i.icon} className="size-5" />
            </span>
            {i.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
