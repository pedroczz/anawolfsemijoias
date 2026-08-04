import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listMovements } from "@/services/stock.service";
import Pagination from "@/components/admin/Pagination";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

const TYPE_LABELS: Record<string, { label: string; className: string }> = {
  in: { label: "Entrada", className: "bg-green-100 text-green-800" },
  out: { label: "Saída", className: "bg-vinho/10 text-vinho" },
  adjustment: { label: "Ajuste", className: "bg-areia/60 text-vinho" },
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

type SearchParams = {
  product?: string;
  page?: string;
};

export default async function StockMovementsPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createClient();
  const page = Math.max(1, Number(searchParams.page) || 1);
  const productId = searchParams.product || undefined;

  const { data: movements, count } = await listMovements(supabase, {
    productId,
    page,
    pageSize: PAGE_SIZE,
  });

  function buildHref(nextPage: number) {
    const params = new URLSearchParams();
    if (productId) params.set("product", productId);
    params.set("page", String(nextPage));
    return `/admin/estoque/movimentacoes?${params.toString()}`;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-vinho">Movimentações de estoque</h1>
          {productId && (
            <p className="mt-1 text-sm text-vinho/60">
              Filtrado por produto —{" "}
              <Link href="/admin/estoque/movimentacoes" className="underline-offset-2 hover:underline">
                limpar filtro
              </Link>
            </p>
          )}
        </div>
        <Link
          href="/admin/estoque"
          className="rounded-full border border-vinho/30 px-4 py-2 text-sm font-medium text-vinho transition hover:bg-vinho hover:text-creme"
        >
          Voltar ao estoque
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-rosa/30 bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-rosa/30 text-xs uppercase text-vinho/60">
            <tr>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Quantidade</th>
              <th className="px-4 py-3">Anterior → Novo</th>
              <th className="px-4 py-3">Motivo</th>
              <th className="px-4 py-3">Responsável</th>
            </tr>
          </thead>
          <tbody>
            {movements.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-vinho/60">
                  Nenhuma movimentação registrada ainda.
                </td>
              </tr>
            )}
            {movements.map((movement) => {
              const typeInfo = TYPE_LABELS[movement.type] ?? { label: movement.type, className: "bg-rosa/20 text-vinho" };
              return (
                <tr key={movement.id} className="border-b border-rosa/15 last:border-0">
                  <td className="px-4 py-3 text-vinho/70">{dateFormatter.format(new Date(movement.createdAt))}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/estoque/movimentacoes?product=${movement.productId}`}
                      className="font-medium text-vinho hover:underline"
                    >
                      {movement.productName}
                    </Link>
                    <p className="text-xs text-vinho/50">{movement.productSku}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${typeInfo.className}`}>
                      {typeInfo.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-vinho/70">
                    {movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity}
                  </td>
                  <td className="px-4 py-3 text-vinho/70">
                    {movement.previousStock} → {movement.newStock}
                  </td>
                  <td className="px-4 py-3 text-vinho/70">{movement.note ?? "—"}</td>
                  <td className="px-4 py-3 text-vinho/70">{movement.createdBy ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pageSize={PAGE_SIZE} total={count} buildHref={buildHref} />
    </div>
  );
}
