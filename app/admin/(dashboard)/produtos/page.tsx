import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { adminListProducts } from "@/services/products.service";
import { listCategories } from "@/services/categories.service";
import ProductFilters from "@/components/admin/ProductFilters";
import ProductRowActions from "@/components/admin/ProductRowActions";
import Pagination from "@/components/admin/Pagination";
import type { AdminProductFilters } from "@/repositories/products.repository";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

type SearchParams = {
  search?: string;
  category?: string;
  status?: string;
  sortBy?: string;
  page?: string;
};

export default async function AdminProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createClient();
  const page = Math.max(1, Number(searchParams.page) || 1);
  const sortBy = (searchParams.sortBy as AdminProductFilters["sortBy"]) ?? "display_order";

  const filters: AdminProductFilters = {
    search: searchParams.search,
    categoryId: searchParams.category || undefined,
    status: (searchParams.status as AdminProductFilters["status"]) ?? "all",
    sortBy,
    sortDir: sortBy === "created_at" ? "desc" : "asc",
    page,
    pageSize: PAGE_SIZE,
  };

  const [{ data: products, count }, categories] = await Promise.all([
    adminListProducts(supabase, filters),
    listCategories(supabase),
  ]);

  function buildHref(nextPage: number) {
    const params = new URLSearchParams();
    if (searchParams.search) params.set("search", searchParams.search);
    if (searchParams.category) params.set("category", searchParams.category);
    if (searchParams.status) params.set("status", searchParams.status);
    if (searchParams.sortBy) params.set("sortBy", searchParams.sortBy);
    params.set("page", String(nextPage));
    return `/admin/produtos?${params.toString()}`;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl text-vinho">Produtos</h1>
        <div className="flex gap-3">
          <Link
            href="/admin/produtos/novo?import=instagram"
            className="rounded-full border border-vinho/30 px-4 py-2 text-sm font-medium text-vinho transition hover:bg-vinho hover:text-creme"
          >
            Importar do Instagram
          </Link>
          <Link
            href="/admin/produtos/novo"
            className="rounded-full bg-vinho px-4 py-2 text-sm font-semibold text-creme transition hover:bg-bordo"
          >
            Novo produto
          </Link>
        </div>
      </div>

      <ProductFilters categories={categories} />

      <div className="overflow-x-auto rounded-xl border border-rosa/30 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-rosa/30 text-xs uppercase text-vinho/60">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Estoque</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-vinho/60">
                  Nenhum produto encontrado.
                </td>
              </tr>
            )}
            {products.map((product) => (
              <tr key={product.id} className="border-b border-rosa/15 last:border-0">
                <td className="flex items-center gap-3 px-4 py-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-off-white">
                    {product.images[0] && (
                      <Image src={product.images[0]} alt="" fill className="object-cover" unoptimized />
                    )}
                  </div>
                  <Link href={`/admin/produtos/${product.id}`} className="font-medium text-vinho hover:underline">
                    {product.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-vinho/70">{product.sku}</td>
                <td className="px-4 py-3 text-vinho/70">{product.categoryName || "—"}</td>
                <td className="px-4 py-3 text-vinho/70">{currency.format(product.promoPrice ?? product.price)}</td>
                <td className="px-4 py-3 text-vinho/70">
                  {product.stock === 0 ? (
                    <span className="rounded-full bg-vinho/10 px-2 py-0.5 text-xs font-semibold text-vinho">
                      Esgotado
                    </span>
                  ) : (
                    product.stock
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      product.active ? "bg-green-100 text-green-800" : "bg-vinho/10 text-vinho/60"
                    }`}
                  >
                    {product.active ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <ProductRowActions productId={product.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pageSize={PAGE_SIZE} total={count} buildHref={buildHref} />
    </div>
  );
}
