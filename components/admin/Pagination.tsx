import Link from "next/link";

export default function Pagination({
  page,
  pageSize,
  total,
  buildHref,
}: {
  page: number;
  pageSize: number;
  total: number;
  buildHref: (page: number) => string;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 text-sm">
      <Link
        href={buildHref(Math.max(1, page - 1))}
        aria-disabled={page <= 1}
        className={`rounded-full border border-vinho/30 px-3 py-1 text-vinho ${
          page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-vinho hover:text-creme"
        }`}
      >
        Anterior
      </Link>
      <span className="text-vinho/70">
        Página {page} de {totalPages}
      </span>
      <Link
        href={buildHref(Math.min(totalPages, page + 1))}
        aria-disabled={page >= totalPages}
        className={`rounded-full border border-vinho/30 px-3 py-1 text-vinho ${
          page >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-vinho hover:text-creme"
        }`}
      >
        Próxima
      </Link>
    </div>
  );
}
