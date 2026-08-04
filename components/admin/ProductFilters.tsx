"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Category } from "@/services/categories.service";

export default function ProductFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="search" className="text-xs font-medium text-vinho/70">
          Buscar
        </label>
        <input
          id="search"
          defaultValue={searchParams.get("search") ?? ""}
          placeholder="Nome ou SKU"
          onKeyDown={(event) => {
            if (event.key === "Enter") updateParam("search", event.currentTarget.value);
          }}
          onBlur={(event) => updateParam("search", event.currentTarget.value)}
          className="admin-input w-48"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="category" className="text-xs font-medium text-vinho/70">
          Categoria
        </label>
        <select
          id="category"
          defaultValue={searchParams.get("category") ?? ""}
          onChange={(event) => updateParam("category", event.target.value)}
          className="admin-input"
        >
          <option value="">Todas</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="status" className="text-xs font-medium text-vinho/70">
          Status
        </label>
        <select
          id="status"
          defaultValue={searchParams.get("status") ?? "all"}
          onChange={(event) => updateParam("status", event.target.value)}
          className="admin-input"
        >
          <option value="all">Todos</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
          <option value="out_of_stock">Esgotados</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="sort" className="text-xs font-medium text-vinho/70">
          Ordenar por
        </label>
        <select
          id="sort"
          defaultValue={searchParams.get("sortBy") ?? "display_order"}
          onChange={(event) => updateParam("sortBy", event.target.value)}
          className="admin-input"
        >
          <option value="display_order">Ordem de exibição</option>
          <option value="name">Nome</option>
          <option value="price">Preço</option>
          <option value="stock">Estoque</option>
          <option value="created_at">Mais recentes</option>
        </select>
      </div>
    </div>
  );
}
