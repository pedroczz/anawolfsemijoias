import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { adminGetDashboardCounts } from "@/services/products.service";
import { listCategories } from "@/services/categories.service";
import StatCard from "@/components/admin/StatCard";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = createClient();
  const [counts, categories] = await Promise.all([
    adminGetDashboardCounts(supabase),
    listCategories(supabase),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl text-vinho">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Produtos" value={counts.total} />
        <StatCard label="Ativos" value={counts.active} />
        <StatCard label="Inativos" value={counts.inactive} />
        <StatCard label="Esgotados" value={counts.outOfStock} />
        <StatCard label="Em destaque" value={counts.featured} />
      </div>

      <div className="rounded-xl border border-rosa/30 bg-white p-5 shadow-sm">
        <p className="text-sm text-vinho/60">Categorias cadastradas</p>
        <p className="mt-1 font-display text-2xl text-vinho">{categories.length}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/produtos/novo"
          className="rounded-full bg-vinho px-4 py-2 text-sm font-semibold text-creme transition hover:bg-bordo"
        >
          Novo produto
        </Link>
        <Link
          href="/admin/produtos"
          className="rounded-full border border-vinho/30 px-4 py-2 text-sm font-medium text-vinho transition hover:bg-vinho hover:text-creme"
        >
          Ver produtos
        </Link>
        <Link
          href="/admin/categorias"
          className="rounded-full border border-vinho/30 px-4 py-2 text-sm font-medium text-vinho transition hover:bg-vinho hover:text-creme"
        >
          Gerenciar categorias
        </Link>
      </div>
    </div>
  );
}
