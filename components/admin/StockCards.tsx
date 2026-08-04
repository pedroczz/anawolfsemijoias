import StatCard from "@/components/admin/StatCard";
import type { TopSellingProduct } from "@/services/products.service";

export default function StockCards({
  active,
  inactive,
  outOfStock,
  lowStock,
  topSelling,
}: {
  active: number;
  inactive: number;
  outOfStock: number;
  lowStock: number;
  topSelling: TopSellingProduct[];
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      <StatCard label="Produtos ativos" value={active} />
      <StatCard label="Produtos inativos" value={inactive} />
      <StatCard label="Sem estoque" value={outOfStock} />
      <StatCard label="Estoque baixo" value={lowStock} />
      <div className="rounded-xl border border-rosa/30 bg-white p-5 shadow-sm">
        <p className="text-sm text-vinho/60">Mais vendidos</p>
        {topSelling.length === 0 ? (
          <p className="mt-1 text-xs text-vinho/50">Nenhuma venda registrada ainda.</p>
        ) : (
          <ol className="mt-2 flex flex-col gap-0.5 text-xs text-vinho">
            {topSelling.map((product, index) => (
              <li key={product.id} className="truncate">
                {index + 1}. {product.name} ({product.salesCount})
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
