import ImageWithFallback from "@/components/ui/ImageWithFallback";
import { createClient } from "@/lib/supabase/server";
import { adminListProducts } from "@/services/products.service";
import StockRow from "@/components/admin/StockRow";

export const dynamic = "force-dynamic";

export default async function AdminStockPage() {
  const supabase = createClient();
  const { data: products } = await adminListProducts(supabase, {
    status: "all",
    sortBy: "name",
    sortDir: "asc",
    page: 1,
    pageSize: 200,
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl text-vinho">Estoque</h1>

      <div className="overflow-x-auto rounded-xl border border-rosa/30 bg-white">
        <table className="w-full min-w-[520px] text-left text-sm">
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
                <td className="flex items-center gap-3 px-4 py-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-off-white">
                    <ImageWithFallback src={product.images[0]} alt="" fill className="object-cover" unoptimized />
                  </div>
                  <span className="font-medium text-vinho">{product.name}</span>
                </td>
                <td className="px-4 py-3 text-vinho/70">{product.sku}</td>
                <td className="px-4 py-3">
                  {product.stock === 0 ? (
                    <span className="rounded-full bg-vinho/10 px-2 py-0.5 text-xs font-semibold text-vinho">
                      Esgotado
                    </span>
                  ) : (
                    <span className="text-xs text-vinho/60">Disponível</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StockRow productId={product.id} initialStock={product.stock} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
