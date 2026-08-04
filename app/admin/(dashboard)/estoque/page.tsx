import Link from "next/link";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import { createClient } from "@/lib/supabase/server";
import { adminListProducts, adminGetDashboardCounts, getTopSellingProducts } from "@/services/products.service";
import StockCards from "@/components/admin/StockCards";
import StockManagerRow from "@/components/admin/StockManagerRow";

export const dynamic = "force-dynamic";

export default async function AdminStockPage() {
  const supabase = createClient();
  const [{ data: products }, counts, topSelling] = await Promise.all([
    adminListProducts(supabase, {
      status: "all",
      sortBy: "name",
      sortDir: "asc",
      page: 1,
      pageSize: 200,
    }),
    adminGetDashboardCounts(supabase),
    getTopSellingProducts(supabase, 5),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl text-vinho">Estoque</h1>
        <Link
          href="/admin/estoque/movimentacoes"
          className="rounded-full border border-vinho/30 px-4 py-2 text-sm font-medium text-vinho transition hover:bg-vinho hover:text-creme"
        >
          Ver movimentações
        </Link>
      </div>

      <StockCards
        active={counts.active}
        inactive={counts.inactive}
        outOfStock={counts.outOfStock}
        lowStock={counts.lowStock}
        topSelling={topSelling}
      />

      <div className="overflow-x-auto rounded-xl border border-rosa/30 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-rosa/30 text-xs uppercase text-vinho/60">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Estoque</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-vinho/60">
                  Nenhum produto cadastrado.
                </td>
              </tr>
            )}
            {products.map((product) => (
              <tr key={product.id} className="border-b border-rosa/15 last:border-0">
                <td className="flex items-center gap-3 px-4 py-3 align-top">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-off-white">
                    <ImageWithFallback src={product.images[0]} alt="" fill className="object-cover" unoptimized />
                  </div>
                  <span className="font-medium text-vinho">{product.name}</span>
                </td>
                <td className="px-4 py-3 align-top text-vinho/70">{product.sku}</td>
                <td className="px-4 py-3 align-top">
                  {product.stock === 0 ? (
                    <span className="rounded-full bg-vinho/10 px-2 py-0.5 text-xs font-semibold text-vinho">
                      Esgotado
                    </span>
                  ) : product.lowStock ? (
                    <span className="rounded-full bg-areia/60 px-2 py-0.5 text-xs font-semibold text-vinho">
                      Estoque baixo
                    </span>
                  ) : (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                      Disponível
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 align-top">
                  <StockManagerRow
                    productId={product.id}
                    initialStock={product.stock}
                    initialThreshold={product.lowStockThreshold}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
