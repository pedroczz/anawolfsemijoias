"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  reorderCategoriesAction,
} from "@/app/admin/(dashboard)/categorias/actions";
import type { Category } from "@/services/categories.service";

export default function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newName.trim()) return;
    setBusy(true);
    setError(null);
    const result = await createCategoryAction(newName.trim(), categories.length);
    setBusy(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setNewName("");
    router.refresh();
  }

  async function handleSaveEdit(category: Category) {
    if (!editingName.trim()) return;
    setBusy(true);
    setError(null);
    const result = await updateCategoryAction(category.id, editingName.trim(), category.order);
    setBusy(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setEditingId(null);
    router.refresh();
  }

  async function handleDelete(category: Category) {
    if (!window.confirm(`Excluir a categoria "${category.name}"? Produtos ficarão sem categoria.`)) return;
    setBusy(true);
    setError(null);
    const result = await deleteCategoryAction(category.id);
    setBusy(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= categories.length) return;
    const reordered = [...categories];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    setBusy(true);
    setError(null);
    const result = await reorderCategoriesAction(reordered.map((category) => category.id));
    setBusy(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleCreate} className="flex gap-3">
        <input
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          placeholder="Nome da nova categoria"
          className="admin-input flex-1"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-vinho px-4 py-2 text-sm font-semibold text-creme transition hover:bg-bordo disabled:opacity-60"
        >
          Adicionar
        </button>
      </form>

      {error && <p className="text-sm text-bordo">{error}</p>}

      <ul className="flex flex-col gap-2">
        {categories.length === 0 && <p className="text-sm text-vinho/60">Nenhuma categoria cadastrada.</p>}
        {categories.map((category, index) => (
          <li
            key={category.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-rosa/30 bg-white px-4 py-3"
          >
            {editingId === category.id ? (
              <input
                value={editingName}
                onChange={(event) => setEditingName(event.target.value)}
                className="admin-input flex-1"
                autoFocus
              />
            ) : (
              <div>
                <p className="font-medium text-vinho">{category.name}</p>
                <p className="text-xs text-vinho/50">{category.slug}</p>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                disabled={busy || index === 0}
                onClick={() => handleMove(index, -1)}
                className="rounded border border-vinho/30 px-2 py-1 text-vinho disabled:opacity-30"
                aria-label="Mover para cima"
              >
                ↑
              </button>
              <button
                type="button"
                disabled={busy || index === categories.length - 1}
                onClick={() => handleMove(index, 1)}
                className="rounded border border-vinho/30 px-2 py-1 text-vinho disabled:opacity-30"
                aria-label="Mover para baixo"
              >
                ↓
              </button>

              {editingId === category.id ? (
                <>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleSaveEdit(category)}
                    className="text-vinho underline-offset-2 hover:underline"
                  >
                    Salvar
                  </button>
                  <button type="button" onClick={() => setEditingId(null)} className="text-vinho/60 hover:underline">
                    Cancelar
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(category.id);
                    setEditingName(category.name);
                  }}
                  className="text-vinho underline-offset-2 hover:underline"
                >
                  Editar
                </button>
              )}
              <button
                type="button"
                disabled={busy}
                onClick={() => handleDelete(category)}
                className="text-bordo underline-offset-2 hover:underline"
              >
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
