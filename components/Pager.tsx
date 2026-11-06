export function Pager({ page, total, per, q, base = "" }: { page: number; total: number; per: number; q?: string; base?: string }) {
  const pages = Math.max(1, Math.ceil(total / per));
  const href = (n: number) => `${base}?p=${n}${q ? `&q=${encodeURIComponent(q)}` : ""}`;
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between text-sm">
      {page > 1 ? <a className="min-h-11 content-center px-3 text-teal-700" href={href(page - 1)}>← Précédent</a> : <span />}
      <span>Page {page} / {pages}</span>
      {page < pages ? <a className="min-h-11 content-center px-3 text-teal-700" href={href(page + 1)}>Suivant →</a> : <span />}
    </nav>
  );
}
